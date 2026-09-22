from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, List, Optional
from app.services.ollama_service import ollama_service
from app.routers.flags import feature_guard

router = APIRouter(prefix="/gpa", tags=["GPA Simulator"], dependencies=[Depends(feature_guard("gpa_simulator"))])

class GPASimulationRequest(BaseModel):
    completed_course_grades: Dict[str, str]
    courses_data: List[dict]
    semesters: Dict[str, List[str]]
    completed_courses: List[str]
    target_gpa: float
    gpa_scale: Optional[str] = "4.0" # "4.0" or "10.0"
    generate_advice: Optional[bool] = False

class GPAScenario(BaseModel):
    projected_gpa: float
    status: str  # "On Track", "At Risk", "Impossible", "Exceeded"
    description: str

class GPARiskAlert(BaseModel):
    type: str  # "impossible_target", "failed_prereq", "high_workload_warning"
    message: str
    course_code: Optional[str] = None

class GPAScenenarios(BaseModel):
    optimistic: GPAScenario
    realistic: GPAScenario
    pessimistic: GPAScenario

class GPASimulationResponse(BaseModel):
    current_cumulative_gpa: float
    completed_credits: float
    remaining_credits: float
    scenarios: GPAScenenarios
    required_remaining_gpa: float
    recommended_grade_configs: Optional[Dict[str, str]] = None
    risks: List[GPARiskAlert]
    advisor_advice: Optional[str] = None

GRADE_POINTS_4 = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0,
    "F": 0.0
}

GRADE_POINTS_10 = {
    "O": 10.0, "A+": 9.0, "A": 8.0,
    "B": 7.0, "C": 6.0, "D": 5.0,
    "F": 0.0
}

def get_closest_grade(points: float, scale: str = "4.0") -> str:
    grade_points = GRADE_POINTS_10 if scale == "10.0" else GRADE_POINTS_4
    closest_grade = "A" if scale == "4.0" else "A+"
    min_diff = 999.0
    for grade, gp in grade_points.items():
        if scale == "4.0" and grade == "A+":
            continue
        diff = abs(gp - points)
        if diff < min_diff:
            min_diff = diff
            closest_grade = grade
    return closest_grade

@router.post("/simulate-gpa", response_model=GPASimulationResponse)
async def simulate_gpa_endpoint(request: GPASimulationRequest):
    scale = request.gpa_scale or "4.0"
    grade_points = GRADE_POINTS_10 if scale == "10.0" else GRADE_POINTS_4
    max_gp = 10.0 if scale == "10.0" else 4.0
    
    # Filter completed course grades
    completed_course_grades = {k: v for k, v in request.completed_course_grades.items() if v in grade_points}
    
    # Build course map
    course_map = {}
    for c in request.courses_data:
        code = c.get("code")
        if code:
            course_map[code] = {
                "name": c.get("name", ""),
                "credits": float(c.get("credits", 3)),
                "difficulty": c.get("difficulty", "Medium"),
                "prerequisites": c.get("prerequisites", [])
            }
            
    # Calculate completed points & credits
    completed_points = 0.0
    completed_credits = 0.0
    for code in request.completed_courses:
        grade = completed_course_grades.get(code)
        if grade in grade_points:
            credits = course_map.get(code, {}).get("credits", 3.0)
            completed_points += grade_points[grade] * credits
            completed_credits += credits
            
    current_gpa = (completed_points / completed_credits) if completed_credits > 0.0 else max_gp
    
    # Identify remaining courses & credits
    remaining_courses = []
    remaining_credits = 0.0
    for semester_name, course_codes in request.semesters.items():
        for code in course_codes:
            if code not in request.completed_courses:
                credits = course_map.get(code, {}).get("credits", 3.0)
                difficulty = course_map.get(code, {}).get("difficulty", "Medium")
                remaining_courses.append({
                    "code": code,
                    "credits": credits,
                    "difficulty": difficulty
                })
                remaining_credits += credits
                
    total_credits = completed_credits + remaining_credits
    
    # Calculate required remaining GPA
    required_remaining_gpa = 0.0
    if remaining_credits > 0.0:
        total_points_needed = request.target_gpa * total_credits
        points_needed_in_remaining = total_points_needed - completed_points
        required_remaining_gpa = points_needed_in_remaining / remaining_credits
        
    # SCENARIO 1: Optimistic (Assumes max grade point in remaining courses)
    proj_optimistic_points = completed_points + (max_gp * remaining_credits)
    proj_optimistic_gpa = min(max_gp, proj_optimistic_points / total_credits) if total_credits > 0.0 else max_gp
    
    if proj_optimistic_gpa >= request.target_gpa:
        optimistic_status = "On Track"
        optimistic_desc = f"With a perfect {max_gp:.1f} average in remaining courses, you will reach a cumulative GPA of {proj_optimistic_gpa:.2f}, exceeding your target."
    else:
        optimistic_status = "Impossible"
        optimistic_desc = f"Even with a perfect {max_gp:.1f} average in remaining courses, your cumulative GPA will only reach {proj_optimistic_gpa:.2f}, which is below your target."
        
    # SCENARIO 2: Realistic (Course difficulty * current_gpa ratio)
    if scale == "10.0":
        difficulty_weights = {"Easy": 9.5, "Medium": 8.0, "Hard": 6.5}
    else:
        difficulty_weights = {"Easy": 4.0, "Medium": 3.3, "Hard": 2.7}
        
    realistic_remaining_points = 0.0
    for rc in remaining_courses:
        base_gp = difficulty_weights.get(rc["difficulty"], 8.0 if scale == "10.0" else 3.3)
        # Scale by current performance if available
        scaled_gp = base_gp * (current_gpa / max_gp) if completed_credits > 0.0 else base_gp
        scaled_gp = max(0.0, min(max_gp, scaled_gp))
        realistic_remaining_points += scaled_gp * rc["credits"]
        
    proj_realistic_points = completed_points + realistic_remaining_points
    proj_realistic_gpa = min(max_gp, proj_realistic_points / total_credits) if total_credits > 0.0 else max_gp
    
    if proj_realistic_gpa >= request.target_gpa:
        realistic_status = "On Track"
        realistic_desc = f"Based on course difficulty and your past performance, you are projected to reach a cumulative GPA of {proj_realistic_gpa:.2f}."
    elif proj_optimistic_gpa >= request.target_gpa:
        realistic_status = "At Risk"
        realistic_desc = f"Realistic projection ({proj_realistic_gpa:.2f}) falls short of your target. Extra effort in difficult classes will be required."
    else:
        realistic_status = "Impossible"
        realistic_desc = f"Realistic projection is {proj_realistic_gpa:.2f}, and even the optimistic case cannot meet your target GPA."
        
    # SCENARIO 3: Pessimistic (Assumes pessimistic grade in remaining courses)
    pessimistic_gp = 5.5 if scale == "10.0" else 2.0
    proj_pessimistic_points = completed_points + (pessimistic_gp * remaining_credits)
    proj_pessimistic_gpa = min(max_gp, proj_pessimistic_points / total_credits) if total_credits > 0.0 else max_gp
    
    if proj_pessimistic_gpa >= request.target_gpa:
        pessimistic_status = "Exceeded"
        pessimistic_desc = f"Even with a pessimistic {pessimistic_gp:.1f} average, your cumulative GPA will be {proj_pessimistic_gpa:.2f}, meeting your target."
    elif proj_realistic_gpa >= request.target_gpa:
        pessimistic_status = "At Risk"
        pessimistic_desc = f"A pessimistic {pessimistic_gp:.1f} average would drop you to a cumulative GPA of {proj_pessimistic_gpa:.2f}, below your target."
    else:
        pessimistic_status = "Impossible"
        pessimistic_desc = f"A pessimistic scenario drops your cumulative GPA to {proj_pessimistic_gpa:.2f}."
        
    # Risks check
    risks = []
    
    if required_remaining_gpa > max_gp:
        risks.append(GPARiskAlert(
            type="impossible_target",
            message=f"Your target GPA of {request.target_gpa:.2f} is mathematically impossible. It requires a remaining GPA of {required_remaining_gpa:.2f}."
        ))
        
    # Failed prerequisites risk
    failed_courses = [code for code, grade in completed_course_grades.items() if grade == "F"]
    for rc in remaining_courses:
        code = rc["code"]
        prereqs = course_map.get(code, {}).get("prerequisites", [])
        for p in prereqs:
            if p in failed_courses:
                risks.append(GPARiskAlert(
                    type="failed_prereq",
                    message=f"You failed prerequisite course {p} (Grade F), which is required for {code} in your future schedule.",
                    course_code=p
                ))
                
    # High workload warning
    if required_remaining_gpa <= max_gp:
        high_workload_threshold = 9.0 if scale == "10.0" else 3.7
        gpa_jump_threshold = 2.0 if scale == "10.0" else 0.8
        if required_remaining_gpa > high_workload_threshold:
            risks.append(GPARiskAlert(
                type="high_workload_warning",
                message=f"Reaching your target requires a remaining GPA average of {required_remaining_gpa:.2f}. This leaves no room for error and demands a heavy workload."
            ))
        elif completed_credits > 0.0 and (required_remaining_gpa - current_gpa) > gpa_jump_threshold:
            risks.append(GPARiskAlert(
                type="high_workload_warning",
                message=f"You need to raise your average from {current_gpa:.2f} to {required_remaining_gpa:.2f} in upcoming semesters. This significant performance jump carries high burnout risk."
            ))
            
    # Recommended grade configurations
    recommended_grade_configs = {}
    if remaining_credits > 0.0 and required_remaining_gpa <= max_gp:
        for rc in remaining_courses:
            code = rc["code"]
            diff = rc["difficulty"]
            if diff == "Easy":
                pts = required_remaining_gpa * 1.1
            elif diff == "Hard":
                pts = required_remaining_gpa * 0.9
            else:
                pts = required_remaining_gpa
            pts = max(1.0, min(max_gp, pts))
            recommended_grade_configs[code] = get_closest_grade(pts, scale=scale)
            
    # AI advisor advice
    advisor_advice = None
    if request.generate_advice:
        risk_strs = [r.message for r in risks]
        risk_text = "\n".join([f"- {m}" for m in risk_strs]) if risk_strs else "- None detected."
        
        prompt = f"""
Student Academic GPA Profile:
- GPA Scale Format: {scale}-point scale
- Current Cumulative GPA: {current_gpa:.2f}
- Completed Credits: {completed_credits}
- Target Graduation GPA: {request.target_gpa:.2f}
- Remaining Credits: {remaining_credits}
- Required Remaining Average GPA: {required_remaining_gpa:.2f}

Completed Course Grades:
{", ".join([f"{code}: {grade}" for code, grade in completed_course_grades.items()]) if completed_course_grades else "None recorded."}

Upcoming Courses:
{", ".join([f"{rc['code']} ({rc['difficulty']} difficulty, {rc['credits']} credits)" for rc in remaining_courses]) if remaining_courses else "None scheduled."}

Academic Risk Alerts:
{risk_text}

Please act as a supportive, expert Academic Advisor. Provide a brief, professional evaluation of this student's GPA goals and risks:
1. Review the feasibility of the target GPA on the {scale}-point scale.
2. Outline specific strategies for succeeding in the remaining courses, accounting for their difficulty weights.
3. Suggest study adjustments or credit loading changes to mitigate risks (such as failed prerequisites or high workload warnings).
4. Provide encouragement and actionable study planning tips.

Write in a concise, structured markdown format. Use bullet points where appropriate. Do not include any intro/outro like "Sure, here's my advice..."; start directly with the content.
"""
        try:
            from app.services.ollama_service import SYSTEM_PROMPT as default_sys
            advisor_advice = await ollama_service._call_ollama(prompt, system_instruction=default_sys)
        except Exception as e:
            print(f"Ollama advice generation failed: {e}")
            advisor_advice = "The local AI Advisor is currently offline or loading. Please ensure Ollama is running (`ollama serve`) and try again."

    return GPASimulationResponse(
        current_cumulative_gpa=round(current_gpa, 2),
        completed_credits=completed_credits,
        remaining_credits=remaining_credits,
        scenarios=GPAScenarios(
            optimistic=GPAScenario(
                projected_gpa=round(proj_optimistic_gpa, 2),
                status=optimistic_status,
                description=optimistic_desc
            ),
            realistic=GPAScenario(
                projected_gpa=round(proj_realistic_gpa, 2),
                status=realistic_status,
                description=realistic_desc
            ),
            pessimistic=GPAScenario(
                projected_gpa=round(proj_pessimistic_gpa, 2),
                status=pessimistic_status,
                description=pessimistic_desc
            )
        ),
        required_remaining_gpa=round(max(0.0, required_remaining_gpa), 2),
        recommended_grade_configs=recommended_grade_configs,
        risks=risks,
        advisor_advice=advisor_advice
    )
