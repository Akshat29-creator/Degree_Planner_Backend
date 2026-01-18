"""Degree Plan generation and management API router."""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.plan import DegreePlan
from app.schemas.plan import (
    PlanGenerateRequest,
    PlanGenerateResponse,
    PlanSaveRequest,
    PlanSaveResponse,
    CourseInput,
)
from app.services.planner_service import planner_service
from app.utils.ics_generator import generate_ics_file

router = APIRouter(prefix="/plan", tags=["Degree Plan"])


@router.post("/generate", response_model=PlanGenerateResponse)
async def generate_plan(request: PlanGenerateRequest):
    """
    Generate an optimized degree plan.
    
    This is the core planning endpoint that:
    1. Resolves prerequisites using topological sort
    2. Schedules courses respecting max load per semester
    3. Prioritizes requested courses
    4. Calculates difficulty ratings per semester
    5. Assesses graduation and burnout risks
    """
    try:
        result = planner_service.generate_plan(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plan generation failed: {str(e)}"
        )


@router.post("/generate-demo", response_model=PlanGenerateResponse)
async def generate_demo_plan():
    """Generate a plan using demo data - useful for testing."""
    demo_request = PlanGenerateRequest(
        courses=[
            CourseInput(code="CS101", name="Introduction to Programming", credits=4, prerequisites=[]),
            CourseInput(code="CS102", name="Data Structures", credits=4, prerequisites=["CS101"]),
            CourseInput(code="CS201", name="Algorithms", credits=4, prerequisites=["CS102"]),
            CourseInput(code="CS202", name="Computer Organization", credits=3, prerequisites=["CS101"]),
            CourseInput(code="CS301", name="Operating Systems", credits=4, prerequisites=["CS201", "CS202"]),
            CourseInput(code="CS302", name="Databases", credits=3, prerequisites=["CS102"]),
            CourseInput(code="CS401", name="Machine Learning", credits=4, prerequisites=["CS201"]),
            CourseInput(code="CS403", name="Capstone Project", credits=6, prerequisites=["CS301", "CS302"]),
            CourseInput(code="MA101", name="Calculus I", credits=4, prerequisites=[]),
            CourseInput(code="MA102", name="Discrete Mathematics", credits=3, prerequisites=["MA101"]),
        ],
        completed_courses=[],
        remaining_semesters=6,
        max_courses_per_semester=4,
        priority_courses=["CS401"],
        career_goal="Machine Learning Engineer"
    )
    
    return planner_service.generate_plan(demo_request)


@router.post("/save", response_model=PlanSaveResponse, status_code=status.HTTP_201_CREATED)
async def save_plan(
    request: PlanSaveRequest,
    db: AsyncSession = Depends(get_db)
):
    """Save a generated plan to the database."""
    plan = DegreePlan(
        name=request.name,
        semesters=request.plan_response.degree_plan,
        completed_courses=request.completed_courses,
        priority_courses=request.priority_courses,
        semester_difficulty=request.plan_response.semester_difficulty,
        risk_analysis=request.plan_response.risk_analysis.model_dump(),
        career_alignment_notes=request.plan_response.career_alignment_notes,
        advisor_explanation=request.plan_response.advisor_explanation,
    )
    
    db.add(plan)
    await db.flush()
    await db.refresh(plan)
    
    return PlanSaveResponse(
        id=plan.id,
        name=plan.name,
        created_at=plan.created_at
    )


@router.get("/{plan_id}/export", response_class=PlainTextResponse)
async def export_plan_ics(
    plan_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Export a saved plan as an ICS calendar file."""
    result = await db.execute(select(DegreePlan).where(DegreePlan.id == plan_id))
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan {plan_id} not found"
        )
    
    ics_content = generate_ics_file(plan.semesters)
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=degree_plan_{plan_id}.ics"}
    )


@router.post("/export-direct", response_class=PlainTextResponse)
async def export_plan_direct(degree_plan: dict):
    """
    Export a plan directly (without saving) as ICS.
    
    Expects: {"degree_plan": {"semester_1": [...], ...}}
    """
    if "degree_plan" not in degree_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="degree_plan field is required"
        )
    
    ics_content = generate_ics_file(degree_plan["degree_plan"])
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": "attachment; filename=degree_plan.ics"}
    )


@router.get("/saved", response_model=list)
async def list_saved_plans(db: AsyncSession = Depends(get_db)):
    """List all saved plans."""
    result = await db.execute(
        select(DegreePlan).order_by(DegreePlan.created_at.desc())
    )
    plans = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "semester_count": len(p.semesters),
            "created_at": p.created_at.isoformat()
        }
        for p in plans
    ]
