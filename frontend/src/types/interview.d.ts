// Interview Types for Degree Planner AI Interview Feature

export interface InterviewFeedback {
    id: string;
    interviewId: string;
    totalScore: number;
    categoryScores: Array<{
        name: string;
        score: number;
        comment: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    createdAt: string;
}

export interface Interview {
    id: string;
    role: string;
    level: string;
    questions: string[];
    techstack: string[];
    createdAt: string;
    userId: string;
    type: string;
    finalized: boolean;
}

export interface CreateFeedbackParams {
    interviewId: string;
    odId: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
}

export interface InterviewCardProps {
    interviewId?: string;
    odId?: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt?: string;
}

export interface AgentProps {
    userName: string;
    odId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
}

export interface InterviewRouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
}

export interface GetFeedbackByInterviewIdParams {
    interviewId: string;
    odId: string;
}

export interface GetLatestInterviewsParams {
    odId: string;
    limit?: number;
}

export interface TechIconProps {
    techStack: string[];
}
