"""
Assessment Router - Core API for generating and evaluating tests via Ollama.
"""
import os
import uuid
import tempfile
from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models.document import UploadedDocument
from app.models.test_result import TestResult
from app.utils.security import get_current_user
from app.services.document_service import extract_text
from app.services.llm_assessment import assessment_engine

router = APIRouter(prefix="/assessment", tags=["Assessment"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class GenerateTestRequest(BaseModel):
    document_id: Optional[int] = None
    manual_topics: Optional[str] = None
    mcq_count: int = 5
    short_count: int = 2
    long_count: int = 1

class AnswerPayload(BaseModel):
    question: str
    type: str # 'mcq', 'short', 'long'
    rubric: str # or correct_answer
    user_answer: str

class EvaluateTestRequest(BaseModel):
    document_id: Optional[int] = None
    topic_name: str
    mcq_count: int = 0
    short_count: int = 0
    long_count: int = 0
    answers: List[AnswerPayload]

# ==========================================
# ENDPOINTS
# ==========================================

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Uploads a PDF/PPT, extracts text, and saves to database."""
    allowed_extensions = [".pdf", ".pptx", ".ppt"]
    filename = file.filename or "document"
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # Check for existing document
    existing_stmt = select(UploadedDocument).where(UploadedDocument.user_id == current_user.id, UploadedDocument.filename == filename)
    existing_doc = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing_doc:
        return {
            "message": "File already exists. Using previous upload.",
            "document_id": existing_doc.id,
            "filename": existing_doc.filename,
            "is_duplicate": True
        }

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    # Extract text using existing service
    try:
        extracted_text, file_type = extract_text(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not extracted_text or len(extracted_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Not enough text extracted.")

    # Save to local disk (in a real app, use S3. Here, local uploads dir)
    safe_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Save to DB
    doc = UploadedDocument(
        user_id=current_user.id,
        filename=filename,
        file_type=file_type,
        file_path=file_path,
        extracted_text=extracted_text
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return {
        "message": "File uploaded successfully",
        "document_id": doc.id,
        "filename": doc.filename
    }

@router.post("/generate")
async def generate_assessment(
    request: GenerateTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Generates a test using Ollama based on document ID or manual topics."""
    source_text = ""
    topic_name = "Custom Topic"

    if request.document_id:
        doc_query = await db.execute(select(UploadedDocument).where(UploadedDocument.id == request.document_id, UploadedDocument.user_id == current_user.id))
        doc = doc_query.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        source_text = doc.extracted_text
        topic_name = doc.filename
    elif request.manual_topics:
        source_text = request.manual_topics
        # Use first 50 chars of manual topic for better history identification
        topic_name = request.manual_topics[:50].strip() + ("..." if len(request.manual_topics) > 50 else "")
    else:
        raise HTTPException(status_code=400, detail="Must provide either document_id or manual_topics")

    # Generate Test via AI
    test_json = await assessment_engine.generate_test(
        source_text=source_text,
        mcq_count=request.mcq_count,
        short_count=request.short_count,
        long_count=request.long_count
    )

    return {
        "topic_name": topic_name,
        "test": test_json
    }


@router.post("/evaluate")
async def evaluate_assessment(
    request: EvaluateTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Evaluates student answers, provides feedback, and saves results."""
    
    # Prepare payload for Ollama
    qa_pairs = []
    for a in request.answers:
        qa_pairs.append({
            "question": a.question,
            "type": a.type,
            "expected_rubric_or_answer": a.rubric,
            "user_answer": a.user_answer
        })

    # Check for duplicate submission (same topic, same answers)
    existing_stmt = select(TestResult).where(
        TestResult.user_id == current_user.id,
        TestResult.topic_name == request.topic_name
    ).order_by(TestResult.id.desc())
    last_test = (await db.execute(existing_stmt)).scalars().first()
    if last_test and len(last_test.questions_json) == len(request.answers) and len(request.answers) > 0:
        # Check if user answers match
        if last_test.questions_json[0].get("user_answer") == request.answers[0].user_answer:
            return {
                "message": "Duplicate Evaluation Prevented",
                "result_id": last_test.id,
                "report": last_test.feedback_json,
                "is_duplicate": True
            }

    # Evaluate via AI
    evaluation_result = await assessment_engine.evaluate_answers(qa_pairs)

    total_score = evaluation_result.get("total_score", 0)
    max_score = evaluation_result.get("max_score", 1)
    if max_score == 0:
        max_score = 1
    percentage = (total_score / max_score) * 100
    perf_level = "Strong" if percentage >= 80 else ("Average" if percentage >= 50 else "Weak")

    # Save to TestResult
    tr = TestResult(
        user_id=current_user.id,
        document_id=request.document_id,
        topic_name=request.topic_name,
        total_score=total_score,
        max_score=max_score,
        percentage=percentage,
        performance_level=perf_level,
        mcq_count=request.mcq_count,
        short_count=request.short_count,
        long_count=request.long_count,
        questions_json=qa_pairs,  # Keep the exact Q/A pair for history rendering
        feedback_json=evaluation_result
    )
    db.add(tr)
    await db.commit()
    await db.refresh(tr)

    return {
        "message": "Evaluation Complete",
        "result_id": tr.id,
        "report": evaluation_result
    }
