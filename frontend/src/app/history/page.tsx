"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
    Clock, BookOpen, Loader2, GraduationCap, Target,
    Trash2, ChevronRight, Search, ArrowLeft, Calendar,
    FileText, Award, BrainCircuit, ChevronDown, ChevronUp,
    CheckCircle2, AlertTriangle, TrendingUp, Brain, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    getPlanHistory, deletePlan, PlanHistoryItem, getPlanDetail,
    getAssessmentDocuments, getAssessmentTests, getTestDetail,
    deleteHistoryDocument, deleteHistoryTest,
    UploadedDocumentItem, TestResultItem, TestResultDetail
} from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { FeatureGate } from "@/components/feature-gate";
import { cn } from "@/lib/utils";

function groupByDate<T extends { created_at: string }>(items: T[]) {
    const groups: Record<string, T[]> = {};
    items.forEach((item) => {
        const d = new Date(item.created_at);
        const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : isThisWeek(d) ? "This Week" : "Earlier";
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });
    return groups;
}

type TabType = 'plans' | 'tests' | 'documents';

export default function HistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('tests');
    const [search, setSearch] = useState("");

    // Data states
    const [plans, setPlans] = useState<PlanHistoryItem[]>([]);
    const [tests, setTests] = useState<TestResultItem[]>([]);
    const [docs, setDocs] = useState<UploadedDocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const setCourses = useAppStore((state) => state.setCourses);
    const setDataSource = useAppStore((state) => state.setDataSource);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const setPriorityCourses = useAppStore((state) => state.setPriorityCourses);
    const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);
    const setCareerGoal = useAppStore((state) => state.setCareerGoal);
    const setRemainingSemesters = useAppStore((state) => state.setRemainingSemesters);
    const setMaxCoursesPerSemester = useAppStore((state) => state.setMaxCoursesPerSemester);

    useEffect(() => { loadAllHistory(); }, []);

    const loadAllHistory = async () => {
        setIsLoading(true);
        try {
            const [plansData, docsData, testsData] = await Promise.all([
                getPlanHistory().catch(() => []),
                getAssessmentDocuments().catch(() => []),
                getAssessmentTests().catch(() => [])
            ]);
            setPlans(plansData);
            setDocs(docsData);
            setTests(testsData);
        } catch {
            toast.error("Failed to load history");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadPlan = async (id: number) => {
        const toastId = toast.loading("Loading plan...");
        try {
            const plan = await getPlanDetail(id);
            if (plan.courses_data?.length > 0) {
                setCourses(plan.courses_data);
                setDataSource((plan.data_source as any) || "uploaded");
            }
            setCurrentPlan({
                degree_plan: plan.semesters,
                semester_difficulty: plan.semester_difficulty as any,
                risk_analysis: plan.risk_analysis,
                career_alignment_notes: plan.career_alignment_notes,
                advisor_explanation: plan.advisor_explanation,
            } as any);
            setCompletedCourses(plan.completed_courses || []);
            setPriorityCourses(plan.priority_courses || []);
            setMaxCoursesPerSemester(plan.max_courses_per_semester || 5);
            setRemainingSemesters(plan.total_semesters || 6);
            if (plan.career_goal) setCareerGoal(plan.career_goal);
            toast.success("Plan loaded!", { id: toastId });
            router.push("/planner");
        } catch {
            toast.error("Failed to load plan", { id: toastId });
        }
    };

    const handleDeletePlan = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this plan?")) return;
        try {
            await deletePlan(id);
            setPlans(prev => prev.filter(item => item.id !== id));
            toast.success("Plan deleted");
        } catch {
            toast.error("Failed to delete plan");
        }
    };

    const handleDeleteTest = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this test result?")) return;
        try {
            await deleteHistoryTest(id);
            setTests(prev => prev.filter(item => item.id !== id));
            toast.success("Test deleted");
        } catch {
            toast.error("Failed to delete test");
        }
    };

    const handleDeleteDoc = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this study document?")) return;
        try {
            await deleteHistoryDocument(id);
            setDocs(prev => prev.filter(item => item.id !== id));
            toast.success("Document deleted");
        } catch {
            toast.error("Failed to delete document");
        }
    };

    const filteredPlans = plans.filter(h => (h.name || "").toLowerCase().includes(search.toLowerCase()) || (h.career_goal || "").toLowerCase().includes(search.toLowerCase()));
    const filteredTests = tests.filter(h => (h.topic_name || "").toLowerCase().includes(search.toLowerCase()));
    const filteredDocs = docs.filter(h => (h.filename || "").toLowerCase().includes(search.toLowerCase()));

    const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

    const renderGroupedList = <T extends { id: number, created_at: string }>(
        items: T[],
        renderItem: (item: T) => React.ReactNode,
        emptyTitle: string,
        emptyDesc: string,
        emptyIcon: React.ReactNode
    ) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center h-full">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-zinc-500">
                        {emptyIcon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{emptyTitle}</h3>
                    <p className="text-sm text-zinc-400 max-w-xs">{emptyDesc}</p>
                </div>
            );
        }

        const groups = groupByDate(items);
        return (
            <div className="space-y-8">
                {groupOrder.filter(g => groups[g]?.length).map(groupLabel => (
                    <div key={groupLabel}>
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{groupLabel}</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {groups[groupLabel].map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        {renderItem(item)}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <FeatureGate featureKey="page_history" featureName="Activity History">
            <div className="min-h-screen bg-[#050510] pb-28 md:pb-12 pt-6 md:pt-24 px-4 overflow-x-hidden">
                <div className="container max-w-5xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 md:hidden mb-4">
                                <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <h1 className="text-xl font-bold text-white leading-tight">Archive</h1>
                            </div>
                            <h1 className="hidden md:block text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent mb-2">Platform Archive</h1>
                            <p className="text-zinc-400">Review your past degree plans, test scores, and uploaded study materials.</p>
                        </div>
                        <div className="relative w-full md:w-64 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search history..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide border-b border-white/10">
                        <TabButton active={activeTab === 'tests'} onClick={() => setActiveTab('tests')} icon={<Award className="w-4 h-4"/>} label="Assessments" count={tests.length} />
                        <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FileText className="w-4 h-4"/>} label="Study Docs" count={docs.length} />
                        <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} icon={<BrainCircuit className="w-4 h-4"/>} label="Degree Plans" count={plans.length} />
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            <p className="text-sm text-zinc-500">Loading your archives...</p>
                        </div>
                    ) : (
                        <div className="min-h-[50vh]">
                            {activeTab === 'plans' && renderGroupedList(
                                filteredPlans,
                                (item) => (
                                    <div onClick={() => handleLoadPlan(item.id)} className="group glass-card p-4 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/5 cursor-pointer flex items-center gap-4 transition-all">
                                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{item.name}</h3>
                                            <div className="flex gap-2 text-xs mt-1 text-zinc-500">
                                                <span>{item.total_courses_count} courses</span> &bull; <span>{item.total_semesters} semesters</span>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDeletePlan(item.id, e)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ),
                                "No Degree Plans", "You haven't saved any AI degree plans yet.", <BrainCircuit />
                            )}

                            {activeTab === 'tests' && renderGroupedList(
                                filteredTests,
                                (item) => <TestCard item={item} onDelete={handleDeleteTest} />,
                                "No Assessments Taken", "Generate a test in the Assessment Hub to see results here.", <Award />
                            )}

                            {activeTab === 'documents' && renderGroupedList(
                                filteredDocs,
                                (item) => (
                                        <div className="group bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 flex items-center gap-4 transition-all cursor-pointer" onClick={() => router.push(`/revision?resumeDocId=${item.id}`)}>
                                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-zinc-200 font-medium truncate group-hover:text-blue-400 transition-colors">{item.filename}</h3>
                                                <div className="flex items-center gap-2 text-xs mt-1 text-zinc-500 uppercase tracking-wider">
                                                    <span className="text-blue-400 font-bold">{item.file_type}</span> &bull; <span>{formatDistanceToNow(new Date(item.created_at))} ago</span>
                                                    {(item as any).analysis_result?.topics && (
                                                        <>&bull; <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">{(item as any).analysis_result.topics.length} topics</span></>
                                                    )}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="hidden md:flex text-blue-400 hover:text-white hover:bg-blue-500/50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/revision?resumeDocId=${item.id}`);
                                                }}
                                            >
                                                Review <ExternalLink className="ml-1 w-3.5 h-3.5" />
                                            </Button>
                                            <button onClick={(e) => handleDeleteDoc(item.id, e)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0">
                                                <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                            </button>
                                        </div>
                                ),
                                "No Documents Uploaded", "Upload study materials in the Assessment Hub to store them.", <FileText />
                            )}
                        </div>
                    )}

                </div>
            </div>
        </FeatureGate>
    );
}

function TestCard({ item, onDelete }: { item: TestResultItem; onDelete: (id: number, e: React.MouseEvent) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [detail, setDetail] = useState<TestResultDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const handleExpand = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!expanded && !detail) {
            setLoadingDetail(true);
            try {
                const d = await getTestDetail(item.id);
                setDetail(d);
            } catch {
                toast.error("Could not load test details");
            } finally {
                setLoadingDetail(false);
            }
        }
        setExpanded(prev => !prev);
    };

    const evaluations = detail?.feedback_json?.evaluations || [];
    const deepAnalysis = detail?.feedback_json?.deep_analysis;

    return (
        <div className={cn("glass-card rounded-2xl border transition-all overflow-hidden", expanded ? "border-violet-500/40" : "border-white/10 hover:border-violet-500/30")}>
            {/* Summary Row */}
            <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center border shrink-0",
                    item.percentage >= 80 ? "bg-green-500/10 border-green-500/30 text-green-400" :
                    item.percentage >= 50 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                    "bg-red-500/10 border-red-500/30 text-red-500"
                )}>
                    <span className="text-lg font-black">{Math.round(item.percentage)}%</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-base truncate flex items-center gap-2">
                        {item.topic_name}
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                            item.performance_level === "Strong" || item.performance_level === "Excellent" ? "bg-green-500/20 text-green-400" :
                            item.performance_level === "Average" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                        )}>{item.performance_level}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs mt-1.5 text-zinc-400">
                        <span>{item.mcq_count} MCQ &bull; {item.short_count} Short &bull; {item.long_count} Long</span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(item.created_at))} ago</span>
                    </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <Button variant="ghost" size="sm" onClick={handleExpand}
                        className={cn("text-sm font-medium gap-1", expanded ? "text-violet-300 bg-violet-500/10" : "text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10")}>
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expanded ? "Hide" : "View Report"}
                    </Button>
                    <button onClick={(e) => onDelete(item.id, e)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Detail */}
            {expanded && (
                <div className="border-t border-white/10 bg-black/30 p-5 space-y-6">
                    {loadingDetail ? (
                        <div className="flex items-center justify-center py-8 gap-3 text-zinc-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading full report...</span>
                        </div>
                    ) : detail ? (
                        <>
                            {/* Per-Question Breakdown */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4 text-violet-400" /> Question Breakdown
                                </h4>
                                {evaluations.map((ev: any, i: number) => (
                                    <div key={i} className={cn("rounded-xl border p-4 space-y-3",
                                        ev.is_correct ? "border-green-500/20 bg-green-500/5" :
                                        ev.marks_awarded > 0 ? "border-amber-500/20 bg-amber-500/5" :
                                        "border-red-500/20 bg-red-500/5")}>
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-white text-sm font-medium flex-1">{i + 1}. {ev.question}</p>
                                            <div className={cn("text-xs font-black font-mono px-2.5 py-1 rounded-lg shrink-0",
                                                ev.is_correct ? "bg-green-500/20 text-green-400" :
                                                ev.marks_awarded > 0 ? "bg-amber-500/20 text-amber-300" :
                                                "bg-red-500/20 text-red-400")}>
                                                {ev.marks_awarded}/{ev.max_marks}
                                            </div>
                                        </div>
                                        <div className="bg-black/40 rounded-lg p-3">
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Your Answer</div>
                                            <p className="text-zinc-300 text-xs italic">&#8220;{ev.user_answer || "No response"}&#8221;</p>
                                        </div>
                                        <div className="bg-violet-950/40 border border-violet-500/10 rounded-lg p-3">
                                            <div className="text-[10px] text-violet-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Brain className="w-3 h-3" /> AI Feedback
                                            </div>
                                            <p className="text-zinc-300 text-xs leading-relaxed">{ev.teacher_feedback}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Deep Analysis */}
                            {deepAnalysis && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-fuchsia-400" /> Teacher's Analysis
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                                            <h5 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Core Strengths
                                            </h5>
                                            {deepAnalysis.strengths?.length > 0 ? (
                                                <ul className="space-y-2">{deepAnalysis.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>
                                                ))}</ul>
                                            ) : <p className="text-zinc-500 text-xs">None identified</p>}
                                        </div>
                                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                            <h5 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Concept Gaps
                                            </h5>
                                            {deepAnalysis.weaknesses?.length > 0 ? (
                                                <ul className="space-y-2">{deepAnalysis.weaknesses.map((w: string, i: number) => (
                                                    <li key={i} className="text-zinc-300 text-xs flex gap-2"><span className="text-red-500 mt-0.5">•</span>{w}</li>
                                                ))}</ul>
                                            ) : <p className="text-zinc-500 text-xs">None identified</p>}
                                        </div>
                                    </div>
                                    {deepAnalysis.improvement_plan && (
                                        <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                            <h5 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <TrendingUp className="w-3.5 h-3.5" /> Action Plan
                                            </h5>
                                            <p className="text-zinc-300 text-xs leading-relaxed border-l-2 border-cyan-500/50 pl-3">{deepAnalysis.improvement_plan}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                active 
                    ? "bg-white/10 text-white border border-white/10" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            )}
        >
            {icon}
            {label}
            <span className={cn(
                "ml-1.5 px-2 py-0.5 rounded-full text-xs",
                active ? "bg-white/20 text-white" : "bg-white/5 text-zinc-500"
            )}>
                {count}
            </span>
        </button>
    );
}
