import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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