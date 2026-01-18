"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Rocket } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-orange-500/30">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20"
                >
                    <Rocket className="w-10 h-10 text-orange-400" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black mb-6"
                >
                    Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Revolution.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-xl max-w-2xl mb-12"
                >
                    We're currently a small, tight-knit team building the future of academic planning. We don't have open positions right now, but we're always looking for brilliant contributors.
                </motion.p>

                <Link href="https://github.com/Akshat29-creator" target="_blank">
                    <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black font-bold hover:bg-zinc-200">
                        Contribute on GitHub
                    </Button>
                </Link>

            </div>
        </div>
    );
}
