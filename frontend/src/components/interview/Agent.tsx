"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, Volume2, Globe, Cpu, Activity, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants/interview";
import { createInterviewFeedback } from "@/lib/actions/interview.action";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

interface AgentProps {
    userName: string;
    odId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
}

const Agent = ({
    userName,
    odId,
    interviewId,
    feedbackId,
    type,
    questions,
}: AgentProps) => {
    const router = useRouter();
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false); // AI Speaking
    const [lastMessage, setLastMessage] = useState<string>("");

    // For rendering scrolling transcript
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, lastMessage]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: any) => {
            if (
                message.type === "transcript" &&
                message.transcriptType === "final" &&
                message.transcript &&
                message.role
            ) {
                const newMessage = {
                    role: message.role as "user" | "system" | "assistant",
                    content: message.transcript,
                };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            console.log("Error:", error);
            if (error.message === "Meeting has ended") {
                setCallStatus(CallStatus.FINISHED);
                toast.error("Call ended. Generating feedback...");
            }
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }

        const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
            try {
                if (!interviewId || !odId) {
                    router.push("/interview");
                    return;
                }

                // Show loading toast
                const toastId = toast.loading("Analyzing interview performance...");

                const { success, feedbackId: id } = await createInterviewFeedback({
                    interviewId: interviewId,
                    odId: odId,
                    transcript: msgs,
                    feedbackId,
                });

                if (success && id) {
                    toast.dismiss(toastId);
                    toast.success("Feedback ready!");
                    router.push(`/interview/${interviewId}/feedback`);
                } else {
                    toast.dismiss(toastId);
                    toast.error("Failed to save feedback.");
                    router.push("/interview");
                }
            } catch (error) {
                console.error("Error generating feedback:", error);
                router.push("/interview");
            }
        };

        const handleCallEnded = async () => {
            if (type === "generate") {
                router.push("/interview");
            } else {
                await handleGenerateFeedback(messages);
            }
        };

        if (callStatus === CallStatus.FINISHED) {
            handleCallEnded();
        }
    }, [messages, callStatus, feedbackId, interviewId, odId, router, type]); // Added missing dependencies

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        try {
            if (type === "generate") {
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                    variableValues: { username: userName, userid: odId || "" },
                });
            } else {
                let formattedQuestions = "";
                if (questions) {
                    formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
                }
                await vapi.start(interviewer, {
                    variableValues: { questions: formattedQuestions },
                });
            }
        } catch (error) {
            console.error("Failed to start call:", error);
            setCallStatus(CallStatus.INACTIVE);
            toast.error("Failed to start call.");
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-[#0a0a0f] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
            {/* Command Center Overlay */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-20" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-20" />
            </div>

            {/* Header / Status Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-500",
                        callStatus === CallStatus.ACTIVE ? "bg-green-500 shadow-[0_0_10px_#22c55e]" :
                            callStatus === CallStatus.CONNECTING ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                    )} />
                    <span className="text-xs font-mono text-gray-400">
                        {callStatus === CallStatus.ACTIVE ? "LIVE CONNECTION" :
                            callStatus === CallStatus.CONNECTING ? "ESTABLISHING UPLINK..." : "OFFLINE"}
                    </span>
                </div>
                <div className="flex gap-4 text-gray-500">
                    <Volume2 className="w-4 h-4" />
                    <Activity className="w-4 h-4" />
                    <Globe className="w-4 h-4" />
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 relative flex items-center justify-center bg-grid-white/[0.02] z-10">

                {/* AI AVATAR / VISUALIZER */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Outer Glow Rings - Animate when AI speaks */}
                        <div className={cn(
                            "absolute inset-0 rounded-full border border-purple-500/30 transition-all duration-300",
                            isSpeaking ? "scale-150 opacity-40 blur-sm" : "scale-100 opacity-20"
                        )} />
                        <div className={cn(
                            "absolute inset-0 rounded-full border border-teal-500/30 transition-all duration-300 delay-75",
                            isSpeaking ? "scale-125 opacity-40 blur-md" : "scale-100 opacity-20"
                        )} />

                        {/* Core Visualizer */}
                        <div className="w-32 h-32 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />

                            {/* Animated Bars */}
                            <div className="flex items-end gap-1 h-12">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: "20%" }}
                                        animate={{
                                            height: isSpeaking ? ["20%", "80%", "30%", "100%", "40%"] : "10%",
                                            backgroundColor: isSpeaking ? "#a855f7" : "#334155"
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            delay: i * 0.1
                                        }}
                                        className="w-2 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <h3 className="text-xl font-bold text-white tracking-widest">AI INTERVIEWER</h3>
                        <p className={cn(
                            "text-xs font-mono mt-1 transition-colors",
                            isSpeaking ? "text-purple-400 animate-pulse" : "text-gray-500"
                        )}>
                            {isSpeaking ? "• SPEAKING •" : "LISTENING..."}
                        </p>
                    </div>
                </div>

                {/* User Bubble (Bottom Right) */}
                <div className="absolute bottom-8 right-8">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-2 pr-4 backdrop-blur-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white leading-none">{userName}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Candidate</span>
                        </div>
                    </div>
                </div>

                {/* Transcript Overlay (Fade In) */}
                {messages.length > 0 && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl z-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={lastMessage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center shadow-2xl"
                            >
                                <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-2">
                                    "{lastMessage}"
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-white/5 border-t border-white/10 flex items-center justify-center gap-6 z-10 relative">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        onClick={handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                        className="group relative px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/40 flex items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Phone className="w-5 h-5 fill-current" />
                        {callStatus === CallStatus.CONNECTING ? "CONNECTING..." : "START INTERVIEW"}
                    </button>
                ) : (
                    <button
                        onClick={handleDisconnect}
                        className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 hover:border-red-500 font-bold rounded-xl transition-all flex items-center gap-2"
                    >
                        <PhoneOff className="w-5 h-5" />
                        END CALL
                    </button>
                )}
            </div>
        </div>
    );
};

export default Agent;
