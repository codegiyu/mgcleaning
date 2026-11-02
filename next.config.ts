import type { NextConfig } from "next";
import { API_BASE_URL } from "./src/lib/env/api-base-url";
import { securityHeaders } from "./src/lib/security/headers";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // The Docker build sets SKIP_TYPECHECK: CI has already run `tsc --noEmit` on the same
  // commit, and repeating it on the deploy server adds well over a minute. Local builds and CI still check.
  typescript: { ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1" },
  images: {
    // Blog covers are served from the R2 custom domain; no other remote host is allowed.
    remotePatterns: mediaBaseUrl ? [new URL(`${mediaBaseUrl}/**`)] : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({
          apiBaseUrl: API_BASE_URL,
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
