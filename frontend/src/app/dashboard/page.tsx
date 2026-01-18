"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    BookOpen,
    Award,
    Calendar,
    TrendingUp,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardPage() {
    const router = useRouter();
    const courses = useAppStore((state) => state.courses);
    const completedCourses = useAppStore((state) => state.completedCourses);
    const remainingSemesters = useAppStore((state) => state.remainingSemesters);
    const currentPlan = useAppStore((state) => state.currentPlan);

    // Removed early return to show empty state UI
    // if (courses.length === 0) {
    //     return null;
    // }

    // Calculate stats
    const totalCourses = courses.length;
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const avgCredits = (totalCredits / totalCourses).toFixed(1);
    const completedCount = completedCourses.length;

    const metrics = [
        {
            icon: BookOpen,
            label: "Total Courses",
            value: totalCourses,
            color: "from-teal-500 to-cyan-500",
        },
        {
            icon: Award,
            label: "Total Credits",
            value: totalCredits,
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Calendar,
            label: "Semesters Left",
            value: remainingSemesters,
            color: "from-orange-500 to-amber-500",
        },
        {
            icon: TrendingUp,
            label: "Avg Credits/Course",
            value: avgCredits,
            color: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <AuthGuard>
            <div className="container mx-auto max-w-7xl px-4 py-12 pt-32">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-400 bg-clip-text text-transparent mb-2">
                        Student Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Your academic journey at a glance
                    </p>
                </motion.div>

                {courses.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-white mb-4">Welcome to Degree Planner</h2>
                        <p className="text-zinc-400 mb-8 max-w-md mx-auto">It looks like you haven't added any courses yet. Head over to the Planner to get started.</p>
                        <Button asChild className="bg-teal-600">
                            <Link href="/planner">Start Planning</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {metrics.map((metric, i) => (
                                <motion.div
                                    key={metric.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="metric-card rounded-2xl p-6"
                                >
                                    <div
                                        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg mb-4`}
                                    >
                                        <metric.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">
                                        {metric.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider">
                                        {metric.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Progress Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-8 mb-10"
                        >
                            <h2 className="text-xl font-semibold text-white mb-6">
                                Your Progress
                            </h2>
                            <div className="flex items-center gap-8">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Course Completion</span>
                                        <span className="text-teal-400 font-medium">
                                            {completedCount} / {totalCourses} courses
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(completedCount / totalCourses) * 100}%`,
                                            }}
                                            transition={{ delay: 0.6, duration: 0.8 }}
                                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-400">
                                        {Math.round((completedCount / totalCourses) * 100)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Complete</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="glass-card glass-card-hover p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                                        <Calendar className="h-6 w-6 text-teal-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            Generate Your Plan
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Create an optimized semester-by-semester schedule
                                        </p>
                                        <Button asChild className="bg-teal-500 hover:bg-teal-400 text-black">
                                            <Link href="/planner">
                                                Go to Planner
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card glass-card-hover p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <Sparkles className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            AI Career Coach
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Get personalized course recommendations for your dream job
                                        </p>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                                        >
                                            <Link href="/advisor">
                                                Ask AI Advisor
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Current Plan Status */}
                        {currentPlan && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="glass-card p-6 mt-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            Active Plan Generated
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {Object.keys(currentPlan.degree_plan).length} semesters planned
                                        </p>
                                    </div>
                                    <Button asChild variant="ghost" className="text-teal-400">
                                        <Link href="/planner">
                                            View Plan
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </AuthGuard>
    );
}
