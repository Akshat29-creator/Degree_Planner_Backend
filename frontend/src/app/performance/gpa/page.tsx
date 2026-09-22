"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import {
    Activity, ArrowLeft, Target, Trophy, BrainCircuit,
    TrendingUp, AlertTriangle, BookOpen, Loader2, CheckCircle2,
    Save, Sparkles, GraduationCap, ArrowRight, HelpCircle, Plus, Trash2, Clock
} from "lucide-react";
import { simulateGPA, saveDegreePlan, GPASimulationResponse, GPARiskAlert } from "@/lib/api";
import { toast } from "sonner";
import { FeatureGate } from "@/components/feature-gate";
import { cn } from "@/lib/utils";

// Standard grade point scale options
const GRADE_OPTIONS_4 = [
    { label: "A+ (4.0)", value: "A+" },
    { label: "A (4.0)", value: "A" },
    { label: "A- (3.7)", value: "A-" },
    { label: "B+ (3.3)", value: "B+" },
    { label: "B (3.0)", value: "B" },
    { label: "B- (2.7)", value: "B-" },
    { label: "C+ (2.3)", value: "C+" },
    { label: "C (2.0)", value: "C" },
    { label: "C- (1.7)", value: "C-" },
    { label: "D+ (1.3)", value: "D+" },
    { label: "D (1.0)", value: "D" },
    { label: "F (0.0)", value: "F" },
    { label: "Planned (Not Completed)", value: "None" }
];

const GRADE_OPTIONS_10 = [
    { label: "O (10.0)", value: "O" },
    { label: "A+ (9.0)", value: "A+" },
    { label: "A (8.0)", value: "A" },
    { label: "B (7.0)", value: "B" },
    { label: "C (6.0)", value: "C" },
    { label: "D (5.0)", value: "D" },
    { label: "F (0.0)", value: "F" },
    { label: "Planned (Not Completed)", value: "None" }
];

export default function GPASimulatorPage() {
    return (
        <FeatureGate featureKey="gpa_simulator" featureName="GPA Simulator">
            <GPASimulatorEngine />
        </FeatureGate>
    );
}

function GPASimulatorEngine() {
    const router = useRouter();
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Store selectors
    const courses = useAppStore((state) => state.courses);
    const completedCourses = useAppStore((state) => state.completedCourses);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const completedCourseGrades = useAppStore((state) => state.completedCourseGrades);
    const setCompletedCourseGrades = useAppStore((state) => state.setCompletedCourseGrades);
    const currentPlan = useAppStore((state) => state.currentPlan);
    const dataSource = useAppStore((state) => state.dataSource);
    const careerGoal = useAppStore((state) => state.careerGoal);
    const loadDemoData = useAppStore((state) => state.loadDemoData);

    // Local state
    const [gpaScale, setGpaScale] = useState<"4.0" | "10.0">("4.0");
    const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
    const [targetGpa, setTargetGpa] = useState<number>(3.5);
    const [simulation, setSimulation] = useState<GPASimulationResponse | null>(null);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [advisorAdvice, setAdvisorAdvice] = useState<string | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
    const [adviceLoadingStep, setAdviceLoadingStep] = useState<string>("Analyzing your coursework...");

    useEffect(() => {
        const cached = localStorage.getItem("gpa_simulator_scale");
        if (cached === "10.0" || cached === "4.0") {
            setGpaScale(cached as any);
            setTargetGpa(cached === "10.0" ? 8.5 : 3.5);
        } else {
            setShowScaleModal(true);
        }
    }, []);

    const handleScaleChange = (scale: "4.0" | "10.0") => {
        setGpaScale(scale);
        localStorage.setItem("gpa_simulator_scale", scale);
        setTargetGpa(scale === "10.0" ? 8.5 : 3.5);
        setShowScaleModal(false);
        
        // Auto-map grades
        const clearedGrades: Record<string, string> = {};
        Object.entries(completedCourseGrades).forEach(([code, grade]) => {
            if (scale === "10.0") {
                if (["A+", "A", "A-"].includes(grade)) clearedGrades[code] = "O";
                else if (["B+", "B"].includes(grade)) clearedGrades[code] = "A+";
                else if (["B-", "C+"].includes(grade)) clearedGrades[code] = "A";
                else if (["C", "C-"].includes(grade)) clearedGrades[code] = "B";
                else if (["D+", "D"].includes(grade)) clearedGrades[code] = "C";
                else clearedGrades[code] = "F";
            } else {
                if (grade === "O") clearedGrades[code] = "A";
                else if (grade === "A+") clearedGrades[code] = "B+";
                else if (grade === "A") clearedGrades[code] = "B";
                else if (grade === "B") clearedGrades[code] = "C";
                else if (grade === "C") clearedGrades[code] = "D+";
                else if (grade === "D") clearedGrades[code] = "D";
                else clearedGrades[code] = "F";
            }
        });
        setCompletedCourseGrades(clearedGrades);
    };

    // Run simulation helper
    const runGPASimulation = async (generateAdvice: boolean = false) => {
        if (courses.length === 0) return;

        setIsSimulating(true);
        if (generateAdvice) {
            setIsLoadingAdvice(true);
            setAdviceLoadingStep("AI is analyzing your coursework...");
        }

        try {
            // Build semesters dict
            const semesters: Record<string, string[]> = currentPlan ? currentPlan.degree_plan : {};
            let currentSemesters = { ...semesters };

            // If plan is not initialized, group remaining courses into dummy semesters for simulation
            if (!currentPlan || Object.keys(currentSemesters).length === 0) {
                let semIdx = 1;
                const remainingList = courses.filter(c => !completedCourses.includes(c.code));
                for (let i = 0; i < remainingList.length; i += 3) {
                    const chunk = remainingList.slice(i, i + 3).map(c => c.code);
                    currentSemesters[`Semester ${semIdx}`] = chunk;
                    semIdx++;
                }
            }

            if (generateAdvice) {
                setAdviceLoadingStep("Consulting local Ollama model (qwen3:8b-q4_K_M)...");
            }

            const response = await simulateGPA({
                completed_course_grades: completedCourseGrades,
                courses_data: courses,
                semesters: currentSemesters,
                completed_courses: completedCourses,
                target_gpa: targetGpa,
                gpa_scale: gpaScale,
                generate_advice: generateAdvice
            });

            setSimulation(response);
            if (generateAdvice && response.advisor_advice) {
                setAdvisorAdvice(response.advisor_advice);
            }
        } catch (err) {
            console.error("GPA simulation failed:", err);
            toast.error("Failed to run GPA simulation.");
        } finally {
            setIsSimulating(false);
            setIsLoadingAdvice(false);
        }
    };

    // Trigger simulation when completed courses, grades, or target GPA changes (debounced)
    useEffect(() => {
        if (courses.length > 0) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            debounceTimer.current = setTimeout(() => {
                runGPASimulation();
            }, 300);
        }
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [completedCourses, completedCourseGrades, targetGpa, courses.length, gpaScale]);

    // Handle initial loading
    useEffect(() => {
        if (courses.length > 0) {
            runGPASimulation();
        }
    }, [courses.length]);

    const handleAddCompletedCourse = (code: string) => {
        const newCompleted = [...completedCourses];
        if (!newCompleted.includes(code)) {
            newCompleted.push(code);
        }
        const defaultGrade = gpaScale === "10.0" ? "O" : "A";
        const newGrades = { ...completedCourseGrades, [code]: defaultGrade };

        setCompletedCourses(newCompleted);
        setCompletedCourseGrades(newGrades);
        toast.success(`Marked ${code} as completed (Grade ${defaultGrade})`);
    };

    const handleRemoveCompletedCourse = (code: string) => {
        const newCompleted = completedCourses.filter(c => c !== code);
        const newGrades = { ...completedCourseGrades };
        delete newGrades[code];

        setCompletedCourses(newCompleted);
        setCompletedCourseGrades(newGrades);
        toast.info(`Moved ${code} back to planned courses`);
    };

    const handleGradeChange = (code: string, grade: string) => {
        if (grade === "None") {
            handleRemoveCompletedCourse(code);
        } else {
            const newCompleted = [...completedCourses];
            if (!newCompleted.includes(code)) {
                newCompleted.push(code);
            }
            const newGrades = { ...completedCourseGrades, [code]: grade };
            setCompletedCourses(newCompleted);
            setCompletedCourseGrades(newGrades);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const semesters = currentPlan ? currentPlan.degree_plan : {};
            let currentSemesters = { ...semesters };
            if (!currentPlan || Object.keys(currentSemesters).length === 0) {
                let semIdx = 1;
                const remainingList = courses.filter(c => !completedCourses.includes(c.code));
                for (let i = 0; i < remainingList.length; i += 3) {
                    const chunk = remainingList.slice(i, i + 3).map(c => c.code);
                    currentSemesters[`Semester ${semIdx}`] = chunk;
                    semIdx++;
                }
            }

            await saveDegreePlan({
                name: "GPA Simulation Degree Plan",
                semesters: currentSemesters,
                completed_courses: completedCourses,
                priority_courses: useAppStore.getState().priorityCourses || [],
                max_courses_per_semester: useAppStore.getState().maxCoursesPerSemester || 5,
                total_semesters: Object.keys(currentSemesters).length || 6,
                semester_difficulty: currentPlan?.semester_difficulty || {},
                risk_analysis: currentPlan?.risk_analysis || undefined,
                career_alignment_notes: currentPlan?.career_alignment_notes || "",
                advisor_explanation: currentPlan?.advisor_explanation || "",
                degree_program: "General Degree Plan",
                career_goal: careerGoal || undefined,
                courses_data: courses,
                data_source: dataSource || "uploaded",
                completed_course_grades: completedCourseGrades,
            });
            toast.success("GPA configurations and course grades saved successfully!");
        } catch (err) {
            console.error("Save failed:", err);
            toast.error("Failed to save GPA configurations.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAIReport = () => {
        runGPASimulation(true);
    };

    // Parse difficulty label classes
    const getDifficultyClass = (diff?: string) => {
        switch (diff) {
            case "Easy": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            case "Hard": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
            default: return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
        }
    };

    // Parse scenario status colors
    const getScenarioColorClass = (status: string) => {
        switch (status) {
            case "On Track":
            case "Exceeded":
                return {
                    text: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                    bar: "bg-gradient-to-r from-emerald-500/50 to-emerald-400"
                };
            case "At Risk":
                return {
                    text: "text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                    bar: "bg-gradient-to-r from-amber-500/50 to-amber-400"
                };
            case "Impossible":
            default:
                return {
                    text: "text-rose-400",
                    bg: "bg-rose-500/10",
                    border: "border-rose-500/20",
                    bar: "bg-gradient-to-r from-rose-500/50 to-rose-400"
                };
        }
    };

    // Parse risk type indicators
    const getRiskStyles = (type: string) => {
        switch (type) {
            case "impossible_target":
                return {
                    icon: <XCircle className="w-5 h-5 text-rose-400" />,
                    bg: "bg-rose-500/5 border-rose-500/20",
                    title: "Impossible Target GPA"
                };
            case "failed_prereq":
                return {
                    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
                    bg: "bg-orange-500/5 border-orange-500/20",
                    title: "Failed Prerequisite dependency"
                };
            case "high_workload_warning":
            default:
                return {
                    icon: <Activity className="w-5 h-5 text-amber-400" />,
                    bg: "bg-amber-500/5 border-amber-500/20",
                    title: "High Workload Alert"
                };
        }
    };

    // Helper: Simple markdown formatting parser
    const parseBoldText = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, index) => {
            if (index % 2 === 1) {
                return <strong key={index} className="text-white font-bold">{part}</strong>;
            }
            return part;
        });
    };

    const renderAdviceMarkdown = (text: string) => {
        if (!text) return null;
        return text.split("\n").map((line, idx) => {
            const content = line.trim();
            if (content.startsWith("###")) {
                return <h4 key={idx} className="text-sm font-bold text-indigo-400 mt-4 mb-2">{content.replace("###", "").trim()}</h4>;
            }
            if (content.startsWith("##")) {
                return <h3 key={idx} className="text-base font-black text-indigo-300 mt-4 mb-2">{content.replace("##", "").trim()}</h3>;
            }
            if (content.startsWith("#")) {
                return <h2 key={idx} className="text-lg font-black text-white mt-4 mb-2">{content.replace("#", "").trim()}</h2>;
            }
            if (content.startsWith("-") || content.startsWith("*")) {
                const itemText = content.substring(1).trim();
                return (
                    <li key={idx} className="ml-4 list-disc text-zinc-300 text-sm mb-1 leading-relaxed">
                        {parseBoldText(itemText)}
                    </li>
                );
            }
            if (content === "") {
                return <div key={idx} className="h-2" />;
            }
            return <p key={idx} className="text-zinc-300 text-sm mb-2 leading-relaxed">{parseBoldText(content)}</p>;
        });
    };

    // Empty state when catalog is empty
    if (courses.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#050510] to-[#0a0a1a] flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">No Degree Course Catalog Found</h2>
                        <p className="text-sm text-zinc-400">
                            Please upload a degree plan, load the official demo course load, or enter courses manually in the Planner tab to start calculating your GPA projections.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={loadDemoData}
                            className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all text-sm"
                        >
                            Load Demo Course load
                        </button>
                        <button
                            onClick={() => router.push("/planner")}
                            className="flex-1 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 font-semibold transition-all text-sm"
                        >
                            Go to Planner
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Split courses into completed and remaining
    const completedCoursesList = courses.filter(c => completedCourses.includes(c.code));
    const remainingCoursesList = courses.filter(c => !completedCourses.includes(c.code));

    // Scenarios data
    const scenarios = simulation?.scenarios;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050510] to-[#0a0a1a] pb-28 md:pb-12 pt-6 md:pt-24 px-4 overflow-x-hidden">
            <div className="container max-w-6xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-3 md:hidden mb-4">
                            <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <h1 className="text-xl font-bold text-white leading-tight">GPA Simulator</h1>
                        </div>
                        <h1 className="hidden md:flex items-center text-4xl font-extrabold tracking-tight text-white mb-2">
                            <GraduationCap className="w-8 h-8 mr-3 text-indigo-500" />
                            GPA Goal & Risk Simulator
                        </h1>
                        <p className="text-zinc-400">Project upcoming semester outcomes, define target goals, and mitigate workload risks.</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto self-start md:self-center shrink-0">
                        <button
                            onClick={() => router.push("/performance")}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            Study Analytics
                        </button>
                        <button
                            onClick={() => router.push("/performance/gpa")}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white/10 text-white shadow-lg border border-white/5"
                        >
                            GPA Simulator
                        </button>
                    </div>
                </div>

                {/* Dashboard Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-5 hover:bg-white/[0.08] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-zinc-300">Current GPA</span>
                            <Trophy className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="font-black text-white text-3xl truncate">
                            {simulation ? simulation.current_cumulative_gpa.toFixed(2) : "4.00"}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-5 hover:bg-white/[0.08] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-zinc-300">Completed Credits</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="font-black text-white text-3xl truncate">
                            {simulation ? simulation.completed_credits : "0"}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-5 hover:bg-white/[0.08] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-zinc-300">Remaining Credits</span>
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="font-black text-white text-3xl truncate">
                            {simulation ? simulation.remaining_credits : "0"}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/5 bg-white/5 p-5 hover:bg-white/[0.08] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-zinc-300">Required Remaining GPA</span>
                            <Target className="w-5 h-5 text-fuchsia-400" />
                        </div>
                        <div className="font-black text-white text-3xl truncate">
                            {simulation ? simulation.required_remaining_gpa.toFixed(2) : "0.00"}
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column (2/3 width on large screens) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Target GPA Goal Slider Card */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Target className="w-5 h-5 text-indigo-400" />
                                        Define Target Graduation GPA
                                    </h3>
                                    <p className="text-xs text-zinc-400">Set your ultimate graduation goal and simulate requirements.</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-zinc-500 block uppercase tracking-wider">Goal</span>
                                    <span className="text-3xl font-black text-indigo-400">{targetGpa.toFixed(1)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div className="space-y-0.5 text-left">
                                    <span className="text-xs font-bold text-zinc-300 block">Grading Scale</span>
                                    <span className="text-[10px] text-zinc-500 block">Choose how your GPA is calculated.</span>
                                </div>
                                <div className="flex gap-1.5 p-0.5 bg-black/30 border border-white/10 rounded-xl">
                                    <button
                                        onClick={() => handleScaleChange("4.0")}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                            gpaScale === "4.0"
                                                ? "bg-indigo-600 text-white shadow"
                                                : "text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        4.0 GPA
                                    </button>
                                    <button
                                        onClick={() => handleScaleChange("10.0")}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                            gpaScale === "10.0"
                                                ? "bg-indigo-600 text-white shadow"
                                                : "text-zinc-400 hover:text-white"
                                        )}
                                    >
                                        10.0 CGPA
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min={gpaScale === "10.0" ? "4.0" : "2.0"}
                                    max={gpaScale === "10.0" ? "10.0" : "4.0"}
                                    step="0.1"
                                    value={targetGpa}
                                    onChange={(e) => setTargetGpa(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between text-xs text-zinc-500">
                                    {gpaScale === "10.0" ? (
                                        <>
                                            <span>4.0 (Passing)</span>
                                            <span>6.5 (First Class)</span>
                                            <span>8.0 (Very Good)</span>
                                            <span>9.0 (Outstanding)</span>
                                            <span>10.0 (Perfect)</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>2.0 (Passing)</span>
                                            <span>3.0 (Good)</span>
                                            <span>3.5 (Honors)</span>
                                            <span>4.0 (Perfect)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Scenario Projections */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-teal-400" />
                                    GPA Projections & Scenarios
                                </h3>
                                <p className="text-xs text-zinc-400">Mathematical scenarios for your graduation average.</p>
                            </div>

                            {isSimulating && !simulation ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                    <span className="text-xs text-zinc-400">Simulating outcomes...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {scenarios && Object.entries(scenarios).map(([key, val]) => {
                                        const classes = getScenarioColorClass(val.status);
                                        const maxScale = gpaScale === "10.0" ? 10.0 : 4.0;
                                        const percentWidth = (val.projected_gpa / maxScale) * 100;
                                        const targetPercent = (targetGpa / maxScale) * 100;

                                        return (
                                            <div key={key} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white capitalize">{key} Case</span>
                                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", classes.bg, classes.text, classes.border)}>
                                                            {val.status}
                                                        </span>
                                                    </div>
                                                    <span className={cn("font-black text-base", classes.text)}>{val.projected_gpa.toFixed(2)}</span>
                                                </div>

                                                {/* Bar container */}
                                                <div className="relative w-full h-4 bg-zinc-800/50 border border-zinc-700/30 rounded-full overflow-hidden">
                                                    {/* Target Marker line */}
                                                    <div
                                                        className="absolute top-0 bottom-0 w-0.5 bg-fuchsia-500 z-10 shadow-[0_0_8px_#d946ef]"
                                                        style={{ left: `${targetPercent}%` }}
                                                        title={`Target: ${targetGpa}`}
                                                    />
                                                    
                                                    {/* Projected progress bar */}
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentWidth}%` }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className={cn("h-full rounded-full", classes.bar)}
                                                    />
                                                </div>
                                                <p className="text-xs text-zinc-400 leading-relaxed">{val.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Course Grades Editor */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-indigo-400" />
                                        Completed Course Grades
                                    </h3>
                                    <p className="text-xs text-zinc-400">Record letter grades to calculate cumulative GPA accurately.</p>
                                </div>
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl font-bold transition-all text-xs self-start sm:self-auto shrink-0 shadow-lg border border-white/5"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Grades
                                </button>
                            </div>

                            <div className="space-y-4">
                                {completedCoursesList.length === 0 ? (
                                    <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <p className="text-zinc-500 text-sm">No completed courses recorded yet.</p>
                                        <p className="text-xs text-zinc-600 mt-1">Select planned courses below to add grades.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
                                        {completedCoursesList.map((course) => {
                                            const currentGrade = completedCourseGrades[course.code] || "A";
                                            return (
                                                <div key={course.code} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="font-bold text-sm text-white">{course.code}</span>
                                                            <span className="text-xs text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-xs">{course.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                                                                {course.credits} Credits
                                                            </span>
                                                            <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase", getDifficultyClass(course.difficulty))}>
                                                                {course.difficulty}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                                        <select
                                                            value={currentGrade}
                                                            onChange={(e) => handleGradeChange(course.code, e.target.value)}
                                                            className="bg-[#0c0c16] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                                                        >
                                                            {(gpaScale === "10.0" ? GRADE_OPTIONS_10 : GRADE_OPTIONS_4).map((opt) => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleRemoveCompletedCourse(course.code)}
                                                            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all"
                                                            title="Mark as Planned"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Planned/Remaining Courses Catalog */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    Upcoming & Planned Courses
                                </h3>
                                <p className="text-xs text-zinc-400">Click "+" to record grades and mark them completed.</p>
                            </div>

                            <div className="space-y-4">
                                {remainingCoursesList.length === 0 ? (
                                    <div className="text-center py-8 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <p className="text-zinc-500 text-sm">All courses are marked completed.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {remainingCoursesList.map((course) => (
                                            <div key={course.code} className="p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-4 transition-all">
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-white shrink-0">{course.code}</span>
                                                        <span className="text-[10px] text-zinc-500 font-mono">({course.credits} cr)</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 truncate font-medium">{course.name}</p>
                                                    <span className={cn("inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase", getDifficultyClass(course.difficulty))}>
                                                        {course.difficulty}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddCompletedCourse(course.code)}
                                                    className="w-8 h-8 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 flex items-center justify-center transition-all shrink-0"
                                                    title="Mark Completed"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (1/3 width on large screens) */}
                    <div className="space-y-6">
                        
                        {/* Advisor Panel */}
                        <div className="rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                                    AI Advisor Consultation
                                </h3>
                                <p className="text-xs text-zinc-400">Receive local AI study advice specific to your goals.</p>
                            </div>

                            {isLoadingAdvice ? (
                                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                    <p className="text-xs text-zinc-300 text-center animate-pulse">{adviceLoadingStep}</p>
                                </div>
                            ) : advisorAdvice ? (
                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-[#070712]/80 border border-white/10 shadow-inner overflow-y-auto max-h-[350px] scrollbar-thin">
                                        {renderAdviceMarkdown(advisorAdvice)}
                                    </div>
                                    <button
                                        onClick={handleGenerateAIReport}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 hover:text-white font-semibold transition-all text-xs"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Refresh AI Consultation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                                        <GraduationCap className="w-8 h-8 mx-auto text-indigo-400/30 mb-3" />
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            The local AI advisor will inspect your completed grades, target GPA requirements, course difficulties, and prerequisite pathways to generate study advice.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerateAIReport}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs shadow-lg shadow-indigo-500/10 border border-white/5"
                                    >
                                        <Sparkles className="w-4 h-4 text-indigo-200" />
                                        Generate Advisor Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Risks & Warnings List */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    Academic Risk Alerts
                                </h3>
                                <p className="text-xs text-zinc-400">Identified hurdles that jeopardize your target graduation GPA.</p>
                            </div>

                            {isSimulating && !simulation ? (
                                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                    <span className="text-xs text-zinc-400">Analyzing risks...</span>
                                </div>
                            ) : simulation?.risks && simulation.risks.length > 0 ? (
                                <div className="space-y-3">
                                    {simulation.risks.map((risk, idx) => {
                                        const styles = getRiskStyles(risk.type);
                                        return (
                                            <div key={idx} className={cn("p-4 border rounded-2xl flex gap-3 shadow-sm", styles.bg)}>
                                                <div className="shrink-0 pt-0.5">
                                                    {styles.icon}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-white">{styles.title}</h4>
                                                    <p className="text-[11px] text-zinc-400 leading-normal">{risk.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 text-center rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3" />
                                    <h4 className="text-xs font-bold">No Academic Risks Detected</h4>
                                    <p className="text-[10px] text-emerald-400/80 mt-1">Your planned grade configuration holds low burnout and requirement risk.</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>

            </div>
            {/* GPA Scale Selection Modal */}
            <AnimatePresence>
                {showScaleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-zinc-950/90 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-2xl"
                        >
                            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                                <GraduationCap className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white">Choose Your Grading Scale</h2>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Does your college or university evaluate coursework using a 10.0 CGPA scale (common in India, Europe, etc.) or a 4.0 GPA scale (common in US, Canada, etc.)?
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={() => handleScaleChange("4.0")}
                                    className="p-6 rounded-2xl bg-white/5 hover:bg-indigo-650/10 border border-white/10 hover:border-indigo-500/30 text-left transition-all group"
                                >
                                    <h4 className="font-bold text-white text-base group-hover:text-indigo-400">4.0 GPA Scale</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Uses letter grades A, B, C, D, F with maximum GPA of 4.0.</p>
                                </button>
                                <button
                                    onClick={() => handleScaleChange("10.0")}
                                    className="p-6 rounded-2xl bg-white/5 hover:bg-indigo-650/10 border border-white/10 hover:border-indigo-500/30 text-left transition-all group"
                                >
                                    <h4 className="font-bold text-white text-base group-hover:text-indigo-400">10.0 CGPA Scale</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Uses letter grades O, A+, A, B, C, D, F with maximum CGPA of 10.0.</p>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Inline reload icon component to avoid importing duplicate names
function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}

// Inline Close Icon representation to avoid missing imports
function XCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
