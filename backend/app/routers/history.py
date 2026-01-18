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

router = APIRouter(prefix="/history", tags=["History"])


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
    courses_data: list = []
    data_source: Optional[str] = None
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
    courses_data: list = []
    data_source: Optional[str] = None


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
        priority_courses=request.priority_courses,
        max_courses_per_semester=request.max_courses_per_semester,
        total_semesters=request.total_semesters,
        semester_difficulty=request.semester_difficulty,
        risk_analysis=request.risk_analysis,
        career_alignment_notes=request.career_alignment_notes,
        advisor_explanation=request.advisor_explanation,
        degree_program=request.degree_program,
        career_goal=request.career_goal,
        courses_data=request.courses_data,
        data_source=request.data_source,
    )
    
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    
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
