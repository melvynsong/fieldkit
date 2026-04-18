import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/fieldkit",
  experimental: {
    serverActions: {
      allowedOrigins: ["togostory.com", "*.togostory.com"],
    },
  },
};

export default nextConfig;
