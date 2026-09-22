"""
History Router - CRUD operations for plan history.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.plan import DegreePlan
from app.utils.security import get_current_user_optional
from app.models.document import UploadedDocument
from app.models.test_result import TestResult
from app.models.user import Profile
from sqlalchemy import delete

from app.routers.flags import feature_guard

router = APIRouter(prefix="/history", tags=["History"], dependencies=[Depends(feature_guard("history"))])


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================
class PlanHistoryItem(BaseModel):
    id: int
    name: str
    created_at: datetime
    total_semesters: int
    completed_courses_count: int
    total_courses_count: int = 0
    degree_program: Optional[str] = None
    career_goal: Optional[str] = None
    
    class Config:
        from_attributes = True


class PlanHistoryDetail(BaseModel):
    id: int
    name: str
    semesters: dict
    completed_courses: list
    priority_courses: list
    max_courses_per_semester: int
    total_semesters: int
    semester_difficulty: dict
    risk_analysis: Optional[dict] = None
    career_alignment_notes: Optional[str] = None
    advisor_explanation: Optional[str] = None
    degree_program: Optional[str] = None
    career_goal: Optional[str] = None
    ai_analysis: Optional[dict] = None
    courses_data: list = []
    data_source: Optional[str] = None
    completed_course_grades: dict = {}
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SavePlanRequest(BaseModel):
    name: str = "My Degree Plan"
    semesters: dict
    completed_courses: list = []
    priority_courses: list = []
    max_courses_per_semester: int = 5
    total_semesters: int = 6
    semester_difficulty: dict = {}
    risk_analysis: Optional[dict] = None
    career_alignment_notes: Optional[str] = None
    advisor_explanation: Optional[str] = None
    degree_program: Optional[str] = None
    career_goal: Optional[str] = None
    ai_analysis: Optional[dict] = None
    courses_data: list = []
    data_source: Optional[str] = None
    completed_course_grades: dict = {}


# ==========================================
# ENDPOINTS
# ==========================================
@router.get("", response_model=List[PlanHistoryItem])
async def get_plan_history(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get all saved plans for current user."""
    user_id = current_user.id if current_user else None
    
    query = select(DegreePlan).order_by(desc(DegreePlan.created_at))
    if user_id:
        query = query.where(DegreePlan.user_id == user_id)
    else:
        query = query.where(DegreePlan.user_id.is_(None))
    
    result = await db.execute(query)
    plans = result.scalars().all()
    
    return [
        PlanHistoryItem(
            id=plan.id,
            name=plan.name,
            created_at=plan.created_at,
            total_semesters=plan.total_semesters,
            completed_courses_count=len(plan.completed_courses or []),
            total_courses_count=sum(len(courses) for courses in (plan.semesters or {}).values()),
            degree_program=plan.degree_program,
            career_goal=plan.career_goal
        )
        for plan in plans
    ]


@router.post("", response_model=PlanHistoryDetail, status_code=status.HTTP_201_CREATED)
async def save_plan(
    request: SavePlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Save current plan to history."""
    user_id = current_user.id if current_user else None
    
    plan = DegreePlan(
        user_id=user_id,
        name=request.name,
        semesters=request.semesters,
        completed_courses=request.completed_courses,
        completed_course_grades=request.completed_course_grades,
        priority_courses=request.priority_courses,
        max_courses_per_semester=request.max_courses_per_semester,
        total_semesters=request.total_semesters,
        semester_difficulty=request.semester_difficulty,
        risk_analysis=request.risk_analysis,
        career_alignment_notes=request.career_alignment_notes,
        advisor_explanation=request.advisor_explanation,
        degree_program=request.degree_program,
        career_goal=request.career_goal,
        ai_analysis=request.ai_analysis,
        courses_data=request.courses_data,
        data_source=request.data_source,
    )
    
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    
    return plan


# ==========================================
# IMPORTANT: All fixed-string sub-paths MUST be defined BEFORE /{plan_id}
# to prevent FastAPI from matching "documents", "tests", "reset-all-data" as integers.
# ==========================================

@router.delete("/reset-all-data", tags=["System"], status_code=status.HTTP_204_NO_CONTENT)
async def reset_all_user_data(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Deletes ALL user data (plans, documents, tests) and resets profile to initial state.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in to reset data")
    
    user_id = current_user.id
    
    # 1. Delete all DegreePlans
    await db.execute(delete(DegreePlan).where(DegreePlan.user_id == user_id))
    
    # 2. Delete all UploadedDocuments
    await db.execute(delete(UploadedDocument).where(UploadedDocument.user_id == user_id))
    
    # 3. Delete all TestResults
    await db.execute(delete(TestResult).where(TestResult.user_id == user_id))
    
    # 4. Reset Profile
    query = select(Profile).where(Profile.user_id == user_id)
    profile = (await db.execute(query)).scalar_one_or_none()
    
    if profile:
        profile.name = None
        profile.university = None
        profile.degree_major = None
        profile.academic_year = None
        profile.goals = []
        profile.preferences = {}
        profile.completed_onboarding = False
    
    await db.commit()
    return None


# ==========================================
# ASSESSMENT HISTORY - Documents
# ==========================================

@router.get("/documents", tags=["Assessment History"])
async def get_user_documents(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get all uploaded documents for the current user."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in to view documents")
    
    query = select(UploadedDocument).where(UploadedDocument.user_id == current_user.id).order_by(desc(UploadedDocument.created_at))
    result = await db.execute(query)
    docs = result.scalars().all()
    
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "analysis_result": doc.analysis_result,
            "created_at": doc.created_at.isoformat() if doc.created_at else None
        }
        for doc in docs
    ]

@router.get("/documents/{doc_id}", tags=["Assessment History"])
async def get_document_details(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in")
        
    query = select(UploadedDocument).where(UploadedDocument.id == doc_id, UploadedDocument.user_id == current_user.id)
    doc = (await db.execute(query)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "extracted_text": doc.extracted_text,
        "analysis_result": doc.analysis_result,
        "created_at": doc.created_at.isoformat() if doc.created_at else None
    }

@router.delete("/documents/{doc_id}", tags=["Assessment History"], status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in")
        
    query = select(UploadedDocument).where(UploadedDocument.id == doc_id, UploadedDocument.user_id == current_user.id)
    doc = (await db.execute(query)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    await db.delete(doc)
    await db.commit()
    return None


# ==========================================
# ASSESSMENT HISTORY - Tests
# ==========================================

@router.get("/tests", tags=["Assessment History"])
async def get_user_tests(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get all test results for the current user."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in")
        
    query = select(TestResult).where(TestResult.user_id == current_user.id).order_by(desc(TestResult.created_at))
    result = await db.execute(query)
    tests = result.scalars().all()
    
    return [
        {
            "id": t.id,
            "topic_name": t.topic_name,
            "percentage": t.percentage,
            "performance_level": t.performance_level,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "mcq_count": t.mcq_count,
            "short_count": t.short_count,
            "long_count": t.long_count
        }
        for t in tests
    ]

@router.get("/tests/{test_id}", tags=["Assessment History"])
async def get_test_details(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get full details of a specific test."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in")
        
    query = select(TestResult).where(TestResult.id == test_id, TestResult.user_id == current_user.id)
    test = (await db.execute(query)).scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    return {
        "id": test.id,
        "topic_name": test.topic_name,
        "percentage": test.percentage,
        "performance_level": test.performance_level,
        "mcq_count": test.mcq_count,
        "short_count": test.short_count,
        "long_count": test.long_count,
        "questions_json": test.questions_json,
        "feedback_json": test.feedback_json,
        "created_at": test.created_at.isoformat() if test.created_at else None
    }

@router.delete("/tests/{test_id}", tags=["Assessment History"], status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_test(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Must be logged in")
        
    query = select(TestResult).where(TestResult.id == test_id, TestResult.user_id == current_user.id)
    test = (await db.execute(query)).scalar_one_or_none()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    await db.delete(test)
    await db.commit()
    return None


# ==========================================
# DEGREE PLAN CRUD - /{plan_id} MUST BE LAST
# (wildcard routes must come after all fixed-string routes)
# ==========================================

@router.get("/{plan_id}", response_model=PlanHistoryDetail)
async def get_plan_detail(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Get detailed view of a specific saved plan."""
    user_id = current_user.id if current_user else None
    
    query = select(DegreePlan).where(DegreePlan.id == plan_id)
    if user_id:
        query = query.where(DegreePlan.user_id == user_id)
    else:
        query = query.where(DegreePlan.user_id.is_(None))
    
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """Delete a saved plan."""
    user_id = current_user.id if current_user else None
    
    query = select(DegreePlan).where(DegreePlan.id == plan_id)
    if user_id:
        query = query.where(DegreePlan.user_id == user_id)
    else:
        query = query.where(DegreePlan.user_id.is_(None))
    
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    await db.delete(plan)
    await db.commit()
    
    return None
