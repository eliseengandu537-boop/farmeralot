import type { NextConfig } from "next";

const storeUrl = new URL(
  process.env.NEXT_PUBLIC_STORE_URL ?? "https://farmeralot.co.za",
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: storeUrl.hostname },
    ],
  },
};

export default nextConfig;
