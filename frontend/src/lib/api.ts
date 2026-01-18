/* API Client for Backend Communication */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ================================
// TYPES
// ================================

export interface Course {
    id?: number;
    code: string;
    name: string;
    credits: number;
    prerequisites: string[];
    semester_offered?: string;
    difficulty?: "Easy" | "Medium" | "Hard";
    description?: string;
}

export interface CourseInput {
    code: string;
    name: string;
    credits: number;
    prerequisites: string[];
    difficulty?: "Easy" | "Medium" | "Hard";
}

export interface FailureSimulation {
    enabled: boolean;
    failed_courses: string[];
}

export interface PlanRequest {
    courses: CourseInput[];
    completed_courses: string[];
    remaining_semesters: number;
    max_courses_per_semester: number;
    priority_courses: string[];
    career_goal?: string;
    current_gpa?: number;
    weekly_work_hours?: number;
    failure_simulation?: FailureSimulation;
    advisor_mode?: boolean;  // NEW: Enable formal advisor-style explanations
}

export interface RiskAnalysis {
    burnout_risk: "Low" | "Medium" | "High";
    graduation_risk: "On Track" | "Delayed";
    risk_factors: string[];
}

export interface FailureImpact {
    failed_courses: string[];
    affected_semesters: number;
    delay_estimate: string;
    directly_affected: string[];
}

// ================================
// ADVANCED INTELLIGENCE TYPES
// ================================

export interface DecisionEvent {
    semester: string;
    decision: string;
    reason: string;
    risk_mitigated: string;
    trade_off: string;
}

export interface ConfidenceBreakdown {
    prerequisite_safety: number;
    workload_balance: number;
    failure_recovery_margin: number;
    graduation_slack: number;
}

// ================================
// PLAN RESPONSE (EXTENDED)
// ================================

export interface PlanResponse {
    // Core Plan
    degree_plan: Record<string, string[]>;
    semester_difficulty: Record<string, "Light" | "Moderate" | "Heavy">;

    // Risk Analysis
    risk_analysis: RiskAnalysis;
    failure_impact?: FailureImpact;

    // === ADVANCED INTELLIGENCE FIELDS ===
    decision_timeline: DecisionEvent[];
    confidence_score: number;
    confidence_breakdown?: ConfidenceBreakdown;
    key_insight: string;

    // Explanations
    career_alignment_notes: string;
    advisor_explanation: string;

    // Metadata
    warnings: string[];
    unscheduled_courses: string[];
    data_status: "User Uploaded" | "Demo";
    validation_status: "Valid" | "Invalid";
}

export interface AIAdviceResponse {
    top_courses: { code: string; reason: string }[];
    learning_path: string[];
    career_tips: string[];
    // Roadmap Enhancements
    certifications?: { name: string; issuer: string; difficulty: string; cost: string; value: string }[] | string[];
    project_ideas?: {
        title: string;
        description: string;
        difficulty: "Beginner" | "Intermediate" | "Advanced";
        tech_stack: string[];
        learning_outcomes?: string[];
        time_estimate?: string;
    }[];
    salary_progression?: {
        stage: string;
        range?: string;
        range_usd?: string;
        range_inr?: string;
        years_experience?: string;
    }[];
    interview_prep?: {
        question: string;
        answer_key: string;
        difficulty?: string;
        topic?: string;
    }[];
    // Gap Analysis & Schedule
    missing_skills?: {
        skill: string;
        description: string;
        recommended_resource: string;
        time_to_learn?: string;
    }[];
    study_schedule?: {
        week: string;
        focus: string;
        activities: string[];
        hours_per_day?: number;
    }[];
    // NEW: Comprehensive Career Guidance
    industry_trends?: {
        trend: string;
        description: string;
        skills_needed: string[];
    }[];
    companies_to_target?: {
        company: string;
        type: string;
        hiring_level: string;
        typical_role: string;
    }[];
    book_recommendations?: {
        title: string;
        author: string;
        why_read: string;
        level: string;
    }[];
    online_communities?: {
        name: string;
        platform: string;
        link_hint: string;
        benefit: string;
    }[];
    youtube_channels?: {
        channel: string;
        content_type: string;
        recommended_playlist: string;
    }[];
    github_topics?: {
        topic: string;
        type: string;
        description: string;
    }[];
    day_in_life?: string;
    career_progression?: {
        level: string;
        years: string;
        responsibilities: string;
        skills_focus: string;
    }[];
}

export interface CourseDetail {
    description: string;
    learning_outcomes: string[];
    connections: string;
    study_tips: string;
}

export interface StudyRoadmap {
    heavy_semester: string;
    light_semester: string;
    exam_period: string;
}

export interface IndustryRelevance {
    key_courses: string[];
    industry_connections: string;
}

export interface AIPlanExplanation {
    explanation: string;
    strengths: string[];
    suggestions: string[];
    key_insight?: string;
    // Enhanced Data
    career_alignment_score?: number;
    skill_gaps?: string[];
    strategic_electives?: string[];
    difficulty_curve?: string;
    projected_salary_range?: string;
    salary_justification?: string;
    top_job_roles?: string[];
    semester_difficulty_scores?: number[];
    elevator_pitch?: string;
    // Deep Analysis Fields
    course_details?: Record<string, CourseDetail>;
    study_roadmap?: StudyRoadmap;
    industry_relevance?: IndustryRelevance;
}

export interface FailureSimulationResponse {
    original_plan: Record<string, string[]>;
    recovery_plan: Record<string, string[]>;
    delay_semesters: number;
    affected_courses: string[];
    explanation: string;
}

export interface StudyPlanRequest {
    subjects: string[];
    available_hours: Record<string, number>;
    exams: Record<string, string>;
    weaknesses: string[];
}

export interface StudyBlock {
    day: string;
    time_block: string;
    subject: string;
    focus_goal: string;
    effort: "High" | "Medium" | "Low";
}

export interface StudyPlanResponse {
    schedule: StudyBlock[];
    weekly_focus: string;
    recovery_plan: string;
    // Personalized additions
    personalized_tips?: string[];
    strength_analysis?: string;
    weakness_insights?: string;
    motivation?: string;
}

export interface RevisionRequest {
    topics: string[];
    subject: string;
    exam_date: string;
    exam_weight?: number;
    weakness_level: "Weak" | "Medium" | "Strong";
    last_studied?: string;
    performance_signals?: string[];
}

export interface RevisionResponse {
    strategy: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserCreate extends UserLogin { }

export interface Token {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    email: string;
}

// ================================
// API FUNCTIONS
// ================================

async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `API Error: ${res.status}`);
    }

    return res.json();
}

// Courses API
export async function getCourses(): Promise<{
    courses: Course[];
    total: number;
}> {
    return fetchAPI("/api/courses");
}

export async function loadDemoCourses(): Promise<{
    courses: Course[];
    total: number;
}> {
    return fetchAPI("/api/courses/demo/load");
}

// Plan API
export async function generatePlan(request: PlanRequest): Promise<PlanResponse> {
    return fetchAPI("/api/plan/generate", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function generateDemoPlan(): Promise<PlanResponse> {
    return fetchAPI("/api/plan/generate-demo", {
        method: "POST",
    });
}

export async function exportPlanICS(
    degreePlan: Record<string, string[]>
): Promise<Blob> {
    const res = await fetch(`${API_URL}/api/plan/export-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ degree_plan: degreePlan }),
    });

    if (!res.ok) {
        throw new Error("Failed to export plan");
    }

    return res.blob();
}

// AI API
export async function analyzePlan(
    degreePlan: Record<string, string[]>,
    careerGoal?: string,
    courses?: CourseInput[],
    advisorMode?: boolean
): Promise<AIPlanExplanation> {
    return fetchAPI("/api/ai/analyze-plan", {
        method: "POST",
        body: JSON.stringify({
            degree_plan: degreePlan,
            career_goal: careerGoal,
            courses: courses,
            advisor_mode: advisorMode,
        }),
    });
}

export async function getCareerAdvice(
    careerGoal: string,
    availableCourses: string[],
    completedCourses?: string[]
): Promise<AIAdviceResponse> {
    return fetchAPI("/api/ai/career-advice", {
        method: "POST",
        body: JSON.stringify({
            career_goal: careerGoal,
            available_courses: availableCourses,
            completed_courses: completedCourses || [],
        }),
    });
}

export async function simulateFailure(
    degreePlan: Record<string, string[]>,
    completedCourses: string[],
    failedCourses: string[],
    courses: CourseInput[],
    remainingSemesters: number,
    maxCoursesPerSemester: number
): Promise<FailureSimulationResponse> {
    return fetchAPI("/api/ai/simulate-failure", {
        method: "POST",
        body: JSON.stringify({
            degree_plan: degreePlan,
            completed_courses: completedCourses,
            failed_courses: failedCourses,
            courses: courses,
            remaining_semesters: remainingSemesters,
            max_courses_per_semester: maxCoursesPerSemester,
        }),
    });
}

export async function generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResponse> {
    return fetchAPI("/api/ai/study-plan", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function generateRevisionStrategy(request: RevisionRequest): Promise<RevisionResponse> {
    return fetchAPI("/api/ai/revision", {
        method: "POST",
        body: JSON.stringify(request),
    });
}


// ================================
// STUDY BUDDY (BEHAVIORAL SUPPORT)
// ================================

export interface StudyBuddyRequest {
    signal?: "missed_session" | "incomplete_plan" | "inactivity" | "overload" | "consistency_drop" | "none";
    mode?: "behavioral" | "academic";
    duration_days?: number;
    completed_tasks?: number;
    planned_tasks?: number;
    message?: string;
    history?: { role: string, content: string }[];
}

export interface StudyBuddyResponse {
    observation?: string;
    encouragement?: string;
    next_small_action?: string;
    chat_response?: string;
}

export async function getStudyBuddySupport(request: StudyBuddyRequest): Promise<StudyBuddyResponse> {
    return fetchAPI("/api/ai/study-buddy", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

// Health Check
export async function healthCheck(): Promise<{ status: string }> {
    return fetchAPI("/health");
}

// ==========================================
// PROFILE INTELLIGENCE (NEW)
// ==========================================

export interface UserProfile {
    user_id?: string;
    name?: string;
    email?: string;
    university?: string;
    degree_major?: string;
    academic_year?: string;
    goals: string[];
    preferences: Record<string, string>;
    completed_onboarding: boolean;
}

export interface ProfileRequest {
    message: string;
    history: { role: string; content: string }[];
    auth_action: "signup" | "signin";
}

export interface ProfileResponse {
    chat_response: string;
    suggested_updates?: Partial<UserProfile>;
    onboarding_complete: boolean;
}

export const getProfileIntelligence = async (data: ProfileRequest): Promise<ProfileResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_URL}/api/ai/profile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to get profile intelligence");
    return response.json();
};

export const loginUser = async (data: UserLogin): Promise<Token> => {
    return fetchAPI("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: data.email, password: data.password }),
    });
};

export const registerUser = async (data: UserCreate): Promise<UserResponse> => {
    return fetchAPI("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const getMe = async (): Promise<UserResponse> => {
    return fetchAPI("/api/auth/me");
};

export const getProfileData = async (): Promise<UserProfile> => {
    return fetchAPI("/api/ai/profile/data");
};


// ================================
// AI COURSE GENERATION
// ================================

export interface GeneratedCourse {
    code: string;
    name: string;
    credits: number;
    prerequisites: string[];
    year: number;
}

export interface GenerateCoursesRequest {
    degree_name: string;
    current_year: number;
    custom_degree?: string;
}

export interface GenerateCoursesResponse {
    courses: GeneratedCourse[];
    degree_name: string;
    total_credits: number;
}

export const generateDegreeCourses = async (request: GenerateCoursesRequest): Promise<GenerateCoursesResponse> => {
    return fetchAPI("/api/ai/generate-courses", {
        method: "POST",
        body: JSON.stringify(request),
    });
};


// ================================
// DOCUMENT ANALYSIS (PDF/PPT)
// ================================

export interface DocumentTopic {
    name: string;
    difficulty: "Easy" | "Medium" | "Hard";
    priority: number;
}

export interface DocumentAnalysisResponse {
    subject: string;
    topics: DocumentTopic[];
    revision_plan: string;
    estimated_hours: number;
    key_concepts: string[];
    filename: string;
    file_type: string;
}

export interface TopicExplanationResponse {
    topic: string;
    definition: string;
    key_points: string[];
    example: string;
    common_mistakes: string[];
    revision_tip: string;
}

export const analyzeDocument = async (file: File): Promise<DocumentAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/revision/analyze-document`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to analyze document" }));
        throw new Error(error.detail || "Document analysis failed");
    }

    return response.json();
};

export const explainTopic = async (topic: string, context?: string): Promise<TopicExplanationResponse> => {
    return fetchAPI("/api/revision/explain-topic", {
        method: "POST",
        body: JSON.stringify({ topic, context }),
    });
};


// ================================
// MANUAL ENTRY & ANALYSIS
// ================================

export interface ManualCourse {
    code: string;
    name: string;
    credits: number;
    semester?: number;
    prerequisites: string[];
    description?: string;
}

export interface ManualEntryRequest {
    degree_program: string;
    current_year: number;
    total_years: number;
    remaining_semesters: number;
    courses: ManualCourse[];
    career_goal?: string;
}

export interface AnalyzedCourse {
    code: string;
    name: string;
    credits: number;
    prerequisites: string[];
    suggested_semester: number;
    difficulty: string;
    category: string;
}

export interface ManualEntryAnalysis {
    is_valid: boolean;
    issues: string[];
    warnings: string[];
    analyzed_courses: AnalyzedCourse[];
    suggested_plan: Record<string, string[]>;
    total_credits: number;
    estimated_semesters: number;
    ai_recommendations: string;
}

export const analyzeManualEntry = async (request: ManualEntryRequest): Promise<ManualEntryAnalysis> => {
    return fetchAPI("/api/manual-entry/analyze", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

export const validateManualCourses = async (courses: ManualCourse[]): Promise<any> => {
    return fetchAPI("/api/manual-entry/validate", {
        method: "POST",
        body: JSON.stringify(courses),
    });
};

// ================================
// HISTORY
// ================================

export interface PlanHistoryItem {
    id: number;
    name: string;
    created_at: string;
    total_semesters: number;
    completed_courses_count: number;
    total_courses_count: number;
    degree_program?: string;
    career_goal?: string;
}

// Re-export or redefine if strictly needed, but ensuring no Duplicates
export interface SavePlanRequest {
    name: string;
    semesters: Record<string, string[]>;
    completed_courses: string[];
    priority_courses: string[];
    max_courses_per_semester: number;
    total_semesters: number;
    semester_difficulty: Record<string, "Light" | "Moderate" | "Heavy">;
    risk_analysis?: RiskAnalysis;
    career_alignment_notes?: string;
    advisor_explanation?: string;
    degree_program?: string;
    career_goal?: string;
    courses_data?: Course[];  // Full course objects for persistence
    data_source?: string;     // demo/uploaded/manual
}

// Full plan detail when loading from history
export interface PlanHistoryDetail {
    id: number;
    name: string;
    semesters: Record<string, string[]>;
    completed_courses: string[];
    priority_courses: string[];
    max_courses_per_semester: number;
    total_semesters: number;
    semester_difficulty: Record<string, string>;
    risk_analysis?: RiskAnalysis;
    career_alignment_notes?: string;
    advisor_explanation?: string;
    degree_program?: string;
    career_goal?: string;
    courses_data: Course[];   // Full course objects
    data_source?: string;     // demo/uploaded/manual
    created_at: string;
    updated_at: string;
}

export const saveDegreePlan = async (request: SavePlanRequest): Promise<void> => {
    return fetchAPI("/api/history", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

export const getPlanHistory = async (): Promise<PlanHistoryItem[]> => {
    return fetchAPI("/api/history");
};

export const getPlanDetail = async (id: number): Promise<PlanHistoryDetail> => {
    return fetchAPI(`/api/history/${id}`);
};

export const deletePlan = async (id: number): Promise<void> => {
    return fetchAPI(`/api/history/${id}`, {
        method: "DELETE",
    });
};


// ================================
// PRACTICE & SELF-TEST ENGINE
// ================================

export interface PracticeQuestion {
    question_id: string;
    text: string;
    question_type: "mcq" | "short" | "long";
    options?: string[];
    correct_answer?: string;  // Hidden in self-test mode
    explanation?: string;     // Hidden in self-test mode
}

export interface GenerateQuestionsRequest {
    topic_name: string;
    topic_notes: string;
    difficulty: "Easy" | "Medium" | "Hard";
    question_type: "mcq" | "short" | "long";
    count: number;
    mode: "practice" | "self-test";
}

export interface GenerateQuestionsResponse {
    session_id: string;
    topic_name: string;
    question_type: string;
    questions: PracticeQuestion[];
}

export interface UserAnswer {
    question_id: string;
    user_answer: string;
}

export interface EvaluateRequest {
    session_id: string;
    topic_name: string;
    question_type: string;
    answers: UserAnswer[];
}

export interface QuestionFeedback {
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    score: number;
    max_score: number;
    feedback: string;
}

export interface EvaluateResponse {
    total_score: number;
    max_score: number;
    percentage: number;
    performance_level: "Weak" | "Average" | "Strong";
    question_feedback: QuestionFeedback[];
    next_steps: string[];
}

/**
 * Generate practice or self-test questions for a topic.
 */
export const generatePracticeQuestions = async (
    request: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> => {
    return fetchAPI("/api/practice/generate", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

/**
 * Evaluate user answers and get scores with feedback.
 */
export const evaluateAnswers = async (
    request: EvaluateRequest
): Promise<EvaluateResponse> => {
    return fetchAPI("/api/practice/evaluate", {
        method: "POST",
        body: JSON.stringify(request),
    });
};


// End of file

