"""
TestResult Model - Stores test attempt history for users across all question types.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class TestResult(Base):
    """Model for storing AI-generated practice/self-test results and deep analysis."""
    
    __tablename__ = "test_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(Integer, ForeignKey("uploaded_documents.id", ondelete="SET NULL"), nullable=True)
    
    # Test metadata
    topic_name = Column(String(255), nullable=False)
    mode = Column(String(50), default="practice") # "practice" or "certification"
    
    # Scores
    total_score = Column(Float, default=0)
    max_score = Column(Float, default=0)
    percentage = Column(Float, default=0)
    performance_level = Column(String(50), default="Average")  # Weak / Average / Strong
    
    # Question configurations used for this test
    mcq_count = Column(Integer, default=0)
    short_count = Column(Integer, default=0)
    long_count = Column(Integer, default=0)
    
    # Spaced Repetition (SM-2) columns
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)
    next_review_at = Column(DateTime(timezone=True), nullable=True)
    
    # Full data payloads
    questions_json = Column(JSON, nullable=True) # The generated test with user answers
    feedback_json = Column(JSON, nullable=True)  # Teacher evaluation with deep analysis showing how to improve
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="test_results")
    document = relationship("UploadedDocument", back_populates="test_results")
