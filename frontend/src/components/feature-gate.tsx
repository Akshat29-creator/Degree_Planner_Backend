"use client";

import { useFeatureFlags } from "@/context/feature-flags-context";
import { motion } from "framer-motion";

interface FeatureGateProps {
  featureKey: keyof ReturnType<typeof useFeatureFlags>;
  children: React.ReactNode;
  featureName?: string;
}

export function FeatureGate({ featureKey, children, featureName }: FeatureGateProps) {
  const flags = useFeatureFlags();
  const isEnabled = flags[featureKey];

  if (isEnabled) {
    return <>{children}</>;
  }

  const displayName = featureName || featureKey.replace(/_/g, " ").replace(/\bpage\b/gi, "").trim();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050510]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md px-8"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-3 capitalize">
          {displayName} Disabled
        </h1>

        {/* Description */}
        <p className="text-zinc-400 mb-6 leading-relaxed">
          This feature is currently disabled and cannot be accessed. Only administrators can turn on features.
        </p>

        {/* Flag key indicator */}
        <p className="mt-4 text-xs text-zinc-600 font-mono">
          flag: <span className="text-zinc-500">{featureKey}</span>
        </p>
      </motion.div>
    </div>
  );
}
