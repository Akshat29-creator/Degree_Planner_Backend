"""
Practice & Self-Test Router - Handles question generation and evaluation.

MODES:
- Practice Mode: Questions WITH answers shown immediately.
- Self-Test Mode: Questions WITHOUT answers, evaluated after submission.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import uuid4
from datetime import datetime

from app.services.ollama_service import ollama_service

router = APIRouter(prefix="/practice", tags=["Practice & Self-Test"])

# ============================================
# In-Memory Answer Store (for Self-Test mode)
# ============================================
# Key: session_id, Value: dict of question_id -> correct_answer
_answer_store: Dict[str, Dict[str, str]] = {}


# ============================================
# Pydantic Schemas
# ============================================

class Question(BaseModel):
    """A single question with optional answer (hidden in self-test mode)."""
    question_id: str = Field(description="Unique ID for this question")
    text: str = Field(description="The question text")
    question_type: str = Field(description="mcq / short / long")
    options: Optional[List[str]] = Field(default=None, description="Options for MCQ")
    correct_answer: Optional[str] = Field(default=None, description="Correct answer (hidden in self-test)")
    explanation: Optional[str] = Field(default=None, description="Explanation (hidden in self-test)")


class GenerateQuestionsRequest(BaseModel):
    """Request to generate practice or self-test questions."""
    topic_name: str = Field(description="Name of the topic")
    topic_notes: str = Field(description="Content/notes for the topic")
    difficulty: str = Field(default="Medium", description="Easy / Medium / Hard")
    question_type: str = Field(default="mcq", description="mcq / short / long")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions")
    mode: str = Field(default="practice", description="practice / self-test")


class GenerateQuestionsResponse(BaseModel):
    """Response containing generated questions."""
    session_id: str = Field(description="Session ID for evaluation (self-test only)")
    topic_name: str
    question_type: str
    questions: List[Question]


class UserAnswer(BaseModel):
    """A single user answer submission."""
    question_id: str
    user_answer: str


class EvaluateRequest(BaseModel):
    """Request to evaluate user answers."""
    session_id: str = Field(description="Session ID from generate response")
    topic_name: str
    question_type: str
    answers: List[UserAnswer]


class QuestionFeedback(BaseModel):
    """Feedback for a single question."""
    question_id: str
    question_text: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    score: float
    max_score: float
    feedback: str


class EvaluateResponse(BaseModel):
    """Response containing evaluation results."""
    total_score: float
    max_score: float
    percentage: float
    performance_level: str  # Weak / Average / Strong
    question_feedback: List[QuestionFeedback]
    next_steps: List[str]


# ============================================
# Endpoints
# ============================================

@router.post("/generate", response_model=GenerateQuestionsResponse)
async def generate_questions(request: GenerateQuestionsRequest):
    """
    Generate questions for practice or self-test.
    
    - **mode=practice**: Returns questions WITH answers and explanations.
    - **mode=self-test**: Returns questions WITHOUT answers. Answers stored server-side.
    """
    if not request.topic_name or not request.topic_notes:
        raise HTTPException(status_code=400, detail="topic_name and topic_notes are required")
    
    if request.mode not in ("practice", "self-test"):
        raise HTTPException(status_code=400, detail="mode must be 'practice' or 'self-test'")
    
    if request.question_type not in ("mcq", "short", "long"):
        raise HTTPException(status_code=400, detail="question_type must be 'mcq', 'short', or 'long'")
    
    # Generate questions using AI (always include answers for storage)
    raw_questions = await ollama_service.generate_practice_questions(
        topic=request.topic_name,
        notes=request.topic_notes,
        difficulty=request.difficulty,
        q_type=request.question_type,
        count=request.count
    )
    
    session_id = str(uuid4())
    questions: List[Question] = []
    answer_map: Dict[str, str] = {}
    
    for idx, q in enumerate(raw_questions):
        qid = str(uuid4())
        
        question = Question(
            question_id=qid,
            text=q.get("text", f"Question {idx + 1}"),
            question_type=request.question_type,
            options=q.get("options"),
            correct_answer=q.get("correct_answer"),
            explanation=q.get("explanation")
        )
        
        # Store answer for evaluation
        answer_map[qid] = q.get("correct_answer", "")
        
        # SECURITY: Strip answers in self-test mode
        if request.mode == "self-test":
            question.correct_answer = None
            question.explanation = None
        
        questions.append(question)
    
    # Store answers server-side for self-test mode
    if request.mode == "self-test":
        _answer_store[session_id] = answer_map
    
    return GenerateQuestionsResponse(
        session_id=session_id,
        topic_name=request.topic_name,
        question_type=request.question_type,
        questions=questions
    )


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answers(request: EvaluateRequest):
    """
    Evaluate user-submitted answers and return scores with feedback.
    
    - Retrieves correct answers from server-side store.
    - Uses AI for semantic evaluation (short/long answers).
    - Returns per-question feedback and overall score.
    """
    if not request.answers:
        raise HTTPException(status_code=400, detail="No answers provided")
    
    # Get stored answers
    stored_answers = _answer_store.get(request.session_id, {})
    if not stored_answers:
        raise HTTPException(status_code=404, detail="Session not found or expired. Please regenerate questions.")
    
    # Prepare data for AI evaluation
    questions_for_eval = []
    for ans in request.answers:
        correct = stored_answers.get(ans.question_id, "")
        questions_for_eval.append({
            "question_id": ans.question_id,
            "user_answer": ans.user_answer,
            "correct_answer": correct
        })
    
    # Use AI for evaluation
    evaluation_result = await ollama_service.evaluate_answers(
        topic=request.topic_name,
        question_type=request.question_type,
        answers_data=questions_for_eval
    )
    
    # Clean up stored answers
    if request.session_id in _answer_store:
        del _answer_store[request.session_id]
    
    return EvaluateResponse(
        total_score=evaluation_result.get("total_score", 0),
        max_score=evaluation_result.get("max_score", len(request.answers)),
        percentage=evaluation_result.get("percentage", 0),
        performance_level=evaluation_result.get("performance_level", "Average"),
        question_feedback=evaluation_result.get("question_feedback", []),
        next_steps=evaluation_result.get("next_steps", ["Review the topic", "Try more questions"])
    )
