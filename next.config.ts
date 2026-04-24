import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so Next.js doesn't
  // wander up to ~/package-lock.json and pick the wrong directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
