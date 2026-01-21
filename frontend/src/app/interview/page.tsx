"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { generateInterviewQuestions, createInterview, getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/interview.action";
import { toast } from "sonner";
import InterviewCard from "@/components/interview/InterviewCard";
import { Sparkles, Brain, Plus, X, Edit2, Play, ChevronRight, Code2, Users, Layers, MessageSquare } from "lucide-react";

interface Interview {
    id: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt: string;
}

export default function InterviewPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1); // 1 = Config, 2 = Questions
    const [userInterviews, setUserInterviews] = useState<Interview[]>([]);
    const [latestInterviews, setLatestInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        role: "",
        level: "Junior",
        type: "Technical",
        techstack: "",
        amount: 5,
    });

    // Generated Questions State
    const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
    const [editQuestionText, setEditQuestionText] = useState("");

    useEffect(() => {
        async function fetchInterviews() {
            if (!user?.id) return;

            try {
                const [userInt, latestInt] = await Promise.all([
                    getInterviewsByUserId(String(user.id)),
                    getLatestInterviews({ odId: String(user.id) }),
                ]);

                setUserInterviews(userInt || []);
                setLatestInterviews(latestInt || []);
            } catch (error) {
                console.error("Error fetching interviews:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchInterviews();
    }, [user?.id]);

    // Step 1: Generate Questions
    const handleGenerateQuestions = async () => {
        if (!formData.role || !formData.techstack) {
            toast.error("Please fill in Job Role and Tech Stack");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateInterviewQuestions({
                ...formData,
                amount: formData.amount // Ensure we request the specific amount
            });

            if (result.success && result.questions) {
                setGeneratedQuestions(result.questions);
                setStep(2); // Move to review step
            } else {
                toast.error(result.error || "Failed to generate questions");
            }
        } catch (error) {
            console.error("Error generation questions:", error);
            toast.error("Something went wrong");
        } finally {
            setIsGenerating(false);
        }
    };

    // Step 2: Create Final Interview
    const handleCreateInterview = async () => {
        setIsGenerating(true);
        try {
            const result = await createInterview({
                role: formData.role,
                type: formData.type,
                level: formData.level,
                techstack: formData.techstack,
                questions: generatedQuestions,
                odId: String(user?.id || ""),
            });

            if (result.success && result.interviewId) {
                toast.success("Interview Module Ready!");
                setShowModal(false);
                setStep(1); // Reset
                setGeneratedQuestions([]);

                // Refresh lists
                const userInt = await getInterviewsByUserId(String(user?.id));
                setUserInterviews(userInt || []);

                // Redirect to start
                router.push(`/interview/${result.interviewId}`);
            } else {
                toast.error("Failed to create interview");
            }
        } catch (error) {
            console.error("Error creating interview:", error);
            toast.error("Something went wrong saving the interview");
        } finally {
            setIsGenerating(false);
        }
    };

    // Question Management helpers
    const saveEditedQuestion = (index: number) => {
        const newQuestions = [...generatedQuestions];
        newQuestions[index] = editQuestionText;
        setGeneratedQuestions(newQuestions);
        setEditingQuestionIndex(null);
    };

    const deleteQuestion = (index: number) => {
        if (generatedQuestions.length <= 1) {
            toast.error("You need at least one question!");
            return;
        }
        const newQuestions = generatedQuestions.filter((_, i) => i !== index);
        setGeneratedQuestions(newQuestions);
    };

    const addQuestion = () => {
        setGeneratedQuestions([...generatedQuestions, "New custom question..."]);
        setEditingQuestionIndex(generatedQuestions.length); // Immediately edit new question
        setEditQuestionText("New custom question...");
    };

    const hasPastInterviews = userInterviews.length > 0;

    return (
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050510] selection:bg-purple-500/30">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid lg:grid-cols-2 gap-12 items-center mb-16"
                >
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
                            <Sparkles className="w-3 h-3" />
                            <span>AI-Powered Interview Coach</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                            Master Your Next <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Tech Interview
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                            Practice with our advanced AI that simulates real-world scenarios.
                            Get instant, harsh, and constructive feedback to refine your answers perfectly.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => {
                                    setShowModal(true);
                                    setStep(1);
                                }}
                                className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <span className="flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" />
                                    Start New Session
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setShowAll(true);
                                    // Small delay to allow state update to render full list before scrolling
                                    setTimeout(() => {
                                        document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }}
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                            >
                                View History
                            </button>
                        </div>

                        <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                            <div>
                                <h4 className="text-2xl font-bold text-white">10k+</h4>
                                <p className="text-sm text-gray-500">Questions Generated</p>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-white">98%</h4>
                                <p className="text-sm text-gray-500">Success Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Holographic Visual Element */}
                    <div className="relative hidden lg:block h-[500px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-3xl backdrop-blur-3xl border border-white/10 overflow-hidden group">
                            {/* Abstract UI Elements representing "Analysis" */}
                            <div className="absolute top-10 left-10 right-10 bottom-10 border border-white/10 rounded-2xl bg-[#0a0a0f]/80 backdrop-blur-xl p-6 flex flex-col shadow-2xl">
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">AI_INTERVIEW_CORE_V2.0</div>
                                </div>

                                <div className="space-y-4 flex-1 overflow-hidden relative">
                                    {/* Mock Code/Analysis Lines */}
                                    <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse" />
                                    <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse delay-75" />
                                    <div className="h-2 w-5/6 bg-white/10 rounded animate-pulse delay-150" />

                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                                            <div className="text-xs text-purple-400 mb-1">Confidence Score</div>
                                            <div className="text-2xl font-bold text-white">92%</div>
                                            <div className="h-1 bg-purple-900 mt-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 w-[92%]" />
                                            </div>
                                        </div>
                                        <div className="bg-teal-500/10 rounded-lg p-3 border border-teal-500/20">
                                            <div className="text-xs text-teal-400 mb-1">Technical Depth</div>
                                            <div className="text-2xl font-bold text-white">High</div>
                                            <div className="h-1 bg-teal-900 mt-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-teal-500 w-[85%]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating graphic */}
                                    <div className="absolute bottom-4 right-4 animate-float">
                                        <Brain className="w-16 h-16 text-purple-500 opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Dashboard Grid */}
                <div className="grid lg:grid-cols-3 gap-8" id="history">
                    {/* Recent Sessions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-400" />
                                {showAll ? "All Sessions" : "Recent Sessions"}
                            </h2>
                            {hasPastInterviews && !showAll && userInterviews.length > 4 && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Show All
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {loading ? (
                                [1, 2].map(i => (
                                    <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
                                ))
                            ) : hasPastInterviews ? (
                                (showAll ? userInterviews : userInterviews.slice(0, 4)).map((interview) => (
                                    <InterviewCard
                                        key={interview.id}
                                        odId={String(user?.id || "")}
                                        interviewId={interview.id}
                                        role={interview.role}
                                        type={interview.type}
                                        techstack={interview.techstack}
                                        createdAt={interview.createdAt}
                                    />
                                ))
                            ) : (
                                <div className="col-span-2 p-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                    <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No interview history found. Start your first session!</p>
                                </div>
                            )}
                        </div>

                        {showAll && hasPastInterviews && userInterviews.length > 4 && (
                            <button
                                onClick={() => {
                                    setShowAll(false);
                                    document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-gray-400 transition-colors"
                            >
                                Show Less
                            </button>
                        )}
                    </div>

                    {/* Quick Stats / Info */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-teal-400" />
                            Community
                        </h2>
                        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Popular Roles</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Frontend Dev", "Fullstack", "Data Science", "DevOps", "PM"].map(role => (
                                    <span key={role} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 cursor-pointer transition-colors">
                                        {role}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
                                <h4 className="font-semibold text-purple-300 mb-1">Pro Tip</h4>
                                <p className="text-sm text-gray-400">
                                    Practice "Behavioral" interviews to improve your soft skills score.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE INTERVIEW WIZARD MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {step === 1 ? "Configure Interview" : "Review Questions"}
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {step === 1 ? "Step 1 of 2: Setup" : "Step 2 of 2: Customize"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {step === 1 ? (
                                    /* STEP 1: CONFIGURATION */
                                    <div className="space-y-6 animate-fadeIn">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Target Role</label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Senior React Developer"
                                                        value={formData.role}
                                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Experience Level</label>
                                                <select
                                                    value={formData.level}
                                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-all appearance-none"
                                                >
                                                    <option value="Intern">Intern</option>
                                                    <option value="Junior">Junior (0-2 years)</option>
                                                    <option value="Mid">Mid-Level (2-5 years)</option>
                                                    <option value="Senior">Senior (5+ years)</option>
                                                    <option value="Lead">Lead / Architect</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Tech Stack / Skills</label>
                                            <div className="relative">
                                                <Code2 className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="React, Node.js, AWS, TypeScript..."
                                                    value={formData.techstack}
                                                    onChange={(e) => setFormData({ ...formData, techstack: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 pl-1">Separate technologies with commas</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">Interview Type</label>
                                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                                    {["Technical", "Behavioral", "Mixed"].map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setFormData({ ...formData, type: t })}
                                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.type === t
                                                                ? "bg-purple-600 text-white shadow-lg"
                                                                : "text-gray-400 hover:text-white"
                                                                }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex justify-between">
                                                    <span>Question Count</span>
                                                    <span className="text-purple-400 font-bold">{formData.amount}</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="3"
                                                    max="10"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* STEP 2: QUESTIONS EDITOR */
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white">Generated Questions</h3>
                                            <button
                                                onClick={addQuestion}
                                                className="text-xs flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add Custom
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {generatedQuestions.map((q, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`group p-4 rounded-xl border transition-all ${editingQuestionIndex === idx
                                                        ? "bg-purple-900/10 border-purple-500/50"
                                                        : "bg-white/5 border-white/10 hover:border-white/20"
                                                        }`}
                                                >
                                                    {editingQuestionIndex === idx ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                autoFocus
                                                                className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
                                                                value={editQuestionText}
                                                                onChange={(e) => setEditQuestionText(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && saveEditedQuestion(idx)}
                                                            />
                                                            <button onClick={() => saveEditedQuestion(idx)} className="text-green-400 hover:bg-green-400/10 p-1 rounded">Save</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex gap-3">
                                                                <span className="text-xs font-mono text-gray-500 mt-1">0{idx + 1}</span>
                                                                <p className="text-sm text-gray-200 leading-relaxed">{q}</p>
                                                            </div>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingQuestionIndex(idx);
                                                                        setEditQuestionText(q);
                                                                    }}
                                                                    className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteQuestion(idx)}
                                                                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
                                {step === 2 ? (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Back to Config
                                    </button>
                                ) : (
                                    <div /> // Spacer
                                )}

                                <button
                                    onClick={step === 1 ? handleGenerateQuestions : handleCreateInterview}
                                    disabled={isGenerating}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {step === 1 ? "Generate Questions" : "Start Interview"}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
