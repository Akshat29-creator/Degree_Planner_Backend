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
import dagre from "dagre";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    GitBranch,
    Info,
    Zap,
    CheckCircle2,
    Clock,
    BookOpen,
    ArrowRight,
    X,
    Layout,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// TYPES & CONSTANTS
// ==========================================
const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

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
};

// ==========================================
// CUSTOM NODE COMPONENT
// ==========================================
function CourseNode({ data }: { data: CourseNodeData }) {
    const colorSchemes = {
        completed: {
            bg: "bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500",
            border: "border-amber-300",
            text: "text-black",
            shadow: "shadow-amber-500/40",
        },
        planned: {
            bg: "bg-gradient-to-br from-teal-400 via-cyan-400 to-emerald-400",
            border: "border-teal-300",
            text: "text-black",
            shadow: "shadow-teal-500/40",
        },
        future: {
            bg: "bg-zinc-800",
            border: "border-zinc-600",
            text: "text-zinc-100",
            shadow: "shadow-zinc-900/50",
        },
    };

    const scheme = colorSchemes[data.status];
    const isBottleneck = (data.dependents || 0) >= 2;

    return (
        <div
            className={cn(
                "relative px-4 py-3 rounded-xl border-2 min-w-[160px] text-center transition-all duration-300 cursor-pointer",
                scheme.bg,
                scheme.border,
                scheme.text,
                scheme.shadow,
                data.isHighlighted ? "scale-110 ring-4 ring-white/50 z-50 shadow-2xl" : "shadow-lg",
                data.isDimmed ? "opacity-30 grayscale blur-[1px] scale-95" : "opacity-100"
            )}
        >
            {/* Handles for edges */}
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />

            {/* Bottleneck Badge */}
            {isBottleneck && !data.isDimmed && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center animate-pulse">
                    <Zap className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Status Icon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                {data.status === "completed" && (
                    <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                )}
                {data.status === "planned" && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            <div className="font-bold text-sm mt-1 truncate">{data.label}</div>
            <div className="text-[10px] opacity-80 mt-0.5 truncate max-w-[140px] mx-auto">
                {data.name || "Course Name"}
            </div>

            {/* Hover details hint */}
            {/* <div className="absolute bottom-1 left-0 right-0 text-[8px] opacity-0 group-hover:opacity-60 transition-opacity">
                Click for details
            </div> */}
        </div>
    );
}

const nodeTypes = {
    course: CourseNode,
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

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const { fitView } = useReactFlow();

    // Derived: Planned Course Codes
    const plannedCourseCodes = useMemo(() => {
        if (!currentPlan) return new Set<string>();
        return new Set(Object.values(currentPlan.degree_plan).flat());
    }, [currentPlan]);

    // Derived: Course Map for fast lookup
    const courseMap = useMemo(() => {
        return new Map(courses.map(c => [c.code, c]));
    }, [courses]);

    // Derived: Dependency Graph Helpers
    const { dependencyMap, unlocksMap } = useMemo(() => {
        const depMap: Record<string, number> = {};
        const unlMap: Record<string, string[]> = {};

        courses.forEach((course) => {
            // Count dependents (how many courses depend on this one)
            course.prerequisites.forEach((prereq) => {
                depMap[prereq] = (depMap[prereq] || 0) + 1;

                if (!unlMap[prereq]) unlMap[prereq] = [];
                unlMap[prereq].push(course.code);
            });
        });

        return { dependencyMap: depMap, unlocksMap: unlMap };
    }, [courses]);

    // 1. GENERATE GRAPH LAYOUT
    const generateLayout = useCallback(() => {
        if (courses.length === 0) return;

        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 });
        g.setDefaultEdgeLabel(() => ({}));

        // Add Nodes
        courses.forEach((course) => {
            g.setNode(course.code, { width: NODE_WIDTH, height: NODE_HEIGHT });
        });

        // Add Edges
        courses.forEach((course) => {
            course.prerequisites.forEach((prereq) => {
                if (courseMap.has(prereq)) {
                    g.setEdge(prereq, course.code);
                }
            });
        });

        dagre.layout(g);

        // Convert to React Flow Nodes
        const newNodes: Node[] = courses.map((course) => {
            const nodeWithPosition = g.node(course.code);

            let status: CourseNodeData["status"] = "future";
            if (completedCourses.includes(course.code)) status = "completed";
            else if (plannedCourseCodes.has(course.code)) status = "planned";

            return {
                id: course.code,
                type: "course",
                position: {
                    x: nodeWithPosition.x - NODE_WIDTH / 2,
                    y: nodeWithPosition.y - NODE_HEIGHT / 2,
                },
                data: {
                    label: course.code,
                    name: course.name,
                    status,
                    credits: course.credits,
                    dependents: dependencyMap[course.code] || 0,
                    description: course.description,
                    prerequisites: course.prerequisites,
                    unlocks: unlocksMap[course.code] || [],
                    isHighlighted: false,
                    isDimmed: false,
                },
            };
        });

        // Convert to React Flow Edges
        const newEdges: Edge[] = [];
        courses.forEach((course) => {
            course.prerequisites.forEach((prereq) => {
                if (courseMap.has(prereq)) {
                    const isSourceCompleted = completedCourses.includes(prereq);

                    // Style logic:
                    // If source is completed -> Path is UNLOCKED (Bright Green + Animated)
                    // If source is not completed -> Path is LOCKED (Visible Grey + Static)

                    const edgeColor = isSourceCompleted ? "#4ade80" : "#a1a1aa";
                    const edgeWidth = isSourceCompleted ? 3 : 2;
                    const edgeOpacity = isSourceCompleted ? 1 : 0.5;

                    newEdges.push({
                        id: `${prereq}-${course.code}`,
                        source: prereq,
                        target: course.code,
                        type: 'smoothstep',
                        animated: isSourceCompleted,
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

        setNodes(newNodes);
        setEdges(newEdges);

        // Fit view after a tick
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 50);

    }, [courses, completedCourses, plannedCourseCodes, dependencyMap, unlocksMap, courseMap, setNodes, setEdges, fitView]);

    // Trigger layout on mount/data change
    useEffect(() => {
        generateLayout();
    }, [generateLayout]);

    // 2. HANDLE SELECTION EFFECTS
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (!selectedNodeId) {
                    return {
                        ...node,
                        data: { ...node.data, isHighlighted: false, isDimmed: false },
                    };
                }

                // Check connection
                const isSelected = node.id === selectedNodeId;
                const isPrereq = (courseMap.get(selectedNodeId)?.prerequisites || []).includes(node.id);
                const isUnlocked = (unlocksMap[selectedNodeId] || []).includes(node.id);

                // Highlight related, dim others
                const isRelated = isSelected || isPrereq || isUnlocked;

                return {
                    ...node,
                    data: {
                        ...node.data,
                        isHighlighted: isSelected, // main focus
                        isDimmed: !isRelated, // dim unrelated
                    },
                };
            })
        );

        setEdges((eds) =>
            eds.map((edge) => {
                if (!selectedNodeId) {
                    return { ...edge, style: { ...edge.style, stroke: edge.style?.stroke === "#22c55e" ? "#22c55e" : "#52525b", opacity: 1, strokeWidth: 2 } };
                }

                const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;

                return {
                    ...edge,
                    style: {
                        ...edge.style,
                        stroke: isConnected ? "#f59e0b" : "#52525b", // Highlight path orange
                        strokeWidth: isConnected ? 3 : 1,
                        opacity: isConnected ? 1 : 0.1,
                    },
                    animated: isConnected,
                };
            })
        );

    }, [selectedNodeId, setNodes, setEdges, courseMap, unlocksMap]);

    // Handle Node Click
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    }, [selectedNodeId]);

    // Handle Pane Click (Deselect)
    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    // Toggle Complete Action
    const toggleCourseStatus = (code: string) => {
        const isCompleted = completedCourses.includes(code);
        if (isCompleted) {
            setCompletedCourses(completedCourses.filter((c) => c !== code));
        } else {
            setCompletedCourses([...completedCourses, code]);
        }
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
        <div className="relative h-[700px] w-full bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                minZoom={0.2}
                maxZoom={2}
                fitView
            >
                <Background color="#27272a" gap={20} size={1} />


                {/* Reset View Button */}
                <Panel position="top-right">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fitView({ duration: 500 })}
                        className="shadow-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                    >
                        <Layout className="w-4 h-4 mr-2" />
                        Reset View
                    </Button>
                </Panel>
            </ReactFlow>

            {/* DETAILS SIDE PANEL */}
            <AnimatePresence>
                {selectedCourse && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 p-6 shadow-2xl overflow-y-auto z-50"
                    >
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className={cn(
                                    "text-sm px-3 py-1",
                                    completedCourses.includes(selectedCourse.code) ? "border-green-500 text-green-400" :
                                        plannedCourseCodes.has(selectedCourse.code) ? "border-teal-500 text-teal-400" :
                                            "border-zinc-600 text-zinc-400"
                                )}>
                                    {completedCourses.includes(selectedCourse.code) ? "Completed" :
                                        plannedCourseCodes.has(selectedCourse.code) ? "In Plan" : "Future"}
                                </Badge>
                                <span className="text-zinc-500 text-sm font-mono">{selectedCourse.credits} Credits</span>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">{selectedCourse.code}</h2>
                            <h3 className="text-xl text-zinc-300 mb-6">{selectedCourse.name}</h3>

                            {selectedCourse.description && (
                                <div className="mb-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {selectedCourse.description}
                                    </p>
                                </div>
                            )}

                            {/* Dependencies Info */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                        <GitBranch className="w-4 h-4" /> Prerequisites
                                    </h4>
                                    {selectedCourse.prerequisites.length > 0 ? (
                                        <div className="grid gap-2">
                                            {selectedCourse.prerequisites.map(prereq => (
                                                <Button
                                                    key={prereq}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 border-zinc-700 hover:border-teal-500/50 hover:bg-zinc-800"
                                                    onClick={() => setSelectedNodeId(prereq)}
                                                >
                                                    <span className="font-bold text-white w-20">{prereq}</span>
                                                    <span className="text-xs text-zinc-400 truncate flex-1 text-left">
                                                        {courseMap.get(prereq)?.name || "Course"}
                                                    </span>
                                                    {completedCourses.includes(prereq) && (
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-600 italic">No prerequisites required.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                        <ArrowRight className="w-4 h-4" /> Unlocks
                                    </h4>
                                    {(unlocksMap[selectedCourse.code] || []).length > 0 ? (
                                        <div className="grid gap-2">
                                            {unlocksMap[selectedCourse.code].map(unlock => (
                                                <Button
                                                    key={unlock}
                                                    variant="outline"
                                                    className="justify-start h-auto py-3 border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800"
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
                                        <p className="text-sm text-zinc-600 italic">This is a terminal course.</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                <Button
                                    className={cn(
                                        "w-full py-6 font-bold text-md",
                                        completedCourses.includes(selectedCourse.code)
                                            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                                            : "bg-green-600 hover:bg-green-500 text-white"
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
        <div className="relative min-h-screen pt-32 pb-12 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[#050510] -z-20" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 -z-10" />
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-500/10 via-purple-500/5 to-transparent blur-3xl -z-10" />

            <div className="container mx-auto max-w-[1400px] px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10 text-center relative"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)] backdrop-blur-sm">
                        <Layout className="w-3 h-3" /> Interactive Map
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400 mb-4 tracking-tight drop-shadow-lg">
                        Degree Knowledge Graph
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Visualize your entire academic journey as a connected network.
                        <span className="text-zinc-500 block mt-1 text-sm">Target prerequisites, uncover unlocking paths, and strategic bottlenecks.</span>
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
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-zinc-300">Completed</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-zinc-300">Planned</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                        <span className="text-zinc-400">Future</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <span className="text-zinc-400">Hold</span>
                        <span className="text-white font-bold bg-zinc-800 px-1.5 rounded text-xs border border-zinc-700">Ctrl</span>
                        <span className="text-zinc-400">+ Scroll to Zoom</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
