import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  // Keep Turbopack cache outside ~/Documents so iCloud doesn't sync/evict it.
  // Must use os.tmpdir() — Next.js silently treats distDir as relative,
  // so os.homedir() paths end up created inside the project directory.
  distDir: process.env.NODE_ENV === "production"
    ? ".next"
    : path.join(os.tmpdir(), "predibol-next"),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.uefa.com" },
    ],
  },
};

export default nextConfig;
