
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Sparkles, Github, Linkedin, Instagram } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Footer() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Hide Footer on Auth pages and Main Application (Dashboard, Planner, etc.)
    const hiddenRoutes = ["/login", "/register", "/dashboard", "/planner", "/graph", "/advisor", "/study", "/revision", "/buddy", "/history", "/profile"];
    const shouldHideFooter = hiddenRoutes.some(route => pathname?.startsWith(route));

    if (shouldHideFooter) return null;

    return (
        <footer className="border-t border-white/10 bg-black pt-20 pb-10 z-10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform border border-white/10">
                                <Brain className="h-5 w-5 relative z-10" />
                                <Sparkles className="h-3 w-3 absolute top-1 right-1 text-white/70" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 group-hover:to-white transition-all tracking-tight leading-none">
                                    DegreePlanner
                                </span>
                                <span className="text-[10px] text-purple-400 font-medium tracking-wider flex items-center gap-1">
                                    AI AGENT <Sparkles className="h-2 w-2" />
                                </span>
                            </div>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            Empowering students to design their perfect academic journey with responsible AI technology.
                        </p>
                        <div className="text-sm text-zinc-600">
                            <p>Developed with ❤️ by Akshat Awasthi</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 tracking-wide">Product</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                            <li>
                                <Link
                                    href={user ? "/planner" : "/login"}
                                    className="hover:text-teal-400 transition-colors"
                                >
                                    Planner
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={user ? "/advisor" : "/login"}
                                    className="hover:text-teal-400 transition-colors"
                                >
                                    Career Advisor
                                </Link>
                            </li>
                            <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 tracking-wide">Company</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
                            <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-teal-400 transition-colors">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 tracking-wide">Connect</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/Akshat29-creator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/akshat-awasthi-0774a0211/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#0077b5] hover:text-white transition-all hover:scale-110"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/akshat_stealth/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 hover:text-white transition-all hover:scale-110"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                        <div className="mt-6 text-sm text-zinc-500">
                            <p>akshatawasthi207@gmail.com</p>
                            <p>+91 8423054162</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-sm">© 2026 DegreePlanner Agent. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-zinc-600">
                        <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-zinc-400 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
