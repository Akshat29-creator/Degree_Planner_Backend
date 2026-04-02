"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudyBuddySupport, StudyBuddyResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreamingText } from "@/components/ui/typewriter";
import {
    Heart,
    Coffee,
    AlertCircle,
    CheckCircle2,
    CalendarX,
    TrendingDown,
    Loader2,
    ArrowRight,
    Smile,
    MessageCircle,
    Send,
    User,
    BookOpen,
    GraduationCap,
    Brain,
    CalendarDays,
    Clock,
    Target,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureGate } from "@/components/feature-gate";

type SignalType = "missed_session" | "incomplete_plan" | "inactivity" | "overload" | "consistency_drop" | "none";
type ModeType = "behavioral" | "academic";

const SIGNALS: { id: SignalType; label: string; icon: any; color: string }[] = [
    { id: "missed_session", label: "Missed Session", icon: CalendarX, color: "text-red-400" },
    { id: "overload", label: "Feeling Overwhelmed", icon: AlertCircle, color: "text-orange-400" },
    { id: "consistency_drop", label: "Hard to Start", icon: TrendingDown, color: "text-yellow-400" },
    { id: "none", label: "Just Checking In", icon: Smile, color: "text-blue-400" },
];

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean; 
}

export default function StudyBuddyPage() {
    const [mode, setMode] = useState<ModeType>("behavioral");
    const [selectedSignal, setSelectedSignal] = useState<SignalType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [initialSupport, setInitialSupport] = useState<StudyBuddyResponse | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, initialSupport]);

    const switchMode = (newMode: ModeType) => {
        setMode(newMode);
        setSelectedSignal(null);
        setInitialSupport(null);
        setMessages([]);
        setInput("");
    };

    const handleGetSupport = async () => {
        if (!selectedSignal) return;

        setIsLoading(true);
        setInitialSupport(null);
        setMessages([]);

        try {
            const response = await getStudyBuddySupport({
                signal: selectedSignal,
                mode: "behavioral",
                duration_days: selectedSignal === "inactivity" ? 3 : undefined,
            });
            setInitialSupport(response);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (overrideMessage?: string) => {
        const messageToSend = overrideMessage || input.trim();
        if (!messageToSend || isLoading) return;

        setInput("");

        const newMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: messageToSend }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await getStudyBuddySupport({
                message: messageToSend,
                mode: mode,
                history: newMessages.map(m => ({ role: m.role, content: m.content })),
                signal: mode === "behavioral" ? (selectedSignal || undefined) : undefined
            });

            if (response.chat_response) {
                setMessages(prev => [...prev, { role: "assistant", content: response.chat_response!, isStreaming: true }]);
                const wordCount = response.chat_response!.split(' ').length;
                setTimeout(() => {
                    setMessages(prev => prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, isStreaming: false } : m
                    ));
                }, wordCount * 60 + 500); 
            } else if (response.encouragement && mode === "behavioral") {
                setMessages(prev => [...prev, { role: "assistant", content: response.encouragement!, isStreaming: true }]);
                const wordCount = response.encouragement!.split(' ').length;
                setTimeout(() => {
                    setMessages(prev => prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, isStreaming: false } : m
                    ));
                }, wordCount * 60 + 500);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FeatureGate featureKey="page_buddy" featureName="Study Buddy">
        <div className="flex flex-col h-[100dvh] md:h-auto md:min-h-screen md:container md:mx-auto md:max-w-6xl md:px-4 md:py-8 md:pt-32 md:pb-24">

            {/* Compact Header */}
            <div className="flex-shrink-0 px-4 pt-safe md:px-0">
                <div className="md:text-left mb-6 md:mb-12">
                    <div className="flex gap-2 mb-4 md:justify-start md:gap-4">
                        <button
                            onClick={() => switchMode("behavioral")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm font-bold shadow-lg shadow-pink-600/10",
                                mode === "behavioral"
                                    ? "bg-pink-600 text-white"
                                    : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"
                            )}
                        >
                            <Heart className={cn("h-4 w-4", mode === "behavioral" && "fill-current")} />
                            <span>Mental Support</span>
                        </button>
                        <button
                            onClick={() => switchMode("academic")}
                            className={cn(
                                "flex-1 md:flex-none px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm font-bold shadow-lg shadow-cyan-600/10",
                                mode === "academic"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"
                            )}
                        >
                            <BookOpen className={cn("h-4 w-4", mode === "academic" && "fill-current")} />
                            <span>Academic Tutor</span>
                        </button>
                    </div>

                    <div className="hidden md:block">
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Study Buddy AI</h1>
                        <p className="text-zinc-500 font-medium">Your personal companion for academic and emotional success.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">

                {/* Left Controls/Info */}
                <div className="lg:col-span-4 space-y-6">
                    {mode === "behavioral" ? (
                        <div className="glass-card p-6 space-y-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Smile className="h-5 w-5 text-pink-400" />
                                How are you feeling?
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                {SIGNALS.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setSelectedSignal(s.id);
                                            setInitialSupport(null);
                                            setMessages([]);
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                                            selectedSignal === s.id
                                                ? "bg-pink-600/10 border-pink-500/50 shadow-lg shadow-pink-500/10"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className={cn("p-2.5 rounded-xl bg-black/40", s.color)}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <span className={cn(
                                            "font-bold text-sm transition-colors",
                                            selectedSignal === s.id ? "text-white" : "text-zinc-400 group-hover:text-white"
                                        )}>
                                            {s.label}
                                        </span>
                                        {selectedSignal === s.id && (
                                            <motion.div layoutId="check" className="ml-auto">
                                                <CheckCircle2 className="h-4 w-4 text-pink-500" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <Button
                                onClick={handleGetSupport}
                                disabled={!selectedSignal || isLoading}
                                className="w-full py-6 rounded-2xl text-base font-bold bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/20 disabled:opacity-50"
                            >
                                {isLoading && !initialSupport ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5" />
                                        Talk to Buddy
                                    </div>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="glass-card p-6 space-y-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-cyan-400" />
                                Academic Doubts
                            </h2>
                            <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 space-y-4">
                                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                    I can explain concepts, solve problems, or give you practice questions for any subject.
                                </p>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">Suggested topics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["Calculus", "Data Structures", "Organic Chem", "History"].map(tag => (
                                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/10 text-[11px] font-bold text-cyan-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Chat Section */}
                <div className="lg:col-span-8 relative min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {messages.length === 0 && !initialSupport ? (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex-1 flex flex-col items-center justify-center p-8 min-h-[500px]"
                            >
                                <div className={cn(
                                    "w-20 h-20 rounded-3xl flex items-center justify-center mb-10 relative",
                                    mode === "behavioral" ? "bg-pink-500/20 text-pink-400" : "bg-cyan-500/20 text-cyan-400"
                                )}>
                                    <div className={cn(
                                        "absolute inset-0 rounded-3xl animate-ping opacity-20",
                                        mode === "behavioral" ? "bg-pink-500" : "bg-cyan-500"
                                    )} />
                                    {mode === "behavioral" ? <Brain className="h-10 w-10 relative z-10" /> : <BookOpen className="h-10 w-10 relative z-10" />}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 text-center tracking-tight">
                                    {mode === "behavioral" ? "Stuck on something?" : "How's the studying going?"}
                                </h3>
                                <p className="text-zinc-400 mb-12 max-w-sm text-center text-sm md:text-base font-medium leading-relaxed">
                                    {mode === "behavioral" 
                                        ? "I'm here to listen and help you find your focus again. Totally anonymous, zero judgment."
                                        : "Your AI academic tutor is ready. Ask me to explain a concept or create a study plan."}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                                    {(mode === "behavioral" ? [
                                        { icon: Coffee, title: "I'm feeling burnt out", text: "Help me handle exam stress" },
                                        { icon: Clock, title: "Procrastinating", text: "I can't seem to start this project" },
                                        { icon: TrendingDown, title: "Lost motivation", text: "Why am I doing this degree again?" },
                                        { icon: AlertCircle, title: "Panic mode", text: "I have an exam tomorrow and I'm not ready" }
                                    ] : [
                                        { icon: Brain, title: "Explain a concept", text: "Explain backpropagation in neural networks" },
                                        { icon: Target, title: "Practice plan", text: "Create a 2-hour intensive study block" },
                                        { icon: GraduationCap, title: "Career advice", text: "What projects should I do for Data Science?" },
                                        { icon: Send, title: "Quick summary", text: "Summarize the key points of OS architecture" }
                                    ]).map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(suggestion.text)}
                                            className="flex flex-col text-left p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden active:scale-95 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <suggestion.icon className={cn(
                                                    "h-5 w-5 transition-transform group-hover:scale-110",
                                                    mode === "behavioral" ? "text-pink-400" : "text-cyan-400"
                                                )} />
                                                <span className="font-bold text-white text-sm tracking-tight">{suggestion.title}</span>
                                            </div>
                                            <span className="text-xs text-zinc-500 group-hover:text-zinc-400 line-clamp-1">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat-interface"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={cn(
                                    "flex-1 flex flex-col glass-card p-0 border-t-4 overflow-hidden h-[65vh] lg:h-[700px] shadow-2xl",
                                    mode === "behavioral" ? "border-t-pink-500 shadow-pink-500/5" : "border-t-cyan-500 shadow-cyan-500/5"
                                )}
                            >
                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-4 md:p-6 space-y-6">
                                    {/* Behavioral Observation Section */}
                                    {mode === "behavioral" && initialSupport && (
                                        <div className="p-6 space-y-6 bg-white/5 rounded-3xl mb-6 border border-white/5">
                                            <div>
                                                <h3 className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-3">Buddy's Reflection</h3>
                                                <p className="text-zinc-300 leading-relaxed text-sm font-medium">{initialSupport.observation}</p>
                                            </div>
                                            {initialSupport.encouragement && (
                                                <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10">
                                                    <p className="text-pink-100 italic text-sm font-medium leading-relaxed">"{initialSupport.encouragement}"</p>
                                                </div>
                                            )}
                                            {initialSupport.next_small_action && (
                                                <div className="flex items-start gap-4 p-5 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                                                    <div className="p-2 bg-teal-500/20 rounded-xl shrink-0">
                                                        <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{initialSupport.next_small_action}</p>
                                                        <p className="text-teal-400/60 text-[10px] uppercase font-black tracking-widest mt-1">Next Step</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Messages */}
                                    <div className="space-y-6">
                                        {messages.map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={cn("flex gap-4 items-end", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                                            >
                                                {msg.role !== "user" && (
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mb-1 shadow-xl",
                                                        mode === "behavioral" ? "bg-pink-600/30 ring-1 ring-pink-500/20" : "bg-cyan-600/30 ring-1 ring-cyan-500/20"
                                                    )}>
                                                        {mode === "behavioral" ? <Heart className="h-4 w-4 text-pink-400" /> : <GraduationCap className="h-4 w-4 text-cyan-400" />}
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "px-6 py-4 rounded-[2rem] text-[15px] max-w-[85%] leading-relaxed shadow-xl",
                                                    msg.role === "user"
                                                        ? "bg-white/10 text-white rounded-br-none border border-white/5"
                                                        : (mode === "behavioral"
                                                            ? "bg-pink-500/10 text-pink-50 border border-pink-500/10 rounded-bl-none"
                                                            : "bg-cyan-500/10 text-cyan-50 border border-cyan-500/10 rounded-bl-none")
                                                )}>
                                                    <div className="whitespace-pre-wrap font-medium">
                                                        {msg.role === "assistant" && msg.isStreaming ? (
                                                            <StreamingText text={msg.content} speed={25} />
                                                        ) : (
                                                            msg.content
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isLoading && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                                                <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg", mode === "behavioral" ? "bg-pink-600/30" : "bg-cyan-600/30")}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                </div>
                                                <div className="flex gap-1.5 px-6 py-4 rounded-[2rem] rounded-bl-none bg-white/5 border border-white/10 shadow-xl">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ALWAYS VISIBLE Sticky Input Area */}
                    <div className={cn(
                        "mt-auto p-5 border-t border-white/5 bg-[#050510]/95 backdrop-blur-3xl shrink-0 z-20 rounded-3xl md:rounded-b-3xl md:rounded-t-none transition-all",
                        messages.length === 0 && !initialSupport ? "w-full max-w-2xl mx-auto border-t-0 bg-transparent" : "glass-card border-x-0 border-b-0 rounded-none border-t border-white/5"
                    )}>
                        {/* Mobile prompt suggestions */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 mask-fade-right">
                            {(mode === "behavioral" ? ["Feeling stuck", "Need a break", "Explain this"] : ["How to study?", "Summarize", "Quiz me"]).map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => setInput(prev => prev + (prev ? " " : "") + chip)}
                                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[2.5rem] px-6 pr-2 py-2.5 group focus-within:border-white/20 transition-all shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder={mode === "behavioral" ? "Talk to Buddy..." : "Ask your doubt..."}
                                className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-white placeholder-zinc-500 font-medium"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-20",
                                    mode === "behavioral" ? "bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/20" : "bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-600/20"
                                )}
                            >
                                <Send className="h-4 w-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </FeatureGate>
    );
}
