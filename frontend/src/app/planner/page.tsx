"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { generatePlan, analyzePlan, exportPlanICS, saveDegreePlan } from "@/lib/api";
import type { PlanResponse, AIPlanExplanation, DecisionEvent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DataUploadModal } from "@/components/data-upload";
import { ManualEntryForm } from "@/components/manual-entry-form";
import { toast } from "sonner";
import {
    Rocket,
    Sparkles,
    Download,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Brain,
    Target,
    ChevronDown,
    Upload,
    FileText,
    Gauge,
    Clock,
    Shield,
    Zap,
    GraduationCap,
    TrendingUp,
    Users,
    Calendar,
    Map,
    BookOpen,
    Star,
    ArrowRight,
    ArrowLeft,
    Trophy,
    Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisualRoadmap } from "./VisualRoadmap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import confetti from "canvas-confetti";
import indianCourses from "@/data/indian-courses";

// Confetti celebration function
const triggerConfetti = () => {
    // First burst - center
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981']
    });

    // Side bursts with slight delay
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#14b8a6', '#06b6d4', '#8b5cf6']
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#f59e0b', '#10b981', '#8b5cf6']
        });
    }, 150);

    // Final celebration burst
    setTimeout(() => {
        confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.7 },
            colors: ['#14b8a6', '#06b6d4', '#22c55e', '#eab308']
        });
    }, 300);
};

// ==========================================
// VISUAL ROADMAP COMPONENT (HACKATHON WINNER)
// ==========================================
function SkillsProgression({ plan, courses }: {
    plan: Record<string, string[]>;
    courses: { code: string; name: string }[]
}) {
    // Infer skills from course names AND course codes
    const skillCategories = [
        { name: "Programming", keywords: ["programming", "software", "code", "development", "python", "java", "web"], codePrefixes: ["CS", "IT", "SE", "SW"], color: "from-violet-500 to-purple-500" },
        { name: "Data Science", keywords: ["data", "analytics", "statistics", "machine learning", "ai", "mining"], codePrefixes: ["DS", "ML", "AI"], color: "from-teal-500 to-cyan-500" },
        { name: "Systems", keywords: ["systems", "database", "network", "architecture", "cloud", "operating"], codePrefixes: ["SY", "DB", "NET"], color: "from-orange-500 to-red-500" },
        { name: "Math", keywords: ["math", "calculus", "algebra", "discrete", "probability", "linear", "numerical"], codePrefixes: ["MA", "MTH", "MATH"], color: "from-pink-500 to-rose-500" },
        { name: "Theory", keywords: ["theory", "algorithms", "computation", "analysis", "logic"], codePrefixes: ["TH", "ALG"], color: "from-emerald-500 to-green-500" },
        { name: "Chemistry", keywords: ["chemistry", "chemical", "organic", "inorganic", "biochem", "polymer"], codePrefixes: ["CHE", "CH", "CY"], color: "from-green-500 to-lime-500" },
        { name: "Physics", keywords: ["physics", "mechanics", "thermodynamics", "quantum", "optics", "electromagnetic"], codePrefixes: ["PHY", "PH"], color: "from-blue-500 to-indigo-500" },
        { name: "Electronics", keywords: ["electronics", "circuits", "signals", "digital", "analog", "vlsi"], codePrefixes: ["EC", "EE", "EL", "ECE"], color: "from-cyan-500 to-sky-500" },
        { name: "Mechanical", keywords: ["mechanical", "thermodynamics", "fluid", "manufacturing", "design"], codePrefixes: ["ME", "MEC"], color: "from-amber-500 to-yellow-500" },
        { name: "Biology", keywords: ["biology", "biotech", "genetics", "molecular", "cell", "microbiology"], codePrefixes: ["BIO", "BT", "BY"], color: "from-lime-500 to-green-500" },
        { name: "Engineering", keywords: ["engineering", "project", "management", "design", "workshop"], codePrefixes: ["EN", "ENG", "PJ", "WS"], color: "from-slate-500 to-zinc-400" },
        { name: "Communication", keywords: ["english", "communication", "writing", "language", "presentation"], codePrefixes: ["ENG1", "COM", "HS", "HU"], color: "from-rose-500 to-pink-500" },
        { name: "Security", keywords: ["security", "cryptography", "cyber", "forensic"], codePrefixes: ["SEC", "CY"], color: "from-red-600 to-orange-500" },
        { name: "Electives", keywords: ["elective", "open", "professional"], codePrefixes: ["OE", "PE", "EL"], color: "from-purple-500 to-violet-500" },
    ];

    const allCourseCodes = Object.values(plan).flat();
    const courseDetails = allCourseCodes.map(code =>
        courses.find(c => c.code === code) || { code, name: code } // Fallback to code if no name
    ).filter(Boolean);

    const skillScores = skillCategories.map(cat => {
        const matchingCourses = courseDetails.filter(c => {
            const nameMatch = cat.keywords.some(kw => c?.name?.toLowerCase().includes(kw));
            const codeMatch = cat.codePrefixes?.some(prefix =>
                c?.code?.toUpperCase().startsWith(prefix.toUpperCase())
            );
            return nameMatch || codeMatch;
        });
        return {
            ...cat,
            count: matchingCourses.length,
            percentage: Math.min(100, (matchingCourses.length / 3) * 100),
        };
    }).filter(s => s.count > 0);

    if (skillScores.length === 0) return null;

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Skills You'll Gain
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {skillScores.map((skill, i) => (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-center"
                    >
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${skill.color} p-[3px] mb-2`}>
                            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                <span className="text-lg font-bold text-white">{skill.count}</span>
                            </div>
                        </div>
                        <div className="text-sm font-medium text-white">{skill.name}</div>
                        <div className="text-xs text-zinc-500">{skill.count} courses</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// CONFIDENCE SCORE GAUGE COMPONENT
// ==========================================
function ConfidenceGauge({ score, breakdown }: {
    score: number;
    breakdown?: {
        prerequisite_safety: number;
        workload_balance: number;
        failure_recovery_margin: number;
        graduation_slack: number;
    } | null
}) {
    const getColor = (value: number) => {
        if (value >= 80) return "text-emerald-400";
        if (value >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getBarColor = (value: number) => {
        if (value >= 80) return "bg-emerald-500";
        if (value >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Gauge className="h-5 w-5 text-cyan-400" />
                Plan Confidence Score
            </h3>

            {/* Main Score */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-zinc-700"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${score * 2.51} 251`}
                            className={getColor(score)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-3xl font-black ${getColor(score)}`}>
                            {Math.round(score)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            {breakdown && (
                <div className="space-y-3">
                    {[
                        { label: "Prerequisite Safety", value: breakdown.prerequisite_safety, icon: Shield },
                        { label: "Workload Balance", value: breakdown.workload_balance, icon: Zap },
                        { label: "Recovery Margin", value: breakdown.failure_recovery_margin, icon: TrendingUp },
                        { label: "Graduation Slack", value: breakdown.graduation_slack, icon: GraduationCap },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400 flex items-center gap-2">
                                    <item.icon className="w-3 h-3" />
                                    {item.label}
                                </span>
                                <span className={getColor(item.value)}>{Math.round(item.value)}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className={`h-full rounded-full ${getBarColor(item.value)}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================================
// DECISION TIMELINE COMPONENT (ENHANCED)
// ==========================================
function DecisionTimeline({ events }: { events: DecisionEvent[] }) {
    if (!events.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6 h-full overflow-hidden flex flex-col"
        >
            <div className="flex items-center gap-2 mb-6 flex-shrink-0">
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                    <Clock className="h-5 w-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Live Decision Feed</h3>
            </div>

            <div className="relative pl-4 border-l border-white/10 space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                {events.map((event, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative"
                    >
                        {/* Dot */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] ring-4 ring-[#0a0a16]" />

                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-400">
                                {event.semester}
                            </span>
                        </div>

                        <div className="text-sm font-medium text-white mb-1">
                            {event.decision}
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                            {event.reason}
                        </p>

                        {event.risk_mitigated && (
                            <div className="flex items-start gap-1.5">
                                <Shield className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] text-emerald-400/80 font-medium">
                                    Mitigated: {event.risk_mitigated}
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ==========================================
// KEY INSIGHT BANNER
// ==========================================
function KeyInsightBanner({ insight }: { insight: string }) {
    if (!insight) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border border-violet-500/30 shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-3xl bg-cyan-500 rounded-full mix-blend-screen pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-inner">
                    <Sparkles className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                    <div className="text-xs text-violet-300 mb-1 font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Key Insight
                    </div>
                    <p className="text-white font-medium text-lg leading-relaxed">{insight}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ==========================================
// MAIN PLANNER PAGE
// ==========================================
export default function PlannerPage() {
    // Store
    const courses = useAppStore((state) => state.courses);
    const loadDemoData = useAppStore((state) => state.loadDemoData);
    const dataSource = useAppStore((state) => state.dataSource);
    const completedCourses = useAppStore((state) => state.completedCourses);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const priorityCourses = useAppStore((state) => state.priorityCourses);
    const setPriorityCourses = useAppStore((state) => state.setPriorityCourses);
    const remainingSemesters = useAppStore((state) => state.remainingSemesters);
    const setRemainingSemesters = useAppStore((state) => state.setRemainingSemesters);
    const maxCoursesPerSemester = useAppStore((state) => state.maxCoursesPerSemester);
    const setMaxCoursesPerSemester = useAppStore((state) => state.setMaxCoursesPerSemester);
    const careerGoal = useAppStore((state) => state.careerGoal);
    const setCareerGoal = useAppStore((state) => state.setCareerGoal);
    const currentPlan = useAppStore((state) => state.currentPlan);
    const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);

    // Local state
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIPlanExplanation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [advisorMode, setAdvisorMode] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Onboarding state
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [selectedDegreeType, setSelectedDegreeType] = useState<string | null>(null); // B.Tech, M.Tech, etc.
    const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null); // CS, EE, etc.
    const [selectedDegree, setSelectedDegree] = useState<string | null>(null); // Legacy compatibility
    const [customDegreeName, setCustomDegreeName] = useState("");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [isGeneratingCourses, setIsGeneratingCourses] = useState(false);

    // Indian Degree Types with durations
    const degreeTypes = [
        { id: "btech", name: "B.Tech / B.E.", duration: 4, icon: "🎓", color: "from-blue-500 to-cyan-500" },
        { id: "mtech", name: "M.Tech / M.E.", duration: 2, icon: "🔬", color: "from-purple-500 to-violet-500" },
        { id: "bsc", name: "B.Sc.", duration: 3, icon: "🔭", color: "from-green-500 to-emerald-500" },
        { id: "msc", name: "M.Sc.", duration: 2, icon: "🧪", color: "from-teal-500 to-cyan-500" },
        { id: "bba", name: "BBA", duration: 3, icon: "💼", color: "from-orange-500 to-amber-500" },
        { id: "mba", name: "MBA", duration: 2, icon: "📊", color: "from-red-500 to-rose-500" },
        { id: "bcom", name: "B.Com", duration: 3, icon: "📈", color: "from-yellow-500 to-orange-500" },
        { id: "mcom", name: "M.Com", duration: 2, icon: "💰", color: "from-lime-500 to-green-500" },
        { id: "ba", name: "B.A.", duration: 3, icon: "📖", color: "from-pink-500 to-rose-500" },
        { id: "ma", name: "M.A.", duration: 2, icon: "📚", color: "from-indigo-500 to-purple-500" },
        { id: "bca", name: "BCA", duration: 3, icon: "💻", color: "from-sky-500 to-blue-500" },
        { id: "mca", name: "MCA", duration: 2, icon: "🖥️", color: "from-cyan-500 to-teal-500" },
        { id: "other", name: "Other", duration: 4, icon: "📝", color: "from-gray-500 to-zinc-500" },
    ];

    // Specializations based on degree type
    const specializationMap: Record<string, { id: string; name: string; icon: string }[]> = {
        btech: [
            { id: "cs", name: "Computer Science & Engineering", icon: "💻" },
            { id: "it", name: "Information Technology", icon: "🌐" },
            { id: "ece", name: "Electronics & Communication", icon: "📡" },
            { id: "ee", name: "Electrical Engineering", icon: "⚡" },
            { id: "me", name: "Mechanical Engineering", icon: "⚙️" },
            { id: "civil", name: "Civil Engineering", icon: "🏗️" },
            { id: "chem", name: "Chemical Engineering", icon: "⚗️" },
            { id: "biotech", name: "Biotechnology", icon: "🧬" },
            { id: "aiml", name: "AI & Machine Learning", icon: "🤖" },
            { id: "ds", name: "Data Science", icon: "📊" },
        ],
        mtech: [
            { id: "cs", name: "Computer Science", icon: "💻" },
            { id: "ai", name: "Artificial Intelligence", icon: "🤖" },
            { id: "vlsi", name: "VLSI Design", icon: "⚡" },
            { id: "embedded", name: "Embedded Systems", icon: "📡" },
            { id: "struct", name: "Structural Engineering", icon: "🏗️" },
            { id: "thermal", name: "Thermal Engineering", icon: "🔥" },
        ],
        bsc: [
            { id: "physics", name: "Physics", icon: "⚛️" },
            { id: "chemistry", name: "Chemistry", icon: "🧪" },
            { id: "math", name: "Mathematics", icon: "📐" },
            { id: "cs", name: "Computer Science", icon: "💻" },
            { id: "bio", name: "Biology", icon: "🧬" },
        ],
        msc: [
            { id: "physics", name: "Physics", icon: "⚛️" },
            { id: "chemistry", name: "Chemistry", icon: "🧪" },
            { id: "math", name: "Mathematics", icon: "📐" },
            { id: "cs", name: "Computer Science", icon: "💻" },
        ],
        bba: [
            { id: "general", name: "General Management", icon: "📋" },
            { id: "marketing", name: "Marketing", icon: "📣" },
            { id: "finance", name: "Finance", icon: "💰" },
            { id: "hr", name: "Human Resources", icon: "👥" },
        ],
        mba: [
            { id: "finance", name: "Finance", icon: "💰" },
            { id: "marketing", name: "Marketing", icon: "📣" },
            { id: "hr", name: "Human Resources", icon: "👥" },
            { id: "operations", name: "Operations", icon: "⚙️" },
            { id: "it", name: "IT & Systems", icon: "💻" },
            { id: "strategy", name: "Strategy", icon: "♟️" },
        ],
        bcom: [
            { id: "general", name: "General Commerce", icon: "📋" },
            { id: "accounting", name: "Accounting & Finance", icon: "📊" },
            { id: "banking", name: "Banking & Insurance", icon: "🏦" },
        ],
        mcom: [
            { id: "accounting", name: "Accounting", icon: "📊" },
            { id: "finance", name: "Finance", icon: "💰" },
            { id: "taxation", name: "Taxation", icon: "📜" },
        ],
        bca: [
            { id: "general", name: "General BCA", icon: "💻" },
        ],
        mca: [
            { id: "general", name: "General MCA", icon: "💻" },
            { id: "ai", name: "AI & Data Science", icon: "🤖" },
        ],
        ba: [
            { id: "english", name: "English", icon: "📖" },
            { id: "economics", name: "Economics", icon: "📈" },
            { id: "psychology", name: "Psychology", icon: "🧠" },
            { id: "sociology", name: "Sociology", icon: "👥" },
            { id: "political", name: "Political Science", icon: "🏛️" },
        ],
        ma: [
            { id: "english", name: "English", icon: "📖" },
            { id: "economics", name: "Economics", icon: "📈" },
            { id: "psychology", name: "Psychology", icon: "🧠" },
        ],
        other: [
            { id: "other", name: "Custom Specialization", icon: "📝" },
        ],
    };

    // Legacy compatibility
    const degreePrograms = degreeTypes.map(dt => ({
        id: dt.id,
        name: dt.name,
        icon: dt.icon,
        color: dt.color
    }));

    // Dynamic years based on degree duration
    const getYearsForDegree = (degreeTypeId: string) => {
        const degree = degreeTypes.find(d => d.id === degreeTypeId);
        const duration = degree?.duration || 4;
        return Array.from({ length: duration }, (_, i) => ({
            year: i + 1,
            name: duration === 2 ? (i === 0 ? "First Year" : "Second Year") :
                duration === 3 ? ["First Year", "Second Year", "Third Year"][i] :
                    ["Freshman", "Sophomore", "Junior", "Senior"][i],
            semesters: (duration - i) * 2
        }));
    };

    const years = selectedDegreeType ? getYearsForDegree(selectedDegreeType) : [
        { year: 1, name: "Freshman", semesters: 8 },
        { year: 2, name: "Sophomore", semesters: 6 },
        { year: 3, name: "Junior", semesters: 4 },
        { year: 4, name: "Senior", semesters: 2 },
    ];

    const generateCoursesForDegree = (degreeId: string, currentYear: number) => {
        // Base courses for each degree
        const courseTemplates: Record<string, { code: string; name: string; credits: number; prerequisites: string[]; year: number }[]> = {
            cs: [
                { code: "CS101", name: "Introduction to Programming", credits: 3, prerequisites: [], year: 1 },
                { code: "CS102", name: "Data Structures", credits: 3, prerequisites: ["CS101"], year: 1 },
                { code: "MATH101", name: "Calculus I", credits: 4, prerequisites: [], year: 1 },
                { code: "MATH102", name: "Calculus II", credits: 4, prerequisites: ["MATH101"], year: 1 },
                { code: "CS201", name: "Algorithms", credits: 3, prerequisites: ["CS102"], year: 2 },
                { code: "CS202", name: "Computer Architecture", credits: 3, prerequisites: ["CS101"], year: 2 },
                { code: "CS203", name: "Database Systems", credits: 3, prerequisites: ["CS102"], year: 2 },
                { code: "MATH201", name: "Discrete Mathematics", credits: 3, prerequisites: ["MATH101"], year: 2 },
                { code: "CS301", name: "Operating Systems", credits: 3, prerequisites: ["CS202", "CS201"], year: 3 },
                { code: "CS302", name: "Software Engineering", credits: 3, prerequisites: ["CS201"], year: 3 },
                { code: "CS303", name: "Computer Networks", credits: 3, prerequisites: ["CS202"], year: 3 },
                { code: "CS304", name: "Machine Learning", credits: 3, prerequisites: ["CS201", "MATH201"], year: 3 },
                { code: "CS401", name: "Distributed Systems", credits: 3, prerequisites: ["CS301", "CS303"], year: 4 },
                { code: "CS402", name: "Capstone Project", credits: 4, prerequisites: ["CS302"], year: 4 },
                { code: "CS403", name: "Deep Learning", credits: 3, prerequisites: ["CS304"], year: 4 },
            ],
            ee: [
                { code: "EE101", name: "Circuit Analysis", credits: 3, prerequisites: [], year: 1 },
                { code: "EE102", name: "Electronics I", credits: 3, prerequisites: ["EE101"], year: 1 },
                { code: "MATH101", name: "Calculus I", credits: 4, prerequisites: [], year: 1 },
                { code: "PHYS101", name: "Physics I", credits: 4, prerequisites: [], year: 1 },
                { code: "EE201", name: "Digital Logic", credits: 3, prerequisites: ["EE101"], year: 2 },
                { code: "EE202", name: "Signals and Systems", credits: 3, prerequisites: ["EE102", "MATH101"], year: 2 },
                { code: "EE203", name: "Electromagnetics", credits: 3, prerequisites: ["PHYS101"], year: 2 },
                { code: "EE301", name: "Control Systems", credits: 3, prerequisites: ["EE202"], year: 3 },
                { code: "EE302", name: "Power Electronics", credits: 3, prerequisites: ["EE102"], year: 3 },
                { code: "EE303", name: "Communication Systems", credits: 3, prerequisites: ["EE202"], year: 3 },
                { code: "EE401", name: "VLSI Design", credits: 3, prerequisites: ["EE201"], year: 4 },
                { code: "EE402", name: "Senior Design Project", credits: 4, prerequisites: ["EE301"], year: 4 },
            ],
            me: [
                { code: "ME101", name: "Engineering Mechanics", credits: 3, prerequisites: [], year: 1 },
                { code: "ME102", name: "Engineering Drawing", credits: 2, prerequisites: [], year: 1 },
                { code: "MATH101", name: "Calculus I", credits: 4, prerequisites: [], year: 1 },
                { code: "PHYS101", name: "Physics I", credits: 4, prerequisites: [], year: 1 },
                { code: "ME201", name: "Thermodynamics", credits: 3, prerequisites: ["PHYS101"], year: 2 },
                { code: "ME202", name: "Fluid Mechanics", credits: 3, prerequisites: ["ME101"], year: 2 },
                { code: "ME203", name: "Material Science", credits: 3, prerequisites: [], year: 2 },
                { code: "ME301", name: "Heat Transfer", credits: 3, prerequisites: ["ME201"], year: 3 },
                { code: "ME302", name: "Machine Design", credits: 3, prerequisites: ["ME101", "ME203"], year: 3 },
                { code: "ME303", name: "Manufacturing Processes", credits: 3, prerequisites: ["ME203"], year: 3 },
                { code: "ME401", name: "CAD/CAM", credits: 3, prerequisites: ["ME302"], year: 4 },
                { code: "ME402", name: "Capstone Project", credits: 4, prerequisites: ["ME302"], year: 4 },
            ],
            business: [
                { code: "BUS101", name: "Introduction to Business", credits: 3, prerequisites: [], year: 1 },
                { code: "ECON101", name: "Microeconomics", credits: 3, prerequisites: [], year: 1 },
                { code: "ACCT101", name: "Financial Accounting", credits: 3, prerequisites: [], year: 1 },
                { code: "MATH105", name: "Business Mathematics", credits: 3, prerequisites: [], year: 1 },
                { code: "BUS201", name: "Marketing Principles", credits: 3, prerequisites: ["BUS101"], year: 2 },
                { code: "BUS202", name: "Organizational Behavior", credits: 3, prerequisites: ["BUS101"], year: 2 },
                { code: "FIN201", name: "Corporate Finance", credits: 3, prerequisites: ["ACCT101"], year: 2 },
                { code: "BUS301", name: "Operations Management", credits: 3, prerequisites: ["BUS201"], year: 3 },
                { code: "BUS302", name: "Business Strategy", credits: 3, prerequisites: ["BUS202"], year: 3 },
                { code: "BUS303", name: "Business Analytics", credits: 3, prerequisites: ["MATH105"], year: 3 },
                { code: "BUS401", name: "Entrepreneurship", credits: 3, prerequisites: ["BUS302"], year: 4 },
                { code: "BUS402", name: "Capstone: Business Plan", credits: 4, prerequisites: ["BUS302"], year: 4 },
            ]
        };

        const template = courseTemplates[degreeId];
        if (!template) return null; // Return null for "other" to trigger AI generation

        // Filter courses: include all courses from current year onwards (not completed)
        const coursesToLoad = template.filter(c => c.year >= currentYear);
        return coursesToLoad;
    };

    const handleGenerateWithAI = async () => {
        if (!selectedDegree || !selectedYear) return;

        setIsGeneratingCourses(true);
        const yearInfo = years.find(y => y.year === selectedYear);

        try {
            // Import the API function dynamically to avoid issues
            const { generateDegreeCourses } = await import("@/lib/api");

            const degreeName = selectedDegree === "other"
                ? customDegreeName
                : degreePrograms.find(p => p.id === selectedDegree)?.name || selectedDegree;

            const response = await generateDegreeCourses({
                degree_name: degreeName,
                current_year: selectedYear,
                custom_degree: selectedDegree === "other" ? customDegreeName : undefined,
            });

            if (yearInfo) {
                setRemainingSemesters(yearInfo.semesters);
            }

            // Load AI-generated courses into store
            useAppStore.getState().setCourses(response.courses);
            useAppStore.getState().setDataSource("uploaded");
        } catch (error) {
            console.error("Failed to generate courses with AI:", error);
            // Fallback to demo data if AI fails
            loadDemoData();
        } finally {
            setIsGeneratingCourses(false);
        }
    };

    const handleUsePresetCourses = async () => {
        if (!selectedSpecialization || !selectedDegreeType || !selectedYear) return;

        const yearInfo = years.find(y => y.year === selectedYear);
        if (yearInfo) {
            setRemainingSemesters(yearInfo.semesters);
        }

        // 🚀 NEW: Use pre-cached Indian courses data for instant loading
        // Check if we have cached data for this degree/specialization combo
        const degreeData = indianCourses[selectedDegreeType];
        const specializationData = degreeData?.[selectedSpecialization];

        if (specializationData) {
            // Load pre-cached courses from selectedYear onwards
            const allCourses = [];
            const maxYear = degreeTypes.find(d => d.id === selectedDegreeType)?.duration || 4;

            for (let year = selectedYear; year <= maxYear; year++) {
                const yearCourses = specializationData[year];
                if (yearCourses) {
                    allCourses.push(...yearCourses);
                }
            }

            if (allCourses.length > 0) {
                // ⏱️ 5-second delay to simulate AI generation (smoother UX)
                setIsGeneratingCourses(true);
                await new Promise(resolve => setTimeout(resolve, 5000));

                // Load cached courses after delay
                useAppStore.getState().setCourses(allCourses);
                useAppStore.getState().setDataSource("uploaded");
                setIsGeneratingCourses(false);
                toast.success(`Loaded ${allCourses.length} courses for your degree!`);
                return;
            }
        }

        // Fallback to AI generation for missing data or "Other" degree
        console.log("No cached data found, falling back to AI generation");
        handleGenerateWithAI();
    };

    const handleManualAnalysisComplete = async (result: any) => {
        if (!result.is_valid) return;

        // 1. Convert Manual Entry courses to standard Course format for visualizer
        // Map suggested_semester to year roughly (1,2 -> Year 1)
        const mappedCourses = result.analyzed_courses.map((ac: any, idx: number) => ({
            id: `manual-${idx}-${Date.now()}`,
            code: ac.code,
            name: ac.name,
            credits: ac.credits,
            prerequisites: ac.prerequisites,
            year: Math.ceil(ac.suggested_semester / 2), // Approx year
            semester_offered: ac.suggested_semester % 2 === 1 ? "Fall" : "Spring",
            difficulty: ac.difficulty === "hard" ? "Hard" : ac.difficulty === "medium" ? "Medium" : "Easy",
            description: `Category: ${ac.category}`
        }));

        useAppStore.getState().setCourses(mappedCourses);
        useAppStore.getState().setDataSource("manual");

        // 2. Process AI result into planner state
        const planData = {
            degree_plan: result.suggested_plan,
            semester_difficulty: {}, // Manual entry might not return this, can be inferred or empty
            risk_analysis: {
                burnout_risk: "Low",
                graduation_risk: "On Track",
                risk_factors: []
            },
            career_alignment_notes: result.ai_recommendations,
            advisor_explanation: "This plan is based on your manually entered courses.",
            decision_timeline: [],
            confidence_score: 90,
            key_insight: "Manual Entry Plan"
        };

        useAppStore.getState().setCurrentPlan(planData as any);
        useAppStore.getState().setAnalysisResults(result as any);

        // 3. AUTO SAVE TO HISTORY (only if not a duplicate)
        try {
            const { getPlanHistory } = await import("@/lib/api");
            const existingPlans = await getPlanHistory();

            // Construct robust readable degree name using new wizard state
            let degreeDisplayName = customDegreeName;
            if (!degreeDisplayName && selectedDegreeType) {
                const dType = degreeTypes.find(d => d.id === selectedDegreeType);
                const sType = specializationMap[selectedDegreeType]?.find(s => s.id === selectedSpecialization);
                if (dType) {
                    degreeDisplayName = dType.name;
                    if (sType) degreeDisplayName += ` in ${sType.name}`;
                }
            }
            // Fallback
            if (!degreeDisplayName || degreeDisplayName.trim() === "") {
                degreeDisplayName = result.degree_program || "Manual Entry Plan";
            }

            const todayStr = new Date().toLocaleDateString();
            const isDuplicate = existingPlans.some((plan: any) =>
                plan.name.includes(todayStr) &&
                plan.degree_program === degreeDisplayName &&
                plan.name.includes("Manual")
            );

            if (!isDuplicate) {
                await saveDegreePlan({
                    name: `Manual Entry - ${new Date().toLocaleDateString()}`,
                    semesters: result.suggested_plan,
                    completed_courses: [],
                    priority_courses: [],
                    max_courses_per_semester: 5,
                    total_semesters: result.estimated_semesters || 8,
                    semester_difficulty: {},
                    risk_analysis: planData.risk_analysis as any,
                    career_alignment_notes: result.ai_recommendations,
                    advisor_explanation: planData.advisor_explanation,
                    degree_program: degreeDisplayName,
                    career_goal: result.career_goal || undefined,
                    courses_data: courses,
                    data_source: dataSource || "manual",
                });
                toast.success("Plan saved to history automatically!");
            } else {
                toast.info("Manual entry plan already saved for today");
            }
        } catch (err) {
            console.error("Failed to auto-save plan:", err);
            // Don't block UI for save failure
        }

        triggerConfetti();
    };


    // Helper to check if we can proceed in each step
    const canProceedStep1 = selectedDegreeType !== null;
    const canProceedStep2 = selectedSpecialization !== null || (selectedDegreeType === "other" && customDegreeName.trim().length > 0);
    const canProceedStep3 = selectedYear !== null;

    // Calculate graduation year based on degree duration and current year
    const getGraduationYear = () => {
        if (!selectedDegreeType || !selectedYear) return new Date().getFullYear() + 4;
        const degree = degreeTypes.find(d => d.id === selectedDegreeType);
        const duration = degree?.duration || 4;
        const remainingYears = duration - selectedYear + 1;
        return new Date().getFullYear() + remainingYears;
    };

    // Onboarding wizard when no courses
    if (courses.length === 0 && !currentPlan) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-12 pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-8 md:p-12"
                >
                    {/* Progress Indicator - 4 Steps */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            onboardingStep >= 1 ? "bg-teal-500 text-black" : "bg-zinc-700 text-zinc-400"
                        )}>1</div>
                        <div className={cn(
                            "w-8 h-1 rounded-full transition-all",
                            onboardingStep >= 2 ? "bg-teal-500" : "bg-zinc-700"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            onboardingStep >= 2 ? "bg-cyan-500 text-black" : "bg-zinc-700 text-zinc-400"
                        )}>2</div>
                        <div className={cn(
                            "w-8 h-1 rounded-full transition-all",
                            onboardingStep >= 3 ? "bg-cyan-500" : "bg-zinc-700"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            onboardingStep >= 3 ? "bg-violet-500 text-white" : "bg-zinc-700 text-zinc-400"
                        )}>3</div>
                        <div className={cn(
                            "w-8 h-1 rounded-full transition-all",
                            onboardingStep >= 4 ? "bg-violet-500" : "bg-zinc-700"
                        )} />
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                            onboardingStep >= 4 ? "bg-purple-500 text-white" : "bg-zinc-700 text-zinc-400"
                        )}>4</div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Degree Type Selection (B.Tech, M.Tech, MBA, etc.) */}
                        {onboardingStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-teal-500/10 mb-6 ring-1 ring-teal-500/30 shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]">
                                    <GraduationCap className="w-12 h-12 text-teal-400" />
                                </div>
                                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                                    What degree are you pursuing?
                                </h2>
                                <p className="text-zinc-400 mb-10 text-lg">
                                    Select your academic path to get started
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto">
                                    {degreeTypes.map((degree) => (
                                        <motion.button
                                            key={degree.id}
                                            whileHover={{ scale: 1.03, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setSelectedDegreeType(degree.id);
                                                setSelectedSpecialization(null);
                                                setSelectedYear(null);
                                                if (degree.id !== "other") setCustomDegreeName("");
                                            }}
                                            className={cn(
                                                "relative p-6 rounded-2xl border transition-all duration-300 text-center group overflow-hidden",
                                                selectedDegreeType === degree.id
                                                    ? "border-teal-500 bg-teal-500/10 shadow-[0_0_30px_-5px_rgba(20,184,166,0.2)]"
                                                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800"
                                            )}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${degree.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{degree.icon}</div>
                                            <div className="font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">{degree.name}</div>
                                            <div className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{degree.duration} Years</div>

                                            {selectedDegreeType === degree.id && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setOnboardingStep(2)}
                                    disabled={!canProceedStep1}
                                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold px-10 py-7 text-lg rounded-2xl disabled:opacity-50 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:scale-105 active:scale-95"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Step 2: Specialization Selection */}
                        {onboardingStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-cyan-500/10 mb-6 ring-1 ring-cyan-500/30 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]">
                                    <Target className="w-12 h-12 text-cyan-400" />
                                </div>
                                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                                    Choose your specialization
                                </h2>
                                <p className="text-zinc-400 mb-10 text-lg">
                                    Select your branch or major in <span className="text-cyan-400 font-bold">{degreeTypes.find(d => d.id === selectedDegreeType)?.name}</span>
                                </p>

                                {selectedDegreeType === "other" ? (
                                    <div className="max-w-md mx-auto mb-10">
                                        <label className="block text-left text-sm text-zinc-400 mb-2 font-medium ml-1">
                                            Enter your degree and specialization name
                                        </label>
                                        <div className="relative">
                                            <Input
                                                value={customDegreeName}
                                                onChange={(e) => setCustomDegreeName(e.target.value)}
                                                placeholder="e.g., B.Arch in Architecture"
                                                className="bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-600 text-lg py-7 px-5 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-xl"
                                                autoFocus
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
                                        {(specializationMap[selectedDegreeType || ""] || []).map((spec) => (
                                            <motion.button
                                                key={spec.id}
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setSelectedSpecialization(spec.id);
                                                    setSelectedDegree(spec.id); // Legacy compatibility
                                                }}
                                                className={cn(
                                                    "relative p-5 rounded-2xl border transition-all duration-300 text-center group overflow-hidden",
                                                    selectedSpecialization === spec.id
                                                        ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]"
                                                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800"
                                                )}
                                            >
                                                <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">{spec.icon}</div>
                                                <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{spec.name}</div>

                                                {selectedSpecialization === spec.id && (
                                                    <div className="absolute top-2 right-2">
                                                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                                    </div>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={() => setOnboardingStep(1)}
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white px-6 py-6 text-lg rounded-2xl hover:bg-white/5"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => setOnboardingStep(3)}
                                        disabled={!canProceedStep2}
                                        className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold px-10 py-7 text-lg rounded-2xl disabled:opacity-50 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Year Selection */}
                        {onboardingStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-violet-500/10 mb-6 ring-1 ring-violet-500/30 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]">
                                    <Calendar className="w-12 h-12 text-violet-400" />
                                </div>
                                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                                    What year are you in?
                                </h2>
                                <p className="text-zinc-400 mb-10 text-lg">
                                    We'll customize the plan based on your remaining time
                                </p>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10 max-w-4xl mx-auto">
                                    {years.map((y) => (
                                        <motion.button
                                            key={y.year}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedYear(y.year)}
                                            className={cn(
                                                "relative p-8 rounded-3xl border transition-all duration-300 overflow-hidden group",
                                                selectedYear === y.year
                                                    ? "border-violet-500 bg-violet-500/10 shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)]"
                                                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800"
                                            )}
                                        >
                                            <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">{y.year}</div>
                                            <div className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-1">{y.name}</div>
                                            <div className="text-xs text-zinc-500 bg-white/5 rounded-full py-1 px-2 inline-block">{y.semesters} Semesters Left</div>

                                            {selectedYear === y.year && (
                                                <div className="absolute top-4 right-4">
                                                    <CheckCircle2 className="w-6 h-6 text-violet-400" />
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={() => setOnboardingStep(2)}
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white px-6 py-6 text-lg rounded-2xl hover:bg-white/5"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => setOnboardingStep(4)}
                                        disabled={!selectedYear}
                                        className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-bold px-10 py-7 text-lg rounded-2xl disabled:opacity-50 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Data Source Selection */}
                        {onboardingStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-purple-500/10 mb-6 ring-1 ring-purple-500/30 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]">
                                    <FileText className="w-12 h-12 text-purple-400" />
                                </div>
                                <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                                    How would you like to get your courses?
                                </h2>
                                <p className="text-zinc-400 mb-10 text-lg">
                                    Choose the best way to input your academic data
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
                                    {/* Upload Option */}
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowUpload(true)}
                                        className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left group shadow-lg hover:shadow-blue-500/10"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                                            <Upload className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Upload Data</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Upload a PDF, CSV or JSON file from your university portal.
                                        </p>
                                    </motion.button>

                                    {/* Manual Entry Option */}
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setOnboardingStep(5)}
                                        className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left group shadow-lg hover:shadow-orange-500/10"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                                            <FileText className="w-8 h-8 text-orange-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Manual Entry</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Type in your courses manually if you don't have a file.
                                        </p>
                                    </motion.button>

                                    {/* AI Generate Option */}
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={selectedDegree === "other" ? handleGenerateWithAI : handleUsePresetCourses}
                                        disabled={isGeneratingCourses}
                                        className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20 relative z-10">
                                            {isGeneratingCourses ? (
                                                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-8 h-8 text-purple-400" />
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors relative z-10">
                                            {isGeneratingCourses ? "Generating..." : "Generate with AI"}
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                                            Let AI create a perfect degree plan path for you instantly.
                                        </p>
                                    </motion.button>
                                </div>

                                <div className="flex justify-center gap-4">
                                    <Button
                                        onClick={() => setOnboardingStep(3)}
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white px-6 py-6 text-lg rounded-2xl hover:bg-white/5"
                                        disabled={isGeneratingCourses}
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                </div>

                                {/* Quick demo option */}
                                <div className="mt-8 pt-6 border-t border-zinc-800/50">
                                    <Button
                                        onClick={loadDemoData}
                                        variant="link"
                                        className="text-zinc-500 hover:text-teal-400 transition-colors"
                                        disabled={isGeneratingCourses}
                                    >
                                        Just looking around? Load demo data
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Manual Entry Form */}
                        {onboardingStep === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <div className="mb-6 flex justify-between items-center">
                                    <Button
                                        onClick={() => setOnboardingStep(4)}
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                    </Button>
                                    <h2 className="text-2xl font-bold text-white">Manual Course Entry</h2>
                                    <div className="w-20" /> {/* Spacer */}
                                </div>

                                <ManualEntryForm onAnalysisComplete={handleManualAnalysisComplete} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
                <DataUploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
            </div>
        );
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setAiAnalysis(null);
        setExportSuccess(false);

        try {
            const response = await generatePlan({
                courses: courses.map((c) => ({
                    code: c.code,
                    name: c.name,
                    credits: c.credits,
                    prerequisites: c.prerequisites,
                })),
                completed_courses: completedCourses,
                remaining_semesters: remainingSemesters,
                max_courses_per_semester: maxCoursesPerSemester,
                priority_courses: priorityCourses,
                career_goal: careerGoal || undefined,
                advisor_mode: advisorMode,
            });

            setCurrentPlan(response);

            // Auto Save to History (only if not a duplicate)
            try {
                // Check if this exact plan already exists
                const { getPlanHistory } = await import("@/lib/api");
                const existingPlans = await getPlanHistory();

                // Construct robust readable degree name using new wizard state
                let degreeDisplayName = customDegreeName;
                if (!degreeDisplayName && selectedDegreeType) {
                    const dType = degreeTypes.find(d => d.id === selectedDegreeType);
                    const sType = specializationMap[selectedDegreeType]?.find(s => s.id === selectedSpecialization);
                    if (dType) {
                        degreeDisplayName = dType.name;
                        if (sType) degreeDisplayName += ` in ${sType.name}`;
                    }
                }
                // Fallback to legacy or default
                if (!degreeDisplayName || degreeDisplayName.trim() === "") {
                    degreeDisplayName = selectedDegree || "General Degree Plan";
                }

                const isDuplicate = existingPlans.some((plan: any) => {
                    const todayStr = new Date().toLocaleDateString();
                    // Check if a plan with same name/program exists for today
                    return plan.name.includes(todayStr) &&
                        plan.degree_program === degreeDisplayName;
                });

                if (!isDuplicate) {
                    await saveDegreePlan({
                        name: `${degreeDisplayName} - ${new Date().toLocaleDateString()}`,
                        semesters: response.degree_plan,
                        completed_courses: completedCourses,
                        priority_courses: priorityCourses,
                        max_courses_per_semester: maxCoursesPerSemester,
                        total_semesters: Object.keys(response.degree_plan).length,
                        semester_difficulty: response.semester_difficulty,
                        risk_analysis: response.risk_analysis,
                        career_alignment_notes: response.career_alignment_notes,
                        advisor_explanation: response.advisor_explanation,
                        degree_program: degreeDisplayName,
                        career_goal: careerGoal || undefined,
                        courses_data: courses,
                        data_source: dataSource || "uploaded",
                    });
                    toast.success("Plan saved to history!");
                } else {
                    // Plan already exists for today, just update view
                    toast.info("Plan already saved for today");
                }
            } catch (saveErr) {
                console.error("Auto-save failed", saveErr);
                toast.error("Failed to save plan to history. Check connection.");
            }

            // 🎉 Trigger celebration confetti on successful plan generation!
            triggerConfetti();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate plan");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalyze = async () => {
        if (!currentPlan) return;

        setIsAnalyzing(true);
        try {
            const analysis = await analyzePlan(
                currentPlan.degree_plan,
                careerGoal || undefined,
                undefined,
                advisorMode
            );
            setAiAnalysis(analysis);
        } catch (err) {
            console.error("Analysis failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDownloadData = () => {
        if (!currentPlan) return;

        setIsExporting(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Helper function to add new page if needed
            const checkPageBreak = (yPos: number, minSpace: number = 40) => {
                if (yPos > pageHeight - minSpace) {
                    doc.addPage();
                    return 30;
                }
                return yPos;
            };

            // ============== COVER / HEADER ==============
            doc.setFillColor(13, 148, 136); // Teal 600
            doc.rect(0, 0, pageWidth, 35, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Smart Degree Planner", 14, 18);
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Comprehensive Academic Plan", 14, 28);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 14, 18, { align: 'right' });

            let yPos = 50;

            // ============== PLAN SUMMARY ==============
            doc.setTextColor(13, 148, 136);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Plan Summary", 14, yPos);
            yPos += 10;

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            const totalSemesters = Object.keys(currentPlan.degree_plan).length;
            const totalCourses = Object.values(currentPlan.degree_plan).flat().length;
            const totalCredits = Object.values(currentPlan.degree_plan).flat().reduce((sum, code) => {
                const course = courses.find(c => c.code === code);
                return sum + (course?.credits || 3);
            }, 0);
            const currentYear = new Date().getFullYear();
            const graduationYear = currentYear + Math.ceil(totalSemesters / 2);

            doc.text(`Career Goal: ${careerGoal || "General Degree Completion"}`, 14, yPos);
            doc.text(`Confidence Score: ${currentPlan.confidence_score}%`, 110, yPos);
            yPos += 6;
            doc.text(`Total Semesters: ${totalSemesters}`, 14, yPos);
            doc.text(`Total Courses: ${totalCourses}`, 110, yPos);
            yPos += 6;
            doc.text(`Total Credits: ${totalCredits}`, 14, yPos);
            doc.text(`Expected Graduation: ${graduationYear}`, 110, yPos);
            yPos += 15;

            // ============== AI CAREER REPORT (PHASE 2) ==============
            if (aiAnalysis) {
                doc.setDrawColor(139, 92, 246); // Violet 500
                doc.setLineWidth(0.5);
                doc.line(14, yPos, pageWidth - 14, yPos);
                yPos += 10;

                // Title
                doc.setTextColor(139, 92, 246);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("AI Career Analysis", 14, yPos);
                yPos += 8;

                // Elevator Pitch (Styled Quote)
                if (aiAnalysis.elevator_pitch) {
                    doc.setFillColor(245, 243, 255); // Violet 50
                    doc.roundedRect(14, yPos, pageWidth - 28, 20, 2, 2, 'F');

                    doc.setTextColor(80, 80, 80);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "italic");
                    const pitchLines = doc.splitTextToSize(`"${aiAnalysis.elevator_pitch}"`, pageWidth - 36);
                    doc.text(pitchLines, 18, yPos + 8);
                    yPos += 28;
                }

                // Career ROI Grid (Salary & Alignment)
                const roiData = [
                    ["Est. Salary Range", aiAnalysis.projected_salary_range || "N/A"],
                    ["Career Alignment", `${aiAnalysis.career_alignment_score || 0}%`],
                    ["Difficulty Curve", aiAnalysis.difficulty_curve || "Unknown"],
                    ["Target Roles", (aiAnalysis.top_job_roles || []).join(", ") || "N/A"]
                ];

                autoTable(doc, {
                    startY: yPos,
                    head: [['Metric', 'Analysis']],
                    body: roiData,
                    theme: 'grid',
                    headStyles: { fillColor: [139, 92, 246], textColor: 255 },
                    styles: { fontSize: 10, cellPadding: 3 },
                    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
                    margin: { left: 14, right: 14 }
                });

                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 10;

                // Skill Gaps & Electives (if any)
                if (aiAnalysis.skill_gaps && aiAnalysis.skill_gaps.length > 0) {
                    doc.setTextColor(220, 38, 38); // Red 600
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("Potential Skill Gaps:", 14, yPos);

                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    const gapText = aiAnalysis.skill_gaps.join(", ");
                    const gapLines = doc.splitTextToSize(gapText, pageWidth - 20);
                    doc.text(gapLines, 60, yPos);
                    yPos += (gapLines.length * 5) + 5;
                }

                if (aiAnalysis.strategic_electives && aiAnalysis.strategic_electives.length > 0) {
                    doc.setTextColor(5, 150, 105); // Emerald 600
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("Recommended Electives:", 14, yPos);

                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    const elecText = aiAnalysis.strategic_electives.join(", ");
                    const elecLines = doc.splitTextToSize(elecText, pageWidth - 20);
                    doc.text(elecLines, 70, yPos);
                    yPos += (elecLines.length * 5) + 10;
                }

                // Salary Justification (NEW)
                if (aiAnalysis.salary_justification) {
                    yPos = checkPageBreak(yPos, 30);
                    doc.setTextColor(16, 185, 129); // Emerald 500
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("Salary Insight:", 14, yPos);
                    yPos += 6;

                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    const salaryLines = doc.splitTextToSize(aiAnalysis.salary_justification, pageWidth - 28);
                    doc.text(salaryLines, 14, yPos);
                    yPos += salaryLines.length * 4 + 8;
                }

                // Study Roadmap (NEW)
                if (aiAnalysis.study_roadmap && Object.keys(aiAnalysis.study_roadmap).length > 0) {
                    yPos = checkPageBreak(yPos, 60);
                    doc.setTextColor(99, 102, 241); // Indigo 500
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("AI Study Roadmap:", 14, yPos);
                    yPos += 8;

                    const roadmapItems = [
                        { label: "Heavy Semester Strategy", value: aiAnalysis.study_roadmap.heavy_semester },
                        { label: "Light Semester Strategy", value: aiAnalysis.study_roadmap.light_semester },
                        { label: "Exam Period Tips", value: aiAnalysis.study_roadmap.exam_period }
                    ];

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    roadmapItems.forEach(item => {
                        if (item.value) {
                            yPos = checkPageBreak(yPos, 15);
                            doc.setTextColor(80, 80, 80);
                            doc.setFont("helvetica", "bold");
                            doc.text(`${item.label}:`, 18, yPos);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(60, 60, 60);
                            const itemLines = doc.splitTextToSize(item.value, pageWidth - 32);
                            doc.text(itemLines, 18, yPos + 5);
                            yPos += itemLines.length * 4 + 10;
                        }
                    });
                }

                // Industry Relevance (NEW)
                if (aiAnalysis.industry_relevance) {
                    yPos = checkPageBreak(yPos, 40);
                    doc.setTextColor(245, 158, 11); // Amber 500
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("Industry Relevance:", 14, yPos);
                    yPos += 6;

                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");

                    if (aiAnalysis.industry_relevance.industry_connections) {
                        const indLines = doc.splitTextToSize(aiAnalysis.industry_relevance.industry_connections, pageWidth - 28);
                        doc.text(indLines, 14, yPos);
                        yPos += indLines.length * 4 + 5;
                    }

                    if (aiAnalysis.industry_relevance.key_courses && aiAnalysis.industry_relevance.key_courses.length > 0) {
                        doc.setFont("helvetica", "bold");
                        doc.text("Key Industry-Relevant Courses:", 14, yPos);
                        yPos += 5;
                        doc.setFont("helvetica", "normal");
                        const keyCourseText = aiAnalysis.industry_relevance.key_courses.join(", ");
                        const courseLines = doc.splitTextToSize(keyCourseText, pageWidth - 28);
                        doc.text(courseLines, 18, yPos);
                        yPos += courseLines.length * 4 + 8;
                    }
                }

                // Course Details (NEW - Top 5 most important courses)
                if (aiAnalysis.course_details && Object.keys(aiAnalysis.course_details).length > 0) {
                    yPos = checkPageBreak(yPos, 80);
                    doc.addPage();
                    yPos = 30;

                    doc.setTextColor(168, 85, 247); // Purple 500
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("Course Deep Dive", 14, yPos);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100, 100, 100);
                    doc.text("Detailed analysis of key courses in your plan", 14, yPos + 6);
                    yPos += 18;

                    // Take top 5 courses with details
                    const courseEntries = Object.entries(aiAnalysis.course_details).slice(0, 5);
                    courseEntries.forEach(([courseCode, details]: [string, any]) => {
                        yPos = checkPageBreak(yPos, 50);

                        // Course header
                        doc.setFillColor(249, 250, 251); // Gray-50
                        doc.roundedRect(14, yPos - 3, pageWidth - 28, 8, 1, 1, 'F');
                        doc.setTextColor(88, 28, 135); // Purple-800
                        doc.setFontSize(10);
                        doc.setFont("helvetica", "bold");
                        doc.text(courseCode, 18, yPos + 2);
                        yPos += 10;

                        doc.setTextColor(60, 60, 60);
                        doc.setFontSize(8);
                        doc.setFont("helvetica", "normal");

                        // Description
                        if (details.description) {
                            const descLines = doc.splitTextToSize(`📝 ${details.description}`, pageWidth - 32);
                            doc.text(descLines, 18, yPos);
                            yPos += descLines.length * 3.5 + 3;
                        }

                        // Learning Outcomes
                        if (details.learning_outcomes && details.learning_outcomes.length > 0) {
                            doc.setFont("helvetica", "bold");
                            doc.text("Learning Outcomes:", 18, yPos);
                            yPos += 4;
                            doc.setFont("helvetica", "normal");
                            details.learning_outcomes.slice(0, 3).forEach((outcome: string) => {
                                const outLines = doc.splitTextToSize(`• ${outcome}`, pageWidth - 36);
                                doc.text(outLines, 22, yPos);
                                yPos += outLines.length * 3.5 + 1;
                            });
                            yPos += 2;
                        }

                        // Study Tips
                        if (details.study_tips) {
                            doc.setTextColor(16, 185, 129); // Emerald
                            doc.setFont("helvetica", "bold");
                            doc.text("💡 Study Tips:", 18, yPos);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(60, 60, 60);
                            const tipLines = doc.splitTextToSize(details.study_tips, pageWidth - 36);
                            doc.text(tipLines, 22, yPos + 4);
                            yPos += tipLines.length * 3.5 + 8;
                        }

                        yPos += 5;
                    });
                }
            } else if (currentPlan.key_insight) {
                // Fallback to old key insight if no enhanced analysis
                doc.setFillColor(245, 245, 255);
                doc.roundedRect(14, yPos - 5, pageWidth - 28, 20, 3, 3, 'F');
                doc.setTextColor(100, 50, 150);
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.text("KEY INSIGHT", 18, yPos + 2);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(60, 60, 60);
                const insightLines = doc.splitTextToSize(currentPlan.key_insight, pageWidth - 36);
                doc.text(insightLines, 18, yPos + 9);
                yPos += 25;
            }

            yPos += 5;

            // ============== SEMESTER-BY-SEMESTER PLAN ==============
            doc.setTextColor(13, 148, 136);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Semester-by-Semester Plan", 14, yPos);
            yPos += 10;

            Object.entries(currentPlan.degree_plan).forEach(([semester, semesterCourses], semIndex) => {
                yPos = checkPageBreak(yPos, 50);

                const difficulty = currentPlan.semester_difficulty[semester] || "Moderate";
                const diffColor: Record<string, [number, number, number]> = {
                    "Light": [34, 197, 94],
                    "Moderate": [234, 179, 8],
                    "Heavy": [239, 68, 68]
                };
                const color = diffColor[difficulty] || [100, 100, 100];

                // Semester header
                doc.setFillColor(color[0], color[1], color[2]);
                doc.roundedRect(14, yPos - 4, pageWidth - 28, 10, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`${semester}`, 18, yPos + 2);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text(`Difficulty: ${difficulty}`, pageWidth - 18, yPos + 2, { align: 'right' });
                yPos += 10;

                // Course table for this semester
                const tableData = semesterCourses.map(code => {
                    const course = courses.find(c => c.code === code);
                    return [
                        code,
                        course?.name || "Course Name",
                        String(course?.credits || 3),
                        (course?.prerequisites || []).join(", ") || "None"
                    ];
                });

                const semCredits = semesterCourses.reduce((sum, code) => {
                    const course = courses.find(c => c.code === code);
                    return sum + (course?.credits || 3);
                }, 0);

                autoTable(doc, {
                    startY: yPos,
                    head: [["Code", "Course Name", "Credits", "Prerequisites"]],
                    body: tableData,
                    foot: [["", `Total: ${semesterCourses.length} courses`, `${semCredits} credits`, ""]],
                    theme: 'striped',
                    headStyles: { fillColor: [13, 148, 136], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    footStyles: { fillColor: [240, 240, 240], textColor: [60, 60, 60], fontStyle: 'bold', fontSize: 8 },
                    margin: { left: 14, right: 14 },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 70 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 50 }
                    }
                });

                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 12;
            });

            // ============== DECISION TIMELINE ==============
            if (currentPlan.decision_timeline && currentPlan.decision_timeline.length > 0) {
                yPos = checkPageBreak(yPos, 60);
                doc.addPage();
                yPos = 30;

                doc.setTextColor(128, 90, 213); // Purple
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("AI Decision Timeline", 14, yPos);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("Understanding why each scheduling decision was made", 14, yPos + 6);
                yPos += 15;

                const timelineData = currentPlan.decision_timeline.map(event => [
                    event.semester,
                    event.decision,
                    event.reason,
                    event.risk_mitigated || "N/A"
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [["Semester", "Decision", "Reason", "Risk Mitigated"]],
                    body: timelineData,
                    theme: 'grid',
                    headStyles: { fillColor: [128, 90, 213], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 45 },
                        2: { cellWidth: 55 },
                        3: { cellWidth: 45 }
                    }
                });

                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== AI ANALYSIS (if available) ==============
            if (aiAnalysis) {
                yPos = checkPageBreak(yPos, 80);

                doc.setTextColor(6, 182, 212); // Cyan 500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("AI Plan Analysis", 14, yPos);
                yPos += 10;

                doc.setTextColor(60, 60, 60);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");

                if (aiAnalysis.explanation) {
                    const explanationLines = doc.splitTextToSize(aiAnalysis.explanation, pageWidth - 28);
                    doc.text(explanationLines, 14, yPos);
                    yPos += explanationLines.length * 4 + 8;
                }

                // Strengths
                if (aiAnalysis.strengths && aiAnalysis.strengths.length > 0) {
                    yPos = checkPageBreak(yPos, 30);
                    doc.setTextColor(34, 197, 94); // Green
                    doc.setFont("helvetica", "bold");
                    doc.text("Strengths:", 14, yPos);
                    yPos += 5;
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(60, 60, 60);
                    aiAnalysis.strengths.forEach(strength => {
                        yPos = checkPageBreak(yPos, 10);
                        doc.text(`• ${strength}`, 18, yPos);
                        yPos += 5;
                    });
                    yPos += 5;
                }

                // Suggestions
                if (aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0) {
                    yPos = checkPageBreak(yPos, 30);
                    doc.setTextColor(234, 179, 8); // Yellow
                    doc.setFont("helvetica", "bold");
                    doc.text("Suggestions for Improvement:", 14, yPos);
                    yPos += 5;
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(60, 60, 60);
                    aiAnalysis.suggestions.forEach(suggestion => {
                        yPos = checkPageBreak(yPos, 10);
                        const suggestionLines = doc.splitTextToSize(`• ${suggestion}`, pageWidth - 32);
                        doc.text(suggestionLines, 18, yPos);
                        yPos += suggestionLines.length * 4 + 2;
                    });
                }
            }

            // ============== RISK ANALYSIS ==============
            yPos = checkPageBreak(yPos, 60);

            doc.setTextColor(220, 38, 38); // Red 600
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Risk Analysis", 14, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "normal");

            const burnoutColor = currentPlan.risk_analysis.burnout_risk === "Low" ? [34, 197, 94] :
                currentPlan.risk_analysis.burnout_risk === "Medium" ? [234, 179, 8] : [220, 38, 38];
            const gradColor = currentPlan.risk_analysis.graduation_risk === "On Track" ? [34, 197, 94] : [220, 38, 38];

            doc.text(`Burnout Risk:`, 14, yPos);
            doc.setTextColor(burnoutColor[0], burnoutColor[1], burnoutColor[2]);
            doc.setFont("helvetica", "bold");
            doc.text(currentPlan.risk_analysis.burnout_risk, 50, yPos);

            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "normal");
            doc.text(`Graduation Status:`, 90, yPos);
            doc.setTextColor(gradColor[0], gradColor[1], gradColor[2]);
            doc.setFont("helvetica", "bold");
            doc.text(currentPlan.risk_analysis.graduation_risk, 140, yPos);
            yPos += 10;

            // Risk factors
            if (currentPlan.risk_analysis.risk_factors && currentPlan.risk_analysis.risk_factors.length > 0) {
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.text("Risk Factors:", 14, yPos);
                yPos += 5;
                currentPlan.risk_analysis.risk_factors.forEach(factor => {
                    yPos = checkPageBreak(yPos, 8);
                    doc.text(`• ${factor}`, 18, yPos);
                    yPos += 4;
                });
            }

            // ============== STUDY TIPS & FOCUS AREAS ==============
            yPos = checkPageBreak(yPos, 100);
            doc.addPage();
            yPos = 30;

            doc.setTextColor(79, 70, 229); // Indigo 600
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Study Tips & Focus Areas", 14, yPos);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Guidance to help you succeed in each semester", 14, yPos + 6);
            yPos += 15;

            // Per-Semester Study Focus
            doc.setTextColor(79, 70, 229);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Semester-by-Semester Focus", 14, yPos);
            yPos += 8;

            Object.entries(currentPlan.degree_plan).forEach(([semester, semCourses], idx) => {
                yPos = checkPageBreak(yPos, 30);
                const difficulty = currentPlan.semester_difficulty[semester] || "Moderate";

                doc.setFont("helvetica", "bold");
                doc.setTextColor(60, 60, 60);
                doc.setFontSize(10);
                doc.text(`${semester}:`, 14, yPos);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);

                // Generate study advice based on difficulty and courses
                let advice = "";
                if (difficulty === "Heavy") {
                    advice = `This is a challenging semester with ${semCourses.length} courses. Start assignments early, form study groups, and consider reducing extracurricular commitments.`;
                } else if (difficulty === "Light") {
                    advice = `A lighter semester - use this time to explore interests, work on side projects, or get ahead on future coursework.`;
                } else {
                    advice = `A balanced workload. Maintain consistent study habits and allocate time for each course weekly.`;
                }

                const adviceLines = doc.splitTextToSize(advice, pageWidth - 28);
                doc.text(adviceLines, 14, yPos + 5);
                yPos += adviceLines.length * 4 + 12;
            });

            // General Study Tips
            yPos = checkPageBreak(yPos, 80);
            doc.setTextColor(34, 197, 94); // Green
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("General Study Tips for Success", 14, yPos);
            yPos += 8;

            const studyTips = [
                "Time Management: Use a planner or digital calendar to block study time for each course every week.",
                "Active Learning: Don't just read - practice problems, teach concepts to others, and create summary notes.",
                "Office Hours: Visit professors during office hours - it helps understanding and builds valuable relationships.",
                "Study Groups: Form study groups for difficult courses - explaining concepts reinforces your own learning.",
                "Breaks: Take regular breaks using techniques like Pomodoro (25 min work, 5 min break) to maintain focus.",
                "Early Start: Begin assignments when they're assigned, not when they're due. This reduces stress and improves quality."
            ];

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            studyTips.forEach((tip, i) => {
                yPos = checkPageBreak(yPos, 12);
                const tipLines = doc.splitTextToSize(`${i + 1}. ${tip}`, pageWidth - 28);
                doc.text(tipLines, 14, yPos);
                yPos += tipLines.length * 4 + 3;
            });

            // Focus Areas by Course Type
            yPos = checkPageBreak(yPos, 60);
            yPos += 5;
            doc.setTextColor(139, 92, 246); // Violet
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Focus Areas by Course Type", 14, yPos);
            yPos += 8;

            const focusAreas = [
                { type: "Programming Courses", focus: "Practice coding daily. Complete all lab exercises. Work on personal projects to reinforce concepts." },
                { type: "Theory/Math Courses", focus: "Work through proofs step-by-step. Do extra practice problems. Attend tutoring if struggling." },
                { type: "Project-Based Courses", focus: "Start early, plan milestones. Meet with team regularly. Document your work for portfolio." },
                { type: "Electives", focus: "Explore interests but maintain standards. These can reveal unexpected career paths." }
            ];

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            focusAreas.forEach(area => {
                yPos = checkPageBreak(yPos, 15);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(80, 80, 80);
                doc.text(`${area.type}:`, 14, yPos);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(60, 60, 60);
                const focusLines = doc.splitTextToSize(area.focus, pageWidth - 28);
                doc.text(focusLines, 14, yPos + 5);
                yPos += focusLines.length * 4 + 10;
            });

            // Resources
            yPos = checkPageBreak(yPos, 50);
            doc.setFillColor(240, 253, 244); // Green-50
            doc.roundedRect(14, yPos - 5, pageWidth - 28, 35, 3, 3, 'F');
            doc.setTextColor(22, 101, 52); // Green-800
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Recommended Resources", 18, yPos + 2);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 60);
            doc.text("• Academic: Office hours, tutoring centers, study groups, course TAs", 18, yPos + 10);
            doc.text("• Online: Khan Academy, Coursera, YouTube tutorials, Stack Overflow", 18, yPos + 16);
            doc.text("• Wellbeing: Counseling services, health center, recreation facilities", 18, yPos + 22);

            // ============== FOOTER ==============
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text("Generated by Smart Degree Planner", 14, pageHeight - 10);
            }

            // Generate Blob manually to force filename
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `degree_plan_comprehensive_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const toggleCourse = (code: string, list: "completed" | "priority") => {
        if (list === "completed") {
            if (completedCourses.includes(code)) {
                setCompletedCourses(completedCourses.filter((c) => c !== code));
            } else {
                setCompletedCourses([...completedCourses, code]);
            }
        } else {
            if (priorityCourses.includes(code)) {
                setPriorityCourses(priorityCourses.filter((c) => c !== code));
            } else {
                setPriorityCourses([...priorityCourses, code]);
            }
        }
    };

    return (
        <div className="relative min-h-screen pt-32 pb-12 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[#050510] -z-20" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 -z-10" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-500/10 via-purple-500/5 to-transparent blur-3xl -z-10" />

            <div className="container mx-auto max-w-7xl px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center md:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] backdrop-blur-sm">
                        <Users className="w-3 h-3" /> Student Planner
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 mb-4 tracking-tight drop-shadow-lg">
                        Smart Degree Planner
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                        Configure your preferences and let our AI architect your perfect academic journey.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Completed Courses */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    Completed Courses
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        {completedCourses.length}
                                    </Badge>
                                </h3>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                    {courses.map((course) => (
                                        <Badge
                                            key={course.code}
                                            variant={completedCourses.includes(course.code) ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-all",
                                                completedCourses.includes(course.code)
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                                                    : "border-white/10 hover:border-white/30"
                                            )}
                                            onClick={() => toggleCourse(course.code, "completed")}
                                        >
                                            {course.code}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Priority Courses */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-orange-400" />
                                    Priority Courses
                                </h3>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                    {courses
                                        .filter((c) => !completedCourses.includes(c.code))
                                        .map((course) => (
                                            <Badge
                                                key={course.code}
                                                variant={priorityCourses.includes(course.code) ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer transition-all",
                                                    priorityCourses.includes(course.code)
                                                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"
                                                        : "border-white/10 hover:border-white/30"
                                                )}
                                                onClick={() => toggleCourse(course.code, "priority")}
                                            >
                                                {course.code}
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Settings */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6 space-y-6"
                        >
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                Plan Configuration
                            </h3>

                            {/* Remaining Semesters */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-teal-400" />
                                        <span className="text-sm font-medium text-white">Remaining Semesters</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-teal-400">{remainingSemesters}</span>
                                        <span className="text-xs text-zinc-500">semesters</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[remainingSemesters]}
                                    onValueChange={([v]) => setRemainingSemesters(v)}
                                    min={1}
                                    max={12}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
                                    <span>1 sem</span>
                                    <span>6 sem</span>
                                    <span>12 sem</span>
                                </div>
                                {/* Graduation Year Estimate */}
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-zinc-400">Estimated Graduation</span>
                                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3" />
                                        {new Date().getFullYear() + Math.ceil(remainingSemesters / 2)}
                                    </span>
                                </div>
                            </div>

                            {/* Max Courses Per Semester */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-violet-400" />
                                        <span className="text-sm font-medium text-white">Max Courses/Semester</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-violet-400">{maxCoursesPerSemester}</span>
                                        <span className="text-xs text-zinc-500">courses</span>
                                    </div>
                                </div>
                                <Slider
                                    value={[maxCoursesPerSemester]}
                                    onValueChange={([v]) => setMaxCoursesPerSemester(v)}
                                    min={2}
                                    max={8}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
                                    <span>Light (2)</span>
                                    <span>Normal (5)</span>
                                    <span>Heavy (8)</span>
                                </div>
                                {/* Workload Indicator */}
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-zinc-400">Workload Level</span>
                                    <Badge variant="outline" className={cn(
                                        "text-xs",
                                        maxCoursesPerSemester <= 3 && "border-emerald-500/30 text-emerald-400",
                                        maxCoursesPerSemester >= 4 && maxCoursesPerSemester <= 5 && "border-yellow-500/30 text-yellow-400",
                                        maxCoursesPerSemester >= 6 && "border-red-500/30 text-red-400"
                                    )}>
                                        {maxCoursesPerSemester <= 3 ? "🧘 Relaxed" : maxCoursesPerSemester <= 5 ? "⚡ Balanced" : "🔥 Intensive"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Career Goal */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4 text-orange-400" />
                                    <span className="text-sm font-medium text-white">Career Goal</span>
                                    <span className="text-xs text-zinc-500">(optional)</span>
                                </div>
                                <Input
                                    value={careerGoal}
                                    onChange={(e) => setCareerGoal(e.target.value)}
                                    placeholder="e.g., Machine Learning Engineer"
                                    className="bg-black/30 border-white/10 focus-visible:ring-orange-500/50"
                                />
                                <p className="text-[10px] text-zinc-500 mt-2">
                                    💡 AI will prioritize courses aligned with your career
                                </p>
                            </div>

                            {/* Advisor Mode Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <div>
                                    <div className="text-sm font-medium text-white flex items-center gap-2">
                                        <Users className="w-4 h-4 text-violet-400" />
                                        Advisor Mode
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        Formal, risk-focused explanations
                                    </p>
                                </div>
                                <Switch
                                    checked={advisorMode}
                                    onCheckedChange={setAdvisorMode}
                                />
                            </div>
                        </motion.div>

                        {/* Generate Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-semibold py-6 text-lg shadow-lg shadow-teal-500/25"
                            >
                                {isGenerating ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Rocket className="mr-2 h-5 w-5" />
                                )}
                                {isGenerating ? "Generating..." : "Generate Optimized Route"}
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="rounded-3xl bg-red-950/20 backdrop-blur-2xl border border-red-500/20 shadow-2xl p-6 mb-6"
                                >
                                    <div className="flex items-center gap-3 text-red-400">
                                        <AlertTriangle className="h-5 w-5" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}

                            {currentPlan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Key Insight Banner */}
                                    <KeyInsightBanner insight={currentPlan.key_insight || ""} />

                                    {/* Actions Bar */}
                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing}
                                            variant="outline"
                                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        >
                                            {isAnalyzing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Brain className="mr-2 h-4 w-4" />
                                            )}
                                            Analyze with AI
                                        </Button>
                                        <Button
                                            onClick={handleDownloadData}
                                            disabled={isExporting}
                                            variant="outline"
                                            className={cn(
                                                "border-white/10",
                                                exportSuccess && "border-green-500/30 text-green-400"
                                            )}
                                        >
                                            {isExporting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : exportSuccess ? (
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                            ) : (
                                                <Download className="mr-2 h-4 w-4" />
                                            )}
                                            {exportSuccess ? "Downloaded!" : "Download PDF"}
                                        </Button>

                                        {/* Data Source Badge */}
                                        {dataSource && (
                                            <Badge variant="outline" className={cn(
                                                dataSource === "demo"
                                                    ? "border-amber-500/30 text-amber-400"
                                                    : "border-emerald-500/30 text-emerald-400"
                                            )}>
                                                {dataSource === "demo" ? "DEMO DATA" : "YOUR DATA"}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Visual Roadmap (NEW - Hackathon Feature) */}
                                    <VisualRoadmap
                                        plan={currentPlan.degree_plan}
                                        difficulty={currentPlan.semester_difficulty}
                                        courses={courses}
                                    />

                                    {/* Skills Progression (NEW - Hackathon Feature) */}
                                    <SkillsProgression
                                        plan={currentPlan.degree_plan}
                                        courses={courses}
                                    />

                                    {/* Two Column: Confidence + Risk */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Confidence Score */}
                                        <ConfidenceGauge
                                            score={currentPlan.confidence_score || 0}
                                            breakdown={currentPlan.confidence_breakdown}
                                        />

                                        {/* Risk Analysis */}
                                        <div className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6 h-full">
                                            <h3 className="text-lg font-semibold text-white mb-4">
                                                Risk Analysis
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white/5">
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        Burnout Risk
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            "text-sm",
                                                            currentPlan.risk_analysis.burnout_risk === "Low" &&
                                                            "bg-green-500/20 text-green-400",
                                                            currentPlan.risk_analysis.burnout_risk === "Medium" &&
                                                            "bg-yellow-500/20 text-yellow-400",
                                                            currentPlan.risk_analysis.burnout_risk === "High" &&
                                                            "bg-red-500/20 text-red-400"
                                                        )}
                                                    >
                                                        {currentPlan.risk_analysis.burnout_risk}
                                                    </Badge>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5">
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        Graduation
                                                    </div>
                                                    <Badge
                                                        className={cn(
                                                            "text-sm",
                                                            currentPlan.risk_analysis.graduation_risk === "On Track"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : "bg-red-500/20 text-red-400"
                                                        )}
                                                    >
                                                        {currentPlan.risk_analysis.graduation_risk}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {currentPlan.warnings && currentPlan.warnings.length > 0 && (
                                                <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {currentPlan.warnings[0]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Decision Timeline */}
                                    <DecisionTimeline events={currentPlan.decision_timeline || []} />

                                    {/* AI Analysis */}
                                    {aiAnalysis && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, type: "spring" }}
                                            className="rounded-[2rem] bg-[#0a0a16]/80 backdrop-blur-2xl border border-purple-500/20 shadow-[0_0_60px_-15px_rgba(168,85,247,0.15)] p-8 relative overflow-hidden group/ai-card"
                                        >
                                            {/* Background Effects */}
                                            <div className="absolute top-0 right-0 p-40 bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 p-40 bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                            {/* Header */}
                                            <div className="relative z-10 flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
                                                        <Sparkles className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                                            AI Plan Analysis
                                                            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
                                                        </h3>
                                                        <p className="text-xs text-purple-300/80 font-medium tracking-wider uppercase">
                                                            Powered by Self Made model
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/5 px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm shadow-sm">
                                                    ✨ PHASE 2 ENABLED
                                                </Badge>
                                            </div>

                                            {/* Elevator Pitch - Hero Section */}
                                            {aiAnalysis.elevator_pitch && (
                                                <div className="relative mb-10 group/pitch">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover/pitch:opacity-100 transition-opacity duration-700" />
                                                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-inner">
                                                        <div className="absolute top-4 left-4 opacity-10">
                                                            <Sparkles className="w-12 h-12 text-white" />
                                                        </div>
                                                        <p className="relative text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-200 italic leading-relaxed text-center px-4">
                                                            "{aiAnalysis.elevator_pitch}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-zinc-400 mb-10 text-sm leading-7 border-l-2 border-purple-500/30 pl-4 py-1">
                                                {aiAnalysis.explanation}
                                            </p>

                                            {/* Enhanced AI Data Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 relative z-10">
                                                {/* Career Alignment Gauge */}
                                                <div className="bg-[#0f0f1d] rounded-[1.2rem] p-5 border border-white/5 relative overflow-hidden group hover:border-teal-500/30 transition-colors shadow-lg">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Alignment</span>
                                                        <Target className="h-4 w-4 text-teal-500/50 group-hover:text-teal-400 transition-colors" />
                                                    </div>

                                                    <div className="flex items-end gap-1 mb-2">
                                                        <span className="text-4xl font-black text-white tracking-tighter group-hover:text-teal-400 transition-colors">
                                                            {aiAnalysis.career_alignment_score || 0}
                                                        </span>
                                                        <span className="text-lg font-bold text-teal-500/50 mb-1">%</span>
                                                    </div>

                                                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-3 ring-1 ring-white/5">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${aiAnalysis.career_alignment_score || 0}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                            className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 truncate font-medium">
                                                        Target: <span className="text-zinc-300">{careerGoal || "General Tech"}</span>
                                                    </div>
                                                </div>

                                                {/* Salary Range */}
                                                <div className="bg-[#0f0f1d] rounded-[1.2rem] p-5 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors shadow-lg">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Est. Salary</span>
                                                        <TrendingUp className="h-4 w-4 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                                                    </div>
                                                    <div className="text-2xl font-black text-white tracking-tight mb-2 leading-none group-hover:text-emerald-400 transition-colors">
                                                        {aiAnalysis.projected_salary_range || "N/A"}
                                                    </div>
                                                    <div className="text-[10px] text-emerald-500/80 font-bold bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
                                                        Entry Level Analysis
                                                    </div>
                                                </div>

                                                {/* Job Roles */}
                                                <div className="col-span-1 md:col-span-2 bg-[#0f0f1d] rounded-[1.2rem] p-5 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors shadow-lg flex flex-col">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">You could become a...</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2.5 content-start">
                                                        {aiAnalysis.top_job_roles && aiAnalysis.top_job_roles.length > 0 ? (
                                                            aiAnalysis.top_job_roles.slice(0, 5).map((role, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: 0.2 + i * 0.1 }}
                                                                >
                                                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 text-xs px-3 py-1.5 border border-blue-500/20 transition-all hover:scale-105 cursor-default">
                                                                        {role}
                                                                    </Badge>
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-zinc-500 italic">Analysis pending...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Difficulty Heatmap and Timeline */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                                {/* Heatmap */}
                                                <div className="lg:col-span-2 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                            <TrendingUp className="h-3 w-3" /> Workload Intensity
                                                        </h4>
                                                        <span className="text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                            {aiAnalysis.difficulty_curve} Curve
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end gap-3 h-24 w-full p-6 bg-black/30 rounded-2xl border border-white/5 relative overflow-hidden">
                                                        {aiAnalysis.semester_difficulty_scores?.map((score, i) => (
                                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-help relative">
                                                                <div className="w-full bg-zinc-800/50 rounded-md relative h-full overflow-hidden ring-1 ring-white/5 group-hover:ring-white/20 transition-all">
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${score * 10}%` }}
                                                                        transition={{ delay: i * 0.05, duration: 0.8, type: "spring" }}
                                                                        className={cn(
                                                                            "absolute bottom-0 w-full rounded-md transition-colors duration-300",
                                                                            score >= 8 ? "bg-gradient-to-t from-red-600 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]" :
                                                                                score >= 5 ? "bg-gradient-to-t from-amber-600 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]" :
                                                                                    "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                                        )}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-300 transition-colors">S{i + 1}</span>
                                                                {/* Tooltip */}
                                                                <div className="absolute -top-10 bg-zinc-900 border border-zinc-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                                    Diff: {score}/10
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {!aiAnalysis.semester_difficulty_scores && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">No difficulty data available</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Study Roadmap Snippet */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="h-3 w-3" /> Quick Strategy
                                                    </h4>
                                                    <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 h-24 flex flex-col justify-center">
                                                        {aiAnalysis.study_roadmap ? (
                                                            <>
                                                                <div className="text-[10px] font-bold text-cyan-400 mb-1">RECOMMENDATION</div>
                                                                <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                                                                    {aiAnalysis.study_roadmap.exam_period || "Focus on consistent revision."}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-zinc-500 italic">Generate plan for tips.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons / Navigation tabs for deeper details could go here */}

                                            {/* Skill Gaps & Electives */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                {/* Skill Gaps */}
                                                <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/10">
                                                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <AlertTriangle className="h-3 w-3" /> Missing Critical Skills
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiAnalysis.skill_gaps && aiAnalysis.skill_gaps.length > 0 ? (
                                                            aiAnalysis.skill_gaps.map((skill, i) => (
                                                                <Badge key={i} variant="outline" className="border-red-500/20 text-red-300 bg-red-500/10 text-[10px] py-1">
                                                                    {skill}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-zinc-500 italic flex items-center gap-2">
                                                                <CheckCircle2 className="h-3 w-3 text-green-500" /> No gaps detected. Great job!
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Strategic Electives */}
                                                <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10">
                                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Star className="h-3 w-3" /> Recommended Electives
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiAnalysis.strategic_electives && aiAnalysis.strategic_electives.length > 0 ? (
                                                            aiAnalysis.strategic_electives.map((elective, i) => (
                                                                <Badge key={i} variant="outline" className="border-emerald-500/20 text-emerald-300 bg-emerald-500/10 text-[10px] py-1">
                                                                    {elective}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-zinc-500 italic">No specific recommendations</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Deep Dive Sections (Accordion Style or Grid) */}
                                            <div className="space-y-6">
                                                {/* Course Deep Dive */}
                                                {aiAnalysis.course_details && Object.keys(aiAnalysis.course_details).length > 0 && (
                                                    <div className="border-t border-white/5 pt-8">
                                                        <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4" /> Course Deep Dive
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {Object.entries(aiAnalysis.course_details).map(([code, details]) => (
                                                                <div key={code} className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition-all hover:bg-white/5 group">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <Badge className="bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/20 px-2 py-0.5">{code}</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-medium">{details.description}</p>

                                                                    {details.learning_outcomes && details.learning_outcomes.length > 0 && (
                                                                        <div className="mb-4 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                                                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Key Outcomes</div>
                                                                            <ul className="space-y-1.5">
                                                                                {details.learning_outcomes.slice(0, 3).map((outcome, i) => (
                                                                                    <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-2">
                                                                                        <div className="mt-1 h-3 w-1 rounded-full bg-purple-500/50 flex-shrink-0" />
                                                                                        {outcome}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    {details.study_tips && (
                                                                        <div className="text-[10px] p-3 rounded-lg bg-blue-500/10 text-blue-200 border border-blue-500/20 flex gap-2">
                                                                            <Zap className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-400" />
                                                                            {details.study_tips}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Industry Relevance */}
                                                {aiAnalysis.industry_relevance && (
                                                    <div className="border-t border-white/5 pt-8">
                                                        <div className="rounded-3xl bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 p-8">
                                                            <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                <Building2 className="h-4 w-4" /> Industry Connection
                                                            </h4>
                                                            <div className="flex flex-col md:flex-row gap-8">
                                                                <div className="flex-1">
                                                                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">{aiAnalysis.industry_relevance.industry_connections}</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {aiAnalysis.industry_relevance.key_courses && aiAnalysis.industry_relevance.key_courses.map((course, i) => (
                                                                            <Badge key={i} variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10 text-[10px]">
                                                                                {course}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="w-px bg-white/10 hidden md:block" />
                                                                <div className="flex-1">
                                                                    <h5 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wide">Salary Insight</h5>
                                                                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                                                                        "{aiAnalysis.salary_justification || "Strong earning potential based on current market trends."}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Explanation */}
                                    <div className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-teal-400" />
                                            {advisorMode ? "Academic Advisor Assessment" : "Plan Summary"}
                                        </h3>
                                        <div className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                                            {currentPlan.advisor_explanation}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {!currentPlan && !error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="rounded-3xl bg-[#0a0a16]/60 backdrop-blur-2xl border border-white/5 shadow-2xl p-12 text-center"
                                >
                                    <Rocket className="h-16 w-16 text-teal-400/30 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Ready to Generate
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Configure your preferences and click the button to generate
                                        your optimized degree plan with AI insights.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
