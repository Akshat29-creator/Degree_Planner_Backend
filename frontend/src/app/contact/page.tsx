"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 overflow-x-hidden selection:bg-teal-500/30">

            {/* Background FX */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* HEADER */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4"
                    >
                        <Badge variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10 px-4 py-1.5 backdrop-blur-md">
                            <MessageSquare className="w-3 h-3 mr-2 inline" />
                            Get in Touch
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tight mb-6"
                    >
                        Let's Build <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                            Something Great.
                        </span>
                    </motion.h1>

                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Whether you have a question about the platform, want to collaborate, or just want to say hi—we're always open to connecting with brilliant minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* LEFT: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                            <div className="space-y-6">

                                <a href="mailto:akshatawasthi207@gmail.com" className="group flex items-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/5 hover:border-teal-500/30 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Email directly</div>
                                        <div className="text-lg font-medium text-white group-hover:text-teal-400 transition-colors">akshatawasthi207@gmail.com</div>
                                    </div>
                                </a>

                                <a href="tel:+918423054162" className="group flex items-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/5 hover:border-teal-500/30 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mr-5 group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Phone / WhatsApp</div>
                                        <div className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">+91 8423054162</div>
                                    </div>
                                </a>

                                <div className="flex items-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-5">
                                        <MapPin className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Headquarters</div>
                                        <div className="text-lg font-medium text-white">Global (Remote First)</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                            <h4 className="font-bold text-white mb-4">Direct Access to the Creator</h4>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                "I personally read every email. If you have feedback on how to make DegreePlanner better, I want to hear it."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-blue-500" />
                                <div>
                                    <div className="font-bold text-white text-sm">Akshat Awasthi</div>
                                    <div className="text-xs text-teal-400">Lead Developer</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] pointer-events-none" />

                        <h3 className="text-2xl font-bold text-white mb-2">Send a Message</h3>
                        <p className="text-zinc-500 mb-8 text-sm">We'll get back to you within 24 hours.</p>

                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 ml-1">First Name</label>
                                    <Input placeholder="Akshat" className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl h-12 text-white placeholder:text-zinc-600" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 ml-1">Last Name</label>
                                    <Input placeholder="Awasthi" className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl h-12 text-white placeholder:text-zinc-600" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 ml-1">Email Address</label>
                                <Input placeholder="you@example.com" className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl h-12 text-white placeholder:text-zinc-600" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 ml-1">Message</label>
                                <Textarea placeholder="Tell us about your project..." className="bg-white/5 border-white/10 focus:border-teal-500/50 rounded-xl min-h-[150px] text-white placeholder:text-zinc-600 resize-none p-4" />
                            </div>

                            <Button className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 shadow-lg shadow-teal-500/20">
                                Send Message <Send className="ml-2 w-5 h-5" />
                            </Button>
                        </form>

                    </motion.div>

                </div>
            </div>
        </div>
    );
}
