"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Brain,
    Target,
    Shield,
    Sparkles,
    BarChart,
    Clock,
    Map,
    BookOpen,
    Users,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- COMPONENTS ---

function FeatureCard({ feature, index }: { feature: any, index: number }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const ref = useRef<HTMLDivElement>(null);

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    const maskX = useTransform(x, (val) => (val + 0.5) * 100);
    const maskY = useTransform(y, (val) => (val + 0.5) * 100);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group h-full"
        >
            <div className={cn(
                "absolute inset-0 rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                feature.gradient
            )} />

            <div className="relative h-full rounded-3xl bg-[#0a0a16] border border-white/10 p-8 overflow-hidden hover:border-white/20 transition-colors">
                {/* Hover Spotlight */}
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: useMotionTemplate`radial-gradient(400px circle at ${maskX}% ${maskY}%, rgba(255,255,255,0.05), transparent 40%)`
                    }}
                />

                <div className={cn("w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-white/5 ring-1 ring-white/10 shadow-lg", feature.color)}>
                    <feature.icon className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm mb-6">
                    {feature.description}
                </p>

                <ul className="space-y-2">
                    {feature.benefits.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-center text-xs text-zinc-500">
                            <div className={cn("w-1 h-1 rounded-full mr-2", feature.dotColor)} />
                            {benefit}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

export default function FeaturesPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white pt-24 pb-20 overflow-hidden">

            {/* BACKGROUND FX */}
            <motion.div style={{ y }} className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* HEADER */}
                <div className="text-center max-w-3xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 backdrop-blur"
                    >
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span className="text-xs font-bold tracking-wide text-teal-300 uppercase">
                            Feature Showcase
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500"
                    >
                        Tools of the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-500">Academic Titan</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-zinc-400 leading-relaxed"
                    >
                        From simple scheduling to complex career modeling. We've built an arsenal of tools to ensure your success is mathematically guaranteed.
                    </motion.p>
                </div>

                {/* FEATURE CATEGORIES */}
                <div className="space-y-32">

                    {/* SECTION 1: CORE PLANNING */}
                    <section>
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px bg-white/10 flex-1" />
                            <Badge variant="outline" className="text-violet-400 border-violet-500/30 bg-violet-500/10 px-4 py-1 text-xs uppercase tracking-widest font-bold">
                                Chapter I: The Architect
                            </Badge>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                index={0}
                                feature={{
                                    title: "Topological Scheduling",
                                    description: "Our core engine uses Kahn's Algorithm to mathematically guarantee valid course sequences that respect every prerequisite chain.",
                                    icon: Brain,
                                    gradient: "bg-violet-500",
                                    color: "text-violet-400",
                                    dotColor: "bg-violet-400",
                                    benefits: ["Zero prerequisite conflicts", "Optimized critical path", "Validates transfer credits"]
                                }}
                            />
                            <FeatureCard
                                index={1}
                                feature={{
                                    title: "Visual Roadmap",
                                    description: "A stunning, interactive year-by-year visualization of your entire degree. Drag, drop, and explore your future.",
                                    icon: Map,
                                    gradient: "bg-fuchsia-500",
                                    color: "text-fuchsia-400",
                                    dotColor: "bg-fuchsia-400",
                                    benefits: ["Year-grouped layout", "Interactive dependency graph", "Export to PDF"]
                                }}
                            />
                            <FeatureCard
                                index={2}
                                feature={{
                                    title: "Load Balancer",
                                    description: "Prevents burnout by analyzing course difficulty and distributing workload evenly across semesters.",
                                    icon: BarChart,
                                    gradient: "bg-indigo-500",
                                    color: "text-indigo-400",
                                    dotColor: "bg-indigo-400",
                                    benefits: ["Credit load smoothing", "Difficulty heatmaps", "Prevents 'Hell Semesters'"]
                                }}
                            />
                        </div>
                    </section>

                    {/* SECTION 2: AI INTELLIGENCE */}
                    <section>
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px bg-white/10 flex-1" />
                            <Badge variant="outline" className="text-teal-400 border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs uppercase tracking-widest font-bold">
                                Chapter II: The Oracle
                            </Badge>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                index={3}
                                feature={{
                                    title: "Privacy-First AI",
                                    description: "Run advanced analysis locally using your own LLM. Your transcript data never leaves your device.",
                                    icon: Shield,
                                    gradient: "bg-emerald-500",
                                    color: "text-emerald-400",
                                    dotColor: "bg-emerald-400",
                                    benefits: ["100% Local Processing", "GDPR Compliant", "No API Costs"]
                                }}
                            />
                            <FeatureCard
                                index={4}
                                feature={{
                                    title: "Career Alignment",
                                    description: "Real-time analysis of how well your selected courses align with your target job role and industry trends.",
                                    icon: Target,
                                    gradient: "bg-teal-500",
                                    color: "text-teal-400",
                                    dotColor: "bg-teal-400",
                                    benefits: ["Skills Gap Analysis", "Job Role Matching", "Elective Recommendations"]
                                }}
                            />
                            <FeatureCard
                                index={5}
                                feature={{
                                    title: "Failure Simulator",
                                    description: "Available only on Pro. Simulate 'What-If' scenarios to see exactly how failing a course impacts graduation.",
                                    icon: Clock,
                                    gradient: "bg-cyan-500",
                                    color: "text-cyan-400",
                                    dotColor: "bg-cyan-400",
                                    benefits: ["Crisis Management", "Recovery Planning", "Delay calculation"]
                                }}
                            />
                        </div>
                    </section>

                    {/* SECTION 3: CAREER ADVISOR */}
                    <section>
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px bg-white/10 flex-1" />
                            <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10 px-4 py-1 text-xs uppercase tracking-widest font-bold">
                                Chapter III: The Strategist
                            </Badge>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FeatureCard
                                index={6}
                                feature={{
                                    title: "A-Z Career Guidance",
                                    description: "A comprehensive playbook for your career. From study schedules to interview prep, specific to your goal.",
                                    icon: BookOpen,
                                    gradient: "bg-orange-500",
                                    color: "text-orange-400",
                                    dotColor: "bg-orange-400",
                                    benefits: ["Weekly Study Plans", "Interview Q&A", "Salary Negotiation Tips"]
                                }}
                            />
                            <FeatureCard
                                index={7}
                                feature={{
                                    title: "Industry Recon",
                                    description: "Deep dive into your target industry. Know the top companies, must-read books, and key influencers.",
                                    icon: Users,
                                    gradient: "bg-amber-500",
                                    color: "text-amber-400",
                                    dotColor: "bg-amber-400",
                                    benefits: ["Company targeting", "Resource curation", "Community finder"]
                                }}
                            />
                        </div>
                    </section>

                </div>

                {/* CTA */}
                <div className="mt-32 text-center">
                    <Link href="/register">
                        <Button size="lg" className="rounded-full h-16 px-12 text-lg font-bold bg-white text-black hover:bg-zinc-200">
                            Start Building Your Future <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
