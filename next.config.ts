import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin Turbopack to this project so the multi-lockfile heuristic doesn't
  // wander up to ~/package-lock.json when running outside Vercel.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
