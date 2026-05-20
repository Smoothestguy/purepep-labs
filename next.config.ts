import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project. Without this, Next.js
  // detects a stray lockfile in $HOME and roots there, which makes every
  // compile crawl unrelated files and takes minutes.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Email-friendly headers for images. Gmail's image proxy (and Apple Mail's
  // remote-image fetcher) prefer long cache + permissive CORS. Vercel's
  // default for /public is `max-age=0, must-revalidate` which several email
  // proxies treat as "don't cache, maybe don't display."
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
