"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Mic,
    Send,
    Play,
    RotateCcw,
    FileText,
    Upload,
    Sparkles,
    ChevronRight,
    ChevronDown,
    CheckCircle2,
    Clock,
    Target,
    Brain,
    Trophy,
    MessageSquare,
    User,
    Bot,
    Loader2,
    History,
    Download,
    Award,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ==========================================
// TYPES
// ==========================================
interface InterviewSession {
    id: number;
    skill_type: string;
    language: string;
    status: string;
    question_count: number;
    current_question_index: number;
    created_at: string;
    completed_at?: string;
}

interface InterviewQuestion {
    id: number;
    question_text: string;
    question_type: string;
    order_index: number;
    difficulty: string;
    total_questions: number;
    is_last: boolean;
}

interface AnswerAnalysis {
    question_id: number;
    score: number;
    analysis: {
        correctness: number;
        clarity: number;
        completeness: number;
        relevance: number;
        feedback: string;
        strengths?: string[];
        improvements?: string[];
    };
    next_question?: InterviewQuestion;
}

interface InterviewReport {
    id: number;
    session_id: number;
    technical_score: number;
    communication_score: number;
    confidence_score: number;
    problem_solving_score: number;
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    retry_recommendations: string[];
    confidence_insights?: string;
    behavior_insights?: string;
}

// Skill types available for interview
const SKILL_TYPES = [
    { id: "backend", name: "Backend Development", icon: "🖥️" },
    { id: "frontend", name: "Frontend Development", icon: "🎨" },
    { id: "dsa", name: "Data Structures & Algorithms", icon: "🧮" },
    { id: "ml", name: "Machine Learning", icon: "🤖" },
    { id: "devops", name: "DevOps & Cloud", icon: "☁️" },
    { id: "database", name: "Database & SQL", icon: "🗄️" },
    { id: "system-design", name: "System Design", icon: "🏗️" },
    { id: "hr", name: "HR / Behavioral", icon: "🤝" },
];

// ==========================================
// INTERVIEW PAGE COMPONENT
// ==========================================
export default function InterviewPage() {
    return (
        <AuthGuard>
            <InterviewContent />
        </AuthGuard>
    );
}

function InterviewContent() {
    const { user } = useAuth();
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // State
    const [stage, setStage] = useState<"setup" | "interview" | "report">("setup");
    const [selectedSkill, setSelectedSkill] = useState<string>("");
    const [questionCount, setQuestionCount] = useState(5);
    const [hasResume, setHasResume] = useState(false);
    const [resumeText, setResumeText] = useState("");
    const [showResumeModal, setShowResumeModal] = useState(false);

    // Interview state
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [chatHistory, setChatHistory] = useState<Array<{
        type: "question" | "answer" | "analysis";
        content: string;
        metadata?: any;
    }>>([]);

    // Report state
    const [report, setReport] = useState<InterviewReport | null>(null);

    // Past sessions
    const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Load past sessions
    useEffect(() => {
        if (token) {
            loadPastSessions();
        }
    }, [token]);

    const loadPastSessions = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/interview/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPastSessions(data);
            }
        } catch (e) {
            console.error("Failed to load sessions:", e);
        }
    };

    // Start interview
    const startInterview = async () => {
        if (!selectedSkill) {
            toast.error("Please select a skill type");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/interview/session/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    skill_type: selectedSkill,
                    language: "en",
                    question_count: questionCount
                })
            });

            if (!res.ok) throw new Error("Failed to start interview");

            const sessionData = await res.json();
            setSession(sessionData);
            setStage("interview");

            // Get first question
            await getNextQuestion(sessionData.id);

            toast.success("Interview started! Good luck!");
        } catch (e) {
            toast.error("Failed to start interview");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Get next question
    const getNextQuestion = async (sessionId: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/interview/session/${sessionId}/question`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) return null;

            const question = await res.json();
            if (question) {
                setCurrentQuestion(question);
                setChatHistory(prev => [...prev, {
                    type: "question",
                    content: question.question_text,
                    metadata: { type: question.question_type, difficulty: question.difficulty }
                }]);
            }
            return question;
        } catch (e) {
            console.error("Failed to get question:", e);
            return null;
        }
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!answer.trim() || !session || !currentQuestion) return;

        setIsAnalyzing(true);
        setChatHistory(prev => [...prev, { type: "answer", content: answer }]);

        try {
            const res = await fetch(`${API_BASE}/api/interview/session/${session.id}/answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answer })
            });

            if (!res.ok) throw new Error("Failed to submit answer");

            const analysis: AnswerAnalysis = await res.json();

            // Add analysis to chat
            setChatHistory(prev => [...prev, {
                type: "analysis",
                content: analysis.analysis.feedback,
                metadata: { score: analysis.score, ...analysis.analysis }
            }]);

            setAnswer("");

            // Check if there's a next question
            if (analysis.next_question) {
                setTimeout(() => {
                    setCurrentQuestion(analysis.next_question!);
                    setChatHistory(prev => [...prev, {
                        type: "question",
                        content: analysis.next_question!.question_text,
                        metadata: {
                            type: analysis.next_question!.question_type,
                            difficulty: analysis.next_question!.difficulty
                        }
                    }]);
                }, 1500);
            } else {
                // Interview complete
                setTimeout(() => completeInterview(), 1500);
            }
        } catch (e) {
            toast.error("Failed to submit answer");
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Complete interview
    const completeInterview = async () => {
        if (!session) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/interview/session/${session.id}/complete`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to complete interview");

            const reportData = await res.json();
            setReport(reportData);
            setStage("report");

            toast.success("Interview complete! View your report.");
        } catch (e) {
            toast.error("Failed to generate report");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset interview
    const resetInterview = () => {
        setStage("setup");
        setSession(null);
        setCurrentQuestion(null);
        setChatHistory([]);
        setReport(null);
        setAnswer("");
        loadPastSessions();
    };

    // View past report
    const viewPastReport = async (sessionId: number) => {
        try {
            const res = await fetch(`${API_BASE}/api/interview/session/${sessionId}/report`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const reportData = await res.json();
                if (reportData) {
                    setReport(reportData);
                    setStage("report");
                    setShowHistory(false);
                }
            }
        } catch (e) {
            toast.error("Failed to load report");
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white pt-20 pb-10">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 mb-4">
                        <Mic className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-medium text-violet-300">AI Interview Simulator</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-cyan-200">
                        Practice Your Interview Skills
                    </h1>
                    <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                        AI-powered mock interviews with real-time feedback and detailed performance reports
                    </p>
                </motion.div>

                {/* History Toggle */}
                <div className="flex justify-end mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-zinc-400 hover:text-white"
                    >
                        <History className="h-4 w-4 mr-2" />
                        Past Interviews ({pastSessions.length})
                    </Button>
                </div>

                {/* Past Sessions Panel */}
                <AnimatePresence>
                    {showHistory && pastSessions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800"
                        >
                            <h3 className="text-sm font-bold text-zinc-400 mb-3">Past Interviews</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {pastSessions.slice(0, 6).map((s) => (
                                    <div
                                        key={s.id}
                                        className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700 cursor-pointer hover:border-violet-500/50 transition-colors"
                                        onClick={() => s.status === "completed" && viewPastReport(s.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-white capitalize">
                                                {s.skill_type.replace("-", " ")}
                                            </span>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                s.status === "completed"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                            )}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content - Conditional Rendering */}
                <AnimatePresence mode="wait">
                    {stage === "setup" && (
                        <SetupStage
                            selectedSkill={selectedSkill}
                            setSelectedSkill={setSelectedSkill}
                            questionCount={questionCount}
                            setQuestionCount={setQuestionCount}
                            startInterview={startInterview}
                            isLoading={isLoading}
                        />
                    )}

                    {stage === "interview" && (
                        <InterviewStage
                            session={session}
                            currentQuestion={currentQuestion}
                            chatHistory={chatHistory}
                            answer={answer}
                            setAnswer={setAnswer}
                            submitAnswer={submitAnswer}
                            isAnalyzing={isAnalyzing}
                            chatEndRef={chatEndRef}
                        />
                    )}

                    {stage === "report" && report && (
                        <ReportStage
                            report={report}
                            resetInterview={resetInterview}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ==========================================
// SETUP STAGE
// ==========================================
function SetupStage({
    selectedSkill,
    setSelectedSkill,
    questionCount,
    setQuestionCount,
    startInterview,
    isLoading
}: {
    selectedSkill: string;
    setSelectedSkill: (s: string) => void;
    questionCount: number;
    setQuestionCount: (n: number) => void;
    startInterview: () => void;
    isLoading: boolean;
}) {
    return (
        <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
        >
            {/* Skill Selection */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-400" />
                    Select Interview Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SKILL_TYPES.map((skill) => (
                        <button
                            key={skill.id}
                            onClick={() => setSelectedSkill(skill.id)}
                            className={cn(
                                "p-4 rounded-xl border-2 text-center transition-all",
                                selectedSkill === skill.id
                                    ? "border-violet-500 bg-violet-500/20"
                                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                            )}
                        >
                            <div className="text-2xl mb-2">{skill.icon}</div>
                            <div className="text-sm font-medium text-white">{skill.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Count */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    Number of Questions
                </h3>
                <div className="flex gap-3">
                    {[5, 8, 10, 15].map((count) => (
                        <button
                            key={count}
                            onClick={() => setQuestionCount(count)}
                            className={cn(
                                "flex-1 py-3 rounded-xl border-2 font-bold transition-all",
                                questionCount === count
                                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                                    : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                            )}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            {/* Start Button */}
            <Button
                onClick={startInterview}
                disabled={!selectedSkill || isLoading}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                    <Play className="h-5 w-5 mr-2" />
                )}
                Start Interview
            </Button>
        </motion.div>
    );
}

// ==========================================
// INTERVIEW STAGE
// ==========================================
function InterviewStage({
    session,
    currentQuestion,
    chatHistory,
    answer,
    setAnswer,
    submitAnswer,
    isAnalyzing,
    chatEndRef
}: {
    session: InterviewSession | null;
    currentQuestion: InterviewQuestion | null;
    chatHistory: Array<{ type: string; content: string; metadata?: any }>;
    answer: string;
    setAnswer: (s: string) => void;
    submitAnswer: () => void;
    isAnalyzing: boolean;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
        >
            {/* Progress Bar */}
            {currentQuestion && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                        <span>Question {currentQuestion.order_index + 1} of {currentQuestion.total_questions}</span>
                        <span className="capitalize">{currentQuestion.difficulty}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: `${((currentQuestion.order_index + 1) / currentQuestion.total_questions) * 100}%`
                            }}
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        />
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="glass-card p-6 mb-4 h-[500px] overflow-y-auto">
                <div className="space-y-4">
                    {chatHistory.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-3",
                                msg.type === "answer" ? "justify-end" : ""
                            )}
                        >
                            {msg.type === "question" && (
                                <div className="p-2 rounded-full bg-violet-500/20 h-fit">
                                    <Bot className="h-5 w-5 text-violet-400" />
                                </div>
                            )}

                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl",
                                msg.type === "question"
                                    ? "bg-zinc-800 border border-zinc-700"
                                    : msg.type === "answer"
                                        ? "bg-violet-600/30 border border-violet-500/30"
                                        : "bg-cyan-600/20 border border-cyan-500/30"
                            )}>
                                {msg.type === "question" && msg.metadata && (
                                    <div className="flex gap-2 mb-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-300 capitalize">
                                            {msg.metadata.type?.replace("_", " ")}
                                        </span>
                                    </div>
                                )}
                                <p className="text-white">{msg.content}</p>
                                {msg.type === "analysis" && msg.metadata?.score && (
                                    <div className="mt-3 pt-3 border-t border-cyan-500/30">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-cyan-300">Score:</span>
                                            <span className="font-bold text-cyan-400">{msg.metadata.score}/100</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {msg.type === "answer" && (
                                <div className="p-2 rounded-full bg-zinc-700 h-fit">
                                    <User className="h-5 w-5 text-zinc-300" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isAnalyzing && (
                        <div className="flex gap-3">
                            <div className="p-2 rounded-full bg-cyan-500/20 h-fit">
                                <Brain className="h-5 w-5 text-cyan-400 animate-pulse" />
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-800 border border-zinc-700">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing your answer...
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Answer Input */}
            <div className="flex gap-3">
                <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 min-h-[80px] bg-zinc-900 border-zinc-700 text-white resize-none"
                    disabled={isAnalyzing}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                            submitAnswer();
                        }
                    }}
                />
                <Button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || isAnalyzing}
                    className="px-6 bg-gradient-to-r from-violet-600 to-cyan-600"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">
                Press Ctrl+Enter to submit
            </p>
        </motion.div>
    );
}

// ==========================================
// REPORT STAGE
// ==========================================
function ReportStage({
    report,
    resetInterview
}: {
    report: InterviewReport;
    resetInterview: () => void;
}) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 mb-4">
                    <Trophy className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Interview Complete!</h2>
                <p className="text-zinc-400">Here's your performance report</p>
            </div>

            {/* Overall Score */}
            <div className="glass-card p-8 mb-6 text-center">
                <h3 className="text-lg font-bold text-zinc-400 mb-4">Overall Score</h3>
                <div className={cn("text-7xl font-black", getScoreColor(report.overall_score))}>
                    {report.overall_score}
                </div>
                <p className="text-zinc-500 mt-2">out of 100</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Technical", score: report.technical_score, icon: Brain },
                    { label: "Communication", score: report.communication_score, icon: MessageSquare },
                    { label: "Confidence", score: report.confidence_score, icon: TrendingUp },
                    { label: "Problem Solving", score: report.problem_solving_score, icon: Target },
                ].map((item) => (
                    <div key={item.label} className="glass-card p-4 text-center">
                        <item.icon className="h-6 w-6 mx-auto mb-2 text-violet-400" />
                        <div className={cn("text-2xl font-black", getScoreColor(item.score))}>
                            {item.score}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                    </h3>
                    <ul className="space-y-2">
                        {report.strengths.map((s, i) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2">
                                <span className="text-emerald-500 mt-1">•</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                        {report.weaknesses.map((w, i) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Recommendations
                </h3>
                <ul className="space-y-2">
                    {report.improvements.map((imp, i) => (
                        <li key={i} className="text-zinc-300 flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-cyan-500 mt-1 flex-shrink-0" />
                            {imp}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
                <Button
                    onClick={resetInterview}
                    className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600"
                >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Try Another Interview
                </Button>
            </div>
        </motion.div>
    );
}
