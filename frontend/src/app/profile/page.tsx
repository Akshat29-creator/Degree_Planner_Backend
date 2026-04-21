"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProfileIntelligence, getProfileData, UserProfile, ProfileResponse, resetDatabaseData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/context/auth-context";
import {
    UserCircle,
    LogOut,
    Send,
    Loader2,
    GraduationCap,
    Target,
    User,
    CheckCircle2,
    Sparkles,
    Briefcase,
    Mail,
    Award,
    Zap,
    MessageSquare,
    ChevronRight,
    Edit2,
    RefreshCw,
    AlertTriangle,
    Calendar,
    Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DEFAULT_PROFILE: UserProfile = {
    goals: [],
    preferences: {},
    completed_onboarding: false
};

export default function ProfilePage() {
    // Persistent Profile State
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth(); // Auth context for signing out

    // Store for reset functionality
    const resetAllData = useAppStore((s) => s.resetAllData);

    // Initial Load
    useEffect(() => {
        loadProfile();
    }, []);


    const loadProfile = async () => {
        try {
            const data = await getProfileData();
            setProfile(data);

            // Check if key fields are filled - if so, treat as completed even if flag is false
            const isEssentiallyComplete = !!(data.name && data.university && data.degree_major);

            if (!data.completed_onboarding && !isEssentiallyComplete) {
                // New user - start onboarding
                handleInitialGreeting(data, "signup");
            } else {
                // Returning user or profile complete - show assist message instead
                handleInitialGreeting(data, "signin");
            }
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInitialGreeting = async (currentProfile: UserProfile, authAction: "signup" | "signin") => {
        setIsLoading(true);
        try {
            const response = await getProfileIntelligence({
                message: authAction === "signup" ? "Initialize onboarding" : "Hello, how can you help me?",
                history: [],
                auth_action: authAction
            });
            setMessages([{ role: "assistant", content: response.chat_response }]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        const newMessages = [...messages, { role: "user", content: userMsg } as const];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const authAction = profile.completed_onboarding ? "signin" : "signup";
            const response = await getProfileIntelligence({
                message: userMsg,
                history: newMessages,
                auth_action: authAction
            });

            setMessages(prev => [...prev, { role: "assistant", content: response.chat_response }]);

            if (response.suggested_updates) {
                // Preserve email - it comes from auth, not AI
                const { email: _, ...rawUpdates } = response.suggested_updates;
                
                // Filter out hallucinated placeholders
                const safeUpdates: Partial<typeof rawUpdates> = {};
                for (const [key, value] of Object.entries(rawUpdates)) {
                    if (value && typeof value === 'string' && !["...", "string", "null", "None"].includes(value)) {
                        (safeUpdates as any)[key] = value;
                    } else if (Array.isArray(value) && value.length > 0 && value[0] !== "goal1") {
                        (safeUpdates as any)[key] = value;
                    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        (safeUpdates as any)[key] = value;
                    }
                }
                
                setProfile(prev => ({ ...prev, ...safeUpdates }));
            }

            if (response.onboarding_complete && !profile.completed_onboarding) {
                setProfile(prev => ({ ...prev, completed_onboarding: true }));
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate "Profile Strength" purely for visual flair
    const calculateStrength = () => {
        let score = 0;
        if (profile.name) score += 20;
        if (profile.university) score += 20;
        if (profile.degree_major) score += 20;
        if (profile.goals && profile.goals.length > 0) score += 20;
        if (profile.preferences && Object.keys(profile.preferences).length > 0) score += 20;
        return score;
    };

    const strength = calculateStrength();

    return (
            <div className="min-h-screen bg-[#050510] relative pt-6 md:pt-32 pb-28 md:pb-12 px-4 sm:px-6">

                {/* Background Decor */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">

                    {/* Header Section - Identity Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 md:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        {/* Inner ambient glow */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                        {/* Left: Identity info */}
                        <div className="flex items-center gap-5 md:gap-6 relative z-10 w-full md:w-auto">
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-2 bg-gradient-to-br from-teal-500 to-purple-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500" />
                                <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-950 flex items-center justify-center border-4 border-[#12121a]">
                                    <span className="text-3xl md:text-4xl font-black bg-gradient-to-br from-teal-400 to-purple-400 bg-clip-text text-transparent">
                                        {profile.name ? profile.name.substring(0, 2).toUpperCase() : <UserCircle className="w-10 h-10 md:w-14 md:h-14 text-zinc-600" />}
                                    </span>
                                </div>
                                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-green-500 border-4 border-[#12121a] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs md:text-sm font-semibold text-teal-400 uppercase tracking-widest mb-1">Student Identity</div>
                                <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-1 md:mb-2 tracking-tight truncate">
                                    {profile.name || "Welcome, Student"}
                                </h1>
                                <p className="text-zinc-400 flex items-center gap-2 text-sm md:text-base font-medium">
                                    <Mail className="w-4 h-4 flex-shrink-0 opacity-70" /> <span className="truncate">{profile.email || "No email linked"}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right: Strength & Logout */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
                            <div className="flex-1 w-full sm:w-64 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-zinc-400 font-medium">Profile Strength</span>
                                    <span className={cn("font-bold", strength === 100 ? "text-emerald-400" : "text-teal-400")}>{strength}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${strength}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn("h-full rounded-full transition-all duration-500",
                                            strength === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                        )}
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={logout}
                                className="w-full sm:w-auto border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all h-12 md:h-auto"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] lg:h-[calc(100vh-22rem)]">

                        {/* LEFT: INFO BENTO GRID - Make it scrollable too */}
                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-min lg:overflow-y-auto lg:custom-scrollbar">

                            {/* Academic Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-2 glass-card p-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-teal-400" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4">Academic Profile</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">University</div>
                                        <div className="font-semibold text-white break-words whitespace-normal text-sm sm:text-base leading-tight">
                                            {profile.university || "Not set"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">Major</div>
                                        <div className="font-semibold text-white break-words whitespace-normal text-sm sm:text-base leading-tight">
                                            {profile.degree_major || "Not set"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 mb-1">Current Year</div>
                                        <div className="font-semibold text-white">
                                            {profile.academic_year || "Not set"}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Goals Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card p-6 h-full"
                            >
                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Career Goals
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.goals && profile.goals.length > 0 ? (
                                        profile.goals.map((goal, i) => (
                                            <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/20">
                                                {goal}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500 text-sm italic">No goals defined yet.</span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Preferences Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6 h-full"
                            >
                                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Preferences
                                </h3>
                                <div className="space-y-2">
                                    {profile.preferences && Object.keys(profile.preferences).length > 0 ? (
                                        Object.entries(profile.preferences).map(([key, value], i) => (
                                            <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-white/5">
                                                <span className="text-zinc-400 capitalize">{key.replace(/_/g, " ")}</span>
                                                <span className="text-white font-medium">{value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500 text-sm italic">No preferences set.</span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Settings Accordion */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="md:col-span-2 mb-6"
                            >
                                <details className="group rounded-2xl bg-[#1c1c1e]/50 border border-white/10 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-zinc-400 group-hover:text-teal-400 transition-colors" />
                                            </div>
                                            <span className="text-white font-semibold">System Settings & Data</span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-500 transition-transform duration-300 group-open:rotate-90" />
                                    </summary>
                                    
                                    <div className="border-t border-white/10 p-5 space-y-5 bg-black/20">
                                        {/* Status Footer Inside Accordion */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold flex items-center gap-2">
                                                        AI Assistant Active
                                                        {profile.completed_onboarding ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-zinc-400 mt-0.5">Helping optimize your journey</div>
                                                </div>
                                            </div>
                                            {profile.completed_onboarding ? (
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none justify-center">Onboarding Complete</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-teal-500 text-teal-400 animate-pulse justify-center">Setup in Progress</Badge>
                                            )}
                                        </div>

                                        {/* Reset All Data Card Inside Accordion */}
                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                                    <RefreshCw className="w-5 h-5 text-red-400" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold">Start Fresh</div>
                                                    <div className="text-xs text-zinc-400 mt-0.5">Clear all data and test with different subjects</div>
                                                </div>
                                            </div>
                                            <AnimatePresence mode="wait">
                                                {!showResetConfirm ? (
                                                    <motion.button
                                                        key="btn"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={(e) => { e.preventDefault(); setShowResetConfirm(true); }}
                                                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors w-full md:w-auto flex items-center justify-center"
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-2" />
                                                        Reset All Data
                                                    </motion.button>
                                                ) : (
                                                    <motion.div
                                                        key="confirm"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="flex gap-2 w-full md:w-auto"
                                                    >
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => { e.preventDefault(); setShowResetConfirm(false); }}
                                                            variant="ghost"
                                                            className="flex-1 md:flex-none text-zinc-400 hover:text-white"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={async (e) => { 
                                                                e.preventDefault();
                                                                try {
                                                                    await resetDatabaseData();
                                                                    resetAllData();
                                                                    setShowResetConfirm(false);
                                                                    toast.success("All data cleared successfully");
                                                                    window.location.href = "/planner";
                                                                } catch (err) {
                                                                    console.error("Failed to reset data", err);
                                                                    toast.error("Failed to reset account data");
                                                                }
                                                            }}
                                                            className="flex-1 md:flex-none bg-red-600 hover:bg-red-500 text-white"
                                                        >
                                                            Confirm Reset
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </details>
                            </motion.div>
                        </div>

                        {/* RIGHT: CHAT INTERFACE */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        className="lg:col-span-5 h-[480px] md:h-[600px] lg:h-full flex flex-col mb-12 lg:mb-0"
                        >
                            <div className="w-full h-full glass-card border-none bg-black/40 backdrop-blur-xl flex flex-col shadow-2xl shadow-teal-900/10">
                                {/* Chat Header */}
                                <div className="p-5 border-b border-white/5 bg-gradient-to-r from-zinc-900/90 to-zinc-900/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-teal-500 rounded-full blur-[2px] opacity-50 animate-pulse" />
                                            <div className="relative w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center border border-teal-500/30">
                                                <Sparkles className="w-4 h-4 text-teal-400" />
                                            </div>
                                        </div>
                                        <span className="font-semibold text-white">Profile Assistant</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="text-zinc-500 hover:text-white rounded-full">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-black/20">
                                    <AnimatePresence mode="popLayout">
                                        {messages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn(
                                                    "flex items-start gap-3 max-w-[90%]",
                                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                                    msg.role === "user" ? "bg-zinc-800 border-zinc-700" : "bg-teal-950/30 border-teal-500/20"
                                                )}>
                                                    {msg.role === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-4 h-4 text-teal-400" />}
                                                </div>
                                                <div className={cn(
                                                    "p-3.5 px-5 rounded-2xl text-sm leading-relaxed shadow-lg",
                                                    msg.role === "user"
                                                        ? "bg-gradient-to-br from-zinc-800 to-zinc-900 text-white rounded-tr-none border border-white/5"
                                                        : "bg-gradient-to-br from-teal-950/40 to-black/40 text-zinc-200 rounded-tl-none border border-teal-500/10 backdrop-blur-md"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-3 mr-auto"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-teal-950/30 border border-teal-500/20 flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4 text-teal-400" />
                                                </div>
                                                <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 flex gap-1 items-center h-10">
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input - iMessage style */}
                                <div className="p-3 bg-zinc-900/50 backdrop-blur-md border-t border-white/5">
                                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl px-4 pr-1.5 py-1.5">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                            placeholder="Ask or update your profile..."
                                            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-zinc-600"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!input.trim() || isLoading}
                                            className="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
    );
}
