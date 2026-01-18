"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/");
        }
    }, [user, isLoading, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050510]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If no user after loading, return null (redirect will happen)
    if (!user) {
        return null;
    }

    // User is authenticated, render children
    return <>{children}</>;
}
