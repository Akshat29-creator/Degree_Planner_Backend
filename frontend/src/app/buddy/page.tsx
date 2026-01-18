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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    isStreaming?: boolean; // For typing animation
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

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");

        const newMessages: ChatMessage[] = [
            ...messages,
            { role: "user", content: userMsg }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await getStudyBuddySupport({
                message: userMsg,
                mode: mode,
                history: newMessages.map(m => ({ role: m.role, content: m.content })),
                signal: mode === "behavioral" ? (selectedSignal || undefined) : undefined
            });

            if (response.chat_response) {
                // Add message with streaming flag for typing animation
                setMessages(prev => [...prev, { role: "assistant", content: response.chat_response!, isStreaming: true }]);

                // Turn off streaming after animation completes (approx time based on word count)
                const wordCount = response.chat_response!.split(' ').length;
                setTimeout(() => {
                    setMessages(prev => prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, isStreaming: false } : m
                    ));
                }, wordCount * 60 + 500); // 60ms per word + buffer
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
        <div className="container mx-auto max-w-4xl px-4 py-8 pt-32">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-4">
                    {mode === "behavioral" ? <Heart className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                    {mode === "behavioral" ? "Behavioral Support System" : "Academic Tutor Support"}
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Your Study Buddy</h1>
                <p className="text-zinc-400 max-w-lg mx-auto mb-6">
                    {mode === "behavioral"
                        ? "A judgment-free zone to help you get back on track."
                        : "Ask specific subject doubts and clear concepts instantly."}
                </p>

                {/* Mode Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => switchMode("behavioral")}
                        className={cn(
                            "px-6 py-2 rounded-full flex items-center gap-2 transition-all",
                            mode === "behavioral"
                                ? "bg-pink-600 text-white font-medium"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        )}
                    >
                        <Heart className="h-4 w-4" />
                        Behavioral
                    </button>
                    <button
                        onClick={() => switchMode("academic")}
                        className={cn(
                            "px-6 py-2 rounded-full flex items-center gap-2 transition-all",
                            mode === "academic"
                                ? "bg-cyan-600 text-white font-medium"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        Academic Help
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {mode === "behavioral" ? (
                    // BEHAVIORAL MODE: SIGNAL SELECTOR
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white">How are things going?</h2>
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
                                        "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                                        selectedSignal === s.id
                                            ? "bg-white/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                    )}
                                >
                                    <div className={cn("p-3 rounded-full bg-black/40", s.color)}>
                                        <s.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <span className={cn(
                                            "block font-medium transition-colors",
                                            selectedSignal === s.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                                        )}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {selectedSignal === s.id && (
                                        <motion.div layoutId="check" className="ml-auto">
                                            <CheckCircle2 className="h-5 w-5 text-pink-500" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={handleGetSupport}
                            disabled={!selectedSignal || isLoading}
                            className="w-full py-6 text-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
                        >
                            {isLoading && !initialSupport ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Finding Support...
                                </>
                            ) : (
                                <>
                                    <Coffee className="mr-2 h-5 w-5" />
                                    Get Support
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    // ACADEMIC MODE: INSTRUCTION CARD
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white">Ask your doubts</h2>
                        <div className="p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-4">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <GraduationCap className="h-6 w-6" />
                                <h3 className="font-bold">Academic Tutor Mode</h3>
                            </div>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                I can help you understand complex concepts, clear specific doubts, or find examples for your subjects.
                            </p>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Try asking:</p>
                                <ul className="text-sm text-zinc-400 space-y-1 list-disc pl-4">
                                    <li>"Explain the Krebs cycle briefly."</li>
                                    <li>"What is the difference between TCP and UDP?"</li>
                                    <li>"Give me an example of a recursive function."</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}


                {/* Output & Chat Section (SHARED LAYOUT) */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {(initialSupport || mode === "academic" || messages.length > 0) ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "glass-card p-0 border-t-4 overflow-hidden flex flex-col h-[600px]",
                                    mode === "behavioral" ? "border-t-pink-500" : "border-t-cyan-500"
                                )}
                            >
                                {/* Scrollable Content Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar">

                                    {/* Behavioral: Initial Diagnosis Section */}
                                    {mode === "behavioral" && initialSupport && (
                                        <div className="p-8 space-y-6 bg-black/20">
                                            <div>
                                                <h3 className="text-xs font-bold text-zinc-500 tracking-wider uppercase mb-2">Observation</h3>
                                                <p className="text-zinc-300 leading-relaxed">{initialSupport.observation}</p>
                                            </div>

                                            {initialSupport.encouragement && (
                                                <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
                                                    <h3 className="text-xs font-bold text-pink-400 tracking-wider uppercase mb-2 flex items-center gap-2">
                                                        <Heart className="h-3 w-3" />
                                                        Encouragement
                                                    </h3>
                                                    <p className="text-pink-100 italic">"{initialSupport.encouragement}"</p>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-xs font-bold text-teal-500 tracking-wider uppercase mb-3 flex items-center gap-2">
                                                    <ArrowRight className="h-3 w-3" />
                                                    Next Small Action
                                                </h3>
                                                <div className="flex items-start gap-4 p-4 bg-teal-500/10 rounded-xl border border-teal-500/20">
                                                    <div className="p-2 bg-teal-500/20 rounded-full shrink-0">
                                                        <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-lg">{initialSupport.next_small_action}</p>
                                                        <p className="text-teal-400/60 text-sm mt-1">≤ 15 minutes • High Impact</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chat Invitation Divider */}
                                            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                                <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                    You can talk freely here. I'll listen for a bit.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Academic: Initial Welcome */}
                                    {mode === "academic" && messages.length === 0 && (
                                        <div className="p-8 text-center space-y-4">
                                            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                                                <BookOpen className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-medium text-white">Ready to help!</h3>
                                            <p className="text-zinc-400 text-sm">Type your question below to start the session.</p>
                                        </div>
                                    )}

                                    {/* Chat Messages */}
                                    <div className="p-6 space-y-4 bg-black/40 min-h-[200px]">
                                        {messages.map((msg, idx) => (
                                            <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                    msg.role === "user" ? "bg-zinc-700" : (mode === "behavioral" ? "bg-pink-600/20" : "bg-cyan-600/20")
                                                )}>
                                                    {msg.role === "user" ? <User className="h-4 w-4" /> : (mode === "behavioral" ? <Heart className="h-4 w-4 text-pink-400" /> : <GraduationCap className="h-4 w-4 text-cyan-400" />)}
                                                </div>
                                                <div className={cn(
                                                    "p-3 rounded-lg text-sm max-w-[80%]",
                                                    msg.role === "user"
                                                        ? "bg-zinc-800 text-zinc-200"
                                                        : (mode === "behavioral" ? "bg-pink-500/10 text-pink-100 border border-pink-500/10" : "bg-cyan-500/10 text-cyan-100 border border-cyan-500/10")
                                                )}>
                                                    <p className="whitespace-pre-wrap">
                                                        {msg.role === "assistant" && msg.isStreaming ? (
                                                            <StreamingText text={msg.content} speed={50} />
                                                        ) : (
                                                            msg.content
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Fixed Chat Input Footer */}
                                <div className="p-4 border-t border-white/10 bg-black/60 flex gap-2 shrink-0 z-10 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder={mode === "behavioral" ? "Talk about it..." : "Ask an academic doubt..."}
                                        className={cn(
                                            "bg-zinc-900/50 border-white/10",
                                            mode === "behavioral" ? "focus-visible:ring-pink-500/50" : "focus-visible:ring-cyan-500/50"
                                        )}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !input.trim()}
                                        className={cn(
                                            mode === "behavioral" ? "bg-pink-600 hover:bg-pink-700" : "bg-cyan-600 hover:bg-cyan-700"
                                        )}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-30"
                            >
                                {mode === "behavioral" ? (
                                    <>
                                        <Heart className="h-24 w-24 mb-4 text-pink-300" />
                                        <p className="text-xl font-light text-white">No judgment.</p>
                                        <p className="text-lg font-light text-white">Just support.</p>
                                    </>
                                ) : (
                                    <>
                                        <BookOpen className="h-24 w-24 mb-4 text-cyan-300" />
                                        <p className="text-xl font-light text-white">Ask anything.</p>
                                        <p className="text-lg font-light text-white">Clear your doubts.</p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
