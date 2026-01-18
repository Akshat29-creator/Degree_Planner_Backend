"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    AlertCircle,
    CheckCircle2,
    X,
    FileJson,
    Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, validateCourseData } from "@/lib/store";
import type { Course } from "@/lib/api";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DataUploadModal({ isOpen, onClose }: UploadModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<Course[] | null>(null);

    const loadUploadedData = useAppStore((state) => state.loadUploadedData);
    const setValidationResult = useAppStore((state) => state.setValidationResult);

    const parseCSV = (text: string): Course[] => {
        const lines = text.trim().split("\n");
        const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());

        const codeIdx = headers.findIndex((h) => h.includes("code"));
        const nameIdx = headers.findIndex((h) => h.includes("name"));
        const creditsIdx = headers.findIndex((h) => h.includes("credit"));
        const prereqIdx = headers.findIndex((h) => h.includes("prereq"));

        if (codeIdx === -1 || nameIdx === -1 || creditsIdx === -1) {
            throw new Error("CSV must have columns: code, name, credits");
        }

        return lines.slice(1).map((line) => {
            const cols = line.split(",").map((c) => c.trim());
            return {
                code: cols[codeIdx] || "",
                name: cols[nameIdx] || "",
                credits: parseInt(cols[creditsIdx]) || 0,
                prerequisites: prereqIdx >= 0 && cols[prereqIdx]
                    ? cols[prereqIdx].split(";").map((p) => p.trim()).filter(Boolean)
                    : [],
            };
        }).filter((c) => c.code);
    };

    const parseJSON = (text: string): Course[] => {
        const data = JSON.parse(text);
        const courses = Array.isArray(data) ? data : data.courses;

        if (!Array.isArray(courses)) {
            throw new Error("JSON must be an array of courses or have a 'courses' field");
        }

        return courses.map((c: any) => ({
            code: c.code || c.course_code || "",
            name: c.name || c.course_name || c.title || "",
            credits: parseInt(c.credits || c.credit_hours || 0),
            prerequisites: Array.isArray(c.prerequisites)
                ? c.prerequisites
                : typeof c.prerequisites === "string"
                    ? c.prerequisites.split(";").map((p: string) => p.trim()).filter(Boolean)
                    : [],
        })).filter((c: Course) => c.code);
    };

    const handleFile = useCallback(async (file: File) => {
        setError(null);
        setPreview(null);

        try {
            const text = await file.text();
            let courses: Course[];

            if (file.name.endsWith(".csv")) {
                courses = parseCSV(text);
            } else if (file.name.endsWith(".json")) {
                courses = parseJSON(text);
            } else {
                throw new Error("Only CSV and JSON files are supported");
            }

            if (courses.length === 0) {
                throw new Error("No valid courses found in file");
            }

            // Validate the data
            const validation = validateCourseData(courses, []);

            if (!validation.isValid) {
                setError(validation.errors.map((e) => e.message).join("\n"));
                return;
            }

            setPreview(courses);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to parse file");
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleConfirm = () => {
        if (preview) {
            loadUploadedData(preview);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Upload Course Data</h2>
                            <p className="text-zinc-400 text-sm mt-1">
                                CSV or JSON file with your courses
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                                ? "border-teal-500 bg-teal-500/10"
                                : "border-zinc-700 hover:border-zinc-600"
                            }`}
                    >
                        <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">
                            Drag & drop your file here
                        </p>
                        <p className="text-zinc-500 text-sm mb-4">or</p>
                        <label>
                            <input
                                type="file"
                                accept=".csv,.json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFile(file);
                                }}
                            />
                            <span className="inline-block px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl cursor-pointer transition-colors">
                                Browse Files
                            </span>
                        </label>
                    </div>

                    {/* Format Help */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Table className="w-4 h-4 text-teal-400" />
                                <span className="text-sm font-medium text-white">CSV Format</span>
                            </div>
                            <code className="text-xs text-zinc-400 block">
                                code,name,credits,prerequisites<br />
                                CS101,Intro to CS,3,<br />
                                CS201,Data Structures,4,CS101
                            </code>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                            <div className="flex items-center gap-2 mb-2">
                                <FileJson className="w-4 h-4 text-violet-400" />
                                <span className="text-sm font-medium text-white">JSON Format</span>
                            </div>
                            <code className="text-xs text-zinc-400 block">
                                {"[\n"}
                                {"  {\"code\": \"CS101\", ...}\n"}
                                {"]"}
                            </code>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-medium">Validation Failed</p>
                                <p className="text-red-300/80 text-sm whitespace-pre-wrap">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-medium">
                                    {preview.length} courses found
                                </span>
                            </div>

                            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 max-h-48 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-800 sticky top-0">
                                        <tr>
                                            <th className="text-left p-3 text-zinc-400">Code</th>
                                            <th className="text-left p-3 text-zinc-400">Name</th>
                                            <th className="text-left p-3 text-zinc-400">Credits</th>
                                            <th className="text-left p-3 text-zinc-400">Prerequisites</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 10).map((course) => (
                                            <tr key={course.code} className="border-t border-zinc-700">
                                                <td className="p-3 text-white font-medium">{course.code}</td>
                                                <td className="p-3 text-zinc-300">{course.name}</td>
                                                <td className="p-3 text-zinc-300">{course.credits}</td>
                                                <td className="p-3 text-zinc-400">
                                                    {course.prerequisites.join(", ") || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 10 && (
                                    <p className="text-center text-zinc-500 py-2 text-sm">
                                        ...and {preview.length - 10} more
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleConfirm}
                                className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold py-6 rounded-xl"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Import {preview.length} Courses
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ==========================================
// DEMO DATA BANNER COMPONENT
// ==========================================
export function DemoBanner() {
    const dataSource = useAppStore((state) => state.dataSource);
    const clearData = useAppStore((state) => state.clearData);

    if (dataSource !== "demo") return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-amber-600 to-orange-600 text-black py-2 px-4"
        >
            <div className="container max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold">DEMO MODE</span>
                    <span className="text-black/70">
                        — Using sample data. Upload your own for real planning.
                    </span>
                </div>
                <button
                    onClick={clearData}
                    className="text-sm font-medium px-3 py-1 bg-black/20 hover:bg-black/30 rounded-lg transition-colors"
                >
                    Clear & Upload
                </button>
            </div>
        </motion.div>
    );
}

// ==========================================
// VALIDATION STATUS COMPONENT
// ==========================================
export function ValidationStatus() {
    const validationResult = useAppStore((state) => state.validationResult);
    const dataSource = useAppStore((state) => state.dataSource);

    if (!validationResult || !dataSource) return null;

    const { isValid, errors, warnings } = validationResult;

    if (isValid && warnings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border ${isValid
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
        >
            {!isValid && (
                <div className="mb-3">
                    <p className="text-red-400 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Validation Errors
                    </p>
                    <ul className="text-red-300/80 text-sm mt-2 space-y-1">
                        {errors.map((e, i) => (
                            <li key={i}>• {e.message}</li>
                        ))}
                    </ul>
                </div>
            )}
            {warnings.length > 0 && (
                <div>
                    <p className="text-amber-400 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Warnings
                    </p>
                    <ul className="text-amber-300/80 text-sm mt-2 space-y-1">
                        {warnings.map((w, i) => (
                            <li key={i}>• {w}</li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
}
