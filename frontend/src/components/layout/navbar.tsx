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
    Clock,
    Mic,
    Grid3X3,
    ChevronUp,
    X,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";

const navItems = [
    { href: "/dashboard",   label: "Home",        icon: LayoutDashboard },
    { href: "/planner",     label: "Plan",        icon: Calendar },
    { href: "/study",       label: "Study",       icon: Brain },
    { href: "/revision",    label: "Revision",    icon: Repeat },
    { href: "/performance", label: "Analytics",   icon: Grid3X3 },
];

// All items that live in the "More" sheet
const moreItems = [
    { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    { href: "/planner",     label: "Plan",        icon: Calendar },
    { href: "/graph",       label: "Map",         icon: GitBranch },
    { href: "/advisor",     label: "Advisor",     icon: Bot },
    { href: "/study",       label: "Study",       icon: Brain },
    { href: "/revision",    label: "Revision",    icon: Repeat },
    { href: "/buddy",       label: "Buddy",       icon: Heart },
    { href: "/interview",   label: "Interview",   icon: Mic },
    { href: "/transcript",  label: "Transcript",  icon: FileText },
    { href: "/history",     label: "History",     icon: Clock },
    { href: "/performance", label: "Analytics",   icon: Grid3X3 },
    { href: "/profile",     label: "Me",          icon: UserCircle },
];


export function Navbar() {
    const pathname = usePathname();
    const { user, logout, isLoading } = useAuth();
    const [scrolled, setScrolled]     = useState(false);
    const [moreOpen, setMoreOpen]     = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close sheet when route changes
    useEffect(() => { setMoreOpen(false); }, [pathname]);

    if (isLoading) return null;
    if (!user)     return null;

    return (
        <>
            {/* ─── DESKTOP NAVBAR (unchanged, floating capsule) ─── */}
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
                    {/* Brand */}
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

                    {/* Nav pills */}
                    <nav className="flex items-center bg-black/20 rounded-full p-1 border border-white/5">
                        {moreItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href} className="relative">
                                    <div className={cn(
                                        "relative px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 text-xs font-bold tracking-wide select-none group/item",
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

                    {/* User avatar + logout */}
                    <div className="pl-5 ml-4 border-l border-white/10 flex items-center gap-3">
                        <div className="text-right hidden xl:flex flex-col items-end whitespace-nowrap">
                            <div className="text-xs font-semibold text-white">
                                {user?.email?.split("@")[0] || "Guest"}
                            </div>
                            <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">Student</div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-9 h-9 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex-shrink-0 flex items-center justify-center transition-all duration-300"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── MOBILE BOTTOM NAV ─── */}
            {/* Backdrop for "More" sheet */}
            <AnimatePresence>
                {moreOpen && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setMoreOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* "More" Sheet — slides up from bottom */}
            <AnimatePresence>
                {moreOpen && (
                    <motion.div
                        key="more-sheet"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 350 }}
                        className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[#0a0a12] border-t border-white/10 rounded-t-3xl pb-24 pt-3 px-4"
                    >
                        {/* Drag handle */}
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />

                        {/* Close button */}
                        <button
                            onClick={() => setMoreOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-2 mb-4">All Features</h2>

                        {/* 3-column grid of all features */}
                        <div className="grid grid-cols-3 gap-3">
                            {moreItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMoreOpen(false)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all active:scale-95",
                                            isActive
                                                ? "bg-purple-500/15 border border-purple-500/30"
                                                : "bg-white/5 border border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                            isActive
                                                ? "bg-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                                                : "bg-white/8"
                                        )}>
                                            <Icon className={cn(
                                                "h-5 w-5",
                                                isActive ? "text-purple-300" : "text-gray-400"
                                            )} />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold",
                                            isActive ? "text-purple-300" : "text-gray-400"
                                        )}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Sign out row */}
                        <button
                            onClick={() => { logout(); setMoreOpen(false); }}
                            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-semibold active:scale-95 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The bottom bar itself */}
            <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden">
                {/* Frosted glass bar */}
                <div className="mx-3 mb-3 rounded-2xl bg-[#0a0a12]/85 backdrop-blur-2xl border border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-around px-1 py-1">

                        {/* First 2 tabs */}
                        {navItems.slice(0, 2).map((item) => (
                            <MobileNavTab key={item.href} item={item} isActive={pathname === item.href} />
                        ))}

                        {/* Centre "More" button — pill design like Instagram's + */}
                        <button
                            onClick={() => setMoreOpen(true)}
                            className="relative flex flex-col items-center justify-center -mt-5"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 shadow-[0_0_24px_rgba(168,85,247,0.5)] flex flex-col items-center justify-center border border-white/15"
                            >
                                <Grid3X3 className="w-5 h-5 text-white" />
                            </motion.div>
                            <span className="text-[9px] font-bold text-purple-400 mt-1.5 tracking-wide">MORE</span>
                        </button>

                        {/* Last 2 tabs */}
                        {navItems.slice(3).map((item) => (
                            <MobileNavTab key={item.href} item={item} isActive={pathname === item.href} />
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
}

/* ── Single tab item component ── */
function MobileNavTab({
    item,
    isActive,
}: {
    item: { href: string; label: string; icon: React.ElementType };
    isActive: boolean;
}) {
    const Icon = item.icon;

    return (
        <Link href={item.href} className="relative min-w-[56px] flex flex-col items-center py-2 px-3 group">
            {/* Active pill indicator */}
            {isActive && (
                <motion.div
                    layoutId="mobile-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/8"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
            )}

            {/* Icon */}
            <div className="relative">
                <Icon className={cn(
                    "h-[22px] w-[22px] transition-all duration-300",
                    isActive ? "text-purple-400 scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                )} />

                {/* Active dot under icon */}
                {isActive && (
                    <motion.span
                        layoutId="mobile-active-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                )}
            </div>

            {/* Label */}
            <span className={cn(
                "text-[10px] font-semibold mt-1.5 transition-colors",
                isActive ? "text-purple-300" : "text-zinc-600 group-hover:text-zinc-400"
            )}>
                {item.label}
            </span>
        </Link>
    );
}
