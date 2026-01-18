"""
TestResult Model - Stores test attempt history for users.
"""
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

from app.db.base_class import Base


class TestResult(Base):
    """Model for storing practice/self-test results."""
    
    __tablename__ = "test_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Test metadata
    topic_name = Column(String, nullable=False)
    question_type = Column(String, nullable=False)  # mcq / short / long
    mode = Column(String, nullable=False)  # practice / self-test
    
    # Scores
    total_score = Column(Float, default=0)
    max_score = Column(Float, default=0)
    percentage = Column(Float, default=0)
    performance_level = Column(String, default="Average")  # Weak / Average / Strong
    
    # Full data (questions, answers, feedback)
    questions_json = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="test_results")
