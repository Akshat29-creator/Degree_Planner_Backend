"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateStudyPlan } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    BookOpen,
    Calendar,
    Clock,
    Zap,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Brain,
    GraduationCap,
    Download,
    Plus,
    X,
    CalendarDays,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudyCopilotPage() {
    // Global Store State
    const {
        studySubjects, setStudySubjects,
        studyAvailableHours, setStudyAvailableHours,
        studyExams, setStudyExams,
        studyWeaknesses, setStudyWeaknesses,
        studyPlan, setStudyPlan,
        resetStudyData
    } = useAppStore();

    // Local Temporary Input State
    const [newSubject, setNewSubject] = useState("");
    const [newWeakness, setNewWeakness] = useState("");
    const [newExamSubject, setNewExamSubject] = useState("");
    const [newExamDate, setNewExamDate] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddSubject = () => {
        if (newSubject.trim() && !studySubjects.includes(newSubject.trim())) {
            setStudySubjects([...studySubjects, newSubject.trim()]);
            setNewSubject("");
        }
    };

    const handleAddWeakness = () => {
        if (newWeakness.trim() && !studyWeaknesses.includes(newWeakness.trim())) {
            setStudyWeaknesses([...studyWeaknesses, newWeakness.trim()]);
            setNewWeakness("");
        }
    };

    const handleAddExam = () => {
        if (newExamSubject && newExamDate) {
            setStudyExams([...studyExams, { subject: newExamSubject, date: newExamDate }]);
            setNewExamSubject("");
            setNewExamDate("");
        }
    };

    const handleGenerate = async () => {
        if (studySubjects.length === 0) {
            setError("Please add at least one subject.");
            return;
        }

        setIsLoading(true);
        setError(null);
        // Don't clear plan immediately to prevent flickering if re-generating same data

        try {
            const examMap: Record<string, string> = {};
            studyExams.forEach(e => examMap[e.subject] = e.date);

            const result = await generateStudyPlan({
                subjects: studySubjects,
                available_hours: studyAvailableHours,
                exams: examMap,
                weaknesses: studyWeaknesses
            });

            setStudyPlan(result);
        } catch (err) {
            console.error(err);
            setError("Failed to generate study plan. Please ensure local AI is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to clear all your study data?")) {
            resetStudyData();
            setNewSubject("");
            setNewWeakness("");
            setNewExamSubject("");
            setNewExamDate("");
            setError(null);
        }
    };

    const handleDownloadPDF = () => {
        if (!studyPlan) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFillColor(139, 92, 246); // Violet 500
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text("Your Personalized Study Plan", 14, 15);
            doc.setFontSize(11);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 23);
            doc.setFontSize(10);

            let yPos = 38;

            // Weekly Focus
            doc.setFillColor(240, 240, 255);
            doc.rect(10, yPos - 5, 190, 15, 'F');
            doc.setTextColor(100, 50, 200);
            doc.setFontSize(12);
            doc.text("🎯 Weekly Focus:", 14, yPos + 2);
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const focusLines = doc.splitTextToSize(studyPlan.weekly_focus, 145);
            doc.text(focusLines, 55, yPos + 2);
            yPos += 20;

            // Motivation (if available)
            if (studyPlan.motivation) {
                doc.setFillColor(255, 250, 240);
                doc.rect(10, yPos - 3, 190, 12, 'F');
                doc.setTextColor(200, 120, 0);
                doc.setFontSize(10);
                doc.text(`💪 ${studyPlan.motivation}`, 14, yPos + 4);
                yPos += 16;
            }

            // Schedule Table
            doc.setTextColor(0, 0, 0);
            autoTable(doc, {
                startY: yPos,
                head: [["Day", "Time", "Subject", "Goal", "Effort"]],
                body: studyPlan.schedule.map(b => [b.day, b.time_block, b.subject, b.focus_goal, b.effort]),
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246] },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 75 },
                    4: { cellWidth: 20 },
                },
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 10;

            // Personalized Tips
            if (studyPlan.personalized_tips && studyPlan.personalized_tips.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(20, 120, 180);
                doc.text("💡 Personalized Tips for You:", 14, yPos);
                yPos += 7;
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                studyPlan.personalized_tips.forEach((tip, i) => {
                    const tipLines = doc.splitTextToSize(`${i + 1}. ${tip}`, 180);
                    doc.text(tipLines, 14, yPos);
                    yPos += tipLines.length * 5 + 2;
                });
                yPos += 5;
            }

            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Strength Analysis
            if (studyPlan.strength_analysis) {
                doc.setFontSize(11);
                doc.setTextColor(34, 139, 34);
                doc.text("✅ Strengths:", 14, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                const strengthLines = doc.splitTextToSize(studyPlan.strength_analysis, 180);
                doc.text(strengthLines, 14, yPos);
                yPos += strengthLines.length * 5 + 8;
            }

            // Weakness Insights
            if (studyPlan.weakness_insights) {
                doc.setFontSize(11);
                doc.setTextColor(200, 100, 0);
                doc.text("⚠️ Areas to Focus On:", 14, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                const weaknessLines = doc.splitTextToSize(studyPlan.weakness_insights, 180);
                doc.text(weaknessLines, 14, yPos);
                yPos += weaknessLines.length * 5 + 8;
            }

            // Recovery Plan
            if (studyPlan.recovery_plan) {
                doc.setFontSize(11);
                doc.setTextColor(220, 38, 38);
                doc.text("🔄 Recovery Strategy:", 14, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                const splitRec = doc.splitTextToSize(studyPlan.recovery_plan, 180);
                doc.text(splitRec, 14, yPos);
            }

            // Footer
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text("Generated by Degree Planner Agent • Your AI Study Companion", 105, 290, { align: "center" });
            }

            // Generate Blob manually to force filename
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `my_study_plan_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF download failed", err);
        }
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8 pt-32">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                        <Brain className="h-4 w-4" />
                        Personalized Study Copilot
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Build Your Perfect Study Routine</h1>
                    <p className="text-zinc-400">AI-powered adaptive planning tailored to your exams and weak spots.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 self-start md:self-center"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Data
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    {/* Subjects */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-purple-400" />
                            Subjects
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <Input
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Add subject (e.g. Math)"
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                            />
                            <Button size="icon" onClick={handleAddSubject} className="shrink-0 bg-purple-600 hover:bg-purple-500">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {studySubjects.map(sub => (
                                <Badge key={sub} variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                                    {sub}
                                    <X
                                        className="h-3 w-3 ml-2 cursor-pointer hover:text-white"
                                        onClick={() => setStudySubjects(studySubjects.filter(s => s !== sub))}
                                    />
                                </Badge>
                            ))}
                            {studySubjects.length === 0 && <span className="text-sm text-zinc-500">No subjects added</span>}
                        </div>
                    </div>

                    {/* Available Hours */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-teal-400" />
                            Available Hours
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(studyAvailableHours).map(([day, hours]) => (
                                <div key={day} className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-zinc-300 w-24">{day}</span>
                                    <Slider
                                        value={[hours]}
                                        max={12}
                                        step={0.5}
                                        onValueChange={(val) => setStudyAvailableHours({ ...studyAvailableHours, [day]: val[0] })}
                                        className="flex-1"
                                    />
                                    <span className="text-sm font-mono text-teal-400 w-12 text-right">{hours}h</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exams */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-red-400" />
                            Upcoming Exams
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input
                                value={newExamSubject}
                                onChange={(e) => setNewExamSubject(e.target.value)}
                                placeholder="Subject"
                                className="bg-white/5 border-white/10"
                            />
                            <Input
                                type="date"
                                value={newExamDate}
                                onChange={(e) => setNewExamDate(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <Button onClick={handleAddExam} className="w-full mb-4 bg-white/5 hover:bg-white/10 text-zinc-200">
                            Add Exam
                        </Button>
                        <div className="space-y-2">
                            {studyExams.map((exam, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 rounded bg-white/5">
                                    <span className="text-white">{exam.subject}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-400">{exam.date}</span>
                                        <X
                                            className="h-3 w-3 text-zinc-500 cursor-pointer hover:text-white"
                                            onClick={() => setStudyExams(studyExams.filter((_, idx) => idx !== i))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-400" />
                            Weaknesses
                        </h3>
                        <div className="flex gap-2 mb-4">
                            <Input
                                value={newWeakness}
                                onChange={(e) => setNewWeakness(e.target.value)}
                                placeholder="e.g. Calculus"
                                className="bg-white/5 border-white/10"
                                onKeyDown={(e) => e.key === "Enter" && handleAddWeakness()}
                            />
                            <Button size="icon" onClick={handleAddWeakness} className="shrink-0 bg-orange-600 hover:bg-orange-500">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {studyWeaknesses.map(w => (
                                <Badge key={w} variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                                    {w}
                                    <X
                                        className="h-3 w-3 ml-2 cursor-pointer hover:text-white"
                                        onClick={() => setStudyWeaknesses(studyWeaknesses.filter(i => i !== w))}
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || studySubjects.length === 0}
                        className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-900/20"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Designing Plan...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Generate Study Plan
                            </>
                        )}
                    </Button>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-2 space-y-6">
                    {!studyPlan && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 glass-card text-center border-dashed border-2 border-white/10">
                            <Brain className="h-16 w-16 text-zinc-600 mb-6" />
                            <h3 className="text-xl font-medium text-white mb-2">Ready to Optimize Your Schedule</h3>
                            <p className="text-zinc-500 max-w-md">
                                Add your subjects, availability, and exam dates on the left.
                                We'll use local AI to build a perfectly balanced study routine.
                            </p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 glass-card">
                            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-6" />
                            <p className="text-zinc-400">Analyzing your workload...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {studyPlan && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Focus Banner */}
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 border border-blue-500/20">
                                <h2 className="text-xl font-semibold text-white mb-2">Weekly Focus Goal</h2>
                                <p className="text-blue-200">{studyPlan.weekly_focus}</p>
                                {studyPlan.recovery_plan && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-sm font-medium text-red-300 mb-1">Recovery Strategy</p>
                                        <p className="text-sm text-zinc-400">{studyPlan.recovery_plan}</p>
                                    </div>
                                )}
                            </div>

                            {/* Schedule Grid */}
                            <div className="glass-card overflow-hidden">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-400" />
                                        Your Schedule
                                    </h3>
                                    <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="border-white/10 text-white hover:bg-white/5">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Plan
                                    </Button>
                                </div>
                                <div className="divide-y divide-white/10">
                                    {studyPlan.schedule.map((block, i) => (
                                        <div key={i} className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row gap-4 md:items-center">
                                            <div className="md:w-32 flex-shrink-0">
                                                <div className="font-medium text-white">{block.day}</div>
                                                <div className="text-sm text-zinc-500">{block.time_block}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-blue-300">{block.subject}</span>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px]",
                                                        block.effort === "High" && "border-red-500/30 text-red-400",
                                                        block.effort === "Medium" && "border-yellow-500/30 text-yellow-400",
                                                        block.effort === "Low" && "border-green-500/30 text-green-400",
                                                    )}>
                                                        {block.effort} Effort
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-zinc-400 truncate">
                                                    {block.focus_goal}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
