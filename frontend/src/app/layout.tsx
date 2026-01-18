import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { DemoBanner } from "@/components/data-upload";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Degree Planner Agent | AI-Powered Academic Planning",
  description:
    "An intelligent AI co-pilot that optimizes your academic journey with personalized course scheduling, risk analysis, and career alignment.",
  keywords: [
    "degree planner",
    "academic planning",
    "course scheduler",
    "AI advisor",
    "university",
    "graduation",
  ],
};

import { AuthProvider } from "@/context/auth-context";

import { Footer } from "@/components/layout/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-[#050510] text-gray-100 overflow-x-hidden`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
