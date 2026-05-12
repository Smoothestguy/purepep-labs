import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project. Without this, Next.js
  // detects a stray lockfile in $HOME and roots there, which makes every
  // compile crawl unrelated files and takes minutes.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
