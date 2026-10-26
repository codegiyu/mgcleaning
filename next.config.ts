import type { NextConfig } from "next";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Blog covers are served from the R2 custom domain; no other remote host is allowed.
    remotePatterns: mediaBaseUrl ? [new URL(`${mediaBaseUrl}/**`)] : [],
  },
};

export default nextConfig;
