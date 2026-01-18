"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateRevisionStrategy, analyzeDocument, explainTopic, DocumentAnalysisResponse, TopicExplanationResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RevisionEnginePage() {
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

    // Topic Explanation State
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [topicExplanation, setTopicExplanation] = useState<TopicExplanationResponse | null>(null);

    // Active Tab
    const [activeTab, setActiveTab] = useState<"manual" | "document">("document");

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
            const analysis = await analyzeDocument(selectedFile);
            setDocumentAnalysis(analysis);
        } catch (err: any) {
            console.error(err);
            setAnalysisError(err.message || "Failed to analyze document");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExplainTopic = async (topicName: string) => {
        setSelectedTopic(topicName);
        setIsExplaining(true);
        setTopicExplanation(null);

        try {
            const explanation = await explainTopic(topicName, documentAnalysis?.subject || "");
            setTopicExplanation(explanation);
        } catch (err) {
            console.error(err);
        } finally {
            setIsExplaining(false);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 pt-32">
            {/* Header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
                    <Repeat className="h-4 w-4" />
                    Smart Revision Engine
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Revision & Document Analyzer</h1>
                <p className="text-zinc-400">Upload your study material or manually enter topics for AI-powered revision planning.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveTab("document")}
                    className={cn(
                        "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2",
                        activeTab === "document"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    )}
                >
                    <Upload className="h-4 w-4" />
                    Document Upload
                </button>
                <button
                    onClick={() => setActiveTab("manual")}
                    className={cn(
                        "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2",
                        activeTab === "manual"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    )}
                >
                    <Brain className="h-4 w-4" />
                    Manual Entry
                </button>
            </div>

            {/* Document Upload Tab */}
            {activeTab === "document" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-400" />
                                Upload Study Material
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Upload a PDF or PowerPoint file. Our AI will extract topics and create a personalized revision plan.
                            </p>

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
                                    <p className="text-xs text-zinc-500">PDF or PPTX (max 10MB)</p>
                                </label>
                            </div>

                            {selectedFile && (
                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <FileText className="h-5 w-5 text-purple-400" />
                                    <span className="text-sm text-white flex-1 truncate">{selectedFile.name}</span>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            <Button
                                onClick={handleAnalyzeDocument}
                                disabled={!selectedFile || isAnalyzing}
                                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Document...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyze & Create Plan
                                    </>
                                )}
                            </Button>

                            {analysisError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {analysisError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Results */}
                    <div className="space-y-6">
                        <div className="glass-card h-full min-h-[500px] p-6 relative">
                            {!documentAnalysis && !isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                    <BookOpen className="h-16 w-16 text-zinc-700 mb-6" />
                                    <h3 className="text-xl font-medium text-white mb-2">No Document Analyzed</h3>
                                    <p className="text-zinc-500 max-w-sm">
                                        Upload a PDF or PPT file to get AI-powered topic extraction and revision planning.
                                    </p>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm rounded-2xl">
                                    <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
                                    <p className="text-zinc-300">Extracting topics from document...</p>
                                </div>
                            )}

                            {documentAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                                        <Sparkles className="h-5 w-5 text-yellow-400" />
                                        <h2 className="text-xl font-bold text-white">{documentAnalysis.subject}</h2>
                                        <Badge className="ml-auto">{documentAnalysis.file_type.toUpperCase()}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Clock className="h-4 w-4" />
                                            ~{documentAnalysis.estimated_hours} hours
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <BookOpen className="h-4 w-4" />
                                            {documentAnalysis.topics.length} topics
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-400 mb-3">Topics to Revise</h4>
                                        <div className="space-y-2">
                                            {documentAnalysis.topics.map((topic, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleExplainTopic(topic.name)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                                                        selectedTopic === topic.name
                                                            ? "bg-purple-500/20 border-purple-500/50"
                                                            : "bg-white/5 border-white/10 hover:bg-white/10"
                                                    )}
                                                >
                                                    <Badge
                                                        className={cn(
                                                            "text-xs",
                                                            topic.difficulty === "Easy" && "bg-green-500/20 text-green-400",
                                                            topic.difficulty === "Medium" && "bg-yellow-500/20 text-yellow-400",
                                                            topic.difficulty === "Hard" && "bg-red-500/20 text-red-400"
                                                        )}
                                                    >
                                                        {topic.difficulty}
                                                    </Badge>
                                                    <span className="flex-1 text-white">{topic.name}</span>
                                                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-400 mb-2">Revision Plan</h4>
                                        <p className="text-sm text-zinc-300 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                                            {documentAnalysis.revision_plan}
                                        </p>
                                    </div>

                                    {documentAnalysis.key_concepts.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-zinc-400 mb-2">Key Concepts</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {documentAnalysis.key_concepts.map((concept, idx) => (
                                                    <Badge key={idx} variant="secondary" className="bg-blue-500/20 text-blue-300">
                                                        {concept}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Topic Explanation Modal */}
            <AnimatePresence>
                {(selectedTopic && topicExplanation) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTopic(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">{topicExplanation.topic}</h2>
                                <button onClick={() => setSelectedTopic(null)} className="text-zinc-400 hover:text-white">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-purple-400 mb-2">Definition</h4>
                                    <p className="text-zinc-300">{topicExplanation.definition}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-blue-400 mb-2">Key Points</h4>
                                    <ul className="space-y-2">
                                        {topicExplanation.key_points.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-zinc-300">
                                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {topicExplanation.example && (
                                    <div>
                                        <h4 className="text-sm font-medium text-green-400 mb-2">Example</h4>
                                        <p className="text-zinc-300 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                                            {topicExplanation.example}
                                        </p>
                                    </div>
                                )}

                                {topicExplanation.common_mistakes.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-red-400 mb-2">Common Mistakes</h4>
                                        <ul className="space-y-2">
                                            {topicExplanation.common_mistakes.map((mistake, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-zinc-300">
                                                    <AlertTriangle className="h-4 w-4 text-red-400 mt-1 shrink-0" />
                                                    {mistake}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="h-4 w-4 text-yellow-400" />
                                        <span className="text-sm font-medium text-yellow-400">Quick Revision Tip</span>
                                    </div>
                                    <p className="text-zinc-300 text-sm">{topicExplanation.revision_tip}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Modal for Topic Explanation */}
            <AnimatePresence>
                {isExplaining && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <div className="glass-card p-8 text-center">
                            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
                            <p className="text-white">Generating explanation for "{selectedTopic}"...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Entry Tab (existing functionality) */}
            {activeTab === "manual" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Brain className="h-5 w-5 text-teal-400" />
                                Context
                            </h3>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Subject</label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Linear Algebra"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Topics to Revise</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        placeholder="Add topic..."
                                        className="bg-white/5 border-white/10"
                                        onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                                    />
                                    <Button size="icon" onClick={handleAddTopic} className="shrink-0 bg-teal-600 hover:bg-teal-500">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {topics.map(t => (
                                        <Badge key={t} variant="secondary" className="bg-teal-500/20 text-teal-300">
                                            {t}
                                            <X
                                                className="h-3 w-3 ml-2 cursor-pointer hover:text-white"
                                                onClick={() => setTopics(topics.filter(i => i !== t))}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-400" />
                                Parameters
                            </h3>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Exam Date</label>
                                <Input
                                    type="date"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Your Confidence</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["Weak", "Medium", "Strong"] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setWeaknessLevel(level)}
                                            className={cn(
                                                "px-2 py-2 rounded-lg text-sm border transition-all",
                                                weaknessLevel === level
                                                    ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                            )}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Weight (%)</label>
                                    <Input
                                        type="number"
                                        value={examWeight}
                                        onChange={(e) => setExamWeight(e.target.value)}
                                        placeholder="Optional"
                                        className="bg-white/5 border-white/10 h-8 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Last Studied</label>
                                    <Input
                                        type="date"
                                        value={lastStudied}
                                        onChange={(e) => setLastStudied(e.target.value)}
                                        className="bg-white/5 border-white/10 h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-6 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-900/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Optimizing Memory...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-5 w-5" />
                                    Generate Strategy
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Output */}
                    <div className="lg:col-span-2">
                        <div className="glass-card h-full min-h-[500px] p-8 relative">
                            {!result && !isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                    <Repeat className="h-16 w-16 text-zinc-700 mb-6" />
                                    <h3 className="text-xl font-medium text-white mb-2">No Active Strategy</h3>
                                    <p className="text-zinc-500 max-w-sm">
                                        Configure your topic parameters on the left to generate a spaced repetition timeline.
                                    </p>
                                </div>
                            )}

                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm rounded-2xl">
                                    <Loader2 className="h-12 w-12 text-orange-400 animate-spin mb-4" />
                                    <p className="text-zinc-300">Calculating forgetting curves...</p>
                                </div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="prose prose-invert max-w-none"
                                >
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                                        <Sparkles className="h-5 w-5 text-yellow-400" />
                                        <h2 className="text-2xl font-bold text-white m-0">Recommended Strategy</h2>
                                    </div>
                                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-300 bg-black/20 p-6 rounded-lg border border-white/5">
                                        {result}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
