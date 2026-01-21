"""
Interview Database Models.
Models for AI Interview Simulator feature.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, JSON, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class InterviewStatus(str, enum.Enum):
    """Interview session status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuestionType(str, enum.Enum):
    """Types of interview questions."""
    WARMUP = "warmup"
    RESUME_BASED = "resume_based"
    TECHNICAL = "technical"
    SCENARIO = "scenario"
    BEHAVIORAL = "behavioral"
    CLOSING = "closing"


class Resume(Base):
    """User resume for interview preparation."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    generated_by_ai = Column(Boolean, default=False)
    
    # Structured resume data (parsed or input)
    name = Column(String(255), nullable=True)
    education = Column(JSON, default=list)  # [{"degree": "", "institution": "", "year": ""}]
    skills = Column(JSON, default=list)  # ["Python", "React", ...]
    projects = Column(JSON, default=list)  # [{"title": "", "description": "", "tech": []}]
    experience = Column(JSON, default=list)  # [{"role": "", "company": "", "duration": ""}]
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="resumes")
    sessions = relationship("InterviewSession", back_populates="resume")


class InterviewSession(Base):
    """Interview session tracking."""
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    
    # Interview configuration
    skill_type = Column(String(100), nullable=False)  # Backend, DSA, ML, HR, etc.
    language = Column(String(50), default="en")  # en, hi, ta, te, etc.
    question_count = Column(Integer, default=10)
    
    # Session state
    status = Column(String(20), default=InterviewStatus.PENDING.value)
    current_question_index = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="interview_sessions")
    resume = relationship("Resume", back_populates="sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    report = relationship("InterviewReport", back_populates="session", uselist=False, cascade="all, delete-orphan")


class InterviewQuestion(Base):
    """Individual interview question and response."""
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    
    # Question details
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default=QuestionType.TECHNICAL.value)
    order_index = Column(Integer, nullable=False)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    
    # User response
    user_answer = Column(Text, nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=True)
    
    # AI analysis of answer
    ai_analysis = Column(JSON, nullable=True)  # {correctness, clarity, completeness, relevance, score}
    score = Column(Integer, nullable=True)  # 0-100
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")


class InterviewReport(Base):
    """Final interview performance report."""
    __tablename__ = "interview_reports"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Scores (0-100)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)
    problem_solving_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    
    # Insights (JSON arrays of strings)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    retry_recommendations = Column(JSON, default=list)
    
    # Detailed analysis
    confidence_insights = Column(Text, nullable=True)
    behavior_insights = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("InterviewSession", back_populates="report")
