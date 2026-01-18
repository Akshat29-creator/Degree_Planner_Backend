"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Code2, Heart, Globe, Terminal, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 overflow-x-hidden selection:bg-purple-500/30">

            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">

                {/* HERO */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur"
                    >
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-xs font-bold tracking-wide text-purple-300 uppercase">
                            The Mission
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter mb-8"
                    >
                        redefining <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 animate-gradient-x">
                            ACADEMIC SUCESS
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-light"
                    >
                        We believe that every student deserves a clear path to their dreams. By combining deterministic precision with AI intuition, we're building the GPS for your degree.
                    </motion.p>
                </div>

                {/* STORY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">The Problem</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            University degrees are becoming increasingly complex. With thousands of course combinations, prerequisite chains, and career tracks, students are often left guessing. One wrong turn can mean an extra semester—or worse, burnout.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-md hover:border-pink-500/30 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                            <Cpu className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">The Solution</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            DegreePlanner Agent isn't just a calendar. It's an intelligent co-pilot. We verify every prerequisite mathematically while our local AI engine analyzes your workload, ensuring you're optimized for both graduation speed and mental health.
                        </p>
                    </motion.div>
                </div>

                {/* CREATOR SECTION */}
                <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-white/10 p-8 md:p-16 text-center">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className="w-32 h-32 rounded-full p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-8"
                        >
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                                {/* Placeholder for Akshat's Image if we had one, using generic code avatar for now */}
                                <Code2 className="w-12 h-12 text-zinc-500" />
                            </div>
                        </motion.div>

                        <h2 className="text-4xl font-black tracking-tight mb-2">Designed by Akshat Awasthi</h2>
                        <p className="text-purple-400 font-medium tracking-wide uppercase text-sm mb-8">Lead Developer & Architect</p>

                        <p className="max-w-2xl mx-auto text-zinc-400 text-lg leading-relaxed mb-10">
                            Passionate about building software that empowers human potential. Specialized in Full Stack Development, AI Agents, and designing systems that feel like magic.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://github.com/Akshat29-creator"
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <Code2 className="w-4 h-4" /> Github
                            </a>
                            <a
                                href="https://www.linkedin.com/in/akshat-awasthi-0774a0211/"
                                target="_blank"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors"
                            >
                                <Globe className="w-4 h-4" /> LinkedIn
                            </a>
                            <a
                                href="mailto:akshatawasthi207@gmail.com"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors"
                            >
                                <Heart className="w-4 h-4" /> Contact
                            </a>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white mb-1">100%</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Open Source</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white mb-1">Local</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">AI First</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white mb-1">24/7</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Availability</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white mb-1">Global</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-widest">Reach</div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
