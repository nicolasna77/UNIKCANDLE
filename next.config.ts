import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oa5vracaap84kwhj.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
