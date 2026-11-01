import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Blog covers are served from the R2 custom domain; no other remote host is allowed.
    remotePatterns: mediaBaseUrl ? [new URL(`${mediaBaseUrl}/**`)] : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({
          apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1",
          mediaBaseUrl,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          turnstile: process.env.NEXT_PUBLIC_TURNSTILE_MODE === "on",
          isDev: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
};

export default nextConfig;
