"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Github, Globe } from "lucide-react";
import { TestimonialTicker } from "@/components/auth/TestimonialTicker";

export default function LoginPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, login, socialLogin } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            router.push("/dashboard");
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT SIDE: Visuals */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-zinc-900 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.15),_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(168,85,247,0.15),_transparent_50%)]" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <GraduationCap className="h-8 w-8 text-white" />
                        <span className="text-2xl font-bold text-white tracking-tight">DegreePlanner</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <TestimonialTicker />
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                        <p className="text-zinc-400">Enter your email to sign in to your account.</p>
                    </div>

                    <div className="space-y-4">
                        {/* SOCIAL LOGIN MOCKS */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11"
                                onClick={() => socialLogin("github")}
                                type="button"
                            >
                                <Github className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white h-11"
                                onClick={() => socialLogin("google")}
                                type="button"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 h-11 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 h-11 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                                    required
                                />
                                <div className="flex justify-end">
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-zinc-400 hover:text-white hover:underline underline-offset-4"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-zinc-200 h-11 font-medium text-base transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : "Sign In"}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <span className="text-zinc-400">Don't have an account? </span>
                            <Link href="/register" className="text-white hover:underline underline-offset-4 font-medium">
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    <p className="px-8 text-center text-sm text-zinc-500">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-zinc-300">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-300">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
