"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, Calendar, ChevronRight, GraduationCap, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/api";

export function VisualRoadmap({ plan, difficulty, courses = [], completedCourses = [] }: {
    plan: Record<string, string[]>;
    difficulty: Record<string, string>;
    courses?: Course[];
    completedCourses?: string[];
}) {
    const [expandedSem, setExpandedSem] = useState<string | null>(null);

    // Helper to get semester number
    const getSemNum = (s: string) => parseInt(s.replace(/\D/g, '')) || 0;

    // Sort semesters
    const sortedSemesters = Object.entries(plan).sort((a, b) => {
        return getSemNum(a[0]) - getSemNum(b[0]);
    });

    // Group by Year
    const semestersByYear = sortedSemesters.reduce((acc, [semNr, semCourses]) => {
        const num = getSemNum(semNr);
        const year = Math.ceil(num / 2);
        if (!acc[year]) acc[year] = [];

        acc[year].push({
            id: semNr,
            courses: semCourses,
            num,
            semesterName: num % 2 === 0 ? "Spring" : "Fall"
        });
        return acc;
    }, {} as Record<number, { id: string; courses: string[]; num: number; semesterName: string }[]>);

    // Stats
    const totalCourses = sortedSemesters.reduce((sum, [, c]) => sum + c.length, 0);
    const graduationYear = new Date().getFullYear() + Object.keys(semestersByYear).length;

    // Derived: Map course code to column ID (semester_x, completed, unscheduled)
    const courseToColId = useMemo(() => {
        const mapping: Record<string, string> = {};
        completedCourses.forEach(code => {
            mapping[code] = "completed";
        });
        Object.entries(plan).forEach(([semId, semCourses]) => {
            semCourses.forEach(code => {
                if (!completedCourses.includes(code)) {
                    mapping[code] = semId;
                }
            });
        });
        return mapping;
    }, [plan, completedCourses]);

    // Helper to check if a semester number is earlier
    const isSemesterEarlier = (semA: string | undefined, semB: string | undefined) => {
        if (!semA) return false;
        if (!semB) return true;
        if (semA === "completed") return true;
        if (semB === "completed") return false;
        if (semA === "unscheduled") return false;
        if (semB === "unscheduled") return true;
        const numA = parseInt(semA.replace("semester_", "")) || 0;
        const numB = parseInt(semB.replace("semester_", "")) || 0;
        return numA < numB;
    };

    // Derived: Course Code to details map
    const courseDetailsMap = useMemo(() => {
        return new Map((courses || []).map(c => [c.code, c]));
    }, [courses]);

    // Compute conflict alerts for each course code in the plan
    const courseConflicts = useMemo(() => {
        const conflictsMap: Record<string, string[]> = {};
        
        (courses || []).forEach(course => {
            const courseSem = courseToColId[course.code];
            if (!courseSem || courseSem === "completed" || courseSem === "unscheduled") return;
            
            course.prerequisites.forEach(prereq => {
                const prereqSem = courseToColId[prereq];
                if (!prereqSem || prereqSem === "unscheduled" || !isSemesterEarlier(prereqSem, courseSem)) {
                    if (!conflictsMap[course.code]) {
                        conflictsMap[course.code] = [];
                    }
                    const prereqLocation = prereqSem === "completed" ? "Completed" : 
                                           prereqSem === "unscheduled" ? "Unscheduled" : 
                                           prereqSem ? prereqSem.replace("semester_", "Semester ") : "Unscheduled";
                    conflictsMap[course.code].push(`${prereq} (scheduled in ${prereqLocation})`);
                }
            });
        });
        
        return conflictsMap;
    }, [courses, courseToColId]);

    return (
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-[#0a0a16]/80 backdrop-blur-2xl border border-white/5 shadow-2xl relative overflow-hidden group/card shadow-violet-500/5">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-xl">
                        <MapIcon className="h-6 w-6 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                            Academic Roadmap
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium tracking-wide">
                            {sortedSemesters.length} Semesters • {totalCourses} Courses
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="self-start md:self-auto bg-violet-500/10 text-violet-300 border-violet-500/20 px-4 py-1.5 text-xs font-bold rounded-full">
                    Class of {graduationYear}
                </Badge>
            </div>

            {/* Timelines by Year */}
            <div className="relative z-10 space-y-12">
                {/* Vertical Spine Line */}
                <div className="absolute top-4 bottom-4 left-[19px] md:left-1/2 md:-translate-x-1/2 w-0.5 bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-emerald-500/50 rounded-full hidden md:block" />

                {Object.entries(semestersByYear).map(([yearStr, semesters], yearIndex) => {
                    const year = parseInt(yearStr);

                    return (
                        <motion.div
                            key={year}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: yearIndex * 0.1 }}
                            className="relative"
                        >
                            {/* Year Marker */}
                            <div className="flex items-center gap-4 mb-6 md:justify-center relative">
                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#0a0a16] border-4 border-zinc-900 items-center justify-center z-20 shadow-xl ring-2 ring-white/10">
                                    <span className="text-[10px] font-black text-white">{year}</span>
                                </div>
                                <div className="md:hidden flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-lg font-black text-white">{year}</span>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Year {year}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-12 lg:gap-16">
                                {semesters.map((sem, semIndex) => {
                                    const diff = difficulty[sem.id] || "Moderate";

                                    // Visual Config
                                    const diffConfig = {
                                        Light: { color: "emerald", icon: "🌿", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                                        Moderate: { color: "amber", icon: "⚡", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
                                        Heavy: { color: "rose", icon: "🔥", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
                                    }[diff] || { color: "amber", icon: "⚡", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" };

                                    return (
                                        <motion.div
                                            key={sem.id}
                                            whileHover={{ y: -4 }}
                                            onClick={() => setExpandedSem(expandedSem === sem.id ? null : sem.id)}
                                            className={cn(
                                                "relative p-6 rounded-3xl bg-[#0f0f1d] border border-white/5 hover:border-white/10 transition-all duration-300 group shadow-lg cursor-pointer md:cursor-default",
                                                semIndex % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl bg-gradient-to-br",
                                                diff === "Heavy" ? "from-rose-500/5" : diff === "Light" ? "from-emerald-500/5" : "from-amber-500/5"
                                            )} />

                                            {/* Semester Header */}
                                            <div className="flex justify-between items-center relative z-10 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                                            {sem.semesterName}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-zinc-500">SEM {sem.num}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide", diffConfig.bg, diffConfig.text)}>
                                                        {diffConfig.icon} {diff}
                                                    </div>
                                                    <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform md:hidden", expandedSem === sem.id ? "rotate-180" : "")} />
                                                </div>
                                            </div>

                                            {/* Accordion Body */}
                                            <div className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out md:block",
                                                expandedSem === sem.id ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0 md:max-h-[1500px] md:opacity-100"
                                            )}>
                                                {/* Courses */}
                                                <div className="space-y-3 relative z-10">
                                                    {sem.courses.map((code, idx) => {
                                                         const courseInfo = courseDetailsMap.get(code);
                                                         const conflictsList = courseConflicts[code];
                                                         const hasConflict = !!conflictsList && conflictsList.length > 0;
                                                         
                                                         // Determine local difficulty for this specific course
                                                         const cDiff = courseInfo?.difficulty === "Easy" ? "Easy" : courseInfo?.difficulty === "Hard" ? "Hard" : "Medium";
                                                         const cDiffConfig = {
                                                             Easy: { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "🌿" },
                                                             Medium: { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: "⚡" },
                                                             Hard: { bg: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: "🔥" },
                                                         }[cDiff];

                                                         return (
                                                             <div 
                                                                 key={idx} 
                                                                 className={cn(
                                                                     "relative flex flex-col p-4 rounded-2xl bg-black/40 border hover:bg-black/60 transition-all duration-300 group/item backdrop-blur-sm",
                                                                     hasConflict 
                                                                         ? "border-red-500/30 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.05)]" 
                                                                         : "border-white/5 hover:border-white/10"
                                                                 )}
                                                             >
                                                                 {/* Top Row: Code + Credits + Difficulty */}
                                                                 <div className="flex items-center justify-between mb-2">
                                                                     <span className="text-xs font-mono font-black text-zinc-300 group-hover/item:text-teal-400 transition-colors">
                                                                         {code}
                                                                     </span>
                                                                     <div className="flex items-center gap-2">
                                                                         <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                                             {courseInfo?.credits || 3} Cr
                                                                         </span>
                                                                         <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", cDiffConfig.bg)}>
                                                                             {cDiffConfig.icon} {cDiff}
                                                                         </span>
                                                                     </div>
                                                                 </div>

                                                                 {/* Course Title */}
                                                                 <h4 className="text-sm font-semibold text-zinc-400 leading-snug group-hover/item:text-white transition-colors">
                                                                     {courseInfo?.name || "Course Title"}
                                                                 </h4>

                                                                 {/* Conflict Alerts */}
                                                                 {hasConflict && (
                                                                     <div className="mt-3 p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-[10px] text-red-300 leading-normal flex flex-col gap-1">
                                                                         <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-400">
                                                                             <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                                                             Prerequisite Conflict
                                                                         </div>
                                                                         <div className="pl-5 font-medium text-red-200/90">
                                                                             Requires: {conflictsList.join(", ")}
                                                                         </div>
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         );
                                                    })}
                                                </div>

                                                {/* Footer */}
                                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider relative z-10">
                                                    <span>{sem.courses.length} Courses</span>
                                                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors hidden md:block" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Start/End Decorations */}
            <div className="mt-12 text-center pb-4">
                <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 text-xs font-bold px-6 py-2 shadow-xl shadow-violet-500/20 animate-pulse">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Graduation Goal: {graduationYear}
                </Badge>
            </div>
        </div>
    );
}
