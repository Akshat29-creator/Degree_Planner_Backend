"""
Interview API Router.
Endpoints for AI Interview Simulator feature.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.interview import (
    Resume, InterviewSession, InterviewQuestion, InterviewReport,
    InterviewStatus, QuestionType
)
from app.routers.auth import get_current_user
from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/interview", tags=["Interview"])


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class ResumeInput(BaseModel):
    """Input for resume generation."""
    name: str
    education: List[dict] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    projects: List[dict] = Field(default_factory=list)
    experience: List[dict] = Field(default_factory=list)


class ResumeUploadRequest(BaseModel):
    """Request to upload resume text."""
    content: str


class ResumeResponse(BaseModel):
    """Resume response."""
    id: int
    content: str
    generated_by_ai: bool
    name: Optional[str]
    skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StartInterviewRequest(BaseModel):
    """Request to start new interview."""
    skill_type: str
    language: str = "en"
    question_count: int = 10
    resume_id: Optional[int] = None


class SubmitAnswerRequest(BaseModel):
    """Request to submit answer."""
    answer: str


class QuestionResponse(BaseModel):
    """Interview question response."""
    id: int
    question_text: str
    question_type: str
    order_index: int
    difficulty: str
    total_questions: int
    is_last: bool


class AnswerAnalysisResponse(BaseModel):
    """Response after answer submission."""
    question_id: int
    score: int
    analysis: dict
    next_question: Optional[QuestionResponse]


class SessionResponse(BaseModel):
    """Interview session response."""
    id: int
    skill_type: str
    language: str
    status: str
    question_count: int
    current_question_index: int
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    """Interview report response."""
    id: int
    session_id: int
    technical_score: int
    communication_score: int
    confidence_score: int
    problem_solving_score: int
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    retry_recommendations: List[str]
    confidence_insights: Optional[str]
    behavior_insights: Optional[str]

    class Config:
        from_attributes = True


# ==========================================
# RESUME ENDPOINTS
# ==========================================

@router.post("/resume/upload", response_model=ResumeResponse)
async def upload_resume(
    request: ResumeUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload resume text."""
    resume = Resume(
        user_id=current_user.id,
        content=request.content,
        generated_by_ai=False
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


@router.post("/resume/generate", response_model=ResumeResponse)
async def generate_resume(
    inputs: ResumeInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate resume using AI."""
    try:
        # Generate resume content using Ollama
        resume_content = await ollama_service.generate_resume(inputs.model_dump())
        
        resume = Resume(
            user_id=current_user.id,
            content=resume_content,
            generated_by_ai=True,
            name=inputs.name,
            education=inputs.education,
            skills=inputs.skills,
            projects=inputs.projects,
            experience=inputs.experience
        )
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        return resume
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")


@router.get("/resume", response_model=Optional[ResumeResponse])
async def get_resume(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's most recent resume."""
    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    resume = result.scalars().first()
    return resume


# ==========================================
# INTERVIEW SESSION ENDPOINTS
# ==========================================

@router.post("/session/start", response_model=SessionResponse)
async def start_interview(
    request: StartInterviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a new interview session."""
    # Validate resume if provided
    resume = None
    if request.resume_id:
        result = await db.execute(
            select(Resume).where(
                Resume.id == request.resume_id,
                Resume.user_id == current_user.id
            )
        )
        resume = result.scalars().first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

    # Create session
    session = InterviewSession(
        user_id=current_user.id,
        resume_id=request.resume_id,
        skill_type=request.skill_type,
        language=request.language,
        question_count=request.question_count,
        status=InterviewStatus.IN_PROGRESS.value,
        started_at=datetime.utcnow()
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Generate first batch of questions
    try:
        resume_text = resume.content if resume else None
        questions = await ollama_service.generate_interview_questions(
            skill_type=request.skill_type,
            question_count=request.question_count,
            resume_text=resume_text
        )
        
        # Save questions
        for idx, q in enumerate(questions):
            question = InterviewQuestion(
                session_id=session.id,
                question_text=q["question"],
                question_type=q.get("type", QuestionType.TECHNICAL.value),
                order_index=idx,
                difficulty=q.get("difficulty", "medium")
            )
            db.add(question)
        
        await db.commit()
    except Exception as e:
        print(f"Error generating questions: {e}")
        # Create fallback questions
        fallback_questions = [
            {"question": "Tell me about yourself and your background.", "type": "warmup"},
            {"question": f"What interests you about {request.skill_type}?", "type": "behavioral"},
            {"question": f"Explain a core concept in {request.skill_type}.", "type": "technical"},
            {"question": "Describe a challenging project you worked on.", "type": "scenario"},
            {"question": "Where do you see yourself in 5 years?", "type": "closing"},
        ]
        for idx, q in enumerate(fallback_questions[:request.question_count]):
            question = InterviewQuestion(
                session_id=session.id,
                question_text=q["question"],
                question_type=q["type"],
                order_index=idx,
                difficulty="medium"
            )
            db.add(question)
        await db.commit()

    await db.refresh(session)
    return session


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get interview session details."""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/session/{session_id}/question", response_model=Optional[QuestionResponse])
async def get_current_question(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current question for the session."""
    # Get session
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status == InterviewStatus.COMPLETED.value:
        return None

    # Find current unanswered question
    questions = sorted(session.questions, key=lambda q: q.order_index)
    for q in questions:
        if q.user_answer is None:
            return QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                order_index=q.order_index,
                difficulty=q.difficulty,
                total_questions=len(questions),
                is_last=(q.order_index == len(questions) - 1)
            )
    
    return None


@router.post("/session/{session_id}/answer", response_model=AnswerAnalysisResponse)
async def submit_answer(
    session_id: int,
    request: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit answer to current question and get AI analysis."""
    # Get session with questions
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.status == InterviewStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Interview already completed")

    # Find current unanswered question
    questions = sorted(session.questions, key=lambda q: q.order_index)
    current_question = None
    for q in questions:
        if q.user_answer is None:
            current_question = q
            break
    
    if not current_question:
        raise HTTPException(status_code=400, detail="No pending questions")

    # Analyze answer using AI
    try:
        analysis = await ollama_service.analyze_interview_answer(
            question=current_question.question_text,
            answer=request.answer,
            skill_type=session.skill_type
        )
    except Exception as e:
        print(f"Error analyzing answer: {e}")
        analysis = {
            "correctness": 70,
            "clarity": 70,
            "completeness": 70,
            "relevance": 70,
            "feedback": "Answer recorded. Detailed analysis unavailable."
        }

    # Update question with answer and analysis
    current_question.user_answer = request.answer
    current_question.answered_at = datetime.utcnow()
    current_question.ai_analysis = analysis
    current_question.score = int((
        analysis.get("correctness", 70) +
        analysis.get("clarity", 70) +
        analysis.get("completeness", 70) +
        analysis.get("relevance", 70)
    ) / 4)
    
    # Update session index
    session.current_question_index = current_question.order_index + 1
    
    await db.commit()

    # Find next question
    next_question = None
    for q in questions:
        if q.order_index > current_question.order_index and q.user_answer is None:
            next_question = QuestionResponse(
                id=q.id,
                question_text=q.question_text,
                question_type=q.question_type,
                order_index=q.order_index,
                difficulty=q.difficulty,
                total_questions=len(questions),
                is_last=(q.order_index == len(questions) - 1)
            )
            break

    return AnswerAnalysisResponse(
        question_id=current_question.id,
        score=current_question.score,
        analysis=analysis,
        next_question=next_question
    )


@router.post("/session/{session_id}/complete", response_model=ReportResponse)
async def complete_interview(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete interview and generate final report."""
    # Get session with questions
    result = await db.execute(
        select(InterviewSession)
        .options(selectinload(InterviewSession.questions))
        .where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Prepare session data for report generation
    questions_data = [
        {
            "question": q.question_text,
            "answer": q.user_answer or "",
            "type": q.question_type,
            "score": q.score or 0,
            "analysis": q.ai_analysis or {}
        }
        for q in session.questions
    ]

    # Generate report using AI
    try:
        report_data = await ollama_service.generate_interview_report(
            skill_type=session.skill_type,
            questions=questions_data
        )
    except Exception as e:
        print(f"Error generating report: {e}")
        # Fallback report
        avg_score = sum(q.score or 0 for q in session.questions) // max(len(session.questions), 1)
        report_data = {
            "technical_score": avg_score,
            "communication_score": avg_score,
            "confidence_score": avg_score,
            "problem_solving_score": avg_score,
            "strengths": ["Completed the interview"],
            "weaknesses": ["Could not generate detailed analysis"],
            "improvements": ["Practice more questions"],
            "retry_recommendations": [f"Try {session.skill_type} again"]
        }

    # Create report
    report = InterviewReport(
        session_id=session.id,
        technical_score=report_data.get("technical_score", 0),
        communication_score=report_data.get("communication_score", 0),
        confidence_score=report_data.get("confidence_score", 0),
        problem_solving_score=report_data.get("problem_solving_score", 0),
        overall_score=(
            report_data.get("technical_score", 0) +
            report_data.get("communication_score", 0) +
            report_data.get("confidence_score", 0) +
            report_data.get("problem_solving_score", 0)
        ) // 4,
        strengths=report_data.get("strengths", []),
        weaknesses=report_data.get("weaknesses", []),
        improvements=report_data.get("improvements", []),
        retry_recommendations=report_data.get("retry_recommendations", []),
        confidence_insights=report_data.get("confidence_insights"),
        behavior_insights=report_data.get("behavior_insights")
    )
    db.add(report)

    # Update session status
    session.status = InterviewStatus.COMPLETED.value
    session.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(report)

    return report


@router.get("/session/{session_id}/report", response_model=Optional[ReportResponse])
async def get_report(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get interview report."""
    result = await db.execute(
        select(InterviewReport)
        .join(InterviewSession)
        .where(
            InterviewReport.session_id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    report = result.scalars().first()
    return report


@router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all interview sessions for user."""
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return sessions


# ==========================================
# TTS (Text-to-Speech) ENDPOINTS
# ==========================================

class SpeakRequest(BaseModel):
    """Request for text-to-speech synthesis."""
    text: str
    language: str = "en"
    voice_preset: str = "interviewer"


class SpeakResponse(BaseModel):
    """Response with audio data."""
    audio_base64: str
    format: str = "wav"
    language: str


@router.post("/speak", response_model=SpeakResponse)
async def speak_text(
    request: SpeakRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Convert text to speech using Indic Parler-TTS.
    Returns base64-encoded WAV audio.
    """
    try:
        from app.services.tts_service import synthesize_speech_base64, is_tts_available
        
        if not is_tts_available():
            raise HTTPException(
                status_code=503,
                detail="TTS not available. Install: pip install git+https://github.com/huggingface/parler-tts.git"
            )
        
        audio_base64 = await synthesize_speech_base64(
            text=request.text,
            language=request.language,
            voice_preset=request.voice_preset
        )
        
        return SpeakResponse(
            audio_base64=audio_base64,
            format="wav",
            language=request.language
        )
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="TTS dependencies not installed. Run: pip install git+https://github.com/huggingface/parler-tts.git torch transformers soundfile"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")


@router.get("/tts-status")
async def get_tts_status():
    """Check if TTS is available."""
    try:
        from app.services.tts_service import is_tts_available
        return {"available": is_tts_available(), "model": "ai4bharat/indic-parler-tts"}
    except ImportError:
        return {"available": False, "model": None, "error": "parler-tts not installed"}
