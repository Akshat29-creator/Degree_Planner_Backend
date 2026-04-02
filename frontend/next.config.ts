import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },

  // Increase proxy timeout so long Ollama calls (plan analysis, quiz gen) don't ECONNRESET.
  // Default is ~30s which is too short for 14B model inference.
  experimental: {
    proxyTimeout: 300_000, // 5 minutes in ms
  },

  // Proxy all /api/backend/* calls to the internal backend.
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL || "http://backend:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
