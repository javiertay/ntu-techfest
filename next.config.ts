import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: '/ntu-techfest',
  assetPrefix: '/ntu-techfest/',
  typescript: {
    // ⚠ WARNING: This allows production builds to succeed even if you have type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠ WARNING: This allows production builds to succeed even if you have ESLint errors
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
