"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

export default function BlogPage() {
    const posts = [
        {
            title: "How to Hack Your Degree with AI",
            excerpt: "Stop guessing. Start calculating. Here's how predictive modeling can shave a semester off your graduation time.",
            date: "Jan 18, 2026",
            category: "Strategy",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            title: "The Death of the 'Easy A'",
            excerpt: "Why modern employers are looking at your complete transcript, not just your GPA. And what to do about it.",
            date: "Jan 15, 2026",
            category: "Industry",
            gradient: "from-purple-500 to-indigo-500"
        },
        {
            title: "Surviving the Sophomore Slump",
            excerpt: "Mid-degree burnout is real. We analyzed data from 5,000 students to find the cure.",
            date: "Jan 10, 2026",
            category: "Mental Health",
            gradient: "from-teal-500 to-cyan-500"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-purple-500/30">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Archive.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">Insights, strategies, and stories from the academic frontier.</p>
                </div>

                <div className="grid gap-8">
                    {posts.map((post, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative rounded-3xl bg-zinc-900/50 border border-white/10 p-8 overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${post.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${post.gradient}`}>{post.category}</span>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-zinc-500">{post.date}</span>
                                    </div>
                                    <h2 className="text-3xl font-bold group-hover:text-white transition-colors">{post.title}</h2>
                                    <p className="text-zinc-400 leading-relaxed">{post.excerpt}</p>
                                </div>

                                <div className="md:pl-8 flex items-center">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
