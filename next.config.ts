import type { NextConfig } from "next";

const nextConfig = {
  output: "export",  // <=== enables static exports
  reactStrictMode: true,
  images: {
    unoptimized: true, // <=== disables Next.js image optimization
  }
};

module.exports = nextConfig;