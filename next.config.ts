import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-da2e56a9ed874d429019c8111a9bd93c.r2.dev",
      },
    ],
  },
};

export default nextConfig;
