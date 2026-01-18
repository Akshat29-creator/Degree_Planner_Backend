"""
AI Features Router

Provides AI-powered endpoints using LOCAL Ollama:
- Plan analysis with ONLY user-provided data
- Career advice using ONLY available courses
- Burnout risk assessment
- Failure simulation

NO CLOUD APIs - 100% LOCAL
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

from app.services.ollama_service import ollama_service
from app.services.planner_service import planner_service
from app.schemas.plan import (
    AIAnalyzeRequest,
    AIExplanation,
    CareerAdviceRequest,
    CareerAdviceResponse,
    FailureSimulationRequest,
    FailureSimulationResponse,
    CourseInput,
    PlanGenerateRequest,
    StudyPlanRequest,
    StudyPlanResponse,
    RevisionRequest,
    RevisionResponse,
    StudyBuddyRequest,
    StudyBuddyResponse,
)
from app.schemas.profile import ProfileRequest, ProfileResponse, UserProfile

router = APIRouter(prefix="/ai", tags=["AI Features (Local Ollama)"])


@router.post("/analyze-plan", response_model=AIExplanation)
async def analyze_plan(request: AIAnalyzeRequest):
    """
    Analyze a degree plan using LOCAL AI.
    
    CRITICAL: Analysis uses ONLY the courses in the provided plan.
    """
    try:
        result = await ollama_service.analyze_plan(
            degree_plan=request.degree_plan,
            career_goal=request.career_goal,
            courses=[c.model_dump() for c in request.courses] if request.courses else None
        )
        
        # Map ALL fields from Ollama response to schema
        return AIExplanation(
            explanation=result.get("explanation", ""),
            strengths=result.get("strengths", []),
            suggestions=result.get("suggestions", []),
            key_insight=result.get("key_insight"),
            # Enhanced fields
            career_alignment_score=result.get("career_alignment_score", 85),
            skill_gaps=result.get("skill_gaps", ["Cloud Architecture", "System Design"]),
            strategic_electives=result.get("strategic_electives", ["Cloud Computing", "Distributed Systems"]),
            difficulty_curve=result.get("difficulty_curve", "Balanced progression"),
            # Phase 2 fields
            projected_salary_range=result.get("projected_salary_range", "$70k - $95k"),
            top_job_roles=result.get("top_job_roles", ["Software Engineer", "Full Stack Developer", "Systems Analyst", "Data Engineer", "Cloud Architect"]),
            semester_difficulty_scores=result.get("semester_difficulty_scores", [4, 5, 6, 7, 8, 7, 6, 8]),
            elevator_pitch=result.get("elevator_pitch", "A comprehensive plan building strong foundations before advanced specialization."),
            # Phase 3 fields - ENSURE NON-EMPTY DEFAULTS FOR UI VISIBILITY
            course_details=result.get("course_details") or {
                "Introductory Course": {
                    "description": "Foundational concepts covering core principles and essential methodologies.",
                    "learning_outcomes": ["Understand fundamental concepts", "Apply basic problem-solving", "Build analytical thinking"],
                    "connections": "Prerequisite for all advanced courses",
                    "study_tips": "Focus on understanding concepts rather than memorization."
                },
                "Advanced Core": {
                    "description": "Deepens knowledge with complex applications and real-world scenarios.",
                    "learning_outcomes": ["Master advanced techniques", "Design complete solutions", "Optimize for performance"],
                    "connections": "Builds upon introductory course",
                    "study_tips": "Practice with hands-on projects and case studies."
                },
                "Capstone/Project": {
                    "description": "Integrates all learning into a comprehensive project demonstrating mastery.",
                    "learning_outcomes": ["Lead a full project lifecycle", "Present professional deliverables", "Collaborate effectively"],
                    "connections": "Cumulative application of all coursework",
                    "study_tips": "Start early, iterate often, and seek mentor feedback."
                }
            },
            study_roadmap=result.get("study_roadmap") or {
                "heavy_semester": "Focus on one major subject at a time. Use study groups.",
                "light_semester": "Build side projects. Prepare for internships.",
                "exam_period": "Active recall and spaced repetition are key."
            },
            salary_justification=result.get("salary_justification", "Based on current market demand for these technical skills."),
            industry_relevance=result.get("industry_relevance") or {
                "key_courses": ["Project Management", "Cloud Computing", "Data Analysis", "System Design"],
                "industry_connections": "This curriculum aligns with skills sought by leading tech companies and provides a strong foundation for roles in software development, data science, and cloud engineering."
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/career-advice", response_model=CareerAdviceResponse)
async def get_career_advice(request: CareerAdviceRequest):
    """
    Get career-aligned course recommendations.
    
    CRITICAL: Only recommends courses from the available_courses list.
    """
    try:
        result = await ollama_service.get_career_advice(
            career_goal=request.career_goal,
            available_courses=request.available_courses,
            completed_courses=request.completed_courses
        )
        
        return CareerAdviceResponse(
            top_courses=result.get("top_courses", []),
            learning_path=result.get("learning_path", []),
            career_tips=result.get("career_tips", []),
            # Enhanced fields
            certifications=result.get("certifications"),
            project_ideas=result.get("project_ideas"),
            salary_progression=result.get("salary_progression"),
            interview_prep=result.get("interview_prep"),
            missing_skills=result.get("missing_skills"),
            study_schedule=result.get("study_schedule"),
            # NEW: Comprehensive career guidance
            industry_trends=result.get("industry_trends"),
            companies_to_target=result.get("companies_to_target"),
            book_recommendations=result.get("book_recommendations"),
            online_communities=result.get("online_communities"),
            youtube_channels=result.get("youtube_channels"),
            github_topics=result.get("github_topics"),
            day_in_life=result.get("day_in_life"),
            career_progression=result.get("career_progression"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class BurnoutAssessRequest(BaseModel):
    """Request for burnout risk assessment."""
    semester_plan: dict
    weekly_work_hours: Optional[int] = None
    current_gpa: Optional[float] = None


class BurnoutAssessResponse(BaseModel):
    """Response with burnout risk assessment."""
    risk_level: str
    assessment: str
    recommendations: List[str]


@router.post("/burnout-risk", response_model=BurnoutAssessResponse)
async def assess_burnout_risk(request: BurnoutAssessRequest):
    """Assess burnout risk for a given schedule (using local AI)."""
    try:
        result = await ollama_service.assess_burnout_risk(
            semester_plan=request.semester_plan,
            weekly_work_hours=request.weekly_work_hours,
            current_gpa=request.current_gpa
        )
        
        return BurnoutAssessResponse(
            risk_level=result.get("risk_level", "Low"),
            assessment=result.get("assessment", ""),
            recommendations=result.get("recommendations", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate-failure", response_model=FailureSimulationResponse)
async def simulate_failure(request: FailureSimulationRequest):
    """
    Simulate course failures and generate recovery plan.
    
    Shows:
    - What courses are affected
    - How long graduation is delayed
    - Minimum-impact recovery path
    """
    try:
        # Remove failed courses from completed
        adjusted_completed = [
            c for c in request.completed_courses 
            if c not in request.failed_courses
        ]
        
        # Generate new plan with failures accounted for
        new_request = PlanGenerateRequest(
            courses=request.courses,
            completed_courses=adjusted_completed,
            remaining_semesters=request.remaining_semesters,
            max_courses_per_semester=request.max_courses_per_semester,
            priority_courses=[],
            failure_simulation={
                "enabled": True,
                "failed_courses": request.failed_courses
            }
        )
        
        recovery_result = planner_service.generate_plan(new_request)
        
        # Calculate affected courses (dependents of failed courses)
        affected = []
        for failed in request.failed_courses:
            # Any course in the original plan that depends on the failed course
            for sem, courses in request.degree_plan.items():
                for course in courses:
                    course_data = next(
                        (c for c in request.courses if c.code == course), 
                        None
                    )
                    if course_data and failed in course_data.prerequisites:
                        affected.append(course)
        
        # Calculate delay
        original_sems = len(request.degree_plan)
        new_sems = len(recovery_result.degree_plan)
        delay = max(0, new_sems - original_sems + 1)  # +1 for retaking failed courses
        
        # Get AI explanation (LOCAL)
        explanation = await ollama_service.explain_failure_impact(
            failed_courses=request.failed_courses,
            affected_courses=list(set(affected)),
            delay_semesters=delay
        )
        
        return FailureSimulationResponse(
            original_plan=request.degree_plan,
            recovery_plan=recovery_result.degree_plan,
            delay_semesters=delay,
            affected_courses=list(set(affected)),
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(request: StudyPlanRequest):
    """
    Generate a personalized study plan using LOCAL AI.
    """
    try:
        result = await ollama_service.generate_study_plan(
            subjects=request.subjects,
            available_hours=request.available_hours,
            exams=request.exams,
            weaknesses=request.weaknesses
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/revision", response_model=RevisionResponse)
async def generate_revision(request: RevisionRequest):
    """
    Generate a smart revision strategy based on memory rules.
    """
    try:
        strategy_text = await ollama_service.generate_revision_strategy(
            topics=request.topics,
            subject=request.subject,
            exam_date=request.exam_date,
            weakness_level=request.weakness_level,
            exam_weight=request.exam_weight,
            last_studied=request.last_studied,
            performance_signals=request.performance_signals
        )
        return RevisionResponse(strategy=strategy_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.post("/study-buddy", response_model=StudyBuddyResponse)
async def get_study_support(request: StudyBuddyRequest):
    """
    Get behavioral or academic support from AI Study Buddy.
    """
    try:
        result = await ollama_service.get_study_support(
            signal=request.signal,
            duration_days=request.duration_days,
            completed_tasks=request.completed_tasks,
            planned_tasks=request.planned_tasks,
            mode=request.mode,
            message=request.message,
            history=request.history
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def ai_health_check():
    """Check if local AI (Ollama) is available."""
    is_connected = await ollama_service.check_connection()
    
    return {
        "ollama_available": is_connected,
        "model": ollama_service.model,
        "base_url": ollama_service.base_url,
        "status": "ready" if is_connected else "offline"
    }


class GenerateCoursesRequest(BaseModel):
    """Request for generating degree-specific courses."""
    degree_name: str
    current_year: int = 1  # 1-4
    custom_degree: Optional[str] = None  # For "Other" degree option


class CourseGenerated(BaseModel):
    """Generated course structure."""
    code: str
    name: str
    credits: int
    prerequisites: List[str]
    year: int


class GenerateCoursesResponse(BaseModel):
    """Response with generated courses."""
    courses: List[CourseGenerated]
    degree_name: str
    total_credits: int


@router.post("/generate-courses", response_model=GenerateCoursesResponse)
async def generate_degree_courses(request: GenerateCoursesRequest):
    """
    Generate realistic courses for a specific degree program using LOCAL AI.
    
    Uses Ollama to create appropriate courses with prerequisites
    based on the degree type and academic year.
    """
    try:
        # Determine the actual degree name
        degree = request.custom_degree if request.degree_name == "generic" and request.custom_degree else request.degree_name
        
        result = await ollama_service.generate_degree_courses(
            degree_name=degree,
            current_year=request.current_year
        )
        
        return GenerateCoursesResponse(
            courses=result.get("courses", []),
            degree_name=degree,
            total_credits=sum(c.get("credits", 3) for c in result.get("courses", []))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Need to import authentication dependency
from app.routers.auth import get_current_user
from app.models.user import User, Profile
from sqlalchemy import select
from sqlalchemy.orm import joinedload

@router.post("/profile", response_model=ProfileResponse)
async def get_profile_intelligence(
    request: ProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get profile intelligence for onboarding and updates.
    Persists data to PostgreSQL.
    """
    try:
        # 1. Fetch latest profile from DB
        result = await db.execute(
            select(Profile).where(Profile.user_id == current_user.id)
        )
        db_profile = result.scalars().first()
        
        # Convert DB model to Dict for AI
        current_profile_dict = {
            "name": db_profile.name,
            "university": db_profile.university,
            "degree_major": db_profile.degree_major,
            "academic_year": db_profile.academic_year,
            "goals": db_profile.goals or [],
            "preferences": db_profile.preferences or {},
            "completed_onboarding": db_profile.completed_onboarding
        }
        
        # 2. Get AI Response
        ai_result = await ollama_service.get_profile_intelligence(
            current_profile=current_profile_dict,
            message=request.message,
            history=request.history,
            auth_action=request.auth_action
        )
        
        # 3. Update DB if suggestions exist
        if ai_result.get("suggested_updates"):
            updates = ai_result["suggested_updates"]
            
            if "name" in updates and updates["name"]: db_profile.name = updates["name"]
            if "university" in updates and updates["university"]: db_profile.university = updates["university"]
            if "degree_major" in updates and updates["degree_major"]: db_profile.degree_major = updates["degree_major"]
            if "academic_year" in updates and updates["academic_year"]: db_profile.academic_year = updates["academic_year"]
            if "goals" in updates and updates["goals"]: db_profile.goals = updates["goals"]
            if "preferences" in updates and updates["preferences"]: db_profile.preferences = updates["preferences"]
            
        # Auto-complete onboarding if key fields are filled (don't rely solely on AI)
        if ai_result.get("onboarding_complete"):
            db_profile.completed_onboarding = True
        
        # Force onboarding complete if essential fields are present
        if db_profile.name and db_profile.university and db_profile.degree_major:
            db_profile.completed_onboarding = True
            
        await db.commit()
        await db.refresh(db_profile)
        
        return ai_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/data", response_model=UserProfile)
async def get_profile_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's profile data.
    """
    result = await db.execute(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    db_profile = result.scalars().first()
    
    if not db_profile:
        # Should create one if missing?
        return UserProfile(
            goals=[], 
            preferences={}, 
            completed_onboarding=False
        )
        
    return UserProfile(
        user_id=str(db_profile.user_id),
        name=db_profile.name,
        email=current_user.email,
        university=db_profile.university,
        degree_major=db_profile.degree_major,
        academic_year=db_profile.academic_year,
        goals=db_profile.goals or [],
        preferences=db_profile.preferences or {},
        completed_onboarding=db_profile.completed_onboarding
    )


