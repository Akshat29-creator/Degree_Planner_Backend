"""Degree Plan database model."""
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy import String, Integer, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DegreePlan(Base):
    """Saved degree plan model."""
    
    __tablename__ = "degree_plans"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, default="My Degree Plan")
    
    # Plan structure: {"semester_1": ["CS101", "MA101"], "semester_2": [...]}
    semesters: Mapped[Dict[str, List[str]]] = mapped_column(JSON, nullable=False)
    
    # Input parameters used to generate plan
    completed_courses: Mapped[List[str]] = mapped_column(JSON, default=list)
    priority_courses: Mapped[List[str]] = mapped_column(JSON, default=list)
    max_courses_per_semester: Mapped[int] = mapped_column(Integer, default=5)
    total_semesters: Mapped[int] = mapped_column(Integer, default=6)
    
    # Analysis results
    semester_difficulty: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict)
    risk_analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    career_alignment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    advisor_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Additional metadata for history display
    degree_program: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    career_goal: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    # Full course data for complete restoration
    courses_data: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    data_source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # demo/uploaded/manual
    
    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<DegreePlan {self.id}: {self.name}>"
