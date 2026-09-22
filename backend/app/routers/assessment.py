"""
Assessment Router - Core API for generating and evaluating tests via Ollama.
"""
import os
import uuid
import tempfile
from typing import List, Dict, Optional
from datetime import datetime
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

    extracted_text = (extracted_text or "").replace("\x00", "").strip()

    if not extracted_text or len(extracted_text) < 50:
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
        
        if request.manual_topics:
            source_text = f"FOCUS TOPIC: {request.manual_topics}\n\nDOCUMENT TEXT SOURCE:\n{doc.extracted_text}"
            topic_name = request.manual_topics
        else:
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

    # Spaced Repetition (SM-2) integration
    from app.services.sm2 import percentage_to_quality, calculate_sm2
    from datetime import datetime, timedelta, timezone

    # Get user's latest previous test result for this topic
    prev_stmt = select(TestResult).where(
        TestResult.user_id == current_user.id,
        TestResult.topic_name == request.topic_name
    ).order_by(TestResult.id.desc())
    prev_result = (await db.execute(prev_stmt)).scalars().first()

    if prev_result:
        prev_interval = prev_result.interval if prev_result.interval is not None else 1
        prev_repetitions = prev_result.repetitions if prev_result.repetitions is not None else 0
        prev_ease_factor = prev_result.ease_factor if prev_result.ease_factor is not None else 2.5
    else:
        prev_interval = 1
        prev_repetitions = 0
        prev_ease_factor = 2.5

    quality = percentage_to_quality(percentage)
    new_interval, new_repetitions, new_ease_factor = calculate_sm2(
        quality, prev_interval, prev_repetitions, prev_ease_factor
    )
    next_review_at = datetime.now(timezone.utc) + timedelta(days=new_interval)

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
        feedback_json=evaluation_result,
        ease_factor=new_ease_factor,
        interval=new_interval,
        repetitions=new_repetitions,
        next_review_at=next_review_at
    )
    db.add(tr)
    await db.commit()
    await db.refresh(tr)

    return {
        "message": "Evaluation Complete",
        "result_id": tr.id,
        "report": evaluation_result,
        "spaced_repetition": {
            "interval": new_interval,
            "repetitions": new_repetitions,
            "ease_factor": new_ease_factor,
            "next_review_at": next_review_at.isoformat()
        }
    }


class SpacedRepetitionItem(BaseModel):
    topic_name: str
    document_id: Optional[int] = None
    last_test_id: int
    percentage: float
    performance_level: str
    interval: int
    repetitions: int
    ease_factor: float
    next_review_at: Optional[datetime] = None
    is_due: bool
    created_at: datetime


@router.get("/spaced-repetition/status", response_model=List[SpacedRepetitionItem])
async def get_spaced_repetition_status(
    due_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all spaced repetition topics and their status.
    If due_only is True, returns only topics that are due for review.
    """
    from sqlalchemy import select, func
    from datetime import datetime, timezone

    # Subquery to find the latest test result ID for each topic_name of the user
    subq = select(
        TestResult.topic_name,
        func.max(TestResult.id).label("max_id")
    ).where(
        TestResult.user_id == current_user.id
    ).group_by(
        TestResult.topic_name
    ).subquery()

    # Query to fetch the full TestResult details for those max IDs
    stmt = select(TestResult).join(
        subq,
        TestResult.id == subq.c.max_id
    )
    
    result = await db.execute(stmt)
    latest_tests = result.scalars().all()

    now = datetime.now(timezone.utc)
    items = []
    
    for t in latest_tests:
        is_due = True
        if t.next_review_at:
            review_at = t.next_review_at
            if review_at.tzinfo is None:
                review_at = review_at.replace(tzinfo=timezone.utc)
            is_due = review_at <= now

        if due_only and not is_due:
            continue

        items.append(SpacedRepetitionItem(
            topic_name=t.topic_name,
            document_id=t.document_id,
            last_test_id=t.id,
            percentage=t.percentage or 0.0,
            performance_level=t.performance_level or "Average",
            interval=t.interval if t.interval is not None else 1,
            repetitions=t.repetitions if t.repetitions is not None else 0,
            ease_factor=t.ease_factor if t.ease_factor is not None else 2.5,
            next_review_at=t.next_review_at,
            is_due=is_due,
            created_at=t.created_at
        ))

    # Sort items so due items or soonest-due items are listed first
    items.sort(key=lambda x: (not x.is_due, x.next_review_at or datetime.max.replace(tzinfo=timezone.utc)))
    return items
