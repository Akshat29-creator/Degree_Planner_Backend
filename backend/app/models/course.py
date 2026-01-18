"""Course database model."""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Course(Base):
    """Course model representing a university course."""
    
    __tablename__ = "courses"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    prerequisites: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    semester_offered: Mapped[str] = mapped_column(String(20), default="Both")  # Fall, Spring, Both
    difficulty_weight: Mapped[int] = mapped_column(Integer, default=2)  # 1-5 scale
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Course {self.code}: {self.name}>"
