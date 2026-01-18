"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap,
    LayoutDashboard,
    Calendar,
    GitBranch,
    Bot,
    Brain,
    Repeat,
    Heart,
    UserCircle,
    LogOut,
    Sparkles,
    ChevronRight,
    Clock // Added Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/planner", label: "Plan", icon: Calendar },
    { href: "/graph", label: "Map", icon: GitBranch },
    { href: "/advisor", label: "Advisor", icon: Bot },
    { href: "/study", label: "Study", icon: Brain },
    { href: "/revision", label: "Revision", icon: Repeat },
    { href: "/buddy", label: "Buddy", icon: Heart },
    { href: "/history", label: "History", icon: Clock },
    { href: "/profile", label: "Me", icon: UserCircle },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    // Listen for scroll to adjust navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!user) return null;

    return (
        <>
            {/* SCROLL PROGRESS INDICATOR */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-purple-500 to-cyan-500 z-[100] origin-left"
                style={{ scaleX: pathname === "/" ? 0 : 1 }}
                initial={{ transformOrigin: "0%" }}
            />

            {/* DESKTOP NAVBAR: FLOATING GLASS CAPSULE */}
            <header
                className={cn(
                    "hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 w-auto max-w-7xl z-50 transition-all duration-500",
                    scrolled ? "top-4" : "top-6"
                )}
            >
                <div className={cn(
                    "flex items-center gap-2 p-2 pr-6 rounded-full border transition-all duration-500 backdrop-blur-xl shadow-2xl",
                    scrolled
                        ? "bg-[#050510]/80 border-white/10 shadow-black/50"
                        : "bg-white/5 border-white/5 shadow-black/20"
                )}>
                    {/* Brand Pill */}
                    <Link href="/dashboard" className="flex items-center gap-3 pr-4 group relative">
                        <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform border border-white/10">
                            <Brain className="h-5 w-5 relative z-10" />
                            <Sparkles className="h-3 w-3 absolute top-1 right-1 text-white/70" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 group-hover:to-white transition-all tracking-tight leading-none">
                                DegreePlanner
                            </span>
                            <span className="text-[10px] text-purple-400 font-medium tracking-wider flex items-center gap-1">
                                AI AGENT <Sparkles className="h-2 w-2" />
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Pills */}
                    <nav className="flex items-center bg-black/20 rounded-full p-1 border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link key={item.href} href={item.href} className="relative">
                                    <div className={cn(
                                        "relative px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-medium select-none group/item",
                                        isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                    )}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="desktop-navbar-active"
                                                className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-sm"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className={cn(
                                            "h-4 w-4 relative z-10 transition-colors",
                                            isActive ? "text-purple-400" : "group-hover/item:text-purple-400"
                                        )} />
                                        <span className="relative z-10">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Pill */}
                    <div className="pl-4 ml-2 border-l border-white/10 flex items-center gap-3">
                        <div className="text-right hidden xl:block">
                            <div className="text-xs font-semibold text-white">{user.email?.split('@')[0]}</div>
                            <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">Student</div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-all duration-300"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>


            {/* MOBILE NAVBAR: BOTTOM BAR (iOS Style) */}
            <header className="lg:hidden fixed top-0 inset-x-0 z-50 p-4 pt-12 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-white/10">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-white tracking-tight block leading-none">DegreePlanner</span>
                        <span className="text-[9px] text-purple-400 font-bold tracking-wider">AI AGENT</span>
                    </div>
                </div>
                <div className="pointer-events-auto">
                    <button onClick={logout} className="p-2 rounded-full bg-black/40 border border-white/10 text-zinc-400 hover:text-white backdrop-blur-md">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <nav className="fixed bottom-0 inset-x-0 bg-[#050510]/80 backdrop-blur-xl border-t border-white/10 z-50 lg:hidden pb-safe">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} className="relative group">
                                <div className={cn(
                                    "flex flex-col items-center gap-1 transition-all duration-300",
                                    isActive ? "transform -translate-y-1" : ""
                                )}>
                                    <div className={cn(
                                        "p-1.5 rounded-xl transition-all duration-300 relative",
                                        isActive ? "bg-teal-500/20" : ""
                                    )}>
                                        {isActive && (
                                            <motion.div
                                                layoutId="mobile-navbar-active"
                                                className="absolute inset-0 bg-teal-500/20 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className={cn(
                                            "h-5 w-5 transition-colors",
                                            isActive ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300"
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium transition-colors",
                                        isActive ? "text-white" : "text-zinc-500"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                    {/* More Menu Item for hidden links on mobile could go here */}
                </div>
            </nav>
        </>
    );
}
