/* API Client for Backend Communication */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/backend";

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
    ai_analysis?: AIPlanExplanation;
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

export async function fetchAPI<T>(
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

    if (res.status === 204 || res.headers.get("content-length") === "0") {
        return null as any;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json();
    }

    return null as any;

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

export async function createCourse(course: {
    code: string;
    name: string;
    credits: number;
    prerequisites: string[];
    semester_offered?: string;
    difficulty_weight?: number;
    description?: string;
}): Promise<Course> {
    return fetchAPI("/api/courses", {
        method: "POST",
        body: JSON.stringify(course),
    });
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
    advisorMode?: boolean,
    force: boolean = false
): Promise<AIPlanExplanation> {
    return fetchAPI("/api/ai/analyze-plan", {
        // @ts-ignore
        cache: force ? "no-store" : "default",
        method: "POST",
        body: JSON.stringify({
            degree_plan: degreePlan,
            career_goal: careerGoal,
            courses: courses,
            advisor_mode: advisorMode,
            force: force,
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
    document_id?: number;
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

    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_URL}/api/revision/analyze-document`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
    completed_course_grades?: Record<string, string>;
    priority_courses: string[];
    max_courses_per_semester: number;
    total_semesters: number;
    semester_difficulty: Record<string, "Light" | "Moderate" | "Heavy">;
    risk_analysis?: RiskAnalysis;
    career_alignment_notes?: string;
    advisor_explanation?: string;
    degree_program?: string;
    career_goal?: string;
    ai_analysis?: AIPlanExplanation;
    courses_data?: Course[];  // Full course objects for persistence
    data_source?: string;     // demo/uploaded/manual
}

// Full plan detail when loading from history
export interface PlanHistoryDetail {
    id: number;
    name: string;
    semesters: Record<string, string[]>;
    completed_courses: string[];
    completed_course_grades?: Record<string, string>;
    priority_courses: string[];
    max_courses_per_semester: number;
    total_semesters: number;
    semester_difficulty: Record<string, string>;
    risk_analysis?: RiskAnalysis;
    career_alignment_notes?: string;
    advisor_explanation?: string;
    degree_program?: string;
    career_goal?: string;
    ai_analysis?: AIPlanExplanation;
    courses_data: Course[];   // Full course objects
    data_source?: string;     // demo/uploaded/manual
    created_at: string;
    updated_at: string;
}

// ================================
// GPA SIMULATOR TYPES & FUNCTIONS
// ================================

export interface GPASimulationRequest {
    completed_course_grades: Record<string, string>;
    courses_data: Course[];
    semesters: Record<string, string[]>;
    completed_courses: string[];
    target_gpa: number;
    gpa_scale?: string;
    generate_advice?: boolean;
}

export interface GPAScenario {
    projected_gpa: number;
    status: "On Track" | "At Risk" | "Impossible" | "Exceeded";
    description: string;
}

export interface GPARiskAlert {
    type: "impossible_target" | "failed_prereq" | "high_workload_warning";
    message: string;
    course_code?: string;
}

export interface GPASimulationResponse {
    current_cumulative_gpa: number;
    completed_credits: number;
    remaining_credits: number;
    scenarios: {
        optimistic: GPAScenario;
        realistic: GPAScenario;
        pessimistic: GPAScenario;
    };
    required_remaining_gpa: number;
    recommended_grade_configs?: Record<string, string>;
    risks: GPARiskAlert[];
    advisor_advice?: string;
}

export async function simulateGPA(request: GPASimulationRequest): Promise<GPASimulationResponse> {
    return fetchAPI("/api/gpa/simulate-gpa", {
        method: "POST",
        body: JSON.stringify(request),
    });
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

export const resetDatabaseData = async (): Promise<void> => {
    return fetchAPI("/api/history/reset-all-data", {
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

// ================================
// ASSESSMENT PLATFORM
// ================================

export interface GenerateAssessmentRequest {
    document_id?: number | null;
    manual_topics?: string | null;
    mcq_count: number;
    short_count: number;
    long_count: number;
}

export interface AssessmentQuestion {
    question: string;
    type?: string;
    options?: string[];
    correct_answer?: string;
    rubric?: string;
}

export interface AssessmentTestResponse {
    topic_name: string;
    test: {
        mcqs: AssessmentQuestion[];
        short_answers: AssessmentQuestion[];
        long_answers: AssessmentQuestion[];
    };
}

export interface AssessmentAnswerPayload {
    question: string;
    type: string;
    rubric: string;
    user_answer: string;
}

export interface EvaluateAssessmentRequest {
    document_id?: number | null;
    topic_name: string;
    mcq_count: number;
    short_count: number;
    long_count: number;
    answers: AssessmentAnswerPayload[];
}

export interface AssessmentEvaluation {
    question: string;
    user_answer: string;
    is_correct: boolean;
    marks_awarded: number;
    max_marks: number;
    teacher_feedback: string;
}

export interface EvaluateAssessmentResponse {
    message: string;
    result_id: number;
    report: {
        evaluations: AssessmentEvaluation[];
        total_score: number;
        max_score: number;
        deep_analysis: {
            strengths: string[];
            weaknesses: string[];
            improvement_plan: string;
        }
    };
}

export const uploadAssessmentDocument = async (file: File): Promise<{ message: string; document_id: number; filename: string; is_duplicate?: boolean }> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_URL}/api/assessment/upload`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to upload document" }));
        throw new Error(error.detail || "Document upload failed");
    }

    return response.json();
};

export const generateAssessmentTest = async (request: GenerateAssessmentRequest): Promise<AssessmentTestResponse> => {
    return fetchAPI("/api/assessment/generate", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

export const evaluateAssessmentTest = async (request: EvaluateAssessmentRequest): Promise<EvaluateAssessmentResponse> => {
    return fetchAPI("/api/assessment/evaluate", {
        method: "POST",
        body: JSON.stringify(request),
    });
};

export interface UploadedDocumentItem {
    id: number;
    filename: string;
    file_type: string;
    created_at: string;
}

export interface DocumentDetail extends UploadedDocumentItem {
    extracted_text: string;
    analysis_result?: any;
}

export interface TestResultItem {
    id: number;
    topic_name: string;
    percentage: number;
    performance_level: string;
    created_at: string;
    mcq_count: number;
    short_count: number;
    long_count: number;
}

export interface TestResultDetail extends TestResultItem {
    questions_json: any;
    feedback_json: any;
}

export const getAssessmentDocuments = async (): Promise<UploadedDocumentItem[]> => {
    return fetchAPI("/api/history/documents", { method: "GET" });
};

export const getAssessmentDocumentDetail = async (docId: number): Promise<DocumentDetail> => {
    return fetchAPI(`/api/history/documents/${docId}`, { method: "GET" });
};

export const getAssessmentTests = async (): Promise<TestResultItem[]> => {
    return fetchAPI("/api/history/tests");
};

export const getTestDetail = async (id: number): Promise<TestResultDetail> => {
    return fetchAPI(`/api/history/tests/${id}`);
};
export const deleteHistoryDocument = async (id: number): Promise<void> => {
    return fetchAPI(`/api/history/documents/${id}`, { method: "DELETE" });
};

export const deleteHistoryTest = async (id: number): Promise<void> => {
    return fetchAPI(`/api/history/tests/${id}`, { method: "DELETE" });
};

export interface SpacedRepetitionItem {
    topic_name: string;
    document_id?: number | null;
    last_test_id: number;
    percentage: number;
    performance_level: string;
    interval: number;
    repetitions: number;
    ease_factor: number;
    next_review_at?: string | null;
    is_due: boolean;
    created_at: string;
}

export const getSpacedRepetitionStatus = async (dueOnly = false): Promise<SpacedRepetitionItem[]> => {
    return fetchAPI(`/api/assessment/spaced-repetition/status?due_only=${dueOnly}`, { method: "GET" });
};

// ==========================================
// TRANSCRIPT IMPORT (OPTION D)
// ==========================================

export interface ParsedCourse {
    code: string;
    name: string;
    credits?: number;
    grade?: string;
    term?: string;
    matched_in_catalog: boolean;
}

export interface TranscriptParseResponse {
    degree_program?: string;
    parsed_courses: ParsedCourse[];
    unmatched_raw: string[];
    total_credits: number;
    extraction_method: string;
    raw_text_preview: string;
    warnings: string[];
}

export interface TranscriptStatusResponse {
    service: string;
    pymupdf_version: string;
    ollama_online: boolean;
    fast_model: string;
    catalog_courses: number;
    endpoints: string[];
}

export const uploadTranscript = async (file: File): Promise<TranscriptParseResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
    const response = await fetch(`${API_URL}/api/transcript/upload`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to upload transcript" }));
        throw new Error(error.detail || "Transcript upload failed");
    }

    return response.json();
};

export const parseTranscriptText = async (text: string): Promise<TranscriptParseResponse> => {
    return fetchAPI("/api/transcript/parse-text", {
        method: "POST",
        body: JSON.stringify({ text }),
    });
};

export const getTranscriptStatus = async (): Promise<TranscriptStatusResponse> => {
    return fetchAPI("/api/transcript/status", { method: "GET" });
};
