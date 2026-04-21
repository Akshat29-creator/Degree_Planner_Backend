"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    BookOpen, Award, Calendar, TrendingUp, ArrowRight,
    Sparkles, Brain, Mic, GitBranch, ChevronRight,
    Repeat, Clock, Grid3X3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FeatureGate } from "@/components/feature-gate";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const courses = useAppStore((state) => state.courses);
    const completedCourses = useAppStore((state) => state.completedCourses);
    const remainingSemesters = useAppStore((state) => state.remainingSemesters);
    const currentPlan = useAppStore((state) => state.currentPlan);

    const totalCourses = courses.length;
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const avgCredits = totalCourses ? (totalCredits / totalCourses).toFixed(1) : "0";
    const completedCount = completedCourses.length;
    const completionPct = totalCourses ? Math.round((completedCount / totalCourses) * 100) : 0;

    const completedCredits = courses.filter(c => completedCourses.includes(c.code)).reduce((sum, c) => sum + c.credits, 0);
    const creditsPct = totalCredits ? Math.round((completedCredits / totalCredits) * 100) : 0;
    
    // Estimate semester progress based on course completion
    const initialSemesters = courses.length ? Math.ceil(courses.length / 5) : 0;
    const semestersProgress = initialSemesters ? Math.max(0, 100 - Math.round((remainingSemesters / initialSemesters) * 100)) : 0;

    const metrics = [
        { icon: BookOpen,  label: "Courses",    value: totalCourses,   progress: completionPct, color: "text-teal-400", bg: "bg-teal-500/10", stroke: "stroke-teal-500" },
        { icon: Award,     label: "Credits",    value: totalCredits,   progress: creditsPct,    color: "text-purple-400", bg: "bg-purple-500/10", stroke: "stroke-purple-500" },
        { icon: Calendar,  label: "Semesters",  value: remainingSemesters, progress: semestersProgress, color: "text-orange-400", bg: "bg-orange-500/10", stroke: "stroke-orange-500" },
        { icon: TrendingUp,label: "Avg/Course", value: avgCredits,     progress: 100,           color: "text-green-400", bg: "bg-green-500/10", stroke: "stroke-green-500" },
    ];

    const quickActions = [
        { href: "/planner",     label: "Plan",        icon: Calendar,      color: "bg-teal-500/15 text-teal-400 border-teal-500/20" },
        { href: "/study",       label: "Study",       icon: Brain,         color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
        { href: "/revision",    label: "Revision",    icon: Repeat,        color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
        { href: "/performance", label: "Analytics",   icon: TrendingUp,    icon2: Grid3X3, color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20" },
        { href: "/history",     label: "History",     icon: Clock,         color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
        { href: "/advisor",     label: "Advisor",     icon: Sparkles,      color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
        { href: "/interview",   label: "Interview",   icon: Mic,           color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
        { href: "/graph",       label: "Map",         icon: GitBranch,     color: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
    ];

    const firstName = (user?.email?.split("@")[0] || "Student")
        .replace(/[._-]/g, " ")
        .split(" ")[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <FeatureGate featureKey="page_dashboard" featureName="Dashboard">
            <div className="min-h-screen bg-[#050510] pb-28 md:pb-12">
                <div className="container mx-auto max-w-7xl px-4 py-6 pt-6 md:pt-32">

                    {/* ── Mobile Header: Greeting card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{greeting}</p>
                                <h1 className="text-2xl font-bold text-white capitalize">{firstName} 👋</h1>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                <span className="text-xs font-semibold text-teal-400">{completionPct}% done</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Desktop Header ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 hidden md:block">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent mb-2">
                            Student Dashboard
                        </h1>
                        <p className="text-muted-foreground">Your academic journey at a glance</p>
                    </motion.div>

                    {courses.length === 0 ? (
                        /* ── Empty State ── */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center py-16 px-6"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-6">
                                <BookOpen className="w-10 h-10 text-teal-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Welcome to Degree Planner</h2>
                            <p className="text-zinc-400 mb-8 max-w-sm">Start by heading to the Planner to create your personalized degree roadmap.</p>
                            <Link href="/planner" className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-teal-500/25">
                                Start Planning <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {/* ── Metrics: Swipeable on mobile, grid on desktop ── */}
                            <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:snap-none mb-6 md:mb-10 scrollbar-none">
                                {metrics.map((metric, i) => {
                                    const circumference = 2 * Math.PI * 18; // r=18
                                    const strokeDashoffset = circumference - (circumference * metric.progress) / 100;
                                    return (
                                        <motion.div
                                            key={metric.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            className="metric-card rounded-2xl p-5 min-w-[160px] flex-shrink-0 snap-center md:min-w-0 flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative w-12 h-12 flex items-center justify-center">
                                                    {/* Background Ring */}
                                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                        <circle cx="24" cy="24" r="18" className="stroke-white/5 fill-none" strokeWidth="4" />
                                                        {/* Progress Ring */}
                                                        <motion.circle 
                                                            cx="24" cy="24" r="18" 
                                                            className={cn("fill-none", metric.stroke)} 
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                                            animate={{ strokeDashoffset }}
                                                            transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                                                        />
                                                    </svg>
                                                    {/* Icon */}
                                                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-white leading-none tabular-nums">{metric.value}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{metric.label}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* ── Progress Bar ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-5 md:p-8 mb-6 md:mb-10"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-base md:text-xl font-semibold text-white">Progress</h2>
                                    <span className="text-sm font-bold text-teal-400">{completedCount} / {totalCourses}</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPct}%` }}
                                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-zinc-500">Courses completed</span>
                                    <span className="text-xs font-medium text-teal-400">{completionPct}%</span>
                                </div>
                            </motion.div>

                            {/* ── Quick Actions: Horizontal scroll chips on mobile ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-6"
                            >
                                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 md:text-lg md:text-white md:normal-case md:tracking-normal">Quick Access</h2>
                                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none md:grid md:grid-cols-5">
                                    {quickActions.map((action, i) => (
                                        <motion.div key={action.href} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }}>
                                            <Link
                                                href={action.href}
                                                className={`flex items-center gap-2.5 flex-shrink-0 px-4 py-3 rounded-2xl border ${action.color} transition-all active:scale-95 whitespace-nowrap text-sm font-semibold md:flex-col md:py-5 md:justify-center`}
                                            >
                                                <action.icon className="w-4 h-4 md:w-5 md:h-5" />
                                                {action.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* ── CTA Cards: Stacked on mobile ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <Link href="/planner" className="glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all group hover:border-teal-500/30">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-white">Generate Your Plan</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Create an optimized semester schedule</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                                </Link>

                                <Link href="/advisor" className="glass-card p-5 flex items-center gap-4 active:scale-[0.98] transition-all group hover:border-purple-500/30">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-white">AI Career Coach</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">Get personalized career recommendations</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                                </Link>
                            </motion.div>

                            {/* ── Current Plan Banner ── */}
                            {currentPlan && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-4"
                                >
                                    <Link href="/planner" className="glass-card p-5 flex items-center gap-4 group hover:border-teal-500/30 transition-all active:scale-[0.98]">
                                        <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-white">Active Plan Ready</p>
                                            <p className="text-xs text-zinc-500">{Object.keys(currentPlan.degree_plan).length} semesters planned</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-teal-400" />
                                    </Link>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </FeatureGate>
    );
}
