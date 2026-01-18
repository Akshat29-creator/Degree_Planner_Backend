"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TESTIMONIALS = [
    {
        quote: "The predictive degree modeling is a game changer. It didn't just save me time; it saved me an entire semester of misplaced credits.",
        author: "Aarav Patel",
        role: "Computer Science, Class of '25",
        color: "bg-blue-500"
    },
    {
        quote: "Finally a planner that actually understands prerequisites. The visual roadmap made planning my double major so much easier.",
        author: "Priya Sharma",
        role: "Economics & Data Science '24",
        color: "bg-purple-500"
    },
    {
        quote: "The gap analysis feature found exactly what I was missing for my minor. I would have graduated late without it!",
        author: "Rohan Gupta",
        role: "Biomedical Engineering '26",
        color: "bg-emerald-500"
    },
    {
        quote: "Super smooth interface. Exploring course combinations used to be a headache, now it's actually fun.",
        author: "Ishita Singh",
        role: "Psychology, Class of '25",
        color: "bg-pink-500"
    }
];

export function TestimonialTicker() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, []);

    const current = TESTIMONIALS[index];

    return (
        <div className="relative h-48 w-full max-w-lg">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-end"
                >
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-100 mb-6">
                        "{current.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full ${current.color} flex items-center justify-center text-white font-bold text-sm`}>
                            {current.author[0]}
                        </div>
                        <div>
                            <div className="font-semibold text-white">{current.author}</div>
                            <div className="text-sm text-zinc-400">{current.role}</div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
