"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    generatePracticeQuestions,
    evaluateAnswers,
    GenerateQuestionsResponse,
    EvaluateResponse,
    PracticeQuestion,
} from "@/lib/api";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    BookOpen,
    Brain,
    ClipboardCheck,
    ChevronRight,
    RotateCcw,
    Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticePanelProps {
    topicName: string;
    topicNotes: string;
    difficulty: "Easy" | "Medium" | "Hard";
    onClose: () => void;
}

export default function PracticePanel({ topicName, topicNotes, difficulty, onClose }: PracticePanelProps) {
    // Mode Selection
    const [mode, setMode] = useState<"practice" | "self-test">("practice");
    const [questionType, setQuestionType] = useState<"mcq" | "short" | "long">("mcq");
    const [questionCount, setQuestionCount] = useState(5);

    // Questions State
    const [isLoading, setIsLoading] = useState(false);
    const [questionsData, setQuestionsData] = useState<GenerateQuestionsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Self-Test State
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<EvaluateResponse | null>(null);

    // Generate Questions
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setQuestionsData(null);
        setEvaluationResult(null);
        setUserAnswers({});

        try {
            const response = await generatePracticeQuestions({
                topic_name: topicName,
                topic_notes: topicNotes,
                difficulty,
                question_type: questionType,
                count: questionCount,
                mode,
            });
            setQuestionsData(response);
        } catch (err: any) {
            setError(err.message || "Failed to generate questions");
        } finally {
            setIsLoading(false);
        }
    };

    // Update Answer
    const handleAnswerChange = (questionId: string, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // Submit for Evaluation
    const handleEvaluate = async () => {
        if (!questionsData) return;

        setIsEvaluating(true);
        setError(null);

        try {
            const response = await evaluateAnswers({
                session_id: questionsData.session_id,
                topic_name: questionsData.topic_name,
                question_type: questionsData.question_type,
                answers: Object.entries(userAnswers).map(([question_id, user_answer]) => ({
                    question_id,
                    user_answer,
                })),
            });
            setEvaluationResult(response);
        } catch (err: any) {
            setError(err.message || "Failed to evaluate answers");
        } finally {
            setIsEvaluating(false);
        }
    };

    // Reset
    const handleReset = () => {
        setQuestionsData(null);
        setEvaluationResult(null);
        setUserAnswers({});
        setError(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Brain className="h-6 w-6 text-purple-400" />
                            Practice: {topicName}
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1">
                            {mode === "practice" ? "View questions with answers" : "Test yourself without hints"}
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
                        ✕
                    </Button>
                </div>

                {/* Configuration (before generating) */}
                {!questionsData && !isLoading && (
                    <div className="space-y-6">
                        {/* Mode Selection */}
                        <div>
                            <label className="text-sm text-zinc-400 mb-2 block">Mode</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMode("practice")}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all text-left",
                                        mode === "practice"
                                            ? "bg-green-500/20 border-green-500 text-green-300"
                                            : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                    )}
                                >
                                    <BookOpen className="h-5 w-5 mb-2" />
                                    <div className="font-medium">Practice Mode</div>
                                    <div className="text-xs opacity-70">See answers immediately</div>
                                </button>
                                <button
                                    onClick={() => setMode("self-test")}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all text-left",
                                        mode === "self-test"
                                            ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                            : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                    )}
                                >
                                    <ClipboardCheck className="h-5 w-5 mb-2" />
                                    <div className="font-medium">Self-Test Mode</div>
                                    <div className="text-xs opacity-70">Evaluate your answers</div>
                                </button>
                            </div>
                        </div>

                        {/* Question Type */}
                        <div>
                            <label className="text-sm text-zinc-400 mb-2 block">Question Type</label>
                            <div className="flex gap-2">
                                {(["mcq", "short", "long"] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setQuestionType(type)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg border text-sm transition-all",
                                            questionType === type
                                                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                        )}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div>
                            <label className="text-sm text-zinc-400 mb-2 block">
                                Number of Questions: <span className="text-white font-bold">{questionCount}</span>
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={20}
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        >
                            Generate Questions <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
                        <p className="text-zinc-300">Generating {questionCount} {questionType.toUpperCase()} questions...</p>
                    </div>
                )}

                {/* Questions Display */}
                {questionsData && !evaluationResult && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-purple-500/20 text-purple-300">
                                {questionsData.questions.length} Questions
                            </Badge>
                            <Badge className={cn(
                                mode === "practice" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"
                            )}>
                                {mode === "practice" ? "Practice Mode" : "Self-Test Mode"}
                            </Badge>
                        </div>

                        {questionsData.questions.map((q, idx) => (
                            <QuestionCard
                                key={q.question_id}
                                question={q}
                                index={idx}
                                mode={mode}
                                userAnswer={userAnswers[q.question_id] || ""}
                                onAnswerChange={(ans) => handleAnswerChange(q.question_id, ans)}
                            />
                        ))}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleReset} className="flex-1">
                                <RotateCcw className="mr-2 h-4 w-4" /> Start Over
                            </Button>
                            {mode === "self-test" && (
                                <Button
                                    onClick={handleEvaluate}
                                    disabled={isEvaluating || Object.keys(userAnswers).length === 0}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                                >
                                    {isEvaluating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...</>
                                    ) : (
                                        <>Submit Answers <ChevronRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Evaluation Results */}
                {evaluationResult && (
                    <EvaluationResults result={evaluationResult} onReset={handleReset} />
                )}
            </motion.div>
        </motion.div>
    );
}

// ================================
// Question Card Component
// ================================

function QuestionCard({
    question,
    index,
    mode,
    userAnswer,
    onAnswerChange,
}: {
    question: PracticeQuestion;
    index: number;
    mode: "practice" | "self-test";
    userAnswer: string;
    onAnswerChange: (ans: string) => void;
}) {
    return (
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm">
                    {index + 1}
                </div>
                <p className="text-white flex-1">{question.text}</p>
            </div>

            {/* MCQ Options */}
            {question.question_type === "mcq" && question.options && (
                <div className="space-y-2 ml-11">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => mode === "self-test" && onAnswerChange(opt.charAt(0))}
                            className={cn(
                                "w-full p-3 rounded-lg border text-left text-sm transition-all",
                                mode === "self-test" && userAnswer === opt.charAt(0)
                                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10",
                                mode === "practice" && question.correct_answer === opt.charAt(0)
                                && "bg-green-500/20 border-green-500 text-green-300"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {/* Short/Long Answer Input */}
            {question.question_type !== "mcq" && mode === "self-test" && (
                <div className="ml-11">
                    <textarea
                        value={userAnswer}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder={question.question_type === "short" ? "Your short answer..." : "Your detailed answer..."}
                        rows={question.question_type === "short" ? 2 : 5}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                </div>
            )}

            {/* Practice Mode: Show Answer */}
            {mode === "practice" && question.correct_answer && (
                <div className="ml-11 mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-xs font-medium text-green-400 mb-1">Answer</div>
                    <p className="text-green-300">{question.correct_answer}</p>
                    {question.explanation && (
                        <p className="text-zinc-400 text-sm mt-2">{question.explanation}</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ================================
// Evaluation Results Component
// ================================

function EvaluationResults({ result, onReset }: { result: EvaluateResponse; onReset: () => void }) {
    const levelColors = {
        Weak: "text-red-400 bg-red-500/20",
        Average: "text-yellow-400 bg-yellow-500/20",
        Strong: "text-green-400 bg-green-500/20",
    };

    return (
        <div className="space-y-6">
            {/* Score Summary */}
            <div className="text-center p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <div className="text-5xl font-black text-white mb-2">
                    {result.percentage.toFixed(0)}%
                </div>
                <div className="text-zinc-400 mb-4">
                    {result.total_score} / {result.max_score} points
                </div>
                <Badge className={cn("text-lg py-1 px-4", levelColors[result.performance_level])}>
                    {result.performance_level}
                </Badge>
            </div>

            {/* Per-Question Feedback */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Question Review</h3>
                <div className="space-y-3">
                    {result.question_feedback.map((fb, idx) => (
                        <div
                            key={fb.question_id}
                            className={cn(
                                "p-4 rounded-xl border",
                                fb.is_correct
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-red-500/10 border-red-500/30"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {fb.is_correct ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-400" />
                                )}
                                <span className="font-medium text-white">Question {idx + 1}</span>
                                <span className="ml-auto text-sm text-zinc-400">
                                    {fb.score}/{fb.max_score}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-300 mb-2">
                                <span className="text-zinc-500">Your answer:</span> {fb.user_answer || "(empty)"}
                            </p>
                            {!fb.is_correct && (
                                <p className="text-sm text-green-300">
                                    <span className="text-zinc-500">Correct:</span> {fb.correct_answer}
                                </p>
                            )}
                            <p className="text-sm text-zinc-400 mt-2">{fb.feedback}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-blue-300">Next Steps</span>
                </div>
                <ul className="space-y-1">
                    {result.next_steps.map((step, i) => (
                        <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-blue-400" />
                            {step}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={onReset} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        </div>
    );
}
