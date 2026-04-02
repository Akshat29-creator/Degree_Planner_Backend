"""
Pipeline Router — Multi-Model AI Endpoints

Four production-grade endpoints that intelligently route to:
  • qwen3:8b-q4_K_M  (always loaded) → /chat
  • qwen3:14b-q4_K_M (on-demand)     → /analyze, /generate-quiz, /evaluate

All responses follow strict contracts. Quiz output is always valid JSON.
Conversation history is maintained in-process (short-term memory).
Long-term knowledge from documents is handled via RAG (/analyze, /generate-quiz).
"""
import asyncio
import uuid
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

from app.services.model_pipeline import pipeline_service
from app.services.document_service import extract_text

router = APIRouter(prefix="/pipeline", tags=["Multi-Model AI Pipeline"])

# ─────────────────────────────────────────────────────────────
# In-memory job store for async tasks (quiz / doc processing)
# ─────────────────────────────────────────────────────────────
_jobs: dict[str, dict] = {}


# ─────────────────────────────────────────────────────────────
# Schema definitions
# ─────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    session_id: Optional[str] = None   # for future persistence


class ChatResponse(BaseModel):
    response: str
    model_used: str
    session_id: str


class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Raw extracted text from a document")
    doc_id: Optional[str] = None
    query: Optional[str] = "Give a comprehensive analysis of this document"


class AnalyzeResponse(BaseModel):
    analysis: str
    doc_id: str
    model_used: str
    chunks_retrieved: int


class QuizRequest(BaseModel):
    topic: str = Field(..., description="Topic or subject for the quiz")
    doc_id: Optional[str] = None       # if document is already indexed
    num_questions: int = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(..., min_length=4, max_length=4)
    answer: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]
    model_used: str
    topic: str


class EvaluateRequest(BaseModel):
    student_answers: list[dict] = Field(
        ..., description="List of {question, selected, correct} dicts"
    )
    subject: Optional[str] = None
    history: list[ChatMessage] = Field(default_factory=list)


class EvaluateResponse(BaseModel):
    score: float
    grade: str
    feedback: str
    weak_topics: list[str]
    recommendations: list[str]
    model_used: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str   # "pending" | "processing" | "done" | "failed"
    result: Optional[dict] = None
    error: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    General chat using qwen3:8b (always loaded, low latency).

    Maintains conversation history for contextual follow-ups.
    Automatically upgrades to 14B if the message triggers reasoning keywords.
    """
    session_id = request.session_id or str(uuid.uuid4())

    result = await pipeline_service.chat(
        message=request.message,
        history=[m.model_dump() for m in request.history],
    )
    return ChatResponse(
        response=result["response"],
        model_used=result["model_used"],
        session_id=session_id,
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_document(request: AnalyzeRequest):
    """
    Deep document analysis using qwen3:14b via RAG.

    The document text is chunked, embedded with nomic-embed-text,
    then the top-5 relevant chunks are retrieved and passed to 14B.
    """
    if not request.text or len(request.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Document text is too short to analyze.")

    result = await pipeline_service.analyze_document(
        text=request.text,
        doc_id=request.doc_id,
        query=request.query or "Give a comprehensive analysis of this document",
    )
    return AnalyzeResponse(**result)


@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate a structured quiz using qwen3:14b.

    Output is ALWAYS strict JSON {questions: [{question, options, answer}]}.
    If a doc_id is provided, quiz questions are grounded in the RAG context.
    """
    result = await pipeline_service.generate_quiz(
        topic=request.topic,
        doc_id=request.doc_id,
        num_questions=request.num_questions,
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return QuizResponse(**result)


@router.post("/generate-quiz/from-file", response_model=dict)
async def generate_quiz_from_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    num_questions: int = Form(default=5),
    topic: str = Form(default=""),
):
    """
    Upload a PDF/PPTX and generate a quiz asynchronously.

    Returns a job_id immediately. Poll /pipeline/status/{job_id} for result.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    file_content = await file.read()
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None}

    async def _process():
        _jobs[job_id]["status"] = "processing"
        try:
            text, _ = extract_text(file_content, file.filename)
            quiz_topic = topic or file.filename.rsplit(".", 1)[0]
            # Index document for RAG
            from app.services.rag_service import rag_service
            doc_id = await rag_service.index_document(text)
            result = await pipeline_service.generate_quiz(
                topic=quiz_topic,
                doc_id=doc_id,
                num_questions=num_questions,
            )
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["result"] = result
        except Exception as e:
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = str(e)

    background_tasks.add_task(_process)
    return {"job_id": job_id, "status": "pending"}


@router.post("/analyze/from-file", response_model=dict)
async def analyze_document_from_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    query: str = Form(default="Give a comprehensive analysis of this document"),
):
    """
    Upload a PDF/PPTX for async deep analysis via RAG + qwen3:14b.

    Returns job_id immediately. Poll /pipeline/status/{job_id} for result.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    file_content = await file.read()
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None}

    async def _process():
        _jobs[job_id]["status"] = "processing"
        try:
            text, _ = extract_text(file_content, file.filename)
            result = await pipeline_service.analyze_document(
                text=text, query=query
            )
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["result"] = result
        except Exception as e:
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = str(e)

    background_tasks.add_task(_process)
    return {"job_id": job_id, "status": "pending"}


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_performance(request: EvaluateRequest):
    """
    Evaluate student quiz answers using qwen3:14b.

    Provides:
    - Score and grade
    - Per-question feedback
    - Identified weak topics
    - Actionable study recommendations
    """
    result = await pipeline_service.evaluate_performance(
        student_answers=request.student_answers,
        subject=request.subject,
        history=[m.model_dump() for m in request.history],
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return EvaluateResponse(**result)


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Poll the status of an async background job (quiz/analysis)."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        result=job.get("result"),
        error=job.get("error"),
    )


@router.get("/health")
async def pipeline_health():
    """Check if all models are reachable via Ollama."""
    from app.services.model_pipeline import pipeline_service as ps
    status = await ps.health_check()
    return status
