import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // F06.1A recovery R2: allow local Next.js dev origins
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.8.0.20"],
  images: {
    qualities: [75, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shop.ysim.vn",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
