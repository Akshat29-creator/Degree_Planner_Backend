"""
PracticeSession Model - Temporarily stores practice/self-test session answer maps 
to persist state when Redis is offline.
"""
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class PracticeSession(Base):
    """Model for storing temporary practice/self-test correct answers to persist session state when Redis is offline."""
    
    __tablename__ = "practice_sessions"
    
    session_id = Column(String(255), primary_key=True, index=True)
    answer_map = Column(JSON, nullable=False) # Stores Dict[str, str] representing qid -> correct_answer
    created_at = Column(DateTime(timezone=True), server_default=func.now())
