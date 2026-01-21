"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import Agent from "@/components/interview/Agent";

export default function InterviewGeneratePage() {
    const { user } = useAuth();

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto interview-root-layout">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h3 className="text-2xl font-semibold text-white mb-2">Interview Generation</h3>
                    <p className="text-gray-400">Click "Start Call" to speak with the AI and set up your interview</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#0d0d1a] to-[#0a0a14] border border-white/10 rounded-2xl p-8"
                >
                    <Agent
                        userName={user?.email?.split("@")[0] || "Guest"}
                        odId={String(user?.id || "")}
                        type="generate"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10"
                >
                    <h3 className="text-sm font-semibold text-white mb-3">How it works</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Click "Start Call" to begin speaking with the AI interviewer</li>
                        <li>• Tell the AI what job role and tech stack you want to practice</li>
                        <li>• The AI will generate personalized interview questions for you</li>
                        <li>• Once complete, your interview will be saved and ready to take</li>
                    </ul>
                </motion.div>
            </div>
        </main>
    );
}
