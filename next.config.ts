import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  // Allow build to continue with lint warnings (errors will still fail)
  eslint: {
    // Only ignore warnings during builds, not errors
    // This allows deployment while you fix warnings gradually
    ignoreDuringBuilds: false, // Set to true if you want to ignore linting during builds
  },
  typescript: {
    // Ignore TypeScript errors during builds (optional, not recommended)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
