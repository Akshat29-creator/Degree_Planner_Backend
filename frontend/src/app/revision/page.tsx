"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    generateRevisionStrategy, 
    analyzeDocument, 
    explainTopic, 
    DocumentAnalysisResponse, 
    TopicExplanationResponse,
    generateAssessmentTest,
    evaluateAssessmentTest,
    AssessmentTestResponse,
    EvaluateAssessmentResponse,
    AssessmentAnswerPayload,
    getAssessmentDocumentDetail
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Repeat,
    Zap,
    Brain,
    Calendar,
    AlertTriangle,
    Loader2,
    Sparkles,
    CheckCircle2,
    Clock,
    Plus,
    X,
    Upload,
    FileText,
    BookOpen,
    ChevronRight,
    ChevronLeft,
    Info,
    ClipboardCheck,
    PlayCircle,
    TestTube2,
    Target,
    Send,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import PracticePanel from "@/components/revision/PracticePanel";
import { FeatureGate } from "@/components/feature-gate";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// ==========================================
// INTERACTIVE TOPIC CARD
// ==========================================
function InteractiveTopicCard({
    topic,
    onClick,
}: {
    topic: { name: string; difficulty: string };
    onClick: () => void;
}) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "relative w-full h-32 flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-lg overflow-hidden",
                "bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105 hover:shadow-xl",
                topic.difficulty === "Hard" && "hover:border-red-500/50",
                topic.difficulty === "Medium" && "hover:border-yellow-500/50",
                topic.difficulty === "Easy" && "hover:border-green-500/50"
            )}
        >
            <div className={cn(
                "absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-20",
                topic.difficulty === "Hard" ? "bg-red-500" : topic.difficulty === "Medium" ? "bg-yellow-500" : "bg-green-500"
            )} />

            <div className="flex justify-between items-start z-10">
                <Badge className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border-0",
                    topic.difficulty === "Easy" && "bg-green-500/20 text-green-400",
                    topic.difficulty === "Medium" && "bg-yellow-500/20 text-yellow-400",
                    topic.difficulty === "Hard" && "bg-red-500/20 text-red-500"
                )}>
                    {topic.difficulty}
                </Badge>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Brain className="w-4 h-4 text-purple-400" />
                </div>
            </div>
            
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 z-10 mt-auto">
                {topic.name}
            </h3>
        </div>
    );
}

// ==========================================
// EXPLANATION MODAL (Interactive Testing Hub)
// ==========================================
function TopicExplanationModal({
    isOpen,
    onClose,
    topicName,
    difficulty,
    subjectName,
    docId,
}: {
    isOpen: boolean;
    onClose: () => void;
    topicName: string | null;
    difficulty: string | null;
    subjectName: string;
    docId?: number;
}) {
    type ModalView = 'explanation' | 'configure' | 'learning' | 'testing' | 'evaluating';
    const [view, setView] = useState<ModalView>('explanation');
    
    // AI Explanation State
    const [explanation, setExplanation] = useState<TopicExplanationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Test Config State
    const [mcqCount, setMcqCount] = useState<number>(1);
    const [shortCount, setShortCount] = useState<number>(0);
    const [longCount, setLongCount] = useState<number>(0);
    const [testMode, setTestMode] = useState<'learning' | 'testing'>('learning');
    
    // Test Execution State
    const [testResponse, setTestResponse] = useState<AssessmentTestResponse | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [evaluationData, setEvaluationData] = useState<EvaluateAssessmentResponse | null>(null);

    // Fetch deep explanation on open main view
    useEffect(() => {
        let isMounted = true;
        if (!isOpen || !topicName) return;
        
        // Reset everything when reopening for a new topic
        setView('explanation');
        setTestResponse(null);
        setEvaluationData(null);
        setUserAnswers({});
        setMcqCount(1);
        setShortCount(0);
        setLongCount(0);
        
        const fetchExplanation = async () => {
            setIsLoading(true);
            setExplanation(null);
            try {
                const deepPrompt = `Provide a comprehensive explanation of: ${topicName}. Include clear definitions, 2 concrete examples, and an analogy if possible. Context: ${subjectName}`;
                const res = await explainTopic(deepPrompt, subjectName);
                if (isMounted) setExplanation(res);
            } catch (e) {
                console.error("Failed to explain topic:", e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchExplanation();
        return () => { isMounted = false; };
    }, [isOpen, topicName, subjectName]);

    if (!isOpen || !topicName) return null;

    // Handle Generation
    const handleGenerateTest = async () => {
        if (mcqCount + shortCount + longCount === 0) {
            toast.error("Please select at least one question format.");
            return;
        }

        setIsLoading(true);
        setView('learning'); // We use learning view to show loading state too
        try {
            const res = await generateAssessmentTest({
                document_id: docId || null,
                manual_topics: topicName,
                mcq_count: mcqCount,
                short_count: shortCount,
                long_count: longCount
            });

            setTestResponse(res);
            setUserAnswers({});
            setView(testMode === 'learning' ? 'learning' : 'testing');
        } catch (err: any) {
            console.error("Failed to generate test", err);
            setView('configure');
            toast.error("Failed to generate test.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Submission
    const handleSubmitAnswer = async () => {
        if (!testResponse) return;
        setIsLoading(true);
        setView('evaluating');
        
        try {
            const answersPayload: AssessmentAnswerPayload[] = [];
            
            testResponse.test.mcqs.forEach((q, i) => {
                answersPayload.push({
                    question: q.question, type: "mcq", rubric: q.correct_answer || "",
                    user_answer: userAnswers[`mcq_${i}`] || ""
                });
            });
            testResponse.test.short_answers.forEach((q, i) => {
                answersPayload.push({
                    question: q.question, type: "short", rubric: q.rubric || "",
                    user_answer: userAnswers[`short_${i}`] || ""
                });
            });
            testResponse.test.long_answers.forEach((q, i) => {
                answersPayload.push({
                    question: q.question, type: "long", rubric: q.rubric || "",
                    user_answer: userAnswers[`long_${i}`] || ""
                });
            });

            const evalRes = await evaluateAssessmentTest({
                topic_name: topicName,
                document_id: docId || null,
                mcq_count: mcqCount,
                short_count: shortCount,
                long_count: longCount,
                answers: answersPayload
            });

            setEvaluationData(evalRes);
            setView('learning'); // Learning view acts as the result review view when evaluationData exists
        } catch (err: any) {
            console.error(err);
            setView('testing'); // GO back to test on err
            toast.error("Failed to evaluate test.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Extracted Question Details
    const allQuestionsAnswered = testResponse ? (
        (testResponse.test.mcqs.length === 0 || testResponse.test.mcqs.every((_, i) => !!userAnswers[`mcq_${i}`])) &&
        (testResponse.test.short_answers.length === 0 || testResponse.test.short_answers.every((_, i) => !!(userAnswers[`short_${i}`] || "").trim())) &&
        (testResponse.test.long_answers.length === 0 || testResponse.test.long_answers.every((_, i) => !!(userAnswers[`long_${i}`] || "").trim()))
    ) : false;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f0f1a] border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => view !== 'explanation' ? setView('explanation') : null}
                                className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", 
                                    view !== 'explanation' ? "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                )}
                            >
                                {view !== 'explanation' ? <ChevronLeft className="w-5 h-5" /> : <Brain className="w-6 h-6" />}
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                                    {topicName} 
                                    {view === 'configure' && <span className="text-sm font-normal text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">Test Config</span>}
                                    {view === 'testing' && <span className="text-sm font-normal text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full">Active Test</span>}
                                    {view === 'learning' && testResponse && <span className="text-sm font-normal text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">Review Results</span>}
                                </h2>
                                <div className="text-sm text-zinc-400">{subjectName}</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        
                        {/* VIEW: EXPLANATION */}
                        {view === 'explanation' && (
                            isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-purple-400">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="text-sm font-semibold tracking-widest uppercase">Synthesizing Detailed Knowledge...</p>
                                </div>
                            ) : explanation ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Info className="w-4 h-4" /> Deep Explanation
                                        </h3>
                                        <p className="text-base text-zinc-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">
                                            {explanation.definition}
                                        </p>
                                    </div>
    
                                    {explanation.key_points && explanation.key_points.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Core Concepts
                                            </h3>
                                            <div className="grid gap-2">
                                                {explanation.key_points.map((point, i) => (
                                                    <div key={i} className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-sm text-zinc-300">{point}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-red-400">
                                    <AlertTriangle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                                    <p>Failed to generate explanation. Please try again.</p>
                                </div>
                            )
                        )}

                        {/* VIEW: CONFIGURE TEST */}
                        {view === 'configure' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl">
                                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2 mb-2">
                                        <Target className="w-5 h-5" /> Customize Your Challenge
                                    </h3>
                                    <p className="text-sm text-zinc-400">Configure how you'd like to test your knowledge on "{topicName}".</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Question Formats</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: 'mcq', label: 'Multiple Choice', count: mcqCount, set: setMcqCount, max: 10, icon: <CheckCircle2 className="w-5 h-5 text-blue-400" /> },
                                            { id: 'short', label: 'Short Answer', count: shortCount, set: setShortCount, max: 5, icon: <FileText className="w-5 h-5 text-purple-400" /> },
                                            { id: 'long', label: 'Deep Essay', count: longCount, set: setLongCount, max: 2, icon: <BookOpen className="w-5 h-5 text-fuchsia-400" /> }
                                        ].map(t => (
                                            <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {t.icon}
                                                    <span className="text-sm font-bold text-white">{t.label}</span>
                                                </div>
                                                <div className="flex items-center gap-4 bg-black/40 px-2 py-1.5 rounded-xl border border-white/5">
                                                    <button onClick={() => t.set(Math.max(0, t.count - 1))} className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10">-</button>
                                                    <span className="w-6 text-center font-bold text-zinc-300">{t.count}</span>
                                                    <button onClick={() => t.set(Math.min(t.max, t.count + 1))} className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center hover:bg-white/10">+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Study Mode</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setTestMode('learning')}
                                            className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all text-left", testMode === 'learning' ? "bg-green-500/20 border-green-500/50 text-green-300" : "bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-zinc-300")}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0"><Brain className="w-5 h-5 text-green-400" /></div>
                                            <div>
                                                <div className="font-bold text-sm">Learning Mode</div>
                                                <div className="text-xs opacity-70 mt-0.5">Show answer immediately. No writing required.</div>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => setTestMode('testing')}
                                            className={cn("flex items-center gap-3 p-4 rounded-xl border transition-all text-left", testMode === 'testing' ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-zinc-300")}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"><TestTube2 className="w-5 h-5 text-amber-400" /></div>
                                            <div>
                                                <div className="font-bold text-sm">Testing Mode</div>
                                                <div className="text-xs opacity-70 mt-0.5">Test yourself. Get graded by AI.</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW: TESTING */}
                        {view === 'testing' && testResponse && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {testResponse.test.mcqs.map((q, idx) => (
                                    <div key={`mcq_${idx}`} className="space-y-6">
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Multiple Choice</div>
                                            <h3 className="text-xl text-white font-medium leading-relaxed">{q.question}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {(q.options || []).map((opt: string, i: number) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setUserAnswers(prev => ({...prev, [`mcq_${idx}`]: opt}))}
                                                    className={cn("w-full text-left p-4 rounded-xl border transition-all", userAnswers[`mcq_${idx}`] === opt ? "bg-amber-500/20 border-amber-500/50 text-amber-200" : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10")}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                
                                {testResponse.test.short_answers.map((q, idx) => (
                                    <div key={`short_${idx}`} className="space-y-6">
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Short Answer</div>
                                            <h3 className="text-xl text-white font-medium leading-relaxed">{q.question}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-zinc-400">Your Answer</Label>
                                            <Textarea 
                                                value={userAnswers[`short_${idx}`] || ""}
                                                onChange={(e) => setUserAnswers(prev => ({...prev, [`short_${idx}`]: e.target.value}))}
                                                placeholder="Type your answer here..."
                                                className="min-h-[100px] bg-black/50 border-white/10 text-white rounded-xl resize-none focus-visible:ring-amber-500/50"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {testResponse.test.long_answers.map((q, idx) => (
                                    <div key={`long_${idx}`} className="space-y-6">
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Deep Essay</div>
                                            <h3 className="text-xl text-white font-medium leading-relaxed">{q.question}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-zinc-400">Your Answer</Label>
                                            <Textarea 
                                                value={userAnswers[`long_${idx}`] || ""}
                                                onChange={(e) => setUserAnswers(prev => ({...prev, [`long_${idx}`]: e.target.value}))}
                                                placeholder="Type your essay here..."
                                                className="min-h-[200px] bg-black/50 border-white/10 text-white rounded-xl resize-none focus-visible:ring-amber-500/50"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VIEW: LEARNING / REVIEW */}
                        {(view === 'learning' || view === 'evaluating') && (
                            isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-blue-400">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="text-sm font-semibold tracking-widest uppercase">{view === 'evaluating' ? 'Grading your answers...' : 'Generating study materials...'}</p>
                                </div>
                            ) : testResponse && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Map all questions to show results */}
                                    {
                                        [
                                            ...testResponse.test.mcqs.map((q, i) => ({ type: 'mcq' as const, idx: i, q })),
                                            ...testResponse.test.short_answers.map((q, i) => ({ type: 'short' as const, idx: i, q })),
                                            ...testResponse.test.long_answers.map((q, i) => ({ type: 'long' as const, idx: i, q }))
                                        ].map((item, absoluteIdx) => {
                                            const { type, idx, q } = item;
                                            const evaluation = evaluationData?.report?.evaluations?.[absoluteIdx];
                                            const ansKey = `${type}_${idx}`;
                                            
                                            return (
                                                <div key={ansKey} className="space-y-6 pb-8 border-b border-white/10 last:border-0">
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Question {absoluteIdx + 1}</div>
                                                        <h3 className="text-xl text-white font-medium leading-relaxed">{q.question}</h3>
                                                        {type === 'mcq' && 'options' in q && (
                                                            <ul className="mt-4 space-y-2 opacity-50 text-sm">
                                                                {(q.options || []).map((o: string, oi: number) => <li key={oi}>• {o}</li>)}
                                                            </ul>
                                                        )}
                                                    </div>

                                                    {evaluation && (
                                                        <div className={cn("rounded-2xl p-6 border", 
                                                            (evaluation.marks_awarded / evaluation.max_marks) >= 0.8 ? "bg-green-500/10 border-green-500/30" : 
                                                            (evaluation.marks_awarded / evaluation.max_marks) >= 0.5 ? "bg-yellow-500/10 border-yellow-500/30" : 
                                                            "bg-red-500/10 border-red-500/30"
                                                        )}>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="font-bold text-white text-lg">AI Feedback</h4>
                                                                <div className={cn("font-black text-2xl font-mono",
                                                                    (evaluation.marks_awarded / evaluation.max_marks) >= 0.8 ? "text-green-400" : 
                                                                    (evaluation.marks_awarded / evaluation.max_marks) >= 0.5 ? "text-yellow-400" : "text-red-400"
                                                                )}>{evaluation.marks_awarded} / {evaluation.max_marks}</div>
                                                            </div>
                                                            <p className="text-zinc-300 bg-black/20 p-4 rounded-xl mb-4 italic text-sm">"{userAnswers[ansKey]}"</p>
                                                            <p className="text-zinc-300 leading-relaxed text-sm">{evaluation.teacher_feedback}</p>
                                                        </div>
                                                    )}

                                                    <div className="bg-green-500/5 flex flex-col items-start border border-green-500/20 rounded-2xl p-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
                                                        <div className="text-xs font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" /> Correct Answer / Rubric
                                                        </div>
                                                        <p className="text-white leading-relaxed relative z-10 font-medium">
                                                            {type === 'mcq' && 'correct_answer' in q ? q.correct_answer : ('rubric' in q ? q.rubric : "No rubric available.")}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            )
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-black/40 shrink-0 flex gap-4">
                        {view === 'explanation' && (
                            <Button 
                                variant="default" 
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-12 text-base rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] group"
                                onClick={() => setView('configure')}
                                disabled={isLoading || !explanation}
                            >
                                <TestTube2 className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform text-blue-300" />
                                Test My Knowledge
                            </Button>
                        )}
                        
                        {view === 'configure' && (
                            <Button 
                                variant="default" 
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 text-base rounded-xl"
                                onClick={handleGenerateTest}
                            >
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Start Engine
                            </Button>
                        )}

                        {view === 'testing' && testResponse && (
                            <Button 
                                variant="default" 
                                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-amber-500/20"
                                onClick={handleSubmitAnswer}
                                disabled={!allQuestionsAnswered || isLoading}
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Submit Test 
                            </Button>
                        )}

                        {view === 'learning' && testResponse && (
                            <Button 
                                variant="default" 
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 text-base rounded-xl"
                                onClick={() => setView('configure')}
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                New Question
                            </Button>
                        )}

                        <Button 
                            variant="outline" 
                            className="h-12 px-6 rounded-xl border-white/20 hover:bg-white/10"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function RevisionEngineContent() {
    // Manual Revision State
    const [subject, setSubject] = useState("");
    const [topics, setTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState("");
    const [examDate, setExamDate] = useState("");
    const [weaknessLevel, setWeaknessLevel] = useState<"Weak" | "Medium" | "Strong">("Medium");
    const [examWeight, setExamWeight] = useState("");
    const [lastStudied, setLastStudied] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Document Analysis State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysisResponse | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Topic Explanation Modal State
    const [selectedTopicObj, setSelectedTopicObj] = useState<{name: string, difficulty: string} | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [topicExplanation, setTopicExplanation] = useState<TopicExplanationResponse | null>(null);

    // Active Tab
    const [activeTab, setActiveTab] = useState<"manual" | "document">("document");

    // Practice Panel State
    const [practiceTopicName, setPracticeTopicName] = useState<string | null>(null);
    const [practiceTopicNotes, setPracticeTopicNotes] = useState<string>("");
    const [currentDocId, setCurrentDocId] = useState<number | undefined>(undefined);

    const router = useRouter();
    const searchParams = useSearchParams();
    const resumeDocId = searchParams?.get("resumeDocId");

    // Handle incoming doc load from History
    useEffect(() => {
        let isMounted = true;
        if (resumeDocId && !isAnalyzing && !documentAnalysis) {
            const loadDoc = async () => {
                try {
                    setActiveTab("document");
                    setIsAnalyzing(true);
                    const docDetail = await getAssessmentDocumentDetail(Number(resumeDocId));
                    if (isMounted && docDetail.analysis_result) {
                        setDocumentAnalysis(docDetail.analysis_result);
                        setCurrentDocId(docDetail.id);
                        toast.success("Loaded previous document topics");
                    }
                } catch (e: any) {
                    if (isMounted) {
                        toast.error("Failed to load document");
                        setAnalysisError(e.message || "Could not retrieve document information");
                    }
                } finally {
                    if (isMounted) setIsAnalyzing(false);
                }
            };
            loadDoc();
        }
        return () => { isMounted = false; };
    }, [resumeDocId]);

    const handleAddTopic = () => {
        if (newTopic.trim()) {
            setTopics([...topics, newTopic.trim()]);
            setNewTopic("");
        }
    };

    const handleGenerate = async () => {
        if (!subject || topics.length === 0 || !examDate) {
            setError("Please fill in Subject, Topics, and Exam Date.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateRevisionStrategy({
                subject,
                topics,
                exam_date: examDate,
                weakness_level: weaknessLevel,
                exam_weight: examWeight ? parseFloat(examWeight) : undefined,
                last_studied: lastStudied || undefined,
            });
            setResult(response.strategy);
        } catch (err) {
            console.error(err);
            setError("Failed to generate revision strategy. Ensure local AI is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setDocumentAnalysis(null);
            setAnalysisError(null);
            setTopicExplanation(null);
        }
    };

    const handleAnalyzeDocument = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setAnalysisError(null);
        setDocumentAnalysis(null);

        try {
            const data = await analyzeDocument(selectedFile);
            setDocumentAnalysis(data);
            setCurrentDocId(data.document_id);
        } catch (err: any) {
            console.error(err);
            setAnalysisError(err.message || "Failed to analyze document");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <FeatureGate featureKey="page_revision" featureName="Revision Engine">
        <div className="container mx-auto max-w-6xl px-4 py-6 pt-6 md:pt-32 pb-28 md:pb-12">
            <div className="mb-6 md:mb-8">
                <div className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
                    <Repeat className="h-4 w-4" />
                    Smart Revision Engine
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">Revision Engine 🔁</h1>
                <p className="text-sm md:text-base text-zinc-400">Upload your study material or manually enter topics for AI-powered revision planning.</p>
            </div>

            <div className="flex gap-2 mb-6 md:mb-8">
                <button
                    onClick={() => setActiveTab("document")}
                    className={cn(
                        "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm",
                        activeTab === "document"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10"
                    )}
                >
                    <Upload className="h-4 w-4" />
                    <span>Upload Doc</span>
                </button>
                <button
                    onClick={() => setActiveTab("manual")}
                    className={cn(
                        "flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl md:rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm",
                        activeTab === "manual"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/10"
                    )}
                >
                    <Brain className="h-4 w-4" />
                    <span>Manual</span>
                </button>
            </div>

            {activeTab === "document" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-400" />
                                Upload Study Material
                            </h3>
                            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf,.pptx,.ppt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400 mb-2">
                                        {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                                    </p>
                                </label>
                            </div>
                            <Button
                                onClick={handleAnalyzeDocument}
                                disabled={!selectedFile || isAnalyzing}
                                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                                {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : "Analyze & Create Plan"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card h-full min-h-[500px] p-6 relative">
                            {documentAnalysis && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                                        <Sparkles className="h-5 w-5 text-yellow-400" />
                                        <h2 className="text-xl font-bold text-white">{documentAnalysis.subject}</h2>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-400 mb-3">Topics to Revise</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {documentAnalysis.topics.map((topic, idx) => (
                                                <InteractiveTopicCard
                                                    key={idx}
                                                    topic={topic}
                                                    onClick={() => setSelectedTopicObj({ name: topic.name, difficulty: topic.difficulty })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "manual" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Brain className="h-5 w-5 text-teal-400" />
                                Context
                            </h3>
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="bg-white/5 border-white/10" />
                            <div className="flex gap-2">
                                <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Add topic..." className="bg-white/5 border-white/10" />
                                <Button size="icon" onClick={handleAddTopic} className="shrink-0 bg-teal-600"><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full py-6 text-lg bg-gradient-to-r from-orange-600 to-red-600">
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Generate Strategy"}
                        </Button>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="glass-card h-full min-h-[500px] p-8">
                            {result && <div className="whitespace-pre-wrap text-zinc-300">{result}</div>}
                        </div>
                    </div>
                </div>
            )}
            
            <TopicExplanationModal 
                isOpen={!!selectedTopicObj}
                onClose={() => setSelectedTopicObj(null)}
                topicName={selectedTopicObj?.name || null}
                difficulty={selectedTopicObj?.difficulty || null}
                subjectName={documentAnalysis?.subject || subject}
                docId={currentDocId}
            />
        </div>
        </FeatureGate>
    );
}

export default function RevisionEnginePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>}>
            <RevisionEngineContent />
        </Suspense>
    );
}
