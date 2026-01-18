import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Ignore ESLint errors during build (for faster iteration)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build (for faster iteration)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
