import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Map, Calendar, ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisualRoadmap({ plan, difficulty, courses }: {
    plan: Record<string, string[]>;
    difficulty: Record<string, string>;
    courses?: { code: string; credits: number }[];
}) {
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

    return (
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-[#0a0a16]/80 backdrop-blur-2xl border border-white/5 shadow-2xl relative overflow-hidden group/card shadow-violet-500/5">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-zinc-900 ring-1 ring-white/10 shadow-xl">
                        <Map className="h-6 w-6 text-violet-400" />
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
                    const isEvenYear = year % 2 === 0; // Alignment toggle for desktop (optional, implementing centered spine)

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
                                {semesters.map((sem, semIndex) => {
                                    const diff = difficulty[sem.id] || "Moderate";
                                    const isRight = semIndex % 2 !== 0; // Simple L/R split for grid

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
                                            className={cn(
                                                "relative p-5 rounded-3xl bg-[#0f0f1d] border border-white/5 hover:border-white/10 transition-all duration-300 group shadow-lg",
                                                semIndex % 2 === 0 ? "md:mr-auto" : "md:ml-auto" // Push into columns if we want Zig Zag, but grid-cols-2 handles it naturally
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl bg-gradient-to-br",
                                                diff === "Heavy" ? "from-rose-500/5" : diff === "Light" ? "from-emerald-500/5" : "from-amber-500/5"
                                            )} />

                                            {/* Semester Header */}
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                                                            {sem.semesterName}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-zinc-500">SEM {sem.num}</span>
                                                    </div>
                                                </div>
                                                <div className={cn("px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide", diffConfig.bg, diffConfig.text)}>
                                                    {diffConfig.icon} {diff}
                                                </div>
                                            </div>

                                            {/* Courses */}
                                            <div className="space-y-2 relative z-10">
                                                {sem.courses.map((code, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group/item">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", diffConfig.text)} />
                                                        <span className="text-xs font-bold text-zinc-300 group-hover/item:text-white transition-colors">{code}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider relative z-10">
                                                <span>{sem.courses.length} Courses</span>
                                                <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
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
