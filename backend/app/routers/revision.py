"""
Revision Router - Handles document upload and AI-powered revision planning.
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional

from app.services.document_service import extract_text
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/revision", tags=["Revision"])


class DocumentAnalysisResponse(BaseModel):
    """Response schema for document analysis."""
    subject: str
    topics: List[dict]
    revision_plan: str
    estimated_hours: int
    key_concepts: List[str]
    filename: str
    file_type: str


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
    file: UploadFile = File(...)
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
    
    if not extracted_text or len(extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient text from the document. The file may be image-based or empty."
        )
    
    # Analyze with AI
    analysis = await ollama_service.analyze_document_for_revision(extracted_text, filename)
    
    return DocumentAnalysisResponse(
        subject=analysis.get("subject", "Unknown"),
        topics=analysis.get("topics", []),
        revision_plan=analysis.get("revision_plan", ""),
        estimated_hours=analysis.get("estimated_hours", 0),
        key_concepts=analysis.get("key_concepts", []),
        filename=filename,
        file_type=file_type
    )


@router.post("/explain-topic", response_model=TopicExplanationResponse)
async def explain_topic(request: ExplainTopicRequest):
    """
    Get a detailed explanation of a specific topic.
    
    - **topic**: The topic name to explain
    - **context**: Optional context about the subject area
    
    Returns:
    - Definition
    - Key points
    - Example/analogy
    - Common mistakes
    - Quick revision tip
    """
    if not request.topic or len(request.topic.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please provide a valid topic name.")
    
    explanation = await ollama_service.explain_topic_in_detail(
        topic=request.topic.strip(),
        context=request.context or ""
    )
    
    return TopicExplanationResponse(
        topic=explanation.get("topic", request.topic),
        definition=explanation.get("definition", ""),
        key_points=explanation.get("key_points", []),
        example=explanation.get("example", ""),
        common_mistakes=explanation.get("common_mistakes", []),
        revision_tip=explanation.get("revision_tip", "")
    )
