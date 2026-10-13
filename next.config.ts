import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  // Keep Turbopack cache outside ~/Documents so iCloud doesn't evict it on every request
  distDir: process.env.NODE_ENV === "production"
    ? ".next"
    : path.join(os.homedir(), ".cache", "predibol-next"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.uefa.com" },
    ],
  },
};

export default nextConfig;
