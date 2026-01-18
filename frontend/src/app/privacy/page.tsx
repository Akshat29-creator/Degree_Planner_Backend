"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, UserCheck, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-teal-500/30">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                <header className="mb-16 text-center">
                    <Badge variant="outline" className="mb-4 border-teal-500/30 text-teal-300 bg-teal-500/10">
                        Last Updated: January 18, 2026
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Privacy Policy</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Your data is yours. We built DegreePlanner to prove that AI can be helpful without being invasive.
                    </p>
                </header>

                <div className="grid gap-12">

                    {/* PRINCIPLE 1 */}
                    <section className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                                <Server className="w-6 h-6 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">1. Local-First AI Processing</h2>
                                <div className="prose prose-invert prose-zinc max-w-none">
                                    <p>
                                        Unlike most AI platforms, DegreePlanner utilizes a <strong>Local LLM (Large Language Model)</strong> architecture via Ollama.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 mt-4 text-zinc-400">
                                        <li>Your transcript files (PDF/Text) are processed entirely within your device's memory.</li>
                                        <li>We do not send your academic records to OpenAI, Anthropic, or Google.</li>
                                        <li>The "thinking" happens on your GPU/CPU, ensuring your grades and course history remain private.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRINCIPLE 2 */}
                    <section className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Eye className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                                <div className="space-y-6 text-zinc-400">
                                    <div>
                                        <h3 className="text-white font-semibold mb-2">A. Account Information</h3>
                                        <p>If you create an account, we store your email using Firebase Authentication. This is solely to allow you to log in across devices.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-2">B. Usage Data</h3>
                                        <p>We collect anonymous, aggregated telemetry to fix bugs (e.g., "Page load failed"). We do not track individual user behavior flows or sell clickstream data.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRINCIPLE 3 */}
                    <section className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Lock className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
                                <p className="text-zinc-400 mb-4">
                                    We implement industry-standard security measures to protect your information:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg">
                                        <Shield className="w-4 h-4 text-green-400" /> Encryption in Transit (TLS 1.3)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg">
                                        <Shield className="w-4 h-4 text-green-400" /> Encryption at Rest (Firebase)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg">
                                        <Shield className="w-4 h-4 text-green-400" /> No Third-Party AI Sharing
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg">
                                        <Shield className="w-4 h-4 text-green-400" /> Regular Security Audits
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* CONTACT */}
                    <section className="text-center py-8">
                        <h2 className="text-2xl font-bold mb-4">Have questions about your data?</h2>
                        <a href="mailto:privacy@degreeplanner.agent" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors">
                            <Mail className="w-4 h-4" /> Contact our Data Protection Officer
                        </a>
                    </section>

                </div>
            </div>
        </div>
    );
}
