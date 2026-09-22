"""
Revision Router - Handles document upload and AI-powered revision planning.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.document import UploadedDocument
from app.utils.security import get_current_user
from app.services.document_service import extract_text
from app.services.ollama_service import ollama_service

from app.routers.flags import feature_guard

router = APIRouter(prefix="/revision", tags=["Revision"], dependencies=[Depends(feature_guard("revision"))])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class DocumentAnalysisResponse(BaseModel):
    """Response schema for document analysis."""
    subject: str
    topics: List[dict]
    revision_plan: str
    estimated_hours: int
    key_concepts: List[str]
    filename: str
    file_type: str
    document_id: Optional[int] = None


class TopicExplanationResponse(BaseModel):
    """Response schema for topic explanation."""
    topic: str
    definition: str
    key_points: List[str]
    example: str
    common_mistakes: List[str]
    revision_tip: str


class ExplainTopicRequest(BaseModel):
    """Request schema for explaining a topic."""
    topic: str
    context: Optional[str] = None


@router.post("/analyze-document", response_model=DocumentAnalysisResponse)
async def analyze_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Upload a PDF or PPT file and get an AI-generated revision plan.
    
    - **file**: PDF or PPTX file to analyze
    
    Returns:
    - Subject identification
    - List of topics with difficulty ratings
    - Personalized revision plan
    - Estimated study hours
    - Key concepts to focus on
    """
    # Validate file type
    allowed_extensions = [".pdf", ".pptx", ".ppt"]
    filename = file.filename or "document"
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")
    
    # Extract text
    try:
        extracted_text, file_type = extract_text(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    extracted_text = (extracted_text or "").replace("\x00", "").strip()

    if not extracted_text or len(extracted_text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient text from the document. The file may be image-based or empty."
        )
        
    doc_id = None
    # Check for existing document for deduplication
    existing_stmt = select(UploadedDocument).where(UploadedDocument.user_id == current_user.id, UploadedDocument.filename == filename)
    existing_doc = (await db.execute(existing_stmt)).scalar_one_or_none()
    
    if existing_doc:
        doc_id = existing_doc.id
        # Cache bypass: We skip the early return to force a fresh analysis during testing/development
        # if existing_doc.analysis_result:
        #     return DocumentAnalysisResponse(...)
    else:
        # Save to local disk (in a real app, use S3. Here, local uploads dir)
        safe_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as f:
            f.write(content)

        # Save to DB
        new_doc = UploadedDocument(
            user_id=current_user.id,
            filename=filename,
            file_path=file_path,
            extracted_text=extracted_text,
            file_type=file_type
        )
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)
        doc_id = new_doc.id
    
    # Analyze with AI
    analysis = await ollama_service.analyze_document_for_revision(extracted_text, filename)
    
    # Cache the analysis result
    if existing_doc:
        existing_doc.analysis_result = analysis
    else:
        new_doc.analysis_result = analysis
    await db.commit()
    
    return DocumentAnalysisResponse(
        subject=analysis.get("subject", "Unknown"),
        topics=analysis.get("topics", []),
        revision_plan=analysis.get("revision_plan", ""),
        estimated_hours=analysis.get("estimated_hours", 0),
        key_concepts=analysis.get("key_concepts", []),
        filename=filename,
        file_type=file_type,
        document_id=doc_id
    )


@router.post("/explain-topic", response_model=TopicExplanationResponse)
async def explain_topic(request: ExplainTopicRequest):
    """
    Get a detailed explanation of a specific topic.
    """
    if not request.topic or len(request.topic.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please provide a valid topic name.")

    try:
        explanation = await ollama_service.explain_topic_in_detail(
            topic=request.topic.strip(),
            context=request.context or ""
        )
    except Exception as e:
        print(f"[explain_topic] LLM error: {e}")
        explanation = {}

    # Ensure all required fields have safe defaults
    return TopicExplanationResponse(
        topic=str(explanation.get("topic", request.topic)),
        definition=str(explanation.get("definition", f"An explanation of '{request.topic}' could not be generated. Please try again.")),
        key_points=list(explanation.get("key_points", ["Review your course material on this topic.", "Consult your textbook or lecture notes."])),
        example=str(explanation.get("example", "No example available at this time.")),
        common_mistakes=list(explanation.get("common_mistakes", ["Not reviewing this topic before an exam."])),
        revision_tip=str(explanation.get("revision_tip", "Try to summarise this topic in your own words."))
    )
