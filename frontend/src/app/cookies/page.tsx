"use client";

import { Badge } from "@/components/ui/badge";
import { Cookie, Settings, ShieldCheck, Database } from "lucide-react";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-orange-500/30">

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                <header className="mb-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                        <Cookie className="w-8 h-8 text-orange-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Cookie Policy</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Transparent. Minimal. Essential. We use digital cookies, but we promise they aren't the tracking kind.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/60 transition-colors">
                        <ShieldCheck className="w-8 h-8 text-green-400 mb-6" />
                        <h3 className="text-xl font-bold mb-4">Essential Cookies</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            These are strictly necessary for the website to function. They allow you to log in, save your degree plan, and navigate between pages securely.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">auth_token</Badge>
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">session_id</Badge>
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">csrf_protection</Badge>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 hover:bg-zinc-900/60 transition-colors">
                        <Settings className="w-8 h-8 text-blue-400 mb-6" />
                        <h3 className="text-xl font-bold mb-4">Preference Cookies</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            These remember your custom settings so you don't have to reset them every time you visit.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">theme_mode</Badge>
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">sidebar_state</Badge>
                            <Badge variant="secondary" className="bg-white/5 text-zinc-400">reduced_motion</Badge>
                        </div>
                    </div>
                </div>

                <div className="border border-white/10 rounded-3xl p-8 bg-black/50 backdrop-blur-md">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Database className="w-6 h-6 text-zinc-500" />
                        What We DON'T Use
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="font-bold text-red-400 mb-2">No Ad Tracking</div>
                            <p className="text-xs text-zinc-500">We don't sell your attention to advertisers.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="font-bold text-red-400 mb-2">No Cross-Site Pixels</div>
                            <p className="text-xs text-zinc-500">Facebook/Google pixels are blocked.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="font-bold text-red-400 mb-2">No Fingerprinting</div>
                            <p className="text-xs text-zinc-500">We verify device integrity without invasive fingerprinting.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
