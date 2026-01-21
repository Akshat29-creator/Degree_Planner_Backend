"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Mic } from "lucide-react";
import Link from "next/link";

import Agent from "@/components/interview/Agent";
import DisplayTechIcons from "@/components/interview/DisplayTechIcons";
import { useAuth } from "@/context/auth-context";
import { getInterviewById } from "@/lib/actions/interview.action";

interface Interview {
    id: string;
    role: string;
    level: string;
    questions: string[];
    techstack: string[];
    createdAt: string;
    type: string;
}

export default function InterviewSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);

    const interviewId = params.id as string;

    useEffect(() => {
        async function fetchInterview() {
            if (!interviewId) return;

            const data = await getInterviewById(interviewId);
            if (!data) {
                router.push("/interview");
                return;
            }
            setInterview(data);
            setLoading(false);
        }

        fetchInterview();
    }, [interviewId, router]);

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Mic className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-gray-400">Loading interview...</p>
                </div>
            </main>
        );
    }

    if (!interview) {
        return null;
    }


    return (
        <main className="min-h-screen pt-24 pb-20 px-4 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center justify-between"
                >
                    <Link
                        href="/interview"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Exit Session</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <h1 className="text-lg font-bold text-white capitalize">
                                {interview.role}
                            </h1>
                            <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{interview.level}</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{interview.type}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Interview Agent - Full Focus */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col shadow-2xl shadow-purple-900/10"
                >
                    <Agent
                        userName={user?.email?.split("@")[0] || "Guest"}
                        odId={String(user?.id || "")}
                        interviewId={interviewId}
                        type="interview"
                        questions={interview.questions}
                    />
                </motion.div>

                <p className="text-center text-xs text-gray-500 mt-6 font-mono">
                    AI_INTERVIEW_SESSION_ID: {interview.id.slice(0, 8)} • SECURE_CONNECTION
                </p>
            </div>
        </main>
    );
}
