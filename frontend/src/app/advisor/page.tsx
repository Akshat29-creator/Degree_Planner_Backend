"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, demoCourses } from "@/lib/store";
import { getCareerAdvice } from "@/lib/api";
import type { AIAdviceResponse } from "@/lib/api";
import { cachedCareerRoadmaps } from "@/data/career-roadmaps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Loader2,
    Target,
    Lightbulb,
    Route,
    BookOpen,
    ArrowRight,
    Code,
    Database,
    Brain,
    Cloud,
    Shield,
    Briefcase,
    GraduationCap,
    Trophy,
    Rocket,
    CheckCircle2,
    ChevronDown,
    Zap,
    Star,
    Map,
    Wrench,
    FolderGit2,
    Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const careerSuggestions = [
    "Machine Learning Engineer",
    "Full Stack Developer",
    "Data Scientist",
    "DevOps Engineer",
    "Cybersecurity Analyst",
    "Cloud Architect",
    "Product Manager",
    "AI Research Scientist",
    "Blockchain Developer",
    "Mobile App Developer",
];

// Skill mapping for different careers
const careerSkillMap: Record<string, { required: string[]; recommended: string[]; tools: string[] }> = {
    "machine learning engineer": {
        required: ["Python", "Statistics", "Linear Algebra", "Neural Networks", "TensorFlow/PyTorch"],
        recommended: ["MLOps", "Cloud Platforms", "Data Pipelines", "SQL", "Docker"],
        tools: ["Jupyter", "scikit-learn", "Pandas", "NumPy", "Kubernetes"],
    },
    "full stack developer": {
        required: ["JavaScript/TypeScript", "React/Vue", "Node.js", "SQL", "REST APIs"],
        recommended: ["GraphQL", "Docker", "CI/CD", "Testing", "System Design"],
        tools: ["Git", "VS Code", "Postman", "Figma", "MongoDB"],
    },
    "data scientist": {
        required: ["Python/R", "Statistics", "Machine Learning", "Data Visualization", "SQL"],
        recommended: ["Deep Learning", "NLP", "A/B Testing", "Cloud Platforms", "Data Engineering"],
        tools: ["Jupyter", "Tableau", "Pandas", "TensorFlow", "Apache Spark"],
    },
    "devops engineer": {
        required: ["Linux", "CI/CD", "Docker", "Kubernetes", "Cloud (AWS/GCP/Azure)"],
        recommended: ["Infrastructure as Code", "Monitoring", "Security", "Networking", "Scripting"],
        tools: ["Terraform", "Jenkins", "Prometheus", "Ansible", "Helm"],
    },
    "cybersecurity analyst": {
        required: ["Network Security", "Cryptography", "Linux", "Security Frameworks", "Incident Response"],
        recommended: ["Penetration Testing", "SIEM", "Cloud Security", "Forensics", "Compliance"],
        tools: ["Wireshark", "Burp Suite", "Metasploit", "Splunk", "Nmap"],
    },
    "cloud architect": {
        required: ["Cloud Platforms", "Networking", "Security", "IaC", "Containers"],
        recommended: ["Microservices", "Serverless", "Cost Optimization", "Disaster Recovery", "Multi-cloud"],
        tools: ["AWS/GCP/Azure", "Terraform", "Kubernetes", "CloudFormation", "Pulumi"],
    },
    "blockchain developer": {
        required: ["Smart Contracts", "Cryptography", "Solidity/Rust", "Web3.js", "Consensus Mechanisms"],
        recommended: ["Tokenomics", "Security Auditing", "Distributed Systems", "Game Theory", "Finance"],
        tools: ["Hardhat", "Truffle", "Metamask", "Remix", "Ganache"],
    },
    "mobile app developer": {
        required: ["React Native/Flutter", "iOS/Android Native", "State Management", "API Integration", "UI/UX Implementation"],
        recommended: ["CI/CD for Mobile", "App Store Optimization", "Offline Storage", "Animations", "Testing"],
        tools: ["Android Studio", "Xcode", "Firebase", "Postman", "Figma"],
    },
    "product manager": {
        required: ["Product Lifecycle", "Agile/Scrum", "User Research", "Data Analysis", "Roadmapping"],
        recommended: ["UX Design Basics", "Technical Architecture", "GTM Strategy", "A/B Testing", "Financial Modeling"],
        tools: ["Jira", "Notion", "Figma", "Amplitude", "Linear"],
    },
    "ai research scientist": {
        required: ["Deep Learning", "Mathematics", "Python", "PyTorch/JAX", "Paper Writing"],
        recommended: ["Distributed Training", "CUDA Programming", "Grant Writing", "Public Speaking", "Ethics"],
        tools: ["arXiv", "Overleaf", "Weights & Biases", "HuggingFace", "Google Colab"],
    },
    "default": {
        required: ["Programming Fundamentals", "Problem Solving", "Data Structures", "Algorithms", "Version Control"],
        recommended: ["System Design", "Cloud Basics", "Databases", "APIs", "Testing"],
        tools: ["Git", "VS Code", "Terminal", "Docker", "Postman"],
    }
};

// Project suggestions based on career
const projectSuggestions: Record<string, { name: string; description: string; difficulty: string }[]> = {
    "machine learning engineer": [
        { name: "Image Classifier", description: "Build a CNN to classify images using TensorFlow", difficulty: "Medium" },
        { name: "Sentiment Analyzer", description: "NLP model for social media sentiment analysis", difficulty: "Medium" },
        { name: "Recommendation Engine", description: "Collaborative filtering system for movie/product recommendations", difficulty: "Hard" },
    ],
    "full stack developer": [
        { name: "Task Manager App", description: "Full CRUD app with React frontend and Node.js backend", difficulty: "Easy" },
        { name: "E-Commerce Site", description: "Shopping cart, payment integration (Stripe), and admin dashboard", difficulty: "Hard" },
        { name: "Real-time Chat", description: "WebSockets based chat application with rooms", difficulty: "Medium" },
    ],
    "blockchain developer": [
        { name: "NFT Marketplace", description: "Buy/Sell NFTs on Ethereum testnet", difficulty: "Hard" },
        { name: "Voting DApp", description: "Decentralized voting system using smart contracts", difficulty: "Medium" },
        { name: "DeFi Staking", description: "Token staking platform with yield calculation", difficulty: "Advanced" },
    ],
    "mobile app developer": [
        { name: "Fitness Tracker", description: "Track steps and workouts with graphs", difficulty: "Medium" },
        { name: "Social Media App", description: "Photo feed with likes and comments", difficulty: "Hard" },
        { name: "Expense Manager", description: "Offline-first local finance tracker", difficulty: "Easy" },
    ],

    "data scientist": [
        { name: "Sales Forecasting", description: "Time series analysis to predict future sales", difficulty: "Medium" },
        { name: "Customer Segmentation", description: "K-means clustering for marketing targeting", difficulty: "Medium" },
        { name: "Fraud Detection", description: "Anomaly detection model for transactions", difficulty: "Hard" },
    ],
    "default": [
        { name: "Portfolio Website", description: "Personal site to showcase your projects", difficulty: "Easy" },
        { name: "API Integration App", description: "Consume a public API and display data", difficulty: "Easy" },
        { name: "Full Stack CRUD App", description: "Complete web app with database", difficulty: "Medium" },
    ]
};

// ==========================================
// SKILLS RADAR COMPONENT
// ==========================================
function SkillsRadar({ skills, type }: { skills: string[]; type: "required" | "recommended" | "tools" }) {
    const colors = {
        required: "from-red-500 to-rose-500",
        recommended: "from-violet-500 to-purple-500",
        tools: "from-teal-500 to-cyan-500",
    };

    const icons = {
        required: Zap,
        recommended: Star,
        tools: Wrench,
    };

    const titles = {
        required: "Required Skills",
        recommended: "Recommended Skills",
        tools: "Tools to Master",
    };

    const Icon = icons[type];

    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Icon className={cn("h-4 w-4",
                    type === "required" && "text-rose-400",
                    type === "recommended" && "text-violet-400",
                    type === "tools" && "text-teal-400"
                )} />
                {titles[type]}
            </h4>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                    <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Badge className={cn(
                            "bg-gradient-to-r text-white border-0",
                            colors[type]
                        )}>
                            {skill}
                        </Badge>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// PROJECT SUGGESTIONS COMPONENT
// ==========================================
function ProjectSuggestions({ projects }: { projects: { name: string; description: string; difficulty: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-orange-400" />
                Portfolio Project Ideas
            </h4>
            <div className="space-y-3">
                {projects.map((project, i) => (
                    <motion.div
                        key={project.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{project.name}</span>
                            <Badge variant="outline" className={cn(
                                "text-xs",
                                project.difficulty === "Easy" && "border-green-500/30 text-green-400",
                                project.difficulty === "Medium" && "border-yellow-500/30 text-yellow-400",
                                project.difficulty === "Hard" && "border-red-500/30 text-red-400"
                            )}>
                                {project.difficulty}
                            </Badge>
                        </div>
                        <p className="text-sm text-zinc-400">{project.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// CERTIFICATIONS COMPONENT
// ==========================================
type CertType = string | { name: string; issuer: string; difficulty: string; cost: string; value: string };
function CertificationsCard({ certs }: { certs: CertType[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                Recommended Certifications
            </h4>
            <div className="space-y-3">
                {certs.map((cert, i) => {
                    const isString = typeof cert === 'string';
                    const certName = isString ? cert : cert.name;
                    const certIssuer = isString ? null : cert.issuer;
                    const certDifficulty = isString ? null : cert.difficulty;
                    const certValue = isString ? null : cert.value;

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white">{certName}</span>
                                {certDifficulty && (
                                    <Badge variant="outline" className={cn(
                                        "text-[10px]",
                                        certDifficulty === "Beginner" && "border-green-500/30 text-green-400",
                                        certDifficulty === "Intermediate" && "border-yellow-500/30 text-yellow-400",
                                        certDifficulty === "Advanced" && "border-red-500/30 text-red-400"
                                    )}>
                                        {certDifficulty}
                                    </Badge>
                                )}
                            </div>
                            {certIssuer && <p className="text-xs text-zinc-500 mb-1">by {certIssuer}</p>}
                            {certValue && <p className="text-sm text-zinc-400">{certValue}</p>}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// SALARY PROGRESSION CHART
// ==========================================
function SalaryProgressionChart({ data }: { data: { stage: string; range?: string; range_usd?: string; range_inr?: string; years_experience?: string }[] }) {
    const parseSalary = (range: string) => {
        // Simple parser to extract max value for visualization scaling
        const match = range.match(/\$(\d+)k/);
        return match ? parseInt(match[1]) : 50;
    };

    // Get display range (prefer range_usd, then range_inr, then legacy range)
    const getDisplayRange = (item: typeof data[0]) => {
        if (item.range_usd && item.range_inr) {
            return `${item.range_usd} / ${item.range_inr}`;
        }
        return item.range_usd || item.range || item.range_inr || "N/A";
    };

    const getRangeForCalc = (item: typeof data[0]) => {
        return item.range_usd || item.range || "$80k";
    };

    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Estimated Salary Progression
            </h4>
            <div className="space-y-6">
                {data.map((item, i) => {
                    const rangeStr = getRangeForCalc(item);
                    const value = parseSalary(rangeStr.split('-')[1] || rangeStr);
                    const percentage = Math.min((value / 250) * 100, 100);

                    return (
                        <div key={i} className="relative">
                            <div className="flex justify-between text-xs mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-medium uppercase tracking-wider",
                                        i === 0 && "text-zinc-400",
                                        i === 1 && "text-blue-400",
                                        i === 2 && "text-purple-400",
                                        i === 3 && "text-yellow-400"
                                    )}>{item.stage}</span>
                                    {item.years_experience && (
                                        <Badge variant="outline" className="text-[10px] border-white/20">
                                            {item.years_experience}
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-white font-mono text-xs">{getDisplayRange(item)}</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: i * 0.2 }}
                                    className={cn(
                                        "h-full rounded-full bg-gradient-to-r",
                                        i === 0 && "from-zinc-500 to-zinc-400",
                                        i === 1 && "from-blue-600 to-blue-400",
                                        i === 2 && "from-purple-600 to-purple-400",
                                        i === 3 && "from-yellow-600 to-yellow-400"
                                    )}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// INTERVIEW PREP COMPONENT
// ==========================================
function InterviewPrepCard({ questions }: { questions: { question: string; answer_key: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                Interview Prep
            </h4>
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-sm font-medium text-emerald-200 mb-2">Q: {q.question}</p>
                        <div className="pl-3 border-l-2 border-emerald-500/30">
                            <p className="text-xs text-zinc-400 italic">{q.answer_key}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// GAP ANALYSIS COMPONENT
// ==========================================
function GapAnalysisCard({ gaps }: { gaps: { skill: string; description: string; recommended_resource: string }[] }) {
    return (
        <div className="glass-card p-6 border-amber-500/20">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                Skill Gap Analysis
            </h4>
            <div className="space-y-4">
                {gaps.map((gap, i) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-amber-200">{gap.skill}</span>
                            <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">Missing</Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mb-3">{gap.description}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/20 p-2 rounded-lg">
                            <BookOpen className="h-3 w-3" />
                            <span className="truncate">Resource: {gap.recommended_resource}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// STUDY SCHEDULE COMPONENT
// ==========================================
function StudySchedule({ schedule }: { schedule: { week: string; focus: string; activities: string[] }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Route className="h-4 w-4 text-sky-400" />
                4-Week Kickstart Plan
            </h4>
            <div className="relative border-l-2 border-sky-500/20 ml-2 space-y-6 pl-6 py-2">
                {schedule.map((week, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative"
                    >
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-sky-900 border-2 border-sky-500" />
                        <h5 className="text-sm font-bold text-sky-400 mb-1">{week.week}: {week.focus}</h5>
                        <ul className="space-y-1">
                            {week.activities.map((act, j) => (
                                <li key={j} className="text-sm text-zinc-400 flex items-start gap-2">
                                    <span className="text-sky-500/50 mt-1.5">•</span>
                                    {act}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// LEARNING ROADMAP VISUALIZATION
// ==========================================
function LearningRoadmap({ path }: { path: string[] }) {
    if (!path || path.length === 0) return null;

    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Map className="h-4 w-4 text-purple-400" />
                Your Learning Roadmap
            </h4>

            {/* Visual Timeline */}
            <div className="relative">
                {/* Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-teal-500" />

                <div className="space-y-4">
                    {path.map((course, i) => (
                        <motion.div
                            key={course}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative flex items-center gap-4 pl-12"
                        >
                            {/* Node */}
                            <div className={cn(
                                "absolute left-4 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-zinc-900",
                                i === 0 && "bg-violet-500",
                                i === path.length - 1 && "bg-teal-500",
                                i > 0 && i < path.length - 1 && "bg-purple-500"
                            )}>
                                {i + 1}
                            </div>

                            {/* Course Card */}
                            <div className={cn(
                                "flex-1 p-3 rounded-xl border",
                                i === 0 && "bg-violet-500/10 border-violet-500/30",
                                i === path.length - 1 && "bg-teal-500/10 border-teal-500/30",
                                i > 0 && i < path.length - 1 && "bg-white/5 border-white/10"
                            )}>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-white">{course}</span>
                                    {i === 0 && (
                                        <Badge className="bg-violet-500/20 text-violet-400 text-xs">Start Here</Badge>
                                    )}
                                    {i === path.length - 1 && (
                                        <Badge className="bg-teal-500/20 text-teal-400 text-xs">Final Goal</Badge>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// NEW: INDUSTRY TRENDS COMPONENT
// ==========================================
function IndustryTrendsCard({ trends }: { trends: { trend: string; description: string; skills_needed: string[] }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Industry Trends to Watch
            </h4>
            <div className="space-y-4">
                {trends.map((trend, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"
                    >
                        <h5 className="font-semibold text-amber-200 mb-2">{trend.trend}</h5>
                        <p className="text-sm text-zinc-400 mb-3">{trend.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {trend.skills_needed.map((skill, j) => (
                                <Badge key={j} variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// NEW: TARGET COMPANIES COMPONENT
// ==========================================
function CompaniesCard({ companies }: { companies: { company: string; type: string; hiring_level: string; typical_role: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                Companies to Target
            </h4>
            <div className="grid grid-cols-2 gap-3">
                {companies.slice(0, 8).map((company, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white text-sm">{company.company}</span>
                            <Badge variant="outline" className={cn(
                                "text-[10px]",
                                company.hiring_level === "High" && "border-green-500/30 text-green-400",
                                company.hiring_level === "Medium" && "border-yellow-500/30 text-yellow-400"
                            )}>
                                {company.hiring_level}
                            </Badge>
                        </div>
                        <p className="text-xs text-zinc-500">{company.type} • {company.typical_role}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// NEW: BOOKS COMPONENT
// ==========================================
function BooksCard({ books }: { books: { title: string; author: string; why_read: string; level: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-pink-400" />
                Must-Read Books
            </h4>
            <div className="space-y-3">
                {books.map((book, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h5 className="font-semibold text-pink-200">{book.title}</h5>
                            <Badge variant="outline" className="text-[10px] border-pink-500/30 text-pink-400">
                                {book.level}
                            </Badge>
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">by {book.author}</p>
                        <p className="text-sm text-zinc-400">{book.why_read}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// NEW: ONLINE COMMUNITIES COMPONENT
// ==========================================
function CommunitiesCard({ communities }: { communities: { name: string; platform: string; link_hint: string; benefit: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-400" />
                Communities to Join
            </h4>
            <div className="space-y-3">
                {communities.map((community, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10"
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-400">{community.platform.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                            <h5 className="font-medium text-white text-sm">{community.name}</h5>
                            <p className="text-xs text-zinc-500">{community.benefit}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// NEW: DAY IN LIFE COMPONENT
// ==========================================
function DayInLifeCard({ description }: { description: string }) {
    return (
        <div className="glass-card p-6 border-cyan-500/20">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                A Day in the Life
            </h4>
            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

// ==========================================
// NEW: CAREER PROGRESSION COMPONENT
// ==========================================
function CareerProgressionCard({ progression }: { progression: { level: string; years: string; responsibilities: string; skills_focus: string }[] }) {
    return (
        <div className="glass-card p-6">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-400" />
                Career Progression Path
            </h4>
            <div className="relative border-l-2 border-emerald-500/20 ml-2 space-y-6 pl-6 py-2">
                {progression.map((level, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="relative"
                    >
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-900 border-2 border-emerald-500" />
                        <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-bold text-emerald-400">{level.level}</h5>
                            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300">
                                {level.years} years
                            </Badge>
                        </div>
                        <p className="text-sm text-zinc-300 mb-1">{level.responsibilities}</p>
                        <p className="text-xs text-zinc-500">Focus: {level.skills_focus}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// MAIN ADVISOR PAGE
// ==========================================
export default function AdvisorPage() {
    const courses = useAppStore((state) => state.courses);
    const setCourses = useAppStore((state) => state.setCourses);
    const careerGoal = useAppStore((state) => state.careerGoal);
    const setCareerGoal = useAppStore((state) => state.setCareerGoal);

    const [isLoading, setIsLoading] = useState(false);
    const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showMore, setShowMore] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingProgress, setTypingProgress] = useState(0);

    // Get skill data based on career goal
    const normalizedGoal = careerGoal.toLowerCase().trim();
    const skillData = careerSkillMap[normalizedGoal] || careerSkillMap["default"];
    const projects = projectSuggestions[normalizedGoal] || projectSuggestions["default"];

    const handleGetAdvice = async () => {
        if (!careerGoal.trim()) return;

        setIsLoading(true);
        setIsTyping(true);
        setTypingProgress(0);
        setError(null);
        setAdvice(null);

        const normalizedGoal = careerGoal.toLowerCase().trim();
        const cachedData = cachedCareerRoadmaps[normalizedGoal];

        // Start progress animation immediately for BOTH cases
        // We will manage the interval ID to clear it later if needed
        let progress = 0;
        let animationComplete = false;

        // For cached data: 20s duration
        // For LLM data: variable duration (we'll slow down progress if it takes longer)
        const targetDuration = cachedData ? 20000 : 30000; // 20s vs 30s base estimate
        const intervalTime = 200;
        const steps = targetDuration / intervalTime;
        const increment = 100 / steps;

        const interval = setInterval(() => {
            setTypingProgress((prev) => {
                // Determine next progress
                let next = prev + increment;

                // Add some randomness to make it feel natural
                next += (Math.random() * 0.5 - 0.25);

                // If no cached data (LLM mode), cap at 90% until real response comes
                if (!cachedData && next > 90 && !animationComplete) {
                    return 90 + (Math.random() * 0.5); // micro-movements at 90%
                }

                // Cap at 100%
                if (next > 100) next = 100;

                return next;
            });
        }, intervalTime);


        if (cachedData) {
            // == CACHED PATH ==
            // Just wait for the full 20s duration implicitly by letting the interval run
            // We can set a timeout to trigger completion
            setTimeout(() => {
                clearInterval(interval);
                setTypingProgress(100);
                setTimeout(() => {
                    setIsTyping(false);
                    setIsLoading(false);
                    setAdvice(cachedData);
                }, 500); // Short delay after 100% before showing result
            }, 20000);

        } else {
            // == LLM PATH ==
            try {
                // The API call happens in parallel with the animation
                const response = await getCareerAdvice(
                    careerGoal,
                    courses.map((c) => c.code)
                );

                // When API returns:
                animationComplete = true; // Signal description
                clearInterval(interval);  // Stop slow increment
                setTypingProgress(100);   // Jump to 100%

                setTimeout(() => {
                    setIsTyping(false);
                    setIsLoading(false);
                    setAdvice(response);
                }, 500);

            } catch (err) {
                clearInterval(interval);
                setIsTyping(false);
                setIsLoading(false);
                setError(err instanceof Error ? err.message : "Failed to get advice");
            }
        }
    };

    const handleDownloadData = () => {
        if (!advice) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Helper function to add new page if needed
            const checkPageBreak = (yPos: number, minSpace: number = 40) => {
                if (yPos > pageHeight - minSpace) {
                    doc.addPage();
                    return 30;
                }
                return yPos;
            };

            // ============== COVER / HEADER ==============
            doc.setFillColor(139, 92, 246); // Violet 500
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("Career Roadmap", 14, 18);
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text(`Your Path to: ${careerGoal}`, 14, 30);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 14, 18, { align: 'right' });

            let yPos = 55;

            // ============== EXECUTIVE SUMMARY ==============
            doc.setTextColor(139, 92, 246);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Executive Summary", 14, yPos);
            yPos += 8;

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const summaryText = `This personalized roadmap outlines your path to becoming a ${careerGoal}. Based on your ${courses.length} available courses, this guide provides recommended courses, required skills, project ideas, and actionable career tips to help you achieve your goal.`;
            const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
            doc.text(summaryLines, 14, yPos);
            yPos += summaryLines.length * 5 + 10;

            // ============== SKILLS OVERVIEW ==============
            doc.setTextColor(139, 92, 246);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Skills You Need to Master", 14, yPos);
            yPos += 10;

            // ... (Existing Skills: Required, Recommended, Tools) ...

            // Required Skills
            doc.setFillColor(254, 226, 226); // Red-50
            doc.roundedRect(14, yPos - 4, pageWidth - 28, 8 + skillData.required.length * 5, 2, 2, 'F');
            doc.setTextColor(185, 28, 28); // Red-700
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Required Skills (Must Have)", 18, yPos + 2);
            yPos += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            skillData.required.forEach((skill, i) => {
                doc.text(`• ${skill}`, 22, yPos);
                yPos += 5;
            });
            yPos += 8;

            // Recommended Skills
            yPos = checkPageBreak(yPos, 50);
            doc.setFillColor(237, 233, 254); // Violet-50
            doc.roundedRect(14, yPos - 4, pageWidth - 28, 8 + skillData.recommended.length * 5, 2, 2, 'F');
            doc.setTextColor(109, 40, 217); // Violet-700
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Recommended Skills (Nice to Have)", 18, yPos + 2);
            yPos += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            skillData.recommended.forEach((skill) => {
                doc.text(`• ${skill}`, 22, yPos);
                yPos += 5;
            });
            yPos += 8;

            // Tools to Master
            yPos = checkPageBreak(yPos, 50);
            doc.setFillColor(204, 251, 241); // Teal-50
            doc.roundedRect(14, yPos - 4, pageWidth - 28, 8 + skillData.tools.length * 5, 2, 2, 'F');
            doc.setTextColor(17, 94, 89); // Teal-700
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Tools & Technologies to Master", 18, yPos + 2);
            yPos += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            skillData.tools.forEach((tool) => {
                doc.text(`• ${tool}`, 22, yPos);
                yPos += 5;
            });
            yPos += 15;

            // GAP ANALYSIS (New)
            if (advice.missing_skills && advice.missing_skills.length > 0) {
                yPos = checkPageBreak(yPos, 60);
                doc.setTextColor(245, 158, 11); // Amber-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Critical Skill Gaps (Not in your Catalog)", 14, yPos);
                yPos += 10;

                autoTable(doc, {
                    startY: yPos,
                    head: [["Missing Skill", "Why it's needed", "Recommended Resource"]],
                    body: advice.missing_skills.map(gap => [gap.skill, gap.description, gap.recommended_resource]),
                    theme: 'striped',
                    headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== RECOMMENDED COURSES ==============
            yPos = checkPageBreak(yPos, 60);
            doc.setTextColor(20, 184, 166); // Teal-500
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Recommended Courses", 14, yPos);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Courses from your catalog that directly support your career goal", 14, yPos + 6);
            yPos += 12;

            autoTable(doc, {
                startY: yPos,
                head: [["Priority", "Course Code", "Why This Course Matters"]],
                body: advice.top_courses.map((c, i) => [`#${i + 1}`, c.code, c.reason]),
                theme: 'striped',
                headStyles: { fillColor: [20, 184, 166], fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 'auto' } },
                margin: { left: 14, right: 14 },
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;

            // ============== STUDY SCHEDULE (New) ==============
            if (advice.study_schedule && advice.study_schedule.length > 0) {
                yPos = checkPageBreak(yPos, 80);
                doc.addPage();
                yPos = 30;

                doc.setTextColor(14, 165, 233); // Sky-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("4-Week Kickstart Plan", 14, yPos);
                yPos += 10;

                advice.study_schedule.forEach((week) => {
                    yPos = checkPageBreak(yPos, 30);
                    doc.setFontSize(11);
                    doc.setTextColor(14, 165, 233);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${week.week}: ${week.focus}`, 14, yPos);
                    yPos += 6;

                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    doc.setFont("helvetica", "normal");
                    week.activities.forEach(act => {
                        doc.text(`• ${act}`, 20, yPos);
                        yPos += 5;
                    });
                    yPos += 5;
                });
                yPos += 10;
            }

            // ============== LEARNING PATH ==============
            yPos = checkPageBreak(yPos, 80);
            // If we didn't add a page for schedule, check if we need one now.
            // But usually schedule takes a page.
            if (!advice.study_schedule) {
                doc.addPage();
                yPos = 30;
            }

            doc.setTextColor(139, 92, 246);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Your Learning Path (Internal Courses)", 14, yPos);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Follow this sequence to build knowledge progressively", 14, yPos + 6);
            yPos += 15;

            autoTable(doc, {
                startY: yPos,
                head: [["Step", "Course/Topic", "Focus Area", "Estimated Time"]],
                body: advice.learning_path.map((c, i) => {
                    const course = courses.find(course => course.code === c);
                    return [
                        `Step ${i + 1}`,
                        c,
                        i === 0 ? "Foundation" : i === advice.learning_path.length - 1 ? "Advanced/Capstone" : "Core Skills",
                        course ? `${course.credits * 3}-${course.credits * 4} weeks` : "4-6 weeks"
                    ];
                }),
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246], fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                margin: { left: 14, right: 14 },
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;

            // ============== PROJECT PORTFOLIO ==============
            yPos = checkPageBreak(yPos, 80);
            doc.setTextColor(249, 115, 22); // Orange-500
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Portfolio Projects to Build", 14, yPos);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Build these projects to demonstrate your skills to employers", 14, yPos + 6);
            yPos += 15;

            const pdfProjects = advice.project_ideas && advice.project_ideas.length > 0
                ? advice.project_ideas.map(p => ({
                    name: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    skills: p.tech_stack ? p.tech_stack.join(", ") : "Various Skills"
                }))
                : projects.map(p => ({
                    name: p.name,
                    description: p.description,
                    difficulty: p.difficulty,
                    skills: p.difficulty === "Easy" ? "Basics, Problem Solving" :
                        p.difficulty === "Medium" ? "Core Concepts, Integration" : "Advanced, System Design"
                }));

            autoTable(doc, {
                startY: yPos,
                head: [["Project Name", "Description", "Difficulty", "Tech Stack / Skills"]],
                body: pdfProjects.map(p => [
                    p.name,
                    p.description,
                    p.difficulty,
                    p.skills
                ]),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22], fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                margin: { left: 14, right: 14 },
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;

            // ============== SALARY & MARKET DATA ==============
            if (advice.salary_progression && advice.salary_progression.length > 0) {
                yPos = checkPageBreak(yPos, 60);
                doc.setTextColor(139, 92, 246); // Violet-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Estimated Salary Progression", 14, yPos);
                yPos += 10;

                autoTable(doc, {
                    startY: yPos,
                    head: [["Career Stage", "Salary (USD)", "Salary (INR)", "Experience"]],
                    body: advice.salary_progression.map(s => [
                        s.stage,
                        s.range_usd || s.range || "N/A",
                        s.range_inr || "N/A",
                        s.years_experience || ""
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [139, 92, 246], fontSize: 9 },
                    bodyStyles: { fontSize: 9, fontStyle: 'bold' },
                    margin: { left: 14, right: 14 },
                    // Limit width to half page if desired, but full width is fine
                });

                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== CERTIFICATIONS & PREP ==============
            if (advice.certifications || advice.interview_prep) {
                yPos = checkPageBreak(yPos, 80);

                // Certs
                if (advice.certifications && advice.certifications.length > 0) {
                    doc.setTextColor(59, 130, 246); // Blue-500
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("Recommended Certifications", 14, yPos);

                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.setFont("helvetica", "normal");
                    yPos += 8;
                    advice.certifications.forEach(cert => {
                        doc.text(`• ${cert}`, 20, yPos);
                        yPos += 6;
                    });
                    yPos += 10;
                }

                // Interview Prep
                if (advice.interview_prep && advice.interview_prep.length > 0) {
                    yPos = checkPageBreak(yPos, 60);
                    doc.setTextColor(16, 185, 129); // Emerald-500
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("Techncial Interview Preparation", 14, yPos);
                    yPos += 10;

                    advice.interview_prep.forEach((item, i) => {
                        yPos = checkPageBreak(yPos, 20);
                        doc.setFontSize(10);
                        doc.setTextColor(16, 185, 129);
                        doc.setFont("helvetica", "bold");
                        const qLines = doc.splitTextToSize(`Q${i + 1}: ${item.question}`, pageWidth - 28);
                        doc.text(qLines, 14, yPos);
                        yPos += qLines.length * 5;

                        doc.setTextColor(80, 80, 80);
                        doc.setFont("helvetica", "italic");
                        const aLines = doc.splitTextToSize(`Key Points: ${item.answer_key}`, pageWidth - 32);
                        doc.text(aLines, 18, yPos);
                        yPos += aLines.length * 5 + 6;
                    });
                    yPos += 5;
                }
            }

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;

            // ============== CAREER TIPS ==============
            yPos = checkPageBreak(yPos, 80);
            doc.setTextColor(234, 179, 8); // Yellow-500
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("AI-Generated Career Tips", 14, yPos);
            yPos += 10;

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");

            advice.career_tips.forEach((tip, i) => {
                yPos = checkPageBreak(yPos, 15);
                doc.setFont("helvetica", "bold");
                doc.text(`${i + 1}.`, 14, yPos);
                doc.setFont("helvetica", "normal");
                const tipLines = doc.splitTextToSize(tip, pageWidth - 35);
                doc.text(tipLines, 22, yPos);
                yPos += tipLines.length * 4 + 5;
            });

            // ============== NEW: INDUSTRY TRENDS ==============
            if (advice.industry_trends && advice.industry_trends.length > 0) {
                yPos = checkPageBreak(yPos, 80);
                doc.addPage();
                yPos = 30;

                doc.setTextColor(245, 158, 11); // Amber-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Industry Trends to Watch", 14, yPos);
                yPos += 10;

                advice.industry_trends.forEach((trend, i) => {
                    yPos = checkPageBreak(yPos, 25);
                    doc.setFontSize(11);
                    doc.setTextColor(245, 158, 11);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${i + 1}. ${trend.trend}`, 14, yPos);
                    yPos += 6;

                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    doc.setFont("helvetica", "normal");
                    const trendLines = doc.splitTextToSize(trend.description, pageWidth - 28);
                    doc.text(trendLines, 18, yPos);
                    yPos += trendLines.length * 4 + 3;

                    if (trend.skills_needed && trend.skills_needed.length > 0) {
                        doc.setTextColor(100, 100, 100);
                        doc.text(`Skills: ${trend.skills_needed.join(", ")}`, 18, yPos);
                        yPos += 8;
                    }
                });
            }

            // ============== NEW: COMPANIES TO TARGET ==============
            if (advice.companies_to_target && advice.companies_to_target.length > 0) {
                yPos = checkPageBreak(yPos, 60);
                doc.setTextColor(59, 130, 246); // Blue-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Companies to Target", 14, yPos);
                yPos += 10;

                autoTable(doc, {
                    startY: yPos,
                    head: [["Company", "Type", "Hiring Level", "Typical Role"]],
                    body: advice.companies_to_target.map(c => [c.company, c.type, c.hiring_level, c.typical_role]),
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== NEW: BOOK RECOMMENDATIONS ==============
            if (advice.book_recommendations && advice.book_recommendations.length > 0) {
                yPos = checkPageBreak(yPos, 60);
                doc.setTextColor(236, 72, 153); // Pink-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Must-Read Books", 14, yPos);
                yPos += 10;

                autoTable(doc, {
                    startY: yPos,
                    head: [["Title", "Author", "Why Read", "Level"]],
                    body: advice.book_recommendations.map(b => [b.title, b.author, b.why_read, b.level]),
                    theme: 'striped',
                    headStyles: { fillColor: [236, 72, 153], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== NEW: DAY IN LIFE ==============
            if (advice.day_in_life) {
                yPos = checkPageBreak(yPos, 50);
                doc.setTextColor(6, 182, 212); // Cyan-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("A Day in the Life", 14, yPos);
                yPos += 10;

                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                doc.setFont("helvetica", "normal");
                const dayLines = doc.splitTextToSize(advice.day_in_life, pageWidth - 28);
                doc.text(dayLines, 14, yPos);
                yPos += dayLines.length * 4 + 15;
            }

            // ============== NEW: CAREER PROGRESSION PATH ==============
            if (advice.career_progression && advice.career_progression.length > 0) {
                yPos = checkPageBreak(yPos, 80);
                doc.setTextColor(16, 185, 129); // Emerald-500
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Career Progression Path", 14, yPos);
                yPos += 10;

                autoTable(doc, {
                    startY: yPos,
                    head: [["Level", "Years", "Responsibilities", "Skills Focus"]],
                    body: advice.career_progression.map(c => [c.level, c.years, c.responsibilities, c.skills_focus]),
                    theme: 'grid',
                    headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
                    bodyStyles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                // @ts-ignore
                yPos = doc.lastAutoTable.finalY + 15;
            }

            // ============== ACTION ITEMS ==============
            yPos = checkPageBreak(yPos, 80);
            doc.addPage();
            yPos = 30;

            doc.setTextColor(34, 197, 94); // Green-500
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Your Action Plan - What To Do Next", 14, yPos);
            yPos += 12;

            const actionItems = [
                { week: "Week 1-2", action: `Start with "${advice.learning_path[0]}" course`, focus: "Build foundation knowledge" },
                { week: "Week 3-4", action: `Begin learning: ${skillData.required.slice(0, 2).join(", ")}`, focus: "Core skills development" },
                { week: "Month 2", action: `Complete first project: ${projects[0]?.name || "Starter Project"}`, focus: "Hands-on practice" },
                { week: "Month 3", action: `Learn tools: ${skillData.tools.slice(0, 3).join(", ")}`, focus: "Industry tools mastery" },
                { week: "Month 4+", action: "Build portfolio with 2-3 projects", focus: "Job-ready demonstration" },
                { week: "Ongoing", action: "Network, apply to jobs, keep learning", focus: "Career advancement" },
            ];

            autoTable(doc, {
                startY: yPos,
                head: [["Timeline", "Action Item", "Focus Area"]],
                body: actionItems.map(item => [item.week, item.action, item.focus]),
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
                bodyStyles: { fontSize: 8 },
                margin: { left: 14, right: 14 },
            });

            // @ts-ignore
            yPos = doc.lastAutoTable.finalY + 15;

            // ============== FINAL NOTES ==============
            yPos = checkPageBreak(yPos, 60);
            doc.setFillColor(245, 245, 255);
            doc.roundedRect(14, yPos - 5, pageWidth - 28, 40, 3, 3, 'F');
            doc.setTextColor(100, 50, 150);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Remember:", 18, yPos + 3);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const reminderText = `Becoming a ${careerGoal} is a journey, not a destination. Focus on consistent learning, building real projects, and connecting with others in the field. Your courses provide the foundation, but hands-on experience and continuous learning will set you apart. Good luck on your journey!`;
            const reminderLines = doc.splitTextToSize(reminderText, pageWidth - 36);
            doc.text(reminderLines, 18, yPos + 12);

            // ============== FOOTER ==============
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text("Generated by Smart Degree Planner - AI Career Coach", 14, pageHeight - 10);
            }

            // Generate Blob manually to force filename
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `career_roadmap_${careerGoal.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF generation failed:", err);
        }
    };

    // Load demo if no courses
    if (courses.length === 0) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="glass-card p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">
                        No Courses Loaded
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Load demo data to get AI career advice.
                    </p>
                    <Button
                        onClick={() => setCourses(demoCourses)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
                    >
                        <Rocket className="mr-2 h-5 w-5" />
                        Load Demo Data
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 pt-32">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Powered by Local AI
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-3">
                    AI Career Coach
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Tell me your dream career and I'll create a complete learning roadmap
                    with skills, courses, and project ideas.
                </p>
            </motion.div>

            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 mb-8"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                        What's Your Dream Career?
                    </h3>
                </div>

                <div className="flex gap-4 mb-6">
                    <Input
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                        placeholder="e.g., Machine Learning Engineer"
                        className="flex-1 bg-white/5 border-white/10 text-lg py-6"
                        onKeyDown={(e) => e.key === "Enter" && handleGetAdvice()}
                    />
                    <Button
                        onClick={handleGetAdvice}
                        disabled={isLoading || !careerGoal.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-8"
                    >
                        <>
                            Get Roadmap
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    </Button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                    {careerSuggestions.map((suggestion) => (
                        <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                            onClick={() => setCareerGoal(suggestion)}
                        >
                            {suggestion}
                        </Badge>
                    ))}
                </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-6 border-red-500/30 text-center"
                    >
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-12 text-center"
                    >
                        <div className="mb-6 relative mx-auto w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                            <Brain className="h-10 w-10 text-purple-400 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            AI is Designing Your Career Path
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            Analyzing industry trends, mapping skills, and curating projects...
                        </p>
                        <div className="w-full max-w-md mx-auto h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${typingProgress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 font-mono">
                            {Math.round(typingProgress)}% COMPLETE
                        </p>
                    </motion.div>
                )}

                {advice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Success Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-teal-500/10 border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-6 w-6 text-yellow-400" />
                                <div>
                                    <p className="text-white font-medium">
                                        Your personalized roadmap to become a <span className="text-purple-400">{careerGoal}</span>
                                    </p>
                                    <p className="text-sm text-zinc-400">
                                        Based on your {courses.length} available courses
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleDownloadData}
                                variant="outline"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Roadmap
                            </Button>
                        </div>

                        {/* TABS INTERFACE */}
                        <Tabs defaultValue="roadmap" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1 mb-8">
                                <TabsTrigger value="roadmap" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                                    Roadmap & Projects
                                </TabsTrigger>
                                <TabsTrigger value="career" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                                    Career & Insights
                                </TabsTrigger>
                                <TabsTrigger value="resources" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300">
                                    Resources & Tools
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB 1: ROADMAP & PROJECTS */}
                            <TabsContent value="roadmap" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Col: Roadmap & Schedule */}
                                    <div className="md:col-span-2 space-y-6">
                                        {advice.study_schedule && advice.study_schedule.length > 0 && (
                                            <StudySchedule schedule={advice.study_schedule} />
                                        )}
                                        <LearningRoadmap path={advice.learning_path} />

                                        {/* Expert Tips (Moved here for better context) */}
                                        <div className="glass-card p-6">
                                            <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
                                                <Lightbulb className="h-4 w-4 text-yellow-400" />
                                                Expert Tips
                                            </h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {advice.career_tips.slice(0, 5).map((tip, i) => (
                                                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                        <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 text-sm font-bold">
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-sm text-zinc-300">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Col: Top Courses */}
                                    <div className="space-y-6">
                                        <div className="glass-card p-6 h-full">
                                            <div className="flex items-center gap-2 mb-4">
                                                <BookOpen className="h-5 w-5 text-teal-400" />
                                                <h3 className="text-lg font-semibold text-white">
                                                    Recommended Courses
                                                </h3>
                                            </div>
                                            <div className="space-y-4">
                                                {advice.top_courses.map((course, i) => (
                                                    <motion.div
                                                        key={course.code}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-4 rounded-xl bg-white/5 border-l-4 border-teal-500"
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="font-semibold text-white">{course.code}</div>
                                                            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">#{i + 1}</Badge>
                                                        </div>
                                                        <p className="text-sm text-zinc-400">{course.reason}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Projects */}
                                <div className="glass-card p-6 border-pink-500/20">
                                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                        <Code className="h-5 w-5 text-pink-400" />
                                        Portfolio Project Ideas
                                    </h3>
                                    <ProjectSuggestions
                                        projects={
                                            advice.project_ideas && advice.project_ideas.length > 0
                                                ? advice.project_ideas.map(p => ({
                                                    name: p.title,
                                                    description: p.description,
                                                    difficulty: p.difficulty
                                                }))
                                                : projects
                                        }
                                    />
                                </div>
                            </TabsContent>

                            {/* TAB 2: CAREER & INSIGHTS */}
                            <TabsContent value="career" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {advice.salary_progression && (
                                        <SalaryProgressionChart data={advice.salary_progression} />
                                    )}
                                    {advice.day_in_life && (
                                        <DayInLifeCard description={advice.day_in_life} />
                                    )}
                                </div>

                                {advice.career_progression && advice.career_progression.length > 0 && (
                                    <CareerProgressionCard progression={advice.career_progression} />
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {advice.industry_trends && advice.industry_trends.length > 0 && (
                                        <IndustryTrendsCard trends={advice.industry_trends} />
                                    )}
                                    {advice.companies_to_target && advice.companies_to_target.length > 0 && (
                                        <CompaniesCard companies={advice.companies_to_target} />
                                    )}
                                </div>
                            </TabsContent>

                            {/* TAB 3: RESOURCES & TOOLS */}
                            <TabsContent value="resources" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Col: Skills & Gaps */}
                                    <div className="md:col-span-1 space-y-6">
                                        {advice.missing_skills && advice.missing_skills.length > 0 && (
                                            <GapAnalysisCard gaps={advice.missing_skills} />
                                        )}
                                        <div className="space-y-6">
                                            <SkillsRadar skills={skillData.required} type="required" />
                                            <SkillsRadar skills={skillData.tools} type="tools" />
                                        </div>
                                    </div>

                                    {/* Center: Certs & Prep */}
                                    <div className="md:col-span-1 space-y-6">
                                        {advice.certifications && (
                                            <CertificationsCard certs={advice.certifications} />
                                        )}
                                        {advice.interview_prep && (
                                            <InterviewPrepCard questions={advice.interview_prep} />
                                        )}
                                    </div>

                                    {/* Right: Community & Books */}
                                    <div className="md:col-span-1 space-y-6">
                                        {advice.book_recommendations && advice.book_recommendations.length > 0 && (
                                            <BooksCard books={advice.book_recommendations} />
                                        )}
                                        {advice.online_communities && advice.online_communities.length > 0 && (
                                            <CommunitiesCard communities={advice.online_communities} />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/20 text-center mt-8"
                        >
                            <h4 className="text-lg font-semibold text-white mb-2">
                                Ready to Start Your Journey?
                            </h4>
                            <p className="text-zinc-400 mb-4">
                                Go to the Smart Degree Planner to create your optimized course schedule.
                            </p>
                            <Button
                                onClick={() => window.location.href = "/planner"}
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold"
                            >
                                <Rocket className="mr-2 h-4 w-4" />
                                Create My Degree Plan
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
