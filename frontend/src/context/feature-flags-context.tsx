"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface FeatureFlags {
  auth: boolean;
  courses: boolean;
  planner: boolean;
  ai_advisor: boolean;
  revision: boolean;
  history: boolean;
  manual_entry: boolean;
  practice: boolean;
  page_dashboard: boolean;
  page_planner: boolean;
  page_advisor: boolean;
  page_buddy: boolean;
  page_revision: boolean;
  page_study_copilot: boolean;
  page_interview: boolean;
  page_history: boolean;
  page_graph: boolean;
  page_study: boolean;
  page_performance: boolean;
  performance: boolean;
  assessment: boolean;
  debug_mode: boolean;
  mock_ai_responses: boolean;
  transcript_import: boolean;
  gpa_simulator: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  auth: true,
  courses: true,
  planner: true,
  ai_advisor: true,
  revision: true,
  history: true,
  manual_entry: true,
  practice: true,
  page_dashboard: true,
  page_planner: true,
  page_advisor: true,
  page_buddy: true,
  page_revision: true,
  page_study_copilot: true,
  page_interview: true,
  page_history: true,
  page_graph: true,
  page_study: true,
  page_performance: true,
  performance: true,
  assessment: true,
  debug_mode: false,
  mock_ai_responses: false,
  transcript_import: true,
  gpa_simulator: true,
};

const FeatureFlagsContext = createContext<FeatureFlags>(DEFAULT_FLAGS);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/backend";
        const res = await fetch(`${apiUrl}/api/flags`);
        if (res.ok) {
          const data = await res.json();
          setFlags({ ...DEFAULT_FLAGS, ...data });
        }
      } catch {
        // If backend is unreachable, keep defaults (all enabled)
        console.warn("[FeatureFlags] Could not reach backend, using defaults.");
      }
    };

    fetchFlags();

    // Refresh every 10 seconds so toggling in dev panel is reflected quickly
    const interval = setInterval(fetchFlags, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}

export function useFlag(key: keyof FeatureFlags): boolean {
  const flags = useContext(FeatureFlagsContext);
  return flags[key];
}
