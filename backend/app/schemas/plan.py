"""
Pydantic schemas for plan generation.

Implements the strict output format required by the AI system specification.
Includes Advanced Intelligence features: Decision Timeline, Confidence Score, Advisor Mode.
"""
from typing import Dict, List, Optional, Literal, Any
from pydantic import BaseModel, Field


class CourseInput(BaseModel):
    """Input course data - ONLY from user-provided data."""
    code: str = Field(..., description="Unique course identifier")
    name: str = Field(..., description="Course name")
    credits: int = Field(..., ge=0, le=12, description="Credit hours")
    prerequisites: List[str] = Field(default_factory=list, description="List of prerequisite course codes")
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = Field(None, description="Optional difficulty rating")


class FailureSimulation(BaseModel):
    """Failure simulation configuration."""
    enabled: bool = False
    failed_courses: List[str] = Field(default_factory=list)


class PlanGenerateRequest(BaseModel):
    """
    Request to generate a degree plan.
    
    CRITICAL: All data comes from user. Never auto-fill or assume.
    """
    courses: List[CourseInput] = Field(..., description="List of courses from user's catalog")
    completed_courses: List[str] = Field(default_factory=list, description="Courses already completed")
    remaining_semesters: int = Field(..., ge=1, le=20, description="Semesters remaining until graduation")
    max_courses_per_semester: int = Field(..., ge=1, le=10, description="Maximum courses per semester")
    priority_courses: List[str] = Field(default_factory=list, description="Courses to prioritize scheduling early")
    career_goal: Optional[str] = Field(None, description="Optional career goal for alignment analysis")
    current_gpa: Optional[float] = Field(None, ge=0.0, le=4.0, description="Current GPA for risk assessment")
    weekly_work_hours: Optional[int] = Field(None, ge=0, description="Hours worked per week (for burnout risk)")
    failure_simulation: Optional[FailureSimulation] = Field(None, description="What-if failure simulation mode")
    advisor_mode: bool = Field(default=False, description="Enable formal advisor-style explanations")


# ==========================================
# ADVANCED INTELLIGENCE: NEW SCHEMA TYPES
# ==========================================

class DecisionEvent(BaseModel):
    """
    Single decision in the academic timeline.
    Explains WHY a semester looks the way it does.
    """
    semester: str = Field(..., description="Semester identifier (e.g., 'Semester 2')")
    decision: str = Field(..., description="What decision was made")
    reason: str = Field(..., description="Why this decision was made")
    risk_mitigated: str = Field(default="", description="What risk was avoided by this decision")
    trade_off: str = Field(default="", description="Any trade-off that was accepted")


class ConfidenceBreakdown(BaseModel):
    """Breakdown of confidence score components."""
    prerequisite_safety: float = Field(..., ge=0, le=100, description="Score for prereq satisfaction (0-100)")
    workload_balance: float = Field(..., ge=0, le=100, description="Score for workload distribution (0-100)")
    failure_recovery_margin: float = Field(..., ge=0, le=100, description="Score for slack/buffer (0-100)")
    graduation_slack: float = Field(..., ge=0, le=100, description="Score for on-time graduation buffer (0-100)")


class RiskAnalysis(BaseModel):
    """Risk assessment output."""
    burnout_risk: Literal["Low", "Medium", "High"] = "Low"
    graduation_risk: Literal["On Track", "Delayed"] = "On Track"
    risk_factors: List[str] = Field(default_factory=list)


class FailureImpact(BaseModel):
    """Impact of simulated course failures."""
    failed_courses: List[str] = Field(default_factory=list)
    affected_semesters: int = 0
    delay_estimate: str = "None"
    directly_affected: List[str] = Field(default_factory=list)


class PlanGenerateResponse(BaseModel):
    """
    Strict output format for degree plan.
    
    EXTENDED with Advanced Intelligence features:
    - decision_timeline: Chronological "why" for every semester
    - confidence_score: Quantitative plan robustness (0-100)
    - confidence_breakdown: Component scores
    - key_insight: Judge-repeatable memorable insight
    """
    # Core Plan
    degree_plan: Dict[str, List[str]] = Field(
        ..., 
        description="Semester-by-semester course schedule"
    )
    semester_difficulty: Dict[str, Literal["Light", "Moderate", "Heavy"]] = Field(
        ..., 
        description="Difficulty rating per semester"
    )
    
    # Risk Analysis
    risk_analysis: RiskAnalysis = Field(
        ..., 
        description="Burnout and graduation risk assessment"
    )
    failure_impact: Optional[FailureImpact] = Field(
        None, 
        description="Impact analysis when failure simulation is enabled"
    )
    
    # === ADVANCED INTELLIGENCE FIELDS ===
    decision_timeline: List[DecisionEvent] = Field(
        default_factory=list,
        description="Chronological list of scheduling decisions and their justifications"
    )
    confidence_score: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Overall plan confidence score (0-100)"
    )
    confidence_breakdown: Optional[ConfidenceBreakdown] = Field(
        None,
        description="Detailed breakdown of confidence score components"
    )
    key_insight: str = Field(
        default="",
        description="One memorable, judge-repeatable insight about this plan"
    )
    
    # Explanations
    career_alignment_notes: str = Field(
        default="", 
        description="Career goal alignment analysis"
    )
    advisor_explanation: str = Field(
        ..., 
        description="Human-readable explanation of the plan"
    )
    
    # Metadata
    warnings: List[str] = Field(
        default_factory=list, 
        description="Validation warnings and issues"
    )
    unscheduled_courses: List[str] = Field(
        default_factory=list, 
        description="Courses that could not be scheduled"
    )
    data_status: Literal["User Uploaded", "Demo"] = Field(
        default="Demo",
        description="Source of the course data"
    )
    validation_status: Literal["Valid", "Invalid"] = Field(
        default="Valid",
        description="Whether input data passed validation"
    )


class PlanSaveRequest(BaseModel):
    """Request to save a generated plan."""
    plan_name: str = Field(..., min_length=1, max_length=100)
    degree_plan: Dict[str, List[str]]
    semester_difficulty: Dict[str, str]
    risk_analysis: Dict
    career_goal: Optional[str] = None
    notes: Optional[str] = None


class PlanSaveResponse(BaseModel):
    """Response after saving a plan."""
    id: int
    plan_name: str
    created_at: str
    message: str = "Plan saved successfully"


class AIAnalyzeRequest(BaseModel):
    """Request for AI analysis of a plan."""
    degree_plan: Dict[str, List[str]]
    career_goal: Optional[str] = None
    courses: Optional[List[CourseInput]] = None
    advisor_mode: bool = False


class AIExplanation(BaseModel):
    """AI-generated explanation of a plan."""
    explanation: str
    strengths: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    key_insight: Optional[str] = None
    
    # Enhanced Data Points
    career_alignment_score: int = Field(default=0, ge=0, le=100, description="0-100 score of alignment with career goal")
    skill_gaps: List[str] = Field(default_factory=list, description="List of missing skills for career")
    strategic_electives: List[str] = Field(default_factory=list, description="Recommended electives to fill gaps")
    difficulty_curve: str = Field(default="Balanced", description="Description of difficulty trend over time")
    
    # Phase 2: Career Insights & Visualization
    projected_salary_range: str = Field(default="$60k - $80k", description="Estimated starting salary range")
    top_job_roles: List[str] = Field(default_factory=list, description="Top 5 job roles this plan prepares for")
    semester_difficulty_scores: List[int] = Field(default_factory=list, description="List of 1-10 difficulty scores per semester")
    elevator_pitch: str = Field(default="", description="A 2-sentence pitch for why this plan is unique")
    
    # Phase 3: Deep Analysis (NEW)
    course_details: Dict[str, Dict] = Field(default_factory=dict, description="Detailed info for each course")
    study_roadmap: Dict[str, str] = Field(default_factory=dict, description="Study advice for heavy/light semesters")
    salary_justification: str = Field(default="", description="Explanation for salary projection")
    industry_relevance: Dict[str, Any] = Field(default_factory=dict, description="How courses connect to industry")


class CareerAdviceRequest(BaseModel):
    """Request for AI career advice."""
    career_goal: str
    available_courses: List[str]
    completed_courses: List[str] = Field(default_factory=list)


class CareerAdviceResponse(BaseModel):
    """AI career advice response - Comprehensive A-Z guidance."""
    top_courses: List[Dict[str, str]] = Field(default_factory=list)
    learning_path: List[str] = Field(default_factory=list)
    career_tips: List[str] = Field(default_factory=list)
    # Enhanced fields
    certifications: Optional[List[Any]] = Field(default=None, description="Recommended certifications")
    project_ideas: Optional[List[Dict[str, Any]]] = Field(default=None, description="Portfolio project ideas")
    salary_progression: Optional[List[Dict[str, Any]]] = Field(default=None, description="Salary progression by career stage")
    interview_prep: Optional[List[Dict[str, str]]] = Field(default=None, description="Interview questions and tips")
    missing_skills: Optional[List[Dict[str, str]]] = Field(default=None, description="Skill gaps to address")
    study_schedule: Optional[List[Dict[str, Any]]] = Field(default=None, description="Weekly study schedule")
    # NEW: Comprehensive career guidance
    industry_trends: Optional[List[Dict[str, Any]]] = Field(default=None, description="Industry trends to watch")
    companies_to_target: Optional[List[Dict[str, str]]] = Field(default=None, description="Companies hiring for this role")
    book_recommendations: Optional[List[Dict[str, str]]] = Field(default=None, description="Must-read books")
    online_communities: Optional[List[Dict[str, str]]] = Field(default=None, description="Communities to join")
    youtube_channels: Optional[List[Dict[str, str]]] = Field(default=None, description="Educational YouTube channels")
    github_topics: Optional[List[Dict[str, str]]] = Field(default=None, description="GitHub topics/repos to follow")
    day_in_life: Optional[str] = Field(default=None, description="Typical day in this role")
    career_progression: Optional[List[Dict[str, str]]] = Field(default=None, description="Career ladder from junior to executive")


class FailureSimulationRequest(BaseModel):
    """Request to simulate course failures."""
    degree_plan: Dict[str, List[str]]
    completed_courses: List[str]
    failed_courses: List[str]
    courses: List[CourseInput]
    remaining_semesters: int = 6
    max_courses_per_semester: int = 5


class FailureSimulationResponse(BaseModel):
    """Response showing recovery plan after failure."""
    original_plan: Dict[str, List[str]]
    recovery_plan: Dict[str, List[str]]
    delay_semesters: int
    affected_courses: List[str]
    explanation: str


# ==========================================
# STUDY COPILOT SCHEMAS
# ==========================================

class StudyPlanRequest(BaseModel):
    """Request for a personalized study plan."""
    subjects: List[str] = Field(..., description="List of subjects to study (e.g. ['Math', 'Physics'])")
    available_hours: Dict[str, float] = Field(..., description="Hours available per day (e.g., {'Monday': 4.0, ...})")
    exams: Dict[str, str] = Field(default_factory=dict, description="Subject -> Date mapping (e.g. {'Math': '2024-05-10'})")
    weaknesses: List[str] = Field(default_factory=list, description="List of weak topics/subjects")


class StudyBlock(BaseModel):
    """A single time-blocked study session."""
    day: str
    time_block: str
    subject: str
    focus_goal: str
    effort: Literal["High", "Medium", "Low"]


class StudyPlanResponse(BaseModel):
    """AI-generated personalized study plan."""
    schedule: List[StudyBlock] = Field(default_factory=list)
    weekly_focus: str = Field(..., description="Main objective for the week")
    recovery_plan: Optional[str] = Field(None, description="Plan for missed days")


# ==========================================
# SMART REVISION ENGINE SCHEMAS
# ==========================================

class RevisionRequest(BaseModel):
    """Request for smart revision strategy."""
    topics: List[str] = Field(..., description="List of topics to revise")
    subject: str = Field(..., description="Subject name")
    exam_date: str = Field(..., description="Date of the exam (YYYY-MM-DD)")
    exam_weight: Optional[float] = Field(None, description="Weight of exam (percentage)")
    weakness_level: Literal["Weak", "Medium", "Strong"] = Field(..., description="Student's self-assessed weakness")
    last_studied: Optional[str] = Field(None, description="Date last studied")
    performance_signals: Optional[List[str]] = Field(None, description="Optional signals like 'Quiz avg 60%'")


class RevisionResponse(BaseModel):
    """AI-generated revision strategy."""
    strategy: str = Field(..., description="The structured revision plan text")



# ==========================================
# STUDY BUDDY SCHEMAS
# ==========================================

class StudyBuddyRequest(BaseModel):
    """Request for behavioral support."""
    signal: Optional[Literal["missed_session", "incomplete_plan", "inactivity", "overload", "consistency_drop", "none"]] = None
    mode: Literal["behavioral", "academic"] = "behavioral"
    duration_days: Optional[int] = Field(None, description="Duration of the issue (e.g. 3 days inactive)")
    completed_tasks: Optional[int] = Field(None, description="Number of tasks completed recently")
    planned_tasks: Optional[int] = Field(None, description="Number of tasks scheduled")
    message: Optional[str] = Field(None, description="User chat message")
    history: Optional[List[Dict[str, str]]] = Field(None, description="Chat history [{'role': 'user', 'content': '...'}, ...]")

class StudyBuddyResponse(BaseModel):
    """Structured behavioral support response."""
    observation: Optional[str] = None
    encouragement: Optional[str] = None
    next_small_action: Optional[str] = None
    chat_response: Optional[str] = Field(None, description="Conversational response")
