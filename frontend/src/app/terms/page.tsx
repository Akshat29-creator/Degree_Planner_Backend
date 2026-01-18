"use client";

import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, FileText, CheckCircle } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-indigo-500/30">

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                <header className="mb-16 text-center">
                    <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                        Effective Date: January 18, 2026
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Terms of Service</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        The rules of engagement. Please read these terms carefully before using DegreePlanner Agent.
                    </p>
                </header>

                <div className="space-y-12">

                    {/* Section 1 */}
                    <div className="group">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors">
                            <CheckCircle className="w-6 h-6 text-indigo-500" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-zinc-400 leading-relaxed pl-9">
                            By accessing or using DegreePlanner Agent ("the Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="group">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                            2. Educational Disclaimer
                        </h2>
                        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 ml-9">
                            <p className="text-orange-200/80 leading-relaxed font-medium">
                                <strong>Important:</strong> DegreePlanner is an assistive tool, not an authorized academic advisor.
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 text-orange-200/60 text-sm">
                                <li>Course prerequisites, availability, and degree requirements are subject to change by your university.</li>
                                <li>The Service generates plans based on provided data, which may be incomplete or outdated.</li>
                                <li><strong>Always verify</strong> your graduation plan with an official university counselor before making registration decisions.</li>
                                <li>We are not liable for missed graduation dates, rejected credits, or scheduling conflicts.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="group">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors">
                            <Scale className="w-6 h-6 text-indigo-500" />
                            3. AI & Predictive Features
                        </h2>
                        <p className="text-zinc-400 leading-relaxed pl-9 mb-4">
                            Our "Career Advisor" and "Burnout Risk" features utilize probabilistic AI models.
                        </p>
                        <ul className="list-disc pl-14 space-y-2 text-zinc-500">
                            <li>Salary projections are estimates based on market trends and unrelated historical data.</li>
                            <li>"Easy" or "Hard" difficulty ratings are subjective and based on aggregated student feedback patterns.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="group">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-4 text-white group-hover:text-indigo-400 transition-colors">
                            <FileText className="w-6 h-6 text-indigo-500" />
                            4. User Accounts
                        </h2>
                        <p className="text-zinc-400 leading-relaxed pl-9">
                            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-12 border-t border-white/10 text-center text-zinc-500 text-sm">
                        <p>Questions about the Terms? Email us at <a href="mailto:legal@degreeplanner.agent" className="text-indigo-400 hover:underline">legal@degreeplanner.agent</a></p>
                    </div>

                </div>
            </div>
        </div>
    );
}
