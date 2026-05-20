import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  allowedDevOrigins: ["192.168.0.24", "192.168.0.0/24"],
  serverExternalPackages: ["swisseph-wasm"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }
    return config;
  },
};

export default nextConfig;
