"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Cell
} from "recharts";
import {
    Activity, ArrowLeft, Target, Trophy, BrainCircuit,
    TrendingUp, AlertTriangle, BookOpen, Loader2, CheckCircle2,
    XCircle, Award, Zap, Brain, TrendingDown, BarChart2, Clock
} from "lucide-react";
import { fetchAPI, getAssessmentTests, TestResultItem } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { FeatureGate } from "@/components/feature-gate";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
    summary: {
        tests_taken: number;
        average_score: number;
    };
    recent_tests: {
        id: number;
        topic_name: string;
        percentage: number;
        total_score: number;
        max_score: number;
        mcq_count: number;
        short_count: number;
        long_count: number;
        performance_level: string;
        created_at: string;
    }[];
    topic_performance: Record<string, {
        attempts: number;
        avg_score: number;
        latest_score: number;
    }>;
}

function PerformanceEngine() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [allTests, setAllTests] = useState<TestResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const [data, tests] = await Promise.all([
                    fetchAPI("/api/performance/metrics"),
                    getAssessmentTests().catch(() => [])
                ]);
                setMetrics(data as PerformanceMetrics);
                setAllTests(tests);
            } catch (err) {
                toast.error("Failed to load performance metrics");
            } finally {
                setIsLoading(false);
            }
        };
        loadMetrics();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-zinc-400">Loading deep analytics...</p>
            </div>
        );
    }

    if (!metrics || !metrics?.summary || metrics?.summary?.tests_taken === 0) {
        return (
            <div className="min-h-screen bg-[#050510] pt-24 px-4">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                        <Activity className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">No Data Available Yet</h1>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                        Your performance dashboard requires test data to generate insights. Take your first AI assessment to unlock deep analytics!
                    </p>
                    <button
                        onClick={() => router.push("/study")}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
                    >
                        Go to Assessment Hub
                    </button>
                </div>
            </div>
        );
    }

    const recentTests = metrics.recent_tests || [];

    // Trend data (chronological)
    const trendData = [...recentTests].reverse().map((t, idx) => ({
        name: `#${idx + 1}`,
        topic: t.topic_name,
        score: Math.round(t.percentage),
        date: format(new Date(t.created_at), "MMM d")
    }));

    // Topic data
    const topicData = Object.entries(metrics.topic_performance).map(([topic, stats]) => ({
        topic: topic.length > 20 ? topic.substring(0, 20) + '…' : topic,
        fullTopic: topic,
        score: Math.round(stats.avg_score),
        attempts: stats.attempts,
        latest: Math.round(stats.latest_score)
    })).sort((a, b) => b.score - a.score);

    const strongestTopic = topicData[0];
    const weakestTopic = topicData[topicData.length - 1];

    // Question type breakdown (from all tests)
    const totalMcq = allTests.reduce((s, t) => s + (t.mcq_count || 0), 0);
    const totalShort = allTests.reduce((s, t) => s + (t.short_count || 0), 0);
    const totalLong = allTests.reduce((s, t) => s + (t.long_count || 0), 0);
    const questionTypeData = [
        { name: "MCQ", count: totalMcq, color: "#6366f1" },
        { name: "Short Answer", count: totalShort, color: "#f59e0b" },
        { name: "Long Essay", count: totalLong, color: "#a855f7" },
    ].filter(d => d.count > 0);

    // Score distribution buckets
    const buckets = [
        { label: "0–40%", count: 0, color: "#ef4444" },
        { label: "40–60%", count: 0, color: "#f59e0b" },
        { label: "60–80%", count: 0, color: "#3b82f6" },
        { label: "80–100%", count: 0, color: "#10b981" },
    ];
    recentTests.forEach(t => {
        if (t.percentage < 40) buckets[0].count++;
        else if (t.percentage < 60) buckets[1].count++;
        else if (t.percentage < 80) buckets[2].count++;
        else buckets[3].count++;
    });

    const avgScore = Math.round(metrics.summary.average_score || 0);
    const best = recentTests.length > 0 ? recentTests.reduce((b, t) => t.percentage > b.percentage ? t : b, recentTests[0]) : null;
    const worst = recentTests.length > 0 ? recentTests.reduce((b, t) => t.percentage < b.percentage ? t : b, recentTests[0]) : null;
    const passing = recentTests.filter(t => t.percentage >= 60).length;
    const passRate = recentTests.length > 0 ? Math.round((passing / recentTests.length) * 100) : 0;

    const getScoreColor = (score: number) => score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
    const getScoreBg = (score: number) => score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";

    return (
        <FeatureGate featureKey="page_performance" featureName="Deep Analytics">
            <div className="min-h-screen bg-gradient-to-br from-[#050510] to-[#0a0a1a] pb-28 md:pb-12 pt-6 md:pt-24 px-4 overflow-x-hidden">
                <div className="container max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                        <div>
                            <div className="flex items-center gap-3 md:hidden mb-4">
                                <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <h1 className="text-xl font-bold text-white leading-tight">Analytics</h1>
                            </div>
                            <h1 className="hidden md:flex items-center text-4xl font-extrabold tracking-tight text-white mb-2">
                                <Activity className="w-8 h-8 mr-3 text-indigo-500" />
                                Performance Matrix
                            </h1>
                            <p className="text-zinc-400">Complete analysis of your testing history, knowledge retention, and growth trajectory.</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full md:w-auto self-start md:self-center shrink-0">
                            <button
                                onClick={() => router.push("/performance")}
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white/10 text-white shadow-lg border border-white/5"
                            >
                                Study Analytics
                            </button>
                            <button
                                onClick={() => router.push("/performance/gpa")}
                                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                                GPA Simulator
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards Row 1 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard title="Average Score" value={`${avgScore}%`} icon={<Trophy className="w-5 h-5 text-indigo-400" />} colorClass="border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10" />
                        <KpiCard title="Assessments Taken" value={metrics.summary.tests_taken} icon={<Target className="w-5 h-5 text-emerald-400" />} colorClass="border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" />
                        <KpiCard title="Pass Rate (≥60%)" value={`${passRate}%`} icon={<CheckCircle2 className="w-5 h-5 text-blue-400" />} colorClass="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10" />
                        <KpiCard title="Topics Covered" value={topicData.length} icon={<BrainCircuit className="w-5 h-5 text-fuchsia-400" />} colorClass="border-fuchsia-500/30 bg-fuchsia-500/5 hover:bg-fuchsia-500/10" />
                    </div>

                    {/* Best / Worst + Question Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Best Test</p>
                                <p className="text-green-400 font-black text-lg">{Math.round(best?.percentage ?? 0)}%</p>
                                <p className="text-zinc-400 text-xs truncate">{best?.topic_name}</p>
                            </div>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                <TrendingDown className="w-6 h-6 text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Needs Attention</p>
                                <p className="text-red-400 font-black text-lg">{Math.round(worst?.percentage ?? 0)}%</p>
                                <p className="text-zinc-400 text-xs truncate">{worst?.topic_name}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Questions By Type</p>
                            <div className="space-y-2">
                                {questionTypeData.map(d => (
                                    <div key={d.name} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                                        <span className="text-xs text-zinc-400 flex-1">{d.name}</span>
                                        <span className="text-xs font-bold text-white">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Score Trend */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Score Trajectory</h3>
                                    <p className="text-sm text-zinc-400">Your recent test performance over time</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                                </div>
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '8px 12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(v: any, _, props) => [`${v}%`, props.payload.topic]}
                                            labelFormatter={(l) => `Test ${l}`}
                                        />
                                        {/* Pass/Fail Reference Line */}
                                        <Line type="monotone" dataKey={() => 60} stroke="#ffffff20" strokeDasharray="4 4" dot={false} strokeWidth={1} />
                                        <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Score Distribution */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Score Distribution</h3>
                                    <p className="text-sm text-zinc-400">How your tests cluster across ranges</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <BarChart2 className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={buckets} barSize={40}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="count" name="Tests" radius={[6, 6, 0, 0]}>
                                            {buckets.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Topic Radar */}
                        {topicData.length >= 3 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Knowledge Web</h3>
                                        <p className="text-sm text-zinc-400">Mastery across all topics</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <BrainCircuit className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                <div className="h-[260px] w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topicData}>
                                            <PolarGrid stroke="#ffffff15" />
                                            <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Score" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(v: any) => [`${v}%`, "Score"]} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Top / Bottom Topic Summary */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Mastery Hotspots</h3>
                            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                                <p className="text-[10px] text-green-400 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Strongest Topic</p>
                                <p className="text-white font-bold">{strongestTopic?.fullTopic || "N/A"}</p>
                                <p className="text-green-400 font-black text-2xl">{strongestTopic?.score}%</p>
                                <p className="text-zinc-500 text-xs">{strongestTopic?.attempts} attempt(s)</p>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                                <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Needs Focus</p>
                                <p className="text-white font-bold">{weakestTopic?.fullTopic || "N/A"}</p>
                                <p className="text-rose-400 font-black text-2xl">{weakestTopic?.score}%</p>
                                <p className="text-zinc-500 text-xs">{weakestTopic?.attempts} attempt(s)</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Detailed Topic Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-indigo-400" />
                                Topic Mastery Breakdown
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {topicData.map((topic, i) => (
                                <div key={i} className="p-4 px-6 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                                        topic.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                        topic.score >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400")}>{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-white truncate">{topic.fullTopic}</h4>
                                        <p className="text-xs text-zinc-500 mt-0.5">{topic.attempts} attempt(s) &bull; Latest: {topic.latest}%</p>
                                    </div>
                                    <div className="w-32 hidden md:block">
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full", getScoreBg(topic.score))} style={{ width: `${topic.score}%` }} />
                                        </div>
                                    </div>
                                    <div className={cn("text-xl font-black w-14 text-right shrink-0", getScoreColor(topic.score))}>{topic.score}%</div>
                                    <div className={cn("text-xs px-2 py-0.5 rounded-full font-bold shrink-0 hidden md:block",
                                        topic.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                                        topic.score >= 60 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400")}>
                                        {topic.score >= 80 ? "Mastered" : topic.score >= 60 ? "Developing" : "Needs Work"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Full Test History Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-bold text-white">Full Test History</h3>
                            <span className="ml-auto text-xs text-zinc-500">{(allTests || []).length} total</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[...(allTests || [])].reverse().map((t, i) => (
                                <div key={t.id || i} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-sm">
                                    <span className="text-zinc-600 w-6 text-right shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-zinc-200 truncate font-medium">{t.topic_name || "Unknown Topic"}</p>
                                        <p className="text-zinc-500 text-xs">{t.mcq_count || 0} MCQ · {t.short_count || 0} Short · {t.long_count || 0} Long</p>
                                    </div>
                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold hidden md:block",
                                        t.performance_level === "Strong" ? "bg-green-500/20 text-green-400" :
                                        t.performance_level === "Average" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400")}>
                                        {t.performance_level || "Unknown"}
                                    </span>
                                    <span className="text-zinc-500 text-xs shrink-0 hidden md:block">
                                        {t.created_at ? formatDistanceToNow(new Date(t.created_at)) + " ago" : "Recently"}
                                    </span>
                                    <span className={cn("font-black w-14 text-right", getScoreColor(t.percentage || 0))}>{Math.round(t.percentage || 0)}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </FeatureGate>
    );
}

function KpiCard({ title, value, icon, colorClass }: { title: string; value: string | number; icon: any; colorClass: string }) {
    return (
        <div className={cn("rounded-3xl border p-5 transition-all duration-300", colorClass)}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-300">{title}</span>
                {icon}
            </div>
            <div className="font-black text-white text-3xl truncate">{value}</div>
        </div>
    );
}

export default function PerformancePage() {
    return (
        <FeatureGate featureKey="page_performance" featureName="Performance Analytics">
            <PerformanceEngine />
        </FeatureGate>
    );
}
