"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function PricingPage() {
    const plans = [
        {
            name: "Student",
            price: "Free",
            description: "Essential tools for undergraduate planning.",
            features: [
                "AI Course Scheduling",
                "Prerequisite Validation",
                "Basic Career Alignment",
                "Visual Roadmap",
            ],
            notIncluded: [
                "Failure Simulations",
                "Advanced Market Analytics",
                "Priority Support"
            ],
            cta: "Get Started",
            href: "/register",
            popular: false
        },
        {
            name: "Scholar Pro",
            price: "$9/mo",
            description: "Power tools for the ambitious academic.",
            features: [
                "Everything in Student",
                "Unlimited What-If Scenarios",
                "Deep Job Market Insights",
                "Course Difficulty Heatmaps",
                "Export to PDF/Calendar"
            ],
            notIncluded: [],
            cta: "Upgrade",
            href: "/register", // In a real app, this would be payment
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-teal-500/30">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-4 border-white/10 bg-white/5 backdrop-blur">
                        Simple Pricing
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        Invest in your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">Future.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Our core planning features will always be free for students. Upgrade for power tools that give you an edge.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative rounded-3xl p-8 border ${plan.popular ? 'bg-zinc-900/80 border-teal-500/50 shadow-2xl shadow-teal-500/10' : 'bg-black/50 border-white/10'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 border-none px-4 py-1 text-white font-bold shadow-lg">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}</span>
                                    {plan.price !== "Free" && <span className="text-zinc-500">/month</span>}
                                </div>
                                <p className="text-zinc-400 text-sm mt-4">{plan.description}</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-white'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-zinc-300 text-sm">{feat}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feat, j) => (
                                    <div key={j} className="flex items-center gap-3 opacity-50">
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5 text-zinc-600">
                                            <X className="w-3 h-3" />
                                        </div>
                                        <span className="text-zinc-600 text-sm">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href={plan.href} className="block">
                                <Button className={`w-full h-12 rounded-xl font-bold ${plan.popular ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}
