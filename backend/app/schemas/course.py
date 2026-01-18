"""Pydantic schemas for Course API."""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CourseBase(BaseModel):
    """Base course schema with common fields."""
    code: str = Field(..., min_length=2, max_length=20, description="Course code (e.g., CS101)")
    name: str = Field(..., min_length=1, max_length=200, description="Course name")
    credits: int = Field(default=3, ge=1, le=12, description="Credit hours")
    prerequisites: List[str] = Field(default=[], description="List of prerequisite course codes")
    semester_offered: str = Field(default="Both", description="Fall, Spring, or Both")
    difficulty_weight: int = Field(default=2, ge=1, le=5, description="Difficulty rating 1-5")
    description: Optional[str] = Field(default=None, description="Course description")


class CourseCreate(CourseBase):
    """Schema for creating a new course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating an existing course."""
    name: Optional[str] = None
    credits: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    semester_offered: Optional[str] = None
    difficulty_weight: Optional[int] = None
    description: Optional[str] = None


class CourseResponse(CourseBase):
    """Schema for course API responses."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    """Schema for listing multiple courses."""
    courses: List[CourseResponse]
    total: int


class CourseBulkImport(BaseModel):
    """Schema for bulk importing courses from CSV-like data."""
    courses: List[CourseCreate]
