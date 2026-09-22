"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useDropzone } from "react-dropzone";
import {
    FileText,
    UploadCloud,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Plus,
    Check,
    RefreshCw,
    FileCode,
    Trash2,
    Info,
    ArrowRight,
    ArrowLeft,
    CheckSquare,
    Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureGate } from "@/components/feature-gate";
import {
    uploadTranscript,
    parseTranscriptText,
    getTranscriptStatus,
    createCourse,
    getCourses,
    ParsedCourse,
    TranscriptParseResponse,
    TranscriptStatusResponse
} from "@/lib/api";

interface Notification {
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
}

export default function TranscriptImportPage() {
    // State management
    const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
    const [pastedText, setPastedText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [status, setStatus] = useState<TranscriptStatusResponse | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [parsedData, setParsedData] = useState<TranscriptParseResponse | null>(null);
    
    // Selection state for import
    const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
    const [customCoursesToDatabase, setCustomCoursesToDatabase] = useState<Set<string>>(new Set());
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Zustand store actions and state
    const completedCourses = useAppStore((state) => state.completedCourses);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const completedCourseGrades = useAppStore((state) => state.completedCourseGrades);
    const setCompletedCourseGrades = useAppStore((state) => state.setCompletedCourseGrades);
    const setCourses = useAppStore((state) => state.setCourses);

    // Helper: Add visual notification
    const addNotification = (type: "success" | "error" | "warning" | "info", message: string) => {
        const id = Math.random().toString(36).substring(7);
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    };

    // Fetch Ollama/PyMuPDF backend status
    const fetchStatus = async () => {
        setStatusLoading(true);
        try {
            const res = await getTranscriptStatus();
            setStatus(res);
        } catch (err) {
            console.error("Failed to fetch transcript status:", err);
            setStatus(null);
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Dropzone callback for PDF Upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        
        if (file.type !== "application/pdf") {
            addNotification("error", "Only PDF documents are supported");
            return;
        }

        setIsProcessing(true);
        setProcessingStep("Reading PDF & Extracting Text...");
        
        try {
            // Short delay to show extraction step
            await new Promise((resolve) => setTimeout(resolve, 800));
            setProcessingStep("Parsing Course Details using Local Ollama model...");
            
            const result = await uploadTranscript(file);
            setParsedData(result);
            
            // Auto-select matched courses
            const matched = new Set<string>();
            result.parsed_courses.forEach((c) => {
                if (c.matched_in_catalog) {
                    matched.add(c.code);
                }
            });
            setSelectedCourses(matched);
            
            // Auto-enable catalog addition for unmatched courses
            const unmatched = new Set<string>();
            result.parsed_courses.forEach((c) => {
                if (!c.matched_in_catalog) {
                    unmatched.add(c.code);
                }
            });
            setCustomCoursesToDatabase(unmatched);

            if (result.warnings && result.warnings.length > 0) {
                addNotification("warning", result.warnings[0]);
            } else {
                addNotification("success", `Parsed ${result.parsed_courses.length} courses!`);
            }
        } catch (err: any) {
            console.error(err);
            addNotification("error", err.message || "Failed to process transcript PDF");
        } finally {
            setIsProcessing(false);
            setProcessingStep("");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        multiple: false
    });

    // Submit pasted raw text
    const handlePasteSubmit = async () => {
        if (!pastedText.trim()) {
            addNotification("error", "Please paste transcript text contents first");
            return;
        }

        setIsProcessing(true);
        setProcessingStep("Parsing text using Local Ollama model...");

        try {
            const result = await parseTranscriptText(pastedText);
            setParsedData(result);

            // Auto-select matched courses
            const matched = new Set<string>();
            result.parsed_courses.forEach((c) => {
                if (c.matched_in_catalog) {
                    matched.add(c.code);
                }
            });
            setSelectedCourses(matched);

            // Auto-enable catalog addition for unmatched courses
            const unmatched = new Set<string>();
            result.parsed_courses.forEach((c) => {
                if (!c.matched_in_catalog) {
                    unmatched.add(c.code);
                }
            });
            setCustomCoursesToDatabase(unmatched);

            addNotification("success", `Parsed ${result.parsed_courses.length} courses!`);
        } catch (err: any) {
            console.error(err);
            addNotification("error", err.message || "Failed to parse transcript text");
        } finally {
            setIsProcessing(false);
            setProcessingStep("");
        }
    };

    // Toggle course selection
    const toggleSelectCourse = (code: string) => {
        setSelectedCourses((prev) => {
            const next = new Set(prev);
            if (next.has(code)) {
                next.delete(code);
            } else {
                next.add(code);
            }
            return next;
        });
    };

    // Toggle database registration for unmatched courses
    const toggleCustomCourseDatabase = (code: string) => {
        setCustomCoursesToDatabase((prev) => {
            const next = new Set(prev);
            if (next.has(code)) {
                next.delete(code);
            } else {
                next.add(code);
            }
            return next;
        });
    };

    // Reset current parsed state
    const handleReset = () => {
        setParsedData(null);
        setSelectedCourses(new Set());
        setCustomCoursesToDatabase(new Set());
        setPastedText("");
    };

    // Import course data into Zustand app state & DB
    const handleImportSubmit = async () => {
        if (selectedCourses.size === 0) {
            addNotification("error", "Please select at least one course to import");
            return;
        }

        setIsImporting(true);
        try {
            const coursesToImport = parsedData?.parsed_courses.filter((c) => selectedCourses.has(c.code)) || [];
            
            let databaseInsertCount = 0;
            const updatedCompletedList = [...completedCourses];
            const updatedGrades = { ...completedCourseGrades };

            for (const course of coursesToImport) {
                // If it is unmatched, but selected and marked for database registration
                if (!course.matched_in_catalog && customCoursesToDatabase.has(course.code)) {
                    try {
                        await createCourse({
                            code: course.code,
                            name: course.name,
                            credits: course.credits || 3,
                            prerequisites: [],
                            semester_offered: "Both",
                            difficulty_weight: 2,
                            description: `Imported via transcript OCR parser. Grade: ${course.grade || "N/A"}, Term: ${course.term || "N/A"}`
                        });
                        databaseInsertCount++;
                    } catch (err: any) {
                        console.warn(`Failed to insert course ${course.code} into catalog DB:`, err);
                    }
                }

                // Add to completed courses if not already present
                if (!updatedCompletedList.includes(course.code)) {
                    updatedCompletedList.push(course.code);
                }

                // Add/update grade if present
                if (course.grade) {
                    updatedGrades[course.code] = course.grade;
                }
            }

            // Update completed courses and grades in Zustand store
            setCompletedCourses(updatedCompletedList);
            setCompletedCourseGrades(updatedGrades);

            // If we added courses to the database catalog, refetch courses and update store
            if (databaseInsertCount > 0) {
                const catalog = await getCourses();
                setCourses(catalog.courses);
                addNotification("info", `Registered ${databaseInsertCount} custom courses into the course catalog.`);
            }

            addNotification("success", `Imported ${coursesToImport.length} courses to completed milestones!`);
            handleReset();
        } catch (err: any) {
            console.error("Import error:", err);
            addNotification("error", err.message || "Failed to complete course import");
        } finally {
            setIsImporting(false);
        }
    };

    // Render status indicator badge
    const renderStatusBadge = () => {
        if (statusLoading) {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking OCR Node...
                </div>
            );
        }

        if (!status) {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    OCR Backend Offline
                </div>
            );
        }

        return (
            <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${
                    status.ollama_online 
                    ? "bg-green-500/10 border-green-500/20 text-green-400" 
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.ollama_online ? "bg-green-400" : "bg-amber-400 animate-pulse"}`} />
                    LLM: {status.ollama_online ? "Active" : "Offline"}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                    <FileCode className="w-3 h-3" />
                    PyMuPDF: v{status.pymupdf_version}
                </div>
                <button 
                    onClick={fetchStatus} 
                    className="p-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                    title="Refresh Status"
                >
                    <RefreshCw className="w-3 h-3" />
                </button>
            </div>
        );
    };

    return (
        <FeatureGate featureKey="transcript_import" featureName="Transcript Import">
            <div className="min-h-screen bg-[#050510] pb-28 md:pb-12 text-white">
                
                {/* Visual Notifications Layer */}
                <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4">
                    <AnimatePresence>
                        {notifications.map((n) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`glass-card p-4 rounded-xl flex items-start gap-3 border shadow-lg ${
                                    n.type === "success" 
                                    ? "border-green-500/30 bg-green-950/20 text-green-200" 
                                    : n.type === "error"
                                    ? "border-red-500/30 bg-red-950/20 text-red-200"
                                    : n.type === "warning"
                                    ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                                    : "border-blue-500/30 bg-blue-950/20 text-blue-200"
                                }`}
                            >
                                {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
                                {n.type === "error" && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                                {n.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                                {n.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                                <div className="text-sm font-medium">{n.message}</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="container mx-auto max-w-5xl px-4 py-6 pt-24 md:pt-32">
                    
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-teal-400 bg-clip-text text-transparent">
                                Transcript Import
                            </h1>
                            <p className="text-zinc-400 text-sm mt-1">
                                OCR transcript course extractor powered by local LLM models
                            </p>
                        </div>
                        {renderStatusBadge()}
                    </div>

                    <AnimatePresence mode="wait">
                        {!parsedData ? (
                            /* ── UPLOAD OR INPUT FORM ── */
                            <motion.div
                                key="input-form"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-6"
                            >
                                {/* Form Cards & Tab Triggers */}
                                <div className="glass-card overflow-hidden">
                                    <div className="flex border-b border-white/10 bg-white/[0.02]">
                                        <button
                                            onClick={() => setActiveTab("upload")}
                                            className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
                                                activeTab === "upload"
                                                ? "border-teal-400 text-teal-400 bg-white/[0.01]"
                                                : "border-transparent text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            Upload PDF Transcript
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("paste")}
                                            className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
                                                activeTab === "paste"
                                                ? "border-teal-400 text-teal-400 bg-white/[0.01]"
                                                : "border-transparent text-zinc-400 hover:text-white"
                                            }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                            Copy & Paste Raw Text
                                        </button>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        {activeTab === "upload" ? (
                                            /* Tab 1: PDF Dropzone */
                                            <div
                                                {...getRootProps()}
                                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] ${
                                                    isDragActive
                                                    ? "border-teal-400 bg-teal-500/5"
                                                    : "border-white/10 hover:border-zinc-700 bg-black/20"
                                                }`}
                                            >
                                                <input {...getInputProps()} />
                                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-all group-hover:scale-105">
                                                    <UploadCloud className="w-8 h-8 text-zinc-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2">
                                                    {isDragActive ? "Drop your PDF here" : "Drag & drop your transcript PDF"}
                                                </h3>
                                                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                                                    Supports official or unofficial academic transcripts in PDF format.
                                                </p>
                                                <Button type="button" variant="outline" className="rounded-xl px-5 border-white/10 hover:bg-white/5 text-white">
                                                    Browse Files
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Tab 2: Copy Paste Text Area */
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-2">
                                                    <label htmlFor="rawText" className="text-sm font-semibold text-zinc-300">
                                                        Paste Transcript Contents
                                                    </label>
                                                    <textarea
                                                        id="rawText"
                                                        value={pastedText}
                                                        onChange={(e) => setPastedText(e.target.value)}
                                                        placeholder="Copy all text (Ctrl+A) from your unofficial transcript website/portal and paste it here..."
                                                        className="w-full min-h-[250px] bg-black/20 border border-white/10 rounded-xl p-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 text-sm font-mono scrollbar-none"
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button
                                                        onClick={handlePasteSubmit}
                                                        disabled={isProcessing || !pastedText.trim()}
                                                        className="rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold px-6 py-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                    >
                                                        Parse Text Contents
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ollama Model Helper Message */}
                                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-3">
                                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-zinc-500 leading-relaxed">
                                        <span className="font-semibold text-zinc-300">How it works:</span> Local parsing utilizes the python-based <strong>PyMuPDF</strong> parser to extract textual data streams from born-digital PDFs. The textual corpus is then structured by your local <strong>Ollama LLM Instance</strong> (running <code>qwen3:8b-q4_K_M</code>). It maps found courses directly to codes inside the database catalog using automatic normalizations.
                                    </div>
                                </div>

                                {/* Loading Overlay */}
                                {isProcessing && (
                                    <div className="fixed inset-0 z-50 bg-[#050510]/80 backdrop-blur-md flex items-center justify-center p-6">
                                        <div className="glass-card max-w-sm w-full p-8 text-center border-white/10 shadow-2xl flex flex-col items-center">
                                            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
                                            <h3 className="text-lg font-bold text-white mb-2">Analyzing Transcript</h3>
                                            <p className="text-zinc-400 text-sm">{processingStep}</p>
                                            
                                            {/* Subtitle Warning */}
                                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-6">
                                                <div className="h-full bg-teal-400 animate-pulse w-full" />
                                            </div>
                                            <p className="text-zinc-600 text-[10px] mt-3">
                                                This operates 100% locally and may take up to a minute depending on GPU speed.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            /* ── PARSED RESULTS DISPLAY ── */
                            <motion.div
                                key="parsed-results"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-6"
                            >
                                {/* Info Panel */}
                                <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Detected Degree Path</span>
                                        <h2 className="text-xl font-bold text-white mt-0.5">
                                            {parsedData.degree_program || "Undergraduate Curriculum Plan"}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-zinc-400">
                                            <span>Method: <strong className="text-zinc-300 capitalize">{parsedData.extraction_method.replace("_", " ")}</strong></span>
                                            <span>•</span>
                                            <span>Parsed Courses: <strong className="text-zinc-300">{parsedData.parsed_courses.length}</strong></span>
                                            <span>•</span>
                                            <span>Total Credits: <strong className="text-zinc-300">{parsedData.total_credits}</strong></span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleReset}
                                            className="rounded-xl border-white/10 hover:bg-white/5 text-zinc-300 text-xs"
                                        >
                                            <ArrowLeft className="w-4.5 h-4.5 mr-1" />
                                            Start Over
                                        </Button>
                                        <Button
                                            onClick={handleImportSubmit}
                                            disabled={isImporting || selectedCourses.size === 0}
                                            className="rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs px-5 shadow-lg shadow-teal-500/10 active:scale-95 disabled:opacity-50"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Import Selected ({selectedCourses.size})
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Table Card */}
                                <div className="glass-card overflow-hidden">
                                    <div className="px-6 py-4 bg-white/[0.02] border-b border-white/10 flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-zinc-300">Parsed Completed Courses</h3>
                                        <div className="flex gap-3 text-xs">
                                            <button 
                                                onClick={() => {
                                                    const allCodes = parsedData.parsed_courses.map(c => c.code);
                                                    setSelectedCourses(new Set(allCodes));
                                                }}
                                                className="text-zinc-400 hover:text-white"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-zinc-700">|</span>
                                            <button 
                                                onClick={() => setSelectedCourses(new Set())}
                                                className="text-zinc-400 hover:text-white"
                                            >
                                                Clear Selected
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10 text-zinc-500 font-semibold text-xs">
                                                    <th className="py-4 px-6 w-10">Select</th>
                                                    <th className="py-4 px-4 w-28">Code</th>
                                                    <th className="py-4 px-4">Title</th>
                                                    <th className="py-4 px-4 w-20 text-center">Credits</th>
                                                    <th className="py-4 px-4 w-20 text-center">Grade</th>
                                                    <th className="py-4 px-4 w-24">Term</th>
                                                    <th className="py-4 px-6 w-48 text-right">Status / Catalog Sync</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {parsedData.parsed_courses.map((course, idx) => {
                                                    const isChecked = selectedCourses.has(course.code);
                                                    const isMatched = course.matched_in_catalog;
                                                    const shouldAddToDB = customCoursesToDatabase.has(course.code);

                                                    return (
                                                        <tr 
                                                            key={course.code + idx}
                                                            className={`transition-colors duration-150 ${
                                                                isChecked ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                                                            }`}
                                                        >
                                                            {/* Checkbox selector */}
                                                            <td className="py-3 px-6 text-center">
                                                                <button
                                                                    onClick={() => toggleSelectCourse(course.code)}
                                                                    className="text-zinc-400 hover:text-white transition-colors"
                                                                >
                                                                    {isChecked ? (
                                                                        <CheckSquare className="w-4.5 h-4.5 text-teal-400" />
                                                                    ) : (
                                                                        <Square className="w-4.5 h-4.5" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                            
                                                            {/* Course code */}
                                                            <td className="py-3 px-4 font-semibold text-zinc-200 font-mono">
                                                                {course.code}
                                                            </td>

                                                            {/* Course Title */}
                                                            <td className="py-3 px-4 text-zinc-300 font-medium max-w-xs truncate">
                                                                {course.name}
                                                            </td>

                                                            {/* Credits */}
                                                            <td className="py-3 px-4 text-center text-zinc-400">
                                                                {course.credits !== undefined ? course.credits : 3}
                                                            </td>

                                                            {/* Grade */}
                                                            <td className="py-3 px-4 text-center font-bold text-zinc-300 font-mono">
                                                                {course.grade || "—"}
                                                            </td>

                                                            {/* Term */}
                                                            <td className="py-3 px-4 text-zinc-400 text-xs truncate">
                                                                {course.term || "N/A"}
                                                            </td>

                                                            {/* Catalog match status & addition checkbox */}
                                                            <td className="py-3 px-6 text-right">
                                                                <div className="flex flex-col items-end gap-1.5">
                                                                    {isMatched ? (
                                                                        <Badge className="bg-green-500/10 border-green-500/20 text-green-400 font-semibold px-2 py-0.5 rounded text-[10px]">
                                                                            Matched in Catalog
                                                                        </Badge>
                                                                    ) : (
                                                                        <>
                                                                            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded text-[10px] mb-0.5">
                                                                                Not in Catalog
                                                                            </Badge>
                                                                            {isChecked && (
                                                                                <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300 select-none">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={shouldAddToDB}
                                                                                        onChange={() => toggleCustomCourseDatabase(course.code)}
                                                                                        className="rounded bg-black border-white/10 text-teal-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                                                                                    />
                                                                                    Save to Course DB
                                                                                </label>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Raw text or unmatched courses fallback list */}
                                {parsedData.unmatched_raw && parsedData.unmatched_raw.length > 0 && (
                                    <div className="glass-card p-6">
                                        <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            Unmatched Raw Lines
                                        </h3>
                                        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                                            The local LLM identified the following transcript entries but could not confidently resolve them to a course model. Review them below:
                                        </p>
                                        <div className="bg-black/35 rounded-xl border border-white/5 p-4 max-h-[180px] overflow-y-auto font-mono text-xs text-zinc-400 divide-y divide-white/5 space-y-1.5 scrollbar-none">
                                            {parsedData.unmatched_raw.map((line, idx) => (
                                                <div key={idx} className="pt-1.5 first:pt-0">
                                                    {line}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </FeatureGate>
    );
}
