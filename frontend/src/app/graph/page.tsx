"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ReactFlow,
    Background,
    Handle,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
    Panel,
    useReactFlow,
    ReactFlowProvider,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GitBranch,
    Zap,
    CheckCircle2,
    Clock,
    ArrowRight,
    X,
    Layout,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureGate } from "@/components/feature-gate";
import type { Course } from "@/lib/api";

// ==========================================
// TYPES & CONSTANTS
// ==========================================
// const NODE_WIDTH = 180;
// const NODE_HEIGHT = 80;
const COLUMN_SPACING = 340;
const ROW_SPACING = 125;

type CourseNodeData = {
    label: string;
    status: "completed" | "planned" | "future";
    credits: number;
    name?: string;
    dependents?: number;
    description?: string;
    prerequisites?: string[];
    unlocks?: string[];
    isHighlighted?: boolean;
    isDimmed?: boolean;
    isAncestor?: boolean;
    isDescendant?: boolean;
    isHovered?: boolean;
    hasConflict?: boolean;
};

// ==========================================
// CUSTOM NODE COMPONENT (COURSE)
// ==========================================
function CourseNode({ data }: { data: CourseNodeData }) {
    const colorSchemes = {
        completed: {
            bg: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700",
            border: "border-emerald-400",
            text: "text-white",
            shadow: "shadow-emerald-500/20",
        },
        planned: {
            bg: "bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-500",
            border: "border-teal-300",
            text: "text-black font-semibold",
            shadow: "shadow-teal-500/20",
        },
        future: {
            bg: "bg-zinc-800/90",
            border: "border-zinc-700",
            text: "text-zinc-300",
            shadow: "shadow-zinc-900/50",
        },
    };

    const scheme = colorSchemes[data.status];
    const isBottleneck = (data.dependents || 0) >= 2;

    // Determine highlight ring style
    let ringClass = "";
    if (data.isHovered) {
        ringClass = "ring-4 ring-amber-400 z-50 scale-105 shadow-2xl";
    } else if (data.isHighlighted) {
        ringClass = "ring-4 ring-amber-400/80 z-50 scale-105 shadow-2xl";
    } else if (data.isAncestor) {
        ringClass = "ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] z-40 scale-105";
    } else if (data.isDescendant) {
        ringClass = "ring-4 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] z-40 scale-105";
    } else if (data.hasConflict) {
        ringClass = "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] z-30 animate-pulse";
    }

    return (
        <div
            className={cn(
                "relative px-4 py-3 rounded-xl border-2 min-w-[220px] text-center transition-all duration-300 cursor-grab active:cursor-grabbing",
                scheme.bg,
                scheme.border,
                scheme.text,
                scheme.shadow,
                ringClass || "shadow-lg",
                data.isDimmed ? "opacity-20 scale-95 grayscale blur-[0.5px]" : "opacity-100"
            )}
        >
            {/* Handles for edges (Horizontal connection flow) */}
            <Handle type="target" position={Position.Left} className="opacity-0" />
            <Handle type="source" position={Position.Right} className="opacity-0" />

            {/* Bottleneck Badge */}
            {isBottleneck && !data.isDimmed && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-zinc-950 flex items-center justify-center animate-pulse z-20">
                    <Zap className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Status Icon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                {data.status === "completed" && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                )}
                {data.status === "planned" && !data.hasConflict && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-zinc-950 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-black" />
                    </div>
                )}
                {data.hasConflict && (
                    <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-zinc-950 flex items-center justify-center animate-bounce shadow-lg shadow-red-500/50">
                        <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            <div className="font-bold text-sm mt-1 truncate">{data.label}</div>
            <div className="text-[10px] opacity-80 mt-0.5 break-words leading-tight max-w-[200px] mx-auto">
                {data.name || "Course Name"}
            </div>
        </div>
    );
}

// ==========================================
// CUSTOM NODE COMPONENT (LANE CONTAINER)
// ==========================================
type LaneNodeData = {
    label: string;
    courseCount: number;
    creditsCount: number;
    status: "completed" | "planned" | "unscheduled";
    height: number;
};

function LaneNode({ data }: { data: LaneNodeData & { width?: number } }) {
    const borderColors = {
        completed: "border-emerald-500/20 bg-emerald-500/[0.01]",
        planned: "border-teal-500/20 bg-teal-500/[0.01]",
        unscheduled: "border-zinc-800 bg-zinc-950/10",
    };
    
    const textColors = {
        completed: "text-emerald-400",
        planned: "text-teal-400",
        unscheduled: "text-zinc-500",
    };

    const headerBgs = {
        completed: "bg-emerald-500/10 border-emerald-500/20",
        planned: "bg-teal-500/10 border-teal-500/20",
        unscheduled: "bg-zinc-800/30 border-zinc-800",
    };

    return (
        <div
            style={{ height: data.height, width: data.width || 300 }}
            className={cn(
                "rounded-3xl border-2 border-dashed flex flex-col p-4 pointer-events-none select-none transition-all duration-300 relative",
                borderColors[data.status]
            )}
        >
            <div className={cn("flex flex-col mb-4 p-3 rounded-2xl border backdrop-blur-sm", headerBgs[data.status])}>
                <span className={cn("text-lg font-black tracking-tight", textColors[data.status])}>
                    {data.label}
                </span>
                <span className="text-xs text-zinc-400 font-medium mt-0.5">
                    {data.courseCount} {data.courseCount === 1 ? "Course" : "Courses"} • {data.creditsCount} Credits
                </span>
            </div>
            <div className="flex-1 rounded-2xl bg-zinc-950/30 border border-zinc-900/30" />
        </div>
    );
}

const nodeTypes = {
    course: CourseNode,
    lane: LaneNode,
};

// ==========================================
// GRAPH CONTENT COMPONENT
// ==========================================
function GraphContent() {
    const courses = useAppStore((state) => state.courses);
    const loadDemoData = useAppStore((state) => state.loadDemoData);
    const completedCourses = useAppStore((state) => state.completedCourses);
    const currentPlan = useAppStore((state) => state.currentPlan);
    const setCompletedCourses = useAppStore((state) => state.setCompletedCourses);
    const setCurrentPlan = useAppStore((state) => state.setCurrentPlan);
    const remainingSemesters = useAppStore((state) => state.remainingSemesters);
    const maxCoursesPerSemester = useAppStore((state) => state.maxCoursesPerSemester);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hasCentered, setHasCentered] = useState(false);
    const [isConflictsExpanded, setIsConflictsExpanded] = useState(true);
    const [prevHash, setPrevHash] = useState("");
    const [prevCoursesLength, setPrevCoursesLength] = useState(0);

    const planHash = currentPlan ? JSON.stringify(currentPlan.degree_plan) : "";
    if (planHash !== prevHash || courses.length !== prevCoursesLength) {
        setPrevHash(planHash);
        setPrevCoursesLength(courses.length);
        setHasCentered(false);
    }

    const { fitView, zoomIn, zoomOut } = useReactFlow();

    // Derived: Course Map for fast lookup
    const courseMap = useMemo(() => {
        return new Map(courses.map(c => [c.code, c]));
    }, [courses]);

    // Derived: Dependency Graph Helpers
    const { dependencyMap, unlocksMap } = useMemo(() => {
        const depMap: Record<string, number> = {};
        const unlMap: Record<string, string[]> = {};

        courses.forEach((course) => {
            course.prerequisites.forEach((prereq) => {
                depMap[prereq] = (depMap[prereq] || 0) + 1;

                if (!unlMap[prereq]) unlMap[prereq] = [];
                unlMap[prereq].push(course.code);
            });
        });

        return { dependencyMap: depMap, unlocksMap: unlMap };
    }, [courses]);

    // Helper: Transitive prerequisite chain (Ancestors)
    const getAncestors = useCallback((courseCode: string): Set<string> => {
        const ancestors = new Set<string>();
        const queue = [courseCode];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const course = courseMap.get(current);
            if (course) {
                course.prerequisites.forEach(prereq => {
                    if (!ancestors.has(prereq)) {
                        ancestors.add(prereq);
                        queue.push(prereq);
                    }
                });
            }
        }
        return ancestors;
    }, [courseMap]);

    // Helper: Transitive unlock chain (Descendants)
    const getDescendants = useCallback((courseCode: string): Set<string> => {
        const descendants = new Set<string>();
        const queue = [courseCode];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const unlocks = unlocksMap[current] || [];
            unlocks.forEach(child => {
                if (!descendants.has(child)) {
                    descendants.add(child);
                    queue.push(child);
                }
            });
        }
        return descendants;
    }, [unlocksMap]);

    // Derived: Get Column assigned to a course
    const getCourseColumn = useCallback((courseCode: string): string => {
        if (completedCourses.includes(courseCode)) {
            return "completed";
        }
        if (currentPlan) {
            for (const [sem, codes] of Object.entries(currentPlan.degree_plan)) {
                if (codes.includes(courseCode)) {
                    return sem;
                }
            }
        }
        return "unscheduled";
    }, [completedCourses, currentPlan]);

    // 1. AUTO-INITIALIZE A BASIC PLAN IF NULL
    useEffect(() => {
        if (courses.length > 0 && !currentPlan) {
            const defaultPlan: Record<string, string[]> = {};
            for (let i = 1; i <= remainingSemesters; i++) {
                defaultPlan[`semester_${i}`] = [];
            }
            
            const courseCodes = courses.map(c => c.code);
            const completed = completedCourses;
            
            // Perform basic topological sort
            const inDegree: Record<string, number> = {};
            courses.forEach(c => {
                if (completed.includes(c.code)) return;
                inDegree[c.code] = c.prerequisites.filter(p => !completed.includes(p) && courseCodes.includes(p)).length;
            });
            
            const queue = Object.keys(inDegree).filter(code => inDegree[code] === 0);
            const sorted: string[] = [];
            while (queue.length > 0) {
                const code = queue.shift()!;
                sorted.push(code);
                courses.forEach(c => {
                    if (c.prerequisites.includes(code) && inDegree[c.code] !== undefined) {
                        inDegree[c.code]--;
                        if (inDegree[c.code] === 0) {
                            queue.push(c.code);
                        }
                    }
                });
            }
            
            // Distribute sorted courses topologically into remaining semesters
            const maxPerSem = maxCoursesPerSemester;
            let currentSem = 1;
            sorted.forEach(code => {
                if (defaultPlan[`semester_${currentSem}`].length >= maxPerSem) {
                    currentSem = Math.min(remainingSemesters, currentSem + 1);
                }
                defaultPlan[`semester_${currentSem}`].push(code);
            });
            
            setCurrentPlan({
                degree_plan: defaultPlan,
                semester_difficulty: {},
                risk_analysis: { burnout_risk: "Low", graduation_risk: "On Track", risk_factors: [] },
                decision_timeline: [],
                confidence_score: 100,
                key_insight: "Initial plan generated topologically.",
                career_alignment_notes: "",
                advisor_explanation: "This is a basic plan initialized from your courses.",
                warnings: [],
                unscheduled_courses: [],
                data_status: "Demo",
                validation_status: "Valid"
            });
        }
    }, [courses, currentPlan, remainingSemesters, maxCoursesPerSemester, completedCourses, setCurrentPlan]);

    // Derived: Column Layout Definition
    const columns = useMemo(() => {
        const cols = [{ id: "completed", label: "Completed" }];
        
        if (currentPlan) {
            const semesters = Object.keys(currentPlan.degree_plan).sort((a, b) => {
                const numA = parseInt(a.replace("semester_", "")) || 0;
                const numB = parseInt(b.replace("semester_", "")) || 0;
                return numA - numB;
            });
            
            semesters.forEach(sem => {
                cols.push({
                    id: sem,
                    label: sem.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())
                });
            });
        } else {
            for (let i = 1; i <= remainingSemesters; i++) {
                cols.push({
                    id: `semester_${i}`,
                    label: `Semester ${i}`
                });
            }
        }
        
        cols.push({ id: "unscheduled", label: "Unscheduled" });
        return cols;
    }, [currentPlan, remainingSemesters]);

    // Derived: Column Layout (x-coordinates, widths, and columns)
    const colLayouts = useMemo(() => {
        const layouts: Record<string, { x: number; width: number; cols: number }> = {};
        let currentX = 0;
        const spacing = 40; // Spacing between lanes
        
        columns.forEach(col => {
            let count = 0;
            if (col.id === "completed") {
                count = completedCourses.length;
            } else if (col.id === "unscheduled") {
                const scheduled = currentPlan ? Object.values(currentPlan.degree_plan).flat() : [];
                count = courses.filter(c => !completedCourses.includes(c.code) && !scheduled.includes(c.code)).length;
            } else {
                count = currentPlan?.degree_plan[col.id]?.length || 0;
            }
            
            let cols = 1;
            if ((col.id === "completed" || col.id === "unscheduled") && count > 6) {
                cols = Math.min(3, Math.ceil(count / 6)); // 2 columns for >6, 3 columns for >12!
            }
            
            const width = cols === 1 ? 300 : cols === 2 ? 540 : 780;
            
            layouts[col.id] = {
                x: currentX,
                width,
                cols
            };
            
            currentX += width + spacing;
        });
        
        return layouts;
    }, [columns, completedCourses, currentPlan, courses]);

    // Derived: Max rows in any column (for scaling heights)
    const maxRowsInCol = useMemo(() => {
        let maxRows = 4;
        columns.forEach(col => {
            let count = 0;
            if (col.id === "completed") {
                count = completedCourses.length;
            } else if (col.id === "unscheduled") {
                const scheduled = currentPlan ? Object.values(currentPlan.degree_plan).flat() : [];
                count = courses.filter(c => !completedCourses.includes(c.code) && !scheduled.includes(c.code)).length;
            } else {
                count = currentPlan?.degree_plan[col.id]?.length || 0;
            }
            
            const layout = colLayouts[col.id];
            const cols = layout ? layout.cols : 1;
            const rows = Math.ceil(count / cols);
            if (rows > maxRows) maxRows = rows;
        });
        return maxRows;
    }, [columns, completedCourses, currentPlan, courses, colLayouts]);

    const laneHeight = useMemo(() => {
        return 100 + maxRowsInCol * ROW_SPACING + 40;
    }, [maxRowsInCol]);

    // Derived: Prerequisite scheduling validation
    const conflicts = useMemo(() => {
        const list: string[] = [];
        if (!currentPlan) return list;
        
        const colIndices: Record<string, number> = {};
        columns.forEach((col, idx) => {
            if (col.id === "completed") {
                completedCourses.forEach(c => { colIndices[c] = idx; });
            } else if (col.id === "unscheduled") {
                const scheduled = Object.values(currentPlan.degree_plan).flat();
                courses.forEach(c => {
                    if (!completedCourses.includes(c.code) && !scheduled.includes(c.code)) {
                        colIndices[c.code] = idx;
                    }
                });
            } else {
                const semesterCourses = currentPlan.degree_plan[col.id] || [];
                semesterCourses.forEach(code => {
                    if (!completedCourses.includes(code)) {
                        colIndices[code] = idx;
                    }
                });
            }
        });

        courses.forEach(course => {
            const courseCol = colIndices[course.code];
            if (courseCol === undefined) return;
            if (completedCourses.includes(course.code)) return;
            
            const colId = columns[courseCol]?.id;
            if (colId === "unscheduled" || colId === "completed") return;
            
            course.prerequisites.forEach(prereq => {
                const prereqCol = colIndices[prereq];
                if (prereqCol === undefined || prereqCol >= courseCol) {
                    const prereqName = columns.find(col => col.id === (completedCourses.includes(prereq) ? "completed" : currentPlan.degree_plan[col.id]?.includes(prereq) ? col.id : "unscheduled"))?.label || "Unscheduled";
                    const courseName = columns.find(col => col.id === (currentPlan.degree_plan[col.id]?.includes(course.code) ? col.id : "unscheduled"))?.label || "Unscheduled";
                    
                    list.push(
                        `Prerequisite conflict: ${course.code} (scheduled in ${courseName}) depends on ${prereq} (scheduled in ${prereqName}).`
                    );
                }
            });
        });

        return list;
    }, [courses, completedCourses, currentPlan, columns]);

    // 2. GENERATE GRAPH LAYOUT
    const generateLayout = useCallback(() => {
        if (courses.length === 0) return;

        // Map course codes to column indices for conflict detection
        const colIndices: Record<string, number> = {};
        columns.forEach((col, idx) => {
            if (col.id === "completed") {
                completedCourses.forEach(c => { colIndices[c] = idx; });
            } else if (col.id === "unscheduled") {
                const scheduled = currentPlan ? Object.values(currentPlan.degree_plan).flat() : [];
                courses.forEach(c => {
                    if (!completedCourses.includes(c.code) && !scheduled.includes(c.code)) {
                        colIndices[c.code] = idx;
                    }
                });
            } else {
                const semesterCourses = currentPlan?.degree_plan[col.id] || [];
                semesterCourses.forEach(code => {
                    if (!completedCourses.includes(code)) {
                        colIndices[code] = idx;
                    }
                });
            }
        });

        const conflictingCourseCodes = new Set<string>();
        courses.forEach(course => {
            const courseCol = colIndices[course.code];
            if (courseCol === undefined) return;
            if (completedCourses.includes(course.code)) return;
            
            const colId = columns[courseCol]?.id;
            if (colId === "unscheduled" || colId === "completed") return;
            
            course.prerequisites.forEach(prereq => {
                const prereqCol = colIndices[prereq];
                if (prereqCol === undefined || prereqCol >= courseCol) {
                    conflictingCourseCodes.add(course.code);
                }
            });
        });

        // A. Generate Lane Nodes
        const laneNodes: Node[] = columns.map((col, index) => {
            let status: LaneNodeData["status"] = "planned";
            if (col.id === "completed") status = "completed";
            else if (col.id === "unscheduled") status = "unscheduled";
            
            let colCourses: string[] = [];
            if (col.id === "completed") {
                colCourses = completedCourses;
            } else if (col.id === "unscheduled") {
                const scheduled = currentPlan ? Object.values(currentPlan.degree_plan).flat() : [];
                colCourses = courses
                    .filter(c => !completedCourses.includes(c.code) && !scheduled.includes(c.code))
                    .map(c => c.code);
            } else {
                colCourses = currentPlan?.degree_plan[col.id] || [];
            }
            
            const creditsCount = colCourses.reduce((sum, code) => {
                const course = courseMap.get(code);
                return sum + (course?.credits || 0);
            }, 0);

            const layout = colLayouts[col.id];
            const laneWidth = layout ? layout.width : 300;
            const laneX = layout ? layout.x : index * COLUMN_SPACING;

            return {
                id: `lane_${col.id}`,
                type: "lane",
                position: { x: laneX, y: 0 },
                draggable: false,
                selectable: false,
                zIndex: -1,
                data: {
                    label: col.label,
                    courseCount: colCourses.length,
                    creditsCount,
                    status,
                    height: laneHeight,
                    width: laneWidth,
                },
            };
        });

        // B. Generate Course Nodes
        const colCounts: Record<string, number> = {};
        columns.forEach(col => { colCounts[col.id] = 0; });

        const courseNodes: Node[] = [];
        const activeId = hoveredNodeId || selectedNodeId;
        const ancestors = activeId ? getAncestors(activeId) : new Set<string>();
        const descendants = activeId ? getDescendants(activeId) : new Set<string>();

        const addCourseNode = (course: Course, colId: string) => {
            const layout = colLayouts[colId];
            if (!layout) return;
            
            const indexInCol = colCounts[colId];
            colCounts[colId]++;
            
            let status: CourseNodeData["status"] = "future";
            if (colId === "completed") status = "completed";
            else if (colId !== "unscheduled") status = "planned";
            
            const col = indexInCol % layout.cols;
            const row = Math.floor(indexInCol / layout.cols);
            
            const x = layout.x + (layout.width - (layout.cols * 220 + (layout.cols - 1) * 20)) / 2 + col * 240;
            const y = 90 + row * ROW_SPACING;
            
            const isHovered = course.code === hoveredNodeId;
            const isSelected = course.code === selectedNodeId;
            const isAncestor = ancestors.has(course.code);
            const isDescendant = descendants.has(course.code);
            const isDimmed = activeId ? (!isHovered && !isSelected && !isAncestor && !isDescendant) : false;
            const hasConflict = conflictingCourseCodes.has(course.code);

            courseNodes.push({
                id: course.code,
                type: "course",
                position: { x, y },
                draggable: true,
                data: {
                    label: course.code,
                    name: course.name,
                    status,
                    credits: course.credits,
                    dependents: dependencyMap[course.code] || 0,
                    description: course.description,
                    prerequisites: course.prerequisites,
                    unlocks: unlocksMap[course.code] || [],
                    isHighlighted: isSelected,
                    isHovered,
                    isAncestor,
                    isDescendant,
                    isDimmed,
                    hasConflict,
                },
            });
        };

        // Completed courses (Col index 0)
        courses.forEach(course => {
            if (completedCourses.includes(course.code)) {
                addCourseNode(course, "completed");
            }
        });

        // Semesters
        if (currentPlan) {
            const sortedSemesters = Object.keys(currentPlan.degree_plan).sort((a, b) => {
                const numA = parseInt(a.replace("semester_", "")) || 0;
                const numB = parseInt(b.replace("semester_", "")) || 0;
                return numA - numB;
            });
            
            sortedSemesters.forEach(sem => {
                const semesterCourseCodes = currentPlan.degree_plan[sem] || [];
                semesterCourseCodes.forEach(code => {
                    const course = courseMap.get(code);
                    if (course && !completedCourses.includes(code)) {
                        addCourseNode(course, sem);
                    }
                });
            });
        }

        // Unscheduled courses
        courses.forEach(course => {
            const isCompleted = completedCourses.includes(course.code);
            const isScheduled = currentPlan ? Object.values(currentPlan.degree_plan).flat().includes(course.code) : false;
            if (!isCompleted && !isScheduled) {
                addCourseNode(course, "unscheduled");
            }
        });

        // C. Generate Edges
        const newEdges: Edge[] = [];
        courses.forEach((course) => {
            course.prerequisites.forEach((prereq) => {
                if (courseMap.has(prereq)) {
                    const prereqCol = getCourseColumn(prereq);
                    const courseCol = getCourseColumn(course.code);
                    const prereqColIdx = columns.findIndex(c => c.id === prereqCol);
                    const courseColIdx = columns.findIndex(c => c.id === courseCol);
                    
                    const isConflict = prereqColIdx !== -1 && 
                                       courseColIdx !== -1 && 
                                       prereqColIdx >= courseColIdx && 
                                       courseCol !== "unscheduled" && 
                                       courseCol !== "completed";
                    const isSourceCompleted = completedCourses.includes(prereq);
                    
                    let edgeColor = isSourceCompleted ? "#10b981" : "#52525b";
                    let edgeWidth = isSourceCompleted ? 3 : 2;
                    let edgeOpacity = isSourceCompleted ? 0.8 : 0.4;
                    let isAnimated = isSourceCompleted;
                    
                    if (isConflict) {
                        edgeColor = "#ef4444";
                        edgeWidth = 3;
                        edgeOpacity = 1.0;
                        isAnimated = true;
                    }
                    
                    // Transitive highlight overrides
                    if (activeId) {
                        const isPrereqPath = (ancestors.has(course.code) && ancestors.has(prereq)) || 
                                             (course.code === activeId && ancestors.has(prereq));
                        const isUnlockPath = (descendants.has(prereq) && descendants.has(course.code)) || 
                                             (prereq === activeId && descendants.has(course.code));
                        
                        if (isPrereqPath) {
                            edgeColor = "#3b82f6";
                            edgeWidth = 4;
                            edgeOpacity = 1.0;
                            isAnimated = true;
                        } else if (isUnlockPath) {
                            edgeColor = "#a855f7";
                            edgeWidth = 4;
                            edgeOpacity = 1.0;
                            isAnimated = true;
                        } else {
                            edgeOpacity = 0.05;
                        }
                    }
                    
                    newEdges.push({
                        id: `${prereq}-${course.code}`,
                        source: prereq,
                        target: course.code,
                        type: 'smoothstep',
                        animated: isAnimated,
                        style: {
                            stroke: edgeColor,
                            strokeWidth: edgeWidth,
                            opacity: edgeOpacity,
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: edgeColor,
                        },
                    });
                }
            });
        });

        setNodes([...laneNodes, ...courseNodes]);
        setEdges(newEdges);

    }, [courses, completedCourses, currentPlan, hoveredNodeId, selectedNodeId, columns, dependencyMap, unlocksMap, courseMap, laneHeight, setNodes, setEdges, getAncestors, getDescendants, getCourseColumn]);

    // Handle initial camera centering
    useEffect(() => {
        if (nodes.length > 0 && !hasCentered) {
            setTimeout(() => {
                fitView({ padding: 0.1, duration: 800 });
                setHasCentered(true);
            }, 100);
        }
    }, [nodes, hasCentered, fitView]);

    // Center state is managed synchronously during render upon key data updates

    // Re-run layout on state changes
    useEffect(() => {
        generateLayout();
    }, [generateLayout]);

    // Handle Drag Stop: snap courses into semesters and update store
    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type !== "course") return;

        const code = node.id;
        const oldCol = getCourseColumn(code);
        
        // Find which lane the dropped node is closest to or inside
        const nodeX = node.position.x;
        let targetCol = "unscheduled";
        let minDistance = Infinity;
        
        Object.entries(colLayouts).forEach(([colId, layout]) => {
            const laneStartX = layout.x;
            const laneEndX = layout.x + layout.width;
            
            // Check if node is inside this lane's horizontal bounds
            if (nodeX >= laneStartX && nodeX <= laneEndX) {
                targetCol = colId;
                minDistance = 0;
            } else {
                // If not inside, calculate distance to the center of the lane
                const laneCenter = laneStartX + layout.width / 2;
                const distance = Math.abs(nodeX + 110 - laneCenter); // 110 is half of node width (220)
                if (distance < minDistance) {
                    minDistance = distance;
                    targetCol = colId;
                }
            }
        });
        
        if (oldCol === targetCol) {
            generateLayout();
            return;
        }
        
        let newCompleted = [...completedCourses];
        const newDegreePlan = currentPlan ? { ...currentPlan.degree_plan } : {};
        
        // Remove from old location
        if (oldCol === "completed") {
            newCompleted = newCompleted.filter(c => c !== code);
        } else if (oldCol !== "unscheduled" && newDegreePlan[oldCol]) {
            newDegreePlan[oldCol] = newDegreePlan[oldCol].filter(c => c !== code);
        }
        
        // Add to new location
        if (targetCol === "completed") {
            if (!newCompleted.includes(code)) {
                newCompleted.push(code);
            }
        } else if (targetCol === "unscheduled") {
            // Unscheduled means not in completed and not in semesters
        } else {
            if (!newDegreePlan[targetCol]) {
                newDegreePlan[targetCol] = [];
            }
            if (!newDegreePlan[targetCol].includes(code)) {
                newDegreePlan[targetCol].push(code);
            }
        }
        
        setCompletedCourses(newCompleted);
        if (currentPlan) {
            setCurrentPlan({
                ...currentPlan,
                degree_plan: newDegreePlan
            });
        }
    }, [columns, completedCourses, currentPlan, setCompletedCourses, setCurrentPlan, getCourseColumn, generateLayout, colLayouts]);

    // Hover Event Listeners
    const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type === "course") {
            setHoveredNodeId(node.id);
        }
    }, []);

    const onNodeMouseLeave = useCallback(() => {
        setHoveredNodeId(null);
    }, []);

    // Selection/Click Listeners
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        if (node.type === "course") {
            setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
        }
    }, [selectedNodeId]);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    // Toggle Complete Action inside side panel
    const toggleCourseStatus = (code: string) => {
        const isCompleted = completedCourses.includes(code);
        let newCompleted = [...completedCourses];
        
        if (isCompleted) {
            newCompleted = newCompleted.filter((c) => c !== code);
        } else {
            newCompleted.push(code);
            
            // Remove from scheduled semesters on completed
            if (currentPlan) {
                const newDegreePlan = { ...currentPlan.degree_plan };
                Object.keys(newDegreePlan).forEach(sem => {
                    newDegreePlan[sem] = newDegreePlan[sem].filter(c => c !== code);
                });
                setCurrentPlan({
                    ...currentPlan,
                    degree_plan: newDegreePlan
                });
            }
        }
        setCompletedCourses(newCompleted);
    };

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                <GitBranch className="w-16 h-16 text-teal-400 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">No Data Loaded</h2>
                <Button onClick={loadDemoData} className="bg-teal-500 hover:bg-teal-400 text-black">
                    Load Demo Data
                </Button>
            </div>
        );
    }

    const selectedCourse = selectedNodeId ? courseMap.get(selectedNodeId) : null;

    return (
        <div className="relative h-[65vh] md:h-[750px] w-full bg-[#030208] rounded-3xl border border-zinc-800/80 overflow-hidden shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                minZoom={0.1}
                maxZoom={2}
                fitView
            >
                <Background color="#1c1917" gap={30} size={1.2} />

                {/* Vertical Zoom Controls Panel */}
                <Panel position="bottom-left" className="mb-4 ml-3">
                    <div className="flex flex-col items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-full p-1.5 shadow-xl backdrop-blur-sm">
                        <button
                            onClick={() => fitView({ duration: 400 })}
                            title="Reset view"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-teal-400 hover:bg-white/10 transition-all active:scale-90"
                        >
                            <Layout className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-5 h-px bg-zinc-800" />
                        <button
                            onClick={() => zoomIn({ duration: 200 })}
                            title="Zoom in"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-200 hover:text-white hover:bg-white/10 transition-all active:scale-90 text-lg font-light leading-none"
                        >
                            +
                        </button>
                        <button
                            onClick={() => zoomOut({ duration: 200 })}
                            title="Zoom out"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-200 hover:text-white hover:bg-white/10 transition-all active:scale-90 text-lg font-light leading-none"
                        >
                            −
                        </button>
                    </div>
                </Panel>

                {/* Reset View FAB */}
                <Panel position="top-right" className="mr-2 mt-2 md:mr-4 md:mt-4">
                    <Button
                        size="icon"
                        onClick={() => fitView({ duration: 500 })}
                        className="shadow-[0_0_20px_rgba(20,184,166,0.3)] bg-gradient-to-br from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 border-0 rounded-full w-12 h-12 flex items-center justify-center text-black hover:scale-105 transition-transform"
                    >
                        <Layout className="w-5 h-5" />
                    </Button>
                </Panel>
            </ReactFlow>

            {/* Conflict Warnings Panel Overlay */}
            {conflicts.length > 0 && (
                <div className={cn(
                    "absolute top-4 left-4 max-w-md bg-zinc-950/90 border border-zinc-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-30 transition-all duration-300 flex flex-col gap-2",
                    isConflictsExpanded ? "max-h-[350px] w-[320px] md:w-[380px]" : "w-auto py-2.5 px-3.5"
                )}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle className={cn("w-4 h-4 text-red-400", isConflictsExpanded ? "" : "animate-pulse")} />
                            {isConflictsExpanded && <span>Prerequisite Conflicts ({conflicts.length})</span>}
                        </div>
                        <button
                            onClick={() => setIsConflictsExpanded(!isConflictsExpanded)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-zinc-900 border border-zinc-850 transition-colors pointer-events-auto"
                        >
                            {isConflictsExpanded ? "Hide" : `Show (${conflicts.length})`}
                        </button>
                    </div>

                    {isConflictsExpanded && (
                        <div className="overflow-y-auto pr-1 max-h-[260px] custom-scrollbar pointer-events-auto">
                            <ul className="text-[11px] text-zinc-300 space-y-2 list-none mt-2">
                                {conflicts.map((conflict, idx) => (
                                    <li key={idx} className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-200 leading-snug">
                                        {conflict}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* DETAILS SIDE PANEL */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800/80 p-6 shadow-2xl overflow-y-auto z-50"
                    >
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-900 text-zinc-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className={cn(
                                    "text-sm px-3 py-1 font-semibold",
                                    completedCourses.includes(selectedCourse.code) ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" :
                                        getCourseColumn(selectedCourse.code) !== "unscheduled" ? "border-teal-500 text-teal-400 bg-teal-500/5" :
                                            "border-zinc-700 text-zinc-500"
                                )}>
                                    {completedCourses.includes(selectedCourse.code) ? "Completed" :
                                        getCourseColumn(selectedCourse.code) !== "unscheduled" ? "In Plan" : "Future"}
                                </Badge>
                                <span className="text-zinc-500 text-sm font-mono">{selectedCourse.credits} Credits</span>
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2">{selectedCourse.code}</h2>
                            <h3 className="text-xl font-bold text-zinc-300 mb-6">{selectedCourse.name}</h3>

                            {selectedCourse.description && (
                                <div className="mb-8 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {selectedCourse.description}
                                    </p>
                                </div>
                            )}

                            {/* Dependencies Info */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        <GitBranch className="w-4 h-4 text-blue-500" /> Prerequisites
                                    </h4>
                                    {selectedCourse.prerequisites.length > 0 ? (
                                        <div className="grid gap-2">
                                            {selectedCourse.prerequisites.map(prereq => (
                                                <Button
                                                    key={prereq}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 border-zinc-800 hover:border-blue-500/40 hover:bg-blue-950/10 text-zinc-300"
                                                    onClick={() => setSelectedNodeId(prereq)}
                                                >
                                                    <span className="font-bold text-white w-20">{prereq}</span>
                                                    <span className="text-xs text-zinc-400 truncate flex-1 text-left">
                                                        {courseMap.get(prereq)?.name || "Course"}
                                                    </span>
                                                    {completedCourses.includes(prereq) && (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-700 italic">No prerequisites required.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                                        <ArrowRight className="w-4 h-4 text-purple-500" /> Unlocks
                                    </h4>
                                    {(unlocksMap[selectedCourse.code] || []).length > 0 ? (
                                        <div className="grid gap-2">
                                            {unlocksMap[selectedCourse.code].map(unlock => (
                                                <Button
                                                    key={unlock}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 border-zinc-800 hover:border-purple-500/40 hover:bg-purple-950/10 text-zinc-300"
                                                    onClick={() => setSelectedNodeId(unlock)}
                                                >
                                                    <span className="font-bold text-white w-20">{unlock}</span>
                                                    <span className="text-xs text-zinc-400 truncate flex-1 text-left">
                                                        {courseMap.get(unlock)?.name}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-700 italic">This is a terminal course.</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 pt-8 border-t border-zinc-900">
                                <Button
                                    className={cn(
                                        "w-full py-6 font-bold text-md transition-all duration-300",
                                        completedCourses.includes(selectedCourse.code)
                                            ? "bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700"
                                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    )}
                                    onClick={() => toggleCourseStatus(selectedCourse.code)}
                                >
                                    {completedCourses.includes(selectedCourse.code) ? (
                                        <>Mark as Incomplete</>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Mark as Completed
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================
export default function GraphPageWrapper() {
    return (
        <FeatureGate featureKey="page_graph" featureName="Knowledge Graph">
        <div className="relative min-h-screen pt-6 md:pt-32 pb-28 md:pb-12 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[#020106] -z-20" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:16px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 -z-10" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-500/10 via-purple-500/5 to-transparent blur-3xl -z-10" />

            <div className="container mx-auto max-w-[1400px] px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10 text-center relative"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] backdrop-blur-sm">
                        <GitBranch className="w-3 h-3" /> Interactive Planning
                    </div>
                    <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 mb-3 md:mb-4 tracking-tight drop-shadow-lg leading-tight">
                        Degree Knowledge Graph
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Visualize and customize your entire academic journey in real-time.
                        <span className="text-zinc-500 block mt-1 text-sm">Drag courses between semesters, hover to trace dependencies, and resolve alerts instantly.</span>
                    </p>
                </motion.div>

                <ReactFlowProvider>
                    <GraphContent />
                </ReactFlowProvider>

                {/* Legend / Hints */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-zinc-500 font-medium"
                >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-zinc-300">Completed</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        <span className="text-zinc-300">Planned</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                        <span className="text-zinc-400">Future / Unscheduled</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80">
                        <span className="text-zinc-400">Interactive: Drag cards to shift semesters • Hover to trace paths</span>
                    </div>
                </motion.div>
            </div>
        </div>
        </FeatureGate>
    );
}
