import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the Turbopack workspace root to this project so Next.js doesn't
  // wander up to ~/package-lock.json and pick the wrong directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Next.js 16 blocks cross-origin requests to dev-only assets (fonts,
  // HMR, etc.) by default. Allowlist LAN hosts here so the Mac dev
  // server can also serve a phone / second laptop on the same Wi-Fi
  // network during manual UX testing (B-4 mobile-width walkthrough).
  // This is dev-only — production builds ignore it.
  // Add IPs as new test devices come online.
  // Reference: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md
  allowedDevOrigins: ["192.168.10.121"],
};

export default nextConfig;
