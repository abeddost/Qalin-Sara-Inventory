import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Next.js uses this workspace as the root (avoid parent lockfile picking)
  turbopack: {
    root: __dirname,
  },
  // Silence workspace-root warning for output tracing
  outputFileTracingRoot: __dirname,
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Environment variables validation (optional)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // ESLint configuration - allow warnings but fail on errors
  eslint: {
    // Warnings won't fail the build, only errors will
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't ignore TypeScript errors
    ignoreBuildErrors: false,
  },
  // Output configuration for Vercel
  output: undefined, // Let Vercel handle this automatically
};

export default nextConfig;
