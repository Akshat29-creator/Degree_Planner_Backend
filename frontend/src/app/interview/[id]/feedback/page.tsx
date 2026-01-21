"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, RefreshCw, Home, CheckCircle, AlertCircle, Download, Share2, Award, Activity } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

import { getInterviewById, getFeedbackByInterviewId } from "@/lib/actions/interview.action";
import { useAuth } from "@/context/auth-context";

interface Feedback {
    id: string;
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

interface Interview {
    id: string;
    role: string;
    type: string;
}

export default function FeedbackPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);

    const interviewId = params.id as string;

    useEffect(() => {
        async function fetchData() {
            if (!interviewId || !user?.id) return;

            const [interviewData, feedbackData] = await Promise.all([
                getInterviewById(interviewId),
                getFeedbackByInterviewId({ interviewId, odId: String(user.id) }),
            ]);

            if (!interviewData) {
                router.push("/interview");
                return;
            }

            setInterview(interviewData);
            setFeedback(feedbackData);
            setLoading(false);
        }

        fetchData();
    }, [interviewId, user?.id, router]);

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        const toastId = toast.loading("Generating PDF Report...");

        try {
            const element = reportRef.current;

            // html-to-image handles modern CSS (lab/oklch) better than html2canvas
            // We adding a small delay to ensure fonts/images are loaded
            const dataUrl = await toPng(element, {
                backgroundColor: "#050510",
                pixelRatio: 2,
                cacheBust: true,
            });

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Interview-Feedback-${dayjs().format("YYYY-MM-DD")}.pdf`);

            toast.dismiss(toastId);
            toast.success("PDF Downloaded!");
        } catch (error) {
            console.error("PDF Error:", error);
            toast.dismiss(toastId);
            toast.error("Failed to generate PDF");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-[#050510]">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Star className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-gray-400">Analyzing Performance...</p>
                </div>
            </main>
        );
    }

    if (!feedback || !interview) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-[#050510]">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">No feedback available for this interview.</p>
                    <Link
                        href={`/interview/${interviewId}`}
                        className="text-purple-400 hover:text-purple-300 underline"
                    >
                        Take the interview to get feedback
                    </Link>
                </div>
            </main>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050510]">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Controls */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-wrap items-center justify-between gap-4"
                >
                    <Link
                        href="/interview"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Hub</span>
                    </Link>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20">
                            <Share2 className="w-4 h-4" />
                            Share Result
                        </button>
                    </div>
                </motion.div>

                {/* REPORT CONTAINER - ID for PDF Generation */}
                <div ref={reportRef} className="space-y-8 bg-[#050510] p-4 sm:p-8 rounded-3xl">

                    {/* Report Header */}
                    <div className="text-center space-y-2 mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 mb-4">
                            <Award className="w-3 h-3" />
                            Official Performance Report
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                            Interview Feedback
                        </h1>
                        <p className="text-lg text-gray-400 capitalize">
                            {interview.role} • {interview.type} Assessment
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                            <Calendar className="w-4 h-4" />
                            {dayjs(feedback.createdAt).format("MMMM D, YYYY • h:mm A")}
                        </div>
                    </div>

                    {/* Score Hero */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#0d0d1a] to-[#0f0f18] border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="text-center md:text-left">
                                <h3 className="text-gray-400 font-medium mb-1">Overall Performance Score</h3>
                                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                    <span className={`text-7xl font-bold tracking-tighter ${getScoreColor(feedback.totalScore)}`}>
                                        {feedback.totalScore}
                                    </span>
                                    <span className="text-2xl text-gray-600 font-medium">/100</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto md:mx-0">
                                    Based on strict evaluation of your technical accuracy, communication style, and problem-solving approach.
                                </p>
                            </div>

                            <div className="h-24 w-px bg-white/10 hidden md:block" />

                            <div className="flex-1 w-full">
                                <h3 className="text-gray-200 font-medium mb-4">Final Assessment</h3>
                                <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                    <p className="text-gray-300 leading-relaxed italic border-l-2 border-purple-500 pl-4">
                                        "{feedback.finalAssessment}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Category Chart */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-400" />
                                Score Breakdown
                            </h3>
                            <div className="space-y-5">
                                {feedback.categoryScores.map((category, index) => (
                                    <div key={index} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                                            <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                                                {category.score}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${category.score}%` }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className={`h-full ${getScoreBg(category.score)} rounded-full`}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {category.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="space-y-6">
                            <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Key Strengths</h3>
                                </div>
                                <ul className="space-y-3">
                                    {feedback.strengths.map((str, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                            {str}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-white">Focus Areas</h3>
                                </div>
                                <ul className="space-y-3">
                                    {feedback.areasForImprovement.map((area, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            {area}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={`/interview/${interviewId}`}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retake Interview
                    </Link>
                    <Link
                        href="/interview"
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                    >
                        Start New Session
                    </Link>
                </div>
            </div>
        </main>
    );
}
