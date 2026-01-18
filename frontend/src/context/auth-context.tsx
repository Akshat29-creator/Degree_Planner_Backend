"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

// ============================================
// TYPES
// ============================================
interface User {
    id: number;
    email: string;
}

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    socialLogin: (provider: "google" | "github") => Promise<void>;
    logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================
// CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Token invalid, clear it
                localStorage.removeItem("auth_token");
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem("auth_token");
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Login failed");
        }

        const data = await response.json();
        localStorage.setItem("auth_token", data.access_token);

        // Fetch user info
        await checkAuth();
        router.push("/dashboard");
    };

    const register = async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Registration failed");
        }

        // Auto-login after registration
        await login(email, password);
    };

    const socialLogin = async (provider: "google" | "github") => {
        let authProvider;
        if (provider === "google") {
            authProvider = new GoogleAuthProvider();
        } else {
            authProvider = new GithubAuthProvider();
            authProvider.addScope('user:email');
        }

        try {
            const result = await signInWithPopup(auth, authProvider);
            let userEmail = result.user.email;
            const userName = result.user.displayName;
            const uid = result.user.uid;

            // FALLBACK: If GitHub email is null, fetch it using the access token
            if (!userEmail && provider === "github") {
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;

                if (token) {
                    try {
                        const emailRes = await fetch('https://api.github.com/user/emails', {
                            headers: { Authorization: `token ${token}` }
                        });
                        const emails = await emailRes.json();
                        // Find primary verified email
                        const primary = emails.find((e: any) => e.primary && e.verified);
                        if (primary) userEmail = primary.email;
                    } catch (err) {
                        console.error("Failed to fetch GitHub emails manually", err);
                    }
                }
            }

            if (!userEmail) {
                throw new Error("No email found from provider. Please ensure your email is public or try Google.");
            }

            // Backend Exchange
            const response = await fetch(`${API_URL}/api/auth/social-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userEmail,
                    name: userName,
                    provider: provider,
                    provider_id: uid
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server error details:", errorData);
                throw new Error(errorData.detail || "Social login failed on server");
            }

            const data = await response.json();
            localStorage.setItem("auth_token", data.access_token);

            await checkAuth();
            router.push("/dashboard");

        } catch (error: any) {
            // Ignore cancelled popup errors (user closed it or double-clicked)
            if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") {
                console.log("Popup was cancelled or closed by user.");
                return;
            }

            // Handle account already exists with different provider
            if (error.code === "auth/account-exists-with-different-credential") {
                throw new Error("This email is already registered with a different sign-in method. Try using Google instead.");
            }

            console.error("Social login error:", error);
            throw new Error(error.message || "Social login failed");
        }
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        // Clear all app data on logout
        useAppStore.getState().resetAllData();
        setUser(null);
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, socialLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
