"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
    UploadCloud, FileType, CheckCircle2, RotateCcw,
    Brain, FileText, Loader2, PlayCircle, LogOut,
    Award, Target, AlertTriangle, TrendingUp, ChevronLeft, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    uploadAssessmentDocument,
    generateAssessmentTest,
    evaluateAssessmentTest,
    AssessmentTestResponse,
    EvaluateAssessmentResponse,
    AssessmentAnswerPayload
} from "@/lib/api";

type AssessmentStep = 'SETUP' | 'GENERATING' | 'TESTING' | 'EVALUATING' | 'RESULTS';

function AssessmentContent() {
    const searchParams = useSearchParams();
    const initDocId = searchParams.get("docId");
    const initTopic = searchParams.get("topic");

    const [step, setStep] = useState<AssessmentStep>('SETUP');
    const [loadingMessage, setLoadingMessage] = useState("");

    // SETUP STATE
    const [inputType, setInputType] = useState<'document' | 'manual'>('document');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedDocId, setUploadedDocId] = useState<number | null>(null);
    const [manualTopic, setManualTopic] = useState("");
    
    const [mcqCount, setMcqCount] = useState([5]);
    const [shortCount, setShortCount] = useState([2]);
    const [longCount, setLongCount] = useState([1]);

    // TEST STATE
    const [testResponse, setTestResponse] = useState<AssessmentTestResponse | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

    // RESULTS STATE
    const [evaluationData, setEvaluationData] = useState<EvaluateAssessmentResponse | null>(null);

    // Initial load from URL params
    const [autoStartRequested, setAutoStartRequested] = useState(false);

    // Declared before useEffect for clean referencing
    const handleGenerate = async (
        overrideInputType?: 'document' | 'manual',
        overrideDocId?: number | null,
        overrideManualTopic?: string
    ) => {
        const activeInputType = overrideInputType ?? inputType;
        const activeDocId = overrideDocId !== undefined ? overrideDocId : uploadedDocId;
        const activeManualTopic = overrideManualTopic ?? manualTopic;

        if (activeInputType === 'document' && !selectedFile && !activeDocId) {
            toast.error("Please upload a PDF or PPT file.");
            return;
        }
        if (activeInputType === 'manual' && activeManualTopic.trim().length < 3) {
            toast.error("Please provide a topic description.");
            return;
        }
        if (mcqCount[0] === 0 && shortCount[0] === 0 && longCount[0] === 0) {
            toast.error("Please select at least one question to generate.");
            return;
        }

        setStep('GENERATING');
        setLoadingMessage("AI is analyzing your content...");

        try {
            let docId = activeDocId;

            // Upload file if new
            if (activeInputType === 'document' && selectedFile && !docId) {
                setLoadingMessage("Extracting text from document...");
                const uploadRes = await uploadAssessmentDocument(selectedFile);
                docId = uploadRes.document_id;
                setUploadedDocId(docId);
            }

            setLoadingMessage("Crafting your personalized assessment...");
            const res = await generateAssessmentTest({
                document_id: activeInputType === 'document' ? docId : null,
                manual_topics: activeManualTopic || null,
                mcq_count: mcqCount[0],
                short_count: shortCount[0],
                long_count: longCount[0]
            });

            setTestResponse(res);
            setUserAnswers({});
            setStep('TESTING');
        } catch (err: any) {
            toast.error(err.message || "Failed to generate test.");
            setStep('SETUP');
        }
    };

    useEffect(() => {
        if (initTopic && !autoStartRequested) {
            setAutoStartRequested(true);
            const docId = initDocId ? Number(initDocId) : null;
            const type = docId ? 'document' : 'manual';
            const topicText = initTopic;

            setUploadedDocId(docId);
            setInputType(type);
            setManualTopic(topicText);

            // Trigger auto-start
            handleGenerate(type, docId, topicText);
        }
    }, [initDocId, initTopic, autoStartRequested]);

    // Dropzone setup
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            setUploadedDocId(null);
        }
    };
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: { 'application/pdf': ['.pdf'], 'application/vnd.ms-powerpoint': ['.ppt', '.pptx'] },
        maxFiles: 1 
    });

    const handleSubmitTest = async () => {
        if (!testResponse) return;

        setStep('EVALUATING');
        setLoadingMessage("AI Teacher is grading your answers...");

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

            const docId = inputType === 'document' ? uploadedDocId : null;
            
            const res = await evaluateAssessmentTest({
                document_id: docId,
                topic_name: testResponse.topic_name,
                mcq_count: mcqCount[0],
                short_count: shortCount[0],
                long_count: longCount[0],
                answers: answersPayload
            });

            setEvaluationData(res);
            setStep('RESULTS');
        } catch (err: any) {
             toast.error(err.message || "Something went wrong.");
             setStep('TESTING');
        }
    };

    const handleReset = () => {
        setStep('SETUP');
        setTestResponse(null);
        setEvaluationData(null);
        setUserAnswers({});
    };

    return (
        <FeatureGate featureKey="page_study_copilot" featureName="Assessment Hub">
            <div className="container mx-auto max-w-5xl px-4 py-6 md:pt-32 pb-24 min-h-screen">
                
                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-4">
                        <Brain className="h-4 w-4" />
                        AI-Powered Testing Core
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Assessment Hub</h1>
                            <p className="text-zinc-400 max-w-xl">Generate custom tests from your documents or topics. Our AI teacher will analyze your performance deeply.</p>
                        </div>
                        {step !== 'SETUP' && (
                            <Button variant="outline" onClick={handleReset} className="border-white/10 hover:bg-white/5 mx-auto md:mx-0">
                                <RotateCcw className="h-4 w-4 mr-2" /> Start Over
                            </Button>
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: SETUP */}
                    {step === 'SETUP' && (
                        <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Data Source Panel */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <FileText className="text-violet-400" /> Source Material
                                </h2>

                                <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
                                    <button 
                                        onClick={() => setInputType('document')}
                                        className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", inputType === 'document' ? "bg-violet-600 text-white shadow-lg" : "text-zinc-500 hover:text-white")}
                                    >
                                        Upload Document
                                    </button>
                                    <button 
                                        onClick={() => setInputType('manual')}
                                        className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", inputType === 'manual' ? "bg-violet-600 text-white shadow-lg" : "text-zinc-500 hover:text-white")}
                                    >
                                        Manual Topic
                                    </button>
                                </div>

                                {inputType === 'document' ? (
                                    <div 
                                        {...getRootProps()} 
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]",
                                            isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-white/10"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        {selectedFile ? (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400"><FileType className="h-8 w-8" /></div>
                                                <p className="text-white font-medium">{selectedFile.name}</p>
                                                <p className="text-zinc-400 text-sm mt-1">Ready for analysis</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 text-violet-400"><UploadCloud className="h-8 w-8" /></div>
                                                <p className="text-white font-medium mb-1">Drag & drop your PDF or PPT</p>
                                                <p className="text-zinc-500 text-sm">or click to browse local files</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Label className="text-zinc-300">Describe what you want to be tested on:</Label>
                                        <Textarea 
                                            placeholder="e.g. The principles of modern operating systems, specifically focusing on memory management, paging, and virtual memory."
                                            className="bg-black/40 border-white/10 min-h-[160px] text-white resize-none"
                                            value={manualTopic}
                                            onChange={(e) => setManualTopic(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Configuration Panel */}
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Target className="text-cyan-400" /> Exam Configuration
                                </h2>

                                <div className="space-y-8 flex-1">
                                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-white font-medium flex items-center gap-2">Multiple Choice</Label>
                                            <span className="font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-sm">{mcqCount[0]} Qs</span>
                                        </div>
                                        <Slider min={0} max={20} step={1} value={mcqCount} onValueChange={setMcqCount} className="py-2" />
                                    </div>

                                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-white font-medium flex items-center gap-2">Short Answer</Label>
                                            <span className="font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-sm">{shortCount[0]} Qs</span>
                                        </div>
                                        <Slider min={0} max={10} step={1} value={shortCount} onValueChange={setShortCount} className="py-2" />
                                        <p className="text-xs text-zinc-500">AI will evaluate text semantics and keywords.</p>
                                    </div>

                                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-white font-medium flex items-center gap-2">Long Essay</Label>
                                            <span className="font-mono bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded text-sm">{longCount[0]} Qs</span>
                                        </div>
                                        <Slider min={0} max={3} step={1} value={longCount} onValueChange={setLongCount} className="py-2" />
                                        <p className="text-xs text-zinc-500">In-depth grading based on arguments and logic.</p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => handleGenerate()} 
                                    className="w-full mt-6 py-6 text-lg tracking-wide rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25"
                                >
                                    <PlayCircle className="mr-2 h-5 w-5" /> Let's Begin
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 & 4: LOADING STATES */}
                    {(step === 'GENERATING' || step === 'EVALUATING') && (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] glass-card rounded-3xl border border-white/10 p-12 text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>
                                <Loader2 className="h-16 w-16 text-violet-400 animate-spin relative z-10" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">AI is processing</h2>
                            <p className="text-xl text-zinc-400">{loadingMessage}</p>
                            <p className="text-sm text-zinc-500 mt-6 max-w-sm">This may take 30-60 seconds depending on the complexity of the document and Ollama model performance.</p>
                        </motion.div>
                    )}

                    {/* STEP 3: TESTING INTERFACE */}
                    {step === 'TESTING' && testResponse && (
                        <motion.div key="testing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            
                            <div className="glass-card p-6 md:p-10 rounded-3xl border border-violet-500/30 shadow-2xl shadow-violet-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Brain className="w-64 h-64" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Exam: {testResponse.topic_name}</h2>
                                <p className="text-violet-300 relative z-10">Read questions carefully. Your responses will be strictly graded.</p>
                                
                                <div className="mt-8 space-y-12 relative z-10">
                                    {/* MCQs */}
                                    {testResponse.test.mcqs.length > 0 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded flex items-center justify-center text-sm">I</span>
                                                Multiple Choice Questions
                                            </h3>
                                            {testResponse.test.mcqs.map((q, idx) => (
                                                <div key={idx} className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                                                    <p className="text-lg text-white font-medium">{idx + 1}. {q.question}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options?.map((opt, oIdx) => (
                                                            <div 
                                                                key={oIdx}
                                                                onClick={() => setUserAnswers({...userAnswers, [`mcq_${idx}`]: opt})}
                                                                className={cn(
                                                                    "p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3",
                                                                    userAnswers[`mcq_${idx}`] === opt 
                                                                        ? "border-blue-500 bg-blue-500/10" 
                                                                        : "border-white/10 bg-white/5 hover:bg-white/10"
                                                                )}
                                                            >
                                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", userAnswers[`mcq_${idx}`] === opt ? "border-blue-500" : "border-zinc-500")}>
                                                                    {userAnswers[`mcq_${idx}`] === opt && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                                                </div>
                                                                <span className="text-zinc-200">{opt}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Shorts */}
                                    {testResponse.test.short_answers.length > 0 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                                                <span className="bg-amber-500/20 text-amber-400 w-8 h-8 rounded flex items-center justify-center text-sm">II</span>
                                                Short Answer Questions
                                            </h3>
                                            {testResponse.test.short_answers.map((q, idx) => (
                                                <div key={idx} className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                                                    <p className="text-lg text-white font-medium">{idx + 1}. {q.question}</p>
                                                    <Textarea 
                                                        placeholder="Type your concise answer here..."
                                                        className="bg-black/50 border-white/10 focus:border-amber-500/50 min-h-[120px] text-zinc-200"
                                                        value={userAnswers[`short_${idx}`] || ""}
                                                        onChange={(e) => setUserAnswers({...userAnswers, [`short_${idx}`]: e.target.value})}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Longs */}
                                    {testResponse.test.long_answers.length > 0 && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                                                <span className="bg-fuchsia-500/20 text-fuchsia-400 w-8 h-8 rounded flex items-center justify-center text-sm">III</span>
                                                Long Assay/Essay Questions
                                            </h3>
                                            {testResponse.test.long_answers.map((q, idx) => (
                                                <div key={idx} className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-4">
                                                    <p className="text-lg text-white font-medium">{idx + 1}. {q.question}</p>
                                                    <Textarea 
                                                        placeholder="Explain your points in detail, use paragraphs..."
                                                        className="bg-black/50 border-white/10 focus:border-fuchsia-500/50 min-h-[250px] text-zinc-200"
                                                        value={userAnswers[`long_${idx}`] || ""}
                                                        onChange={(e) => setUserAnswers({...userAnswers, [`long_${idx}`]: e.target.value})}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-4 pb-12">
                                <Button size="lg" onClick={handleSubmitTest} className="px-12 py-6 text-lg rounded-2xl bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/30">
                                    <Send className="mr-2 h-5 w-5" /> Submit & Evaluate
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: RESULTS AND ANALYSIS */}
                    {step === 'RESULTS' && evaluationData && (
                        <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 md:p-8 rounded-3xl border-t-4 border-violet-500 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-400 mb-1 font-medium">Final Score</p>
                                    <div className="text-6xl font-black text-white mix-blend-screen">{evaluationData.report.total_score}</div>
                                    <p className="text-sm text-zinc-500 uppercase mt-1">out of {evaluationData.report.max_score}</p>
                                </div>

                                <div className="glass-card p-6 md:p-8 rounded-3xl border-t-4 border-cyan-500 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-400 mb-1 font-medium">Percentage</p>
                                    <div className="text-6xl font-black text-cyan-400">
                                        {((evaluationData.report.total_score / evaluationData.report.max_score) * 100).toFixed(1)}%
                                    </div>
                                </div>

                                <div className="glass-card p-6 md:p-8 rounded-3xl border-t-4 border-fuchsia-500 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-400 mb-1 font-medium">Deep Analysis</p>
                                    <div className="flex gap-2 text-sm mt-3 flex-wrap justify-center">
                                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full">{evaluationData.report.deep_analysis?.strengths?.length || 0} Strengths</span>
                                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full">{evaluationData.report.deep_analysis?.weaknesses?.length || 0} Weaknesses</span>
                                    </div>
                                    <Button variant="link" className="mt-4 text-fuchsia-400 p-0" onClick={() => document.getElementById("deep-analysis")?.scrollIntoView({behavior: "smooth"})}>View Report <TrendingUp className="ml-1 w-4 h-4" /></Button>
                                </div>
                            </div>

                            {/* Evaluation Item List */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                                    <CheckCircle2 className="text-green-500" /> Question Breakdown
                                </h3>
                                
                                {evaluationData.report.evaluations.map((evalItem, idx) => (
                                    <div key={idx} className={cn(
                                        "glass-card p-6 rounded-2xl border-l-4 transition-all hover:bg-white/5",
                                        evalItem.is_correct ? "border-green-500" : (evalItem.marks_awarded > 0 ? "border-amber-500" : "border-red-500")
                                    )}>
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="text-lg text-white font-medium flex-1">{idx + 1}. {evalItem.question}</div>
                                            <div className={cn(
                                                "font-mono font-bold px-3 py-1 rounded-lg text-sm shrink-0",
                                                evalItem.is_correct ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                            )}>
                                                {evalItem.marks_awarded} / {evalItem.max_marks} marks
                                            </div>
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-xl mb-4 border border-white/5">
                                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider block mb-1">Your Answer</span>
                                            <p className="text-zinc-300 italic">{evalItem.user_answer || "No response provided"}</p>
                                        </div>

                                        <div className="bg-violet-500/5 p-4 rounded-xl border border-violet-500/10">
                                            <span className="text-xs text-violet-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Teacher Feedback
                                            </span>
                                            <p className="text-violet-200 leading-relaxed text-sm">{evalItem.teacher_feedback}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Deep Analysis Report */}
                            <div id="deep-analysis" className="glass-card p-6 md:p-10 rounded-3xl border border-white/10 mt-12 bg-gradient-to-b from-transparent to-blue-900/20">
                                <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <Brain className="text-blue-400 h-8 w-8" /> Teacher's Deep Analysis Profile
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl">
                                        <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2"><Award className="w-5 h-5"/> Core Strengths</h3>
                                        <ul className="space-y-3">
                                            {evaluationData.report.deep_analysis?.strengths?.map((s, i) => (
                                                <li key={i} className="text-zinc-300 text-sm flex gap-3">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                            {(!evaluationData.report.deep_analysis?.strengths || evaluationData.report.deep_analysis.strengths.length === 0) && <p className="text-zinc-500 text-sm">None identified in this attempt.</p>}
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                                        <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Concept Blindspots</h3>
                                        <ul className="space-y-3">
                                            {evaluationData.report.deep_analysis?.weaknesses?.map((w, i) => (
                                                <li key={i} className="text-zinc-300 text-sm flex gap-3">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span>{w}</span>
                                                </li>
                                            ))}
                                            {(!evaluationData.report.deep_analysis?.weaknesses || evaluationData.report.deep_analysis.weaknesses.length === 0) && <p className="text-zinc-500 text-sm">No major blindspots identified!</p>}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2"><TrendingUp className="text-cyan-400 w-5 h-5"/> Growth Trajectory & Action Plan</h3>
                                    <p className="text-zinc-300 leading-relaxed text-sm md:text-base border-l-2 border-cyan-500/50 pl-4 py-1">
                                        {evaluationData.report.deep_analysis?.improvement_plan || "Keep studying the base concepts and try again."}
                                    </p>
                                </div>

                            </div>

                            <div className="flex justify-center pt-8 pb-12">
                                <Button size="lg" onClick={handleReset} variant="outline" className="px-8 border-white/10 hover:bg-white/5">
                                    Close & Return to Dashboard
                                </Button>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </FeatureGate>
    );
}

export default function AssessmentHubPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050510] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
            <AssessmentContent />
        </Suspense>
    );
}
