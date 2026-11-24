import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos are served either from our own /api/uploads route (local
    // storage) or directly from the configured Supabase Storage bucket.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
