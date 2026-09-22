"""
Document Database Model for storing uploaded study materials.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func
from app.database import Base

class UploadedDocument(Base):
    """Model for storing uploaded user documents and their derived topics."""
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, ppt, txt
    file_path = Column(String(500), nullable=False) # Local path inside container
    
    extracted_text = Column(Text, nullable=True)    # Extracted text content
    analysis_result = Column(JSON, nullable=True)   # Cached topics/summaries from LLM
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @validates("extracted_text")
    def validate_extracted_text(self, key, value):
        if isinstance(value, str):
            return value.replace("\x00", "")
        return value

    # Relationships
    user = relationship("User", back_populates="documents")
    test_results = relationship("TestResult", back_populates="document", cascade="all, delete-orphan")
