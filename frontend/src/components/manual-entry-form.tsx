"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    Plus,
    Trash2,
    Wand2,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    BookOpen,
    GraduationCap,
    Loader2,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { analyzeManualEntry, ManualCourse, ManualEntryRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManualEntryFormProps {
    onAnalysisComplete: (result: any) => void;
}

export function ManualEntryForm({ onAnalysisComplete }: ManualEntryFormProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Form State
    const [degreeProgram, setDegreeProgram] = useState("Computer Science");
    const [currentYear, setCurrentYear] = useState("1");
    const [careerGoal, setCareerGoal] = useState("");

    // Course List State
    const [courses, setCourses] = useState<ManualCourse[]>([
        { code: "", name: "", credits: 3, prerequisites: [] }
    ]);

    const addCourse = () => {
        setCourses([...courses, { code: "", name: "", credits: 3, prerequisites: [] }]);
    };

    const removeCourse = (index: number) => {
        if (courses.length > 1) {
            setCourses(courses.filter((_, i) => i !== index));
        }
    };

    const updateCourse = (index: number, field: keyof ManualCourse, value: any) => {
        const newCourses = [...courses];
        if (field === 'prerequisites') {
            // Handle comma-separated string to array
            if (typeof value === 'string') {
                newCourses[index] = {
                    ...newCourses[index],
                    prerequisites: value.split(',').map(s => s.trim()).filter(Boolean)
                };
            } else {
                newCourses[index] = { ...newCourses[index], [field]: value };
            }
        } else {
            newCourses[index] = { ...newCourses[index], [field]: value };
        }
        setCourses(newCourses);
    };

    const handleSubmit = async () => {
        // Basic Validation
        const validCourses = courses.filter(c => c.code && c.name);
        if (validCourses.length === 0) {
            toast.error("Please add at least one course with Code and Name");
            return;
        }

        setIsAnalyzing(true);
        const toastId = toast.loading("AI is analyzing your manual entry...");

        try {
            const request: ManualEntryRequest = {
                degree_program: degreeProgram,
                current_year: parseInt(currentYear),
                total_years: 4,
                remaining_semesters: (4 - parseInt(currentYear) + 1) * 2, // Approximation
                courses: validCourses,
                career_goal: careerGoal
            };

            const result = await analyzeManualEntry(request);

            if (result.is_valid) {
                toast.success("Analysis complete!", { id: toastId });
                onAnalysisComplete(result);
            } else {
                toast.error("Found issues with your entry", { id: toastId });
                // Still pass result to show issues
                onAnalysisComplete(result);
            }
        } catch (error) {
            toast.error("Failed to analyze courses", { id: toastId });
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-zinc-900/80 to-black/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-32 h-32 text-teal-400" />
                </div>

                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-6">
                    Program Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                        <Label className="text-zinc-400 font-medium">Degree Program</Label>
                        <Input
                            value={degreeProgram}
                            onChange={(e) => setDegreeProgram(e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="bg-black/40 border-zinc-700/50 focus:border-teal-500/50 h-12 rounded-xl text-lg backdrop-blur-sm transition-all"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-zinc-400 font-medium">Current Year</Label>
                        <Select value={currentYear} onValueChange={setCurrentYear}>
                            <SelectTrigger className="bg-black/40 border-zinc-700/50 focus:border-teal-500/50 h-12 rounded-xl backdrop-blur-sm transition-all">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="1">Year 1 (Freshman)</SelectItem>
                                <SelectItem value="2">Year 2 (Sophomore)</SelectItem>
                                <SelectItem value="3">Year 3 (Junior)</SelectItem>
                                <SelectItem value="4">Year 4 (Senior)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-8 space-y-3 relative z-10">
                    <Label className="text-zinc-400 font-medium">Career Goal (Optional)</Label>
                    <Input
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        placeholder="e.g. Software Engineer, Data Scientist"
                        className="bg-black/40 border-zinc-700/50 focus:border-teal-500/50 h-12 rounded-xl backdrop-blur-sm transition-all"
                    />
                </div>
            </div>

            {/* Course Entry Table */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-teal-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Course List</h3>
                    </div>
                    <Button
                        onClick={addCourse}
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 border border-teal-500/20 rounded-xl"
                    >
                        <Plus className="w-4 h-4" /> Add Course
                    </Button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {courses.map((course, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700 rounded-2xl transition-all shadow-lg backdrop-blur-sm relative z-10">
                                    <div className="md:col-span-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-500 uppercase tracking-wider">Code</Label>
                                            <Input
                                                placeholder="CS101"
                                                value={course.code}
                                                onChange={(e) => updateCourse(index, 'code', e.target.value)}
                                                className="bg-black/20 border-zinc-800 focus:border-teal-500/50 font-mono text-sm uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-500 uppercase tracking-wider">Course Name</Label>
                                            <Input
                                                placeholder="Intro to Programming"
                                                value={course.name}
                                                onChange={(e) => updateCourse(index, 'name', e.target.value)}
                                                className="bg-black/20 border-zinc-800 focus:border-teal-500/50 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-500 uppercase tracking-wider">Credits</Label>
                                            <Input
                                                type="number"
                                                placeholder="3"
                                                value={course.credits}
                                                onChange={(e) => updateCourse(index, 'credits', parseInt(e.target.value) || 0)}
                                                className="bg-black/20 border-zinc-800 focus:border-teal-500/50 text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                                                <span>Prerequisites</span>
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-zinc-800 text-teal-500/80 bg-teal-900/10">Optional</Badge>
                                            </Label>
                                            <Input
                                                placeholder="AI will detect automatically..."
                                                value={course.prerequisites.join(', ')}
                                                onChange={(e) => updateCourse(index, 'prerequisites', e.target.value)}
                                                className="bg-black/20 border-zinc-800 focus:border-teal-500/50 text-sm placeholder:text-zinc-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-1 flex justify-center items-end pb-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCourse(index)}
                                            className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 h-9 w-9"
                                            disabled={courses.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="pt-8 flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isAnalyzing}
                    className="relative group bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-6 px-10 rounded-2xl shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-1000 transform -skew-x-12 -translate-x-full" />

                    {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing Plan...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5" />
                            <span>Generate AI Analysis</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
