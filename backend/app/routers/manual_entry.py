"""
Manual Entry Router - Allow users to manually enter courses and analyze with AI.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.ollama_service import OllamaService

router = APIRouter(prefix="/manual-entry", tags=["Manual Entry"])


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================
class ManualCourse(BaseModel):
    code: str
    name: str
    credits: int
    semester: Optional[int] = None  # Which semester user plans to take it
    prerequisites: List[str] = []
    description: Optional[str] = None


class ManualEntryRequest(BaseModel):
    degree_program: str
    current_year: int  # 1, 2, 3, or 4
    total_years: int = 4
    remaining_semesters: int
    courses: List[ManualCourse]
    career_goal: Optional[str] = None


class AnalyzedCourse(BaseModel):
    code: str
    name: str
    credits: int
    prerequisites: List[str]
    suggested_semester: int
    difficulty: str  # easy, medium, hard
    category: str  # core, elective, prerequisite


class ManualEntryAnalysis(BaseModel):
    is_valid: bool
    issues: List[str]
    warnings: List[str]
    analyzed_courses: List[AnalyzedCourse]
    suggested_plan: dict  # {"semester_1": ["CS101"], ...}
    total_credits: int
    estimated_semesters: int
    ai_recommendations: str


# ==========================================
# ENDPOINTS
# ==========================================
@router.post("/analyze", response_model=ManualEntryAnalysis)
async def analyze_manual_entry(
    request: ManualEntryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze manually entered courses using AI.
    Maps prerequisites, validates structure, and suggests optimal plan.
    """
    ollama = OllamaService()
    
    # Validate basic structure
    issues = []
    warnings = []
    
    # Check for duplicate codes
    codes = [c.code for c in request.courses]
    if len(codes) != len(set(codes)):
        issues.append("Duplicate course codes found")
    
    # Check prerequisites reference existing courses
    for course in request.courses:
        for prereq in course.prerequisites:
            if prereq not in codes:
                warnings.append(f"Course {course.code} has prerequisite {prereq} not in course list")
    
    # Calculate totals
    total_credits = sum(c.credits for c in request.courses)
    
    # Build AI prompt for analysis
    courses_text = "\n".join([
        f"- {c.code}: {c.name} ({c.credits} credits). User notes: {c.description or 'None'}"
        for c in request.courses
    ])
    
    prompt = f"""Analyze these manually entered courses for a {request.degree_program} degree program.
Student is in year {request.current_year} of {request.total_years}, with {request.remaining_semesters} semesters remaining.
Career Goal: {request.career_goal or 'Not specified'}

Courses:
{courses_text}

Task:
1. Identify standard prerequisites for each course based on common academic curriculums.
2. Suggest a logical semester-by-semester plan.
3. partial matching/correction of course codes if they look standard (e.g. "Intro to CS" -> "CS101").

Provide analysis in this exact JSON format:
{{
    "analyzed_courses": [
        {{
            "code": "CS101", 
            "name": "Introduction to Computer Science",
            "suggested_semester": 1, 
            "difficulty": "easy", 
            "category": "core",
            "prerequisites": [] 
        }},
        {{
            "code": "CS102",
            "name": "Data Structures", 
            "suggested_semester": 2, 
            "difficulty": "medium", 
            "category": "core",
            "prerequisites": ["CS101"]
        }}
    ],
    "suggested_plan": {{
        "semester_1": ["CS101", "MATH101"],
        "semester_2": ["CS102"]
    }},
    "recommendations": "Brief recommendations..."
}}

Rules:
- INFER prerequisites if they are missing. Use standard CS/Engineering knowledge.
- Suggest semester numbers relative to remaining semesters (1 = next semester).
- difficulty: easy, medium, hard.
- category: core, elective, prerequisite.
"""

    try:
        response = await ollama._call_ollama(prompt)
        
        if response:
            # Parse AI response
            analyzed_courses = []
            suggested_plan = {}
            recommendations = ""
            
            if "analyzed_courses" in response:
                for ac in response.get("analyzed_courses", []):
                    # Find original course data by matching code closely (or use AI returned code)
                    # We accept the AI's corrected code/name/prereqs
                    analyzed_courses.append(AnalyzedCourse(
                        code=ac.get("code", "Unknown"),
                        name=ac.get("name", "Unknown Course"),
                        credits=ac.get("credits", 3), # Fallback
                        prerequisites=ac.get("prerequisites", []), # Use AI inferred prereqs
                        suggested_semester=ac.get("suggested_semester", 1),
                        difficulty=ac.get("difficulty", "medium"),
                        category=ac.get("category", "elective")
                    ))
            
            
            suggested_plan = response.get("suggested_plan", {})
            recommendations = response.get("recommendations", "No specific recommendations.")
            
            return ManualEntryAnalysis(
                is_valid=len(issues) == 0,
                issues=issues,
                warnings=warnings,
                analyzed_courses=analyzed_courses,
                suggested_plan=suggested_plan,
                total_credits=total_credits,
                estimated_semesters=len(suggested_plan) if suggested_plan else request.remaining_semesters,
                ai_recommendations=recommendations
            )
    except Exception as e:
        print(f"AI analysis error: {e}")
    
    # Fallback if AI fails
    return ManualEntryAnalysis(
        is_valid=len(issues) == 0,
        issues=issues,
        warnings=warnings,
        analyzed_courses=[
            AnalyzedCourse(
                code=c.code,
                name=c.name,
                credits=c.credits,
                prerequisites=c.prerequisites,
                suggested_semester=c.semester or 1,
                difficulty="medium",
                category="elective"
            ) for c in request.courses
        ],
        suggested_plan={},
        total_credits=total_credits,
        estimated_semesters=request.remaining_semesters,
        ai_recommendations="AI analysis unavailable. Please review courses manually."
    )


@router.post("/validate")
async def validate_courses(courses: List[ManualCourse]):
    """Quick validation of course entries without full AI analysis."""
    issues = []
    warnings = []
    
    codes = [c.code for c in courses]
    
    # Check duplicates
    seen = set()
    for code in codes:
        if code in seen:
            issues.append(f"Duplicate course code: {code}")
        seen.add(code)
    
    # Check prerequisites
    for course in courses:
        for prereq in course.prerequisites:
            if prereq not in codes:
                warnings.append(f"{course.code} requires {prereq} which is not in your list")
    
    # Check credits
    for course in courses:
        if course.credits <= 0 or course.credits > 6:
            warnings.append(f"{course.code} has unusual credit value: {course.credits}")
    
    return {
        "is_valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "total_courses": len(courses),
        "total_credits": sum(c.credits for c in courses)
    }
