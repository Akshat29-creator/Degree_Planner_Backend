"""Course management API router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.course import Course
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseListResponse,
    CourseBulkImport,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=CourseListResponse)
async def list_courses(db: AsyncSession = Depends(get_db)):
    """Get all courses."""
    result = await db.execute(select(Course).order_by(Course.code))
    courses = result.scalars().all()
    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in courses],
        total=len(courses)
    )


@router.get("/{code}", response_model=CourseResponse)
async def get_course(code: str, db: AsyncSession = Depends(get_db)):
    """Get a specific course by code."""
    result = await db.execute(select(Course).where(Course.code == code.upper()))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {code} not found"
        )
    
    return CourseResponse.model_validate(course)


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new course."""
    # Check if course already exists
    existing = await db.execute(
        select(Course).where(Course.code == course_data.code.upper())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Course {course_data.code} already exists"
        )
    
    course = Course(
        code=course_data.code.upper(),
        name=course_data.name,
        credits=course_data.credits,
        prerequisites=course_data.prerequisites,
        semester_offered=course_data.semester_offered,
        difficulty_weight=course_data.difficulty_weight,
        description=course_data.description,
    )
    
    db.add(course)
    await db.flush()
    await db.refresh(course)
    
    return CourseResponse.model_validate(course)


@router.put("/{code}", response_model=CourseResponse)
async def update_course(
    code: str,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing course."""
    result = await db.execute(select(Course).where(Course.code == code.upper()))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {code} not found"
        )
    
    # Update only provided fields
    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.flush()
    await db.refresh(course)
    
    return CourseResponse.model_validate(course)


@router.delete("/{code}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(code: str, db: AsyncSession = Depends(get_db)):
    """Delete a course."""
    result = await db.execute(select(Course).where(Course.code == code.upper()))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {code} not found"
        )
    
    await db.delete(course)


@router.post("/bulk", response_model=CourseListResponse)
async def bulk_import_courses(
    data: CourseBulkImport,
    db: AsyncSession = Depends(get_db)
):
    """Bulk import courses (useful for importing from CSV)."""
    created_courses = []
    
    for course_data in data.courses:
        # Skip if exists
        existing = await db.execute(
            select(Course).where(Course.code == course_data.code.upper())
        )
        if existing.scalar_one_or_none():
            continue
        
        course = Course(
            code=course_data.code.upper(),
            name=course_data.name,
            credits=course_data.credits,
            prerequisites=course_data.prerequisites,
            semester_offered=course_data.semester_offered,
            difficulty_weight=course_data.difficulty_weight,
            description=course_data.description,
        )
        db.add(course)
        created_courses.append(course)
    
    await db.flush()
    
    # Refresh all courses
    for course in created_courses:
        await db.refresh(course)
    
    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in created_courses],
        total=len(created_courses)
    )


@router.get("/demo/load", response_model=CourseListResponse)
async def load_demo_courses(db: AsyncSession = Depends(get_db)):
    """Load demo course data."""
    demo_courses = [
        CourseCreate(code="CS101", name="Introduction to Programming", credits=4, prerequisites=[]),
        CourseCreate(code="CS102", name="Data Structures", credits=4, prerequisites=["CS101"]),
        CourseCreate(code="CS201", name="Algorithms", credits=4, prerequisites=["CS102"]),
        CourseCreate(code="CS202", name="Computer Organization", credits=3, prerequisites=["CS101"]),
        CourseCreate(code="CS301", name="Operating Systems", credits=4, prerequisites=["CS201", "CS202"]),
        CourseCreate(code="CS302", name="Databases", credits=3, prerequisites=["CS102"]),
        CourseCreate(code="CS303", name="Computer Networks", credits=3, prerequisites=["CS202"]),
        CourseCreate(code="CS401", name="Machine Learning", credits=4, prerequisites=["CS201"]),
        CourseCreate(code="CS402", name="Software Engineering", credits=3, prerequisites=["CS201"]),
        CourseCreate(code="CS403", name="Capstone Project", credits=6, prerequisites=["CS301", "CS302", "CS402"]),
        CourseCreate(code="MA101", name="Calculus I", credits=4, prerequisites=[]),
        CourseCreate(code="MA102", name="Discrete Mathematics", credits=3, prerequisites=["MA101"]),
        CourseCreate(code="EL101", name="Open Elective I", credits=3, prerequisites=[]),
        CourseCreate(code="EL102", name="Open Elective II", credits=3, prerequisites=[]),
    ]
    
    created_courses = []
    
    for course_data in demo_courses:
        existing = await db.execute(
            select(Course).where(Course.code == course_data.code)
        )
        if existing.scalar_one_or_none():
            continue
        
        course = Course(
            code=course_data.code,
            name=course_data.name,
            credits=course_data.credits,
            prerequisites=course_data.prerequisites,
            semester_offered=course_data.semester_offered,
            difficulty_weight=course_data.difficulty_weight,
        )
        db.add(course)
        created_courses.append(course)
    
    await db.flush()
    
    for course in created_courses:
        await db.refresh(course)
    
    return CourseListResponse(
        courses=[CourseResponse.model_validate(c) for c in created_courses],
        total=len(created_courses)
    )
