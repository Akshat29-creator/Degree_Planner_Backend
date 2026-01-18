"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
    Calendar,
    ArrowRight,
    Trash2,
    Clock,
    BookOpen,
    LayoutDashboard,
    Loader2,
    GraduationCap,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlanHistory, deletePlan, PlanHistoryItem, getPlanDetail } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<PlanHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Store actions to load a plan
    const setCourses = useAppStore((state) => state.setCourses);
    const setDataSource = useAppStore((state) => state.setDataSource);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const setPriorityCourses = useAppStore((state) => state.setPriorityCourses);
    const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);
    const setAnalysisResults = useAppStore((state) => state.setAnalysisResults);
    const setCareerGoal = useAppStore((state) => state.setCareerGoal);
    const setRemainingSemesters = useAppStore((state) => state.setRemainingSemesters);
    const setMaxCoursesPerSemester = useAppStore((state) => state.setMaxCoursesPerSemester);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getPlanHistory();
            setHistory(data);
        } catch (error) {
            toast.error("Failed to load history");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadPlan = async (id: number) => {
        const toastId = toast.loading("Loading plan...");
        try {
            const plan = await getPlanDetail(id);

            // CRITICAL: Restore courses data first
            if (plan.courses_data && plan.courses_data.length > 0) {
                setCourses(plan.courses_data);
                setDataSource((plan.data_source as any) || "uploaded");
            }

            // Populate global store with ALL saved data
            setCurrentPlan({
                degree_plan: plan.semesters,
                semester_difficulty: plan.semester_difficulty,
                risk_analysis: plan.risk_analysis,
                career_alignment_notes: plan.career_alignment_notes,
                advisor_explanation: plan.advisor_explanation,
            } as any);

            // Restore input parameters
            setCompletedCourses(plan.completed_courses || []);
            setPriorityCourses(plan.priority_courses || []);
            setMaxCoursesPerSemester(plan.max_courses_per_semester || 5);
            setRemainingSemesters(plan.total_semesters || 6);

            // Restore career goal if available
            if (plan.career_goal) {
                setCareerGoal(plan.career_goal);
            }

            toast.success("Plan loaded successfully!", { id: toastId });
            router.push("/planner"); // Redirect to planner view
        } catch (error) {
            toast.error("Failed to load plan details", { id: toastId });
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("Are you sure you want to delete this plan?")) return;

        setIsDeleting(id);
        try {
            await deletePlan(id);
            setHistory((prev) => prev.filter((item) => item.id !== id));
            toast.success("Plan deleted");
        } catch (error) {
            toast.error("Failed to delete plan");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="container max-w-5xl mx-auto px-6 pt-24 pb-12 space-y-8 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-center md:text-left md:flex md:justify-between md:items-end"
            >
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
                        Plan History
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mt-2 text-lg">
                        Review and reload your previous degree plans.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push("/planner")} className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Back to Planner
                </Button>
            </motion.div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
                </div>
            ) : history.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 px-4 text-center bg-gradient-to-b from-zinc-900/50 to-black/50 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl"
                >
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full" />
                        <div className="relative p-6 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
                            <Clock className="w-12 h-12 text-teal-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No Plans Saved Yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto text-lg leading-relaxed mb-8">
                        Your academic journey starts here. Create your first degree plan to track your progress and get AI insights.
                    </p>
                    <Button
                        onClick={() => router.push("/planner")}
                        size="lg"
                        className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/20 rounded-xl px-8 h-12 text-base transition-all hover:scale-105 active:scale-95"
                    >
                        Start Planning Now
                    </Button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {history.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleLoadPlan(item.id)}
                                className="group relative bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-teal-500/50 hover:bg-zinc-900/80 transition-all cursor-pointer shadow-lg hover:shadow-teal-900/20"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-teal-500/10 rounded-xl group-hover:bg-teal-500/20 transition-colors">
                                        <BookOpen className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDelete(item.id, e)}
                                        disabled={isDeleting === item.id}
                                    >
                                        {isDeleting === item.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>

                                <h3 className="text-xl font-bold text-zinc-100 mb-2 truncate">
                                    {item.name}
                                </h3>

                                <div className="space-y-2 text-sm text-zinc-400">
                                    {item.degree_program && (
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-purple-400" />
                                            <span className="text-purple-300 font-medium">{item.degree_program}</span>
                                        </div>
                                    )}
                                    {item.career_goal && (
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-cyan-400" />
                                            <span className="text-cyan-300">{item.career_goal}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-zinc-500" />
                                        <span>{item.total_courses_count || 0} Courses • {item.total_semesters} Semesters</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-zinc-500" />
                                        <span>Created {formatDistanceToNow(new Date(item.created_at))} ago</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 text-teal-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                    Open Plan <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
