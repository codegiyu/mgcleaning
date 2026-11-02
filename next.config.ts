import type { NextConfig } from "next";
import { API_BASE_URL } from "./src/lib/env/api-base-url";
import { securityHeaders } from "./src/lib/security/headers";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

/**
 * Development only: `next dev` forwards /api/v1/* to this API, so a local website can use a
 * deployed API. The API's session cookie then arrives from localhost and stays first-party,
 * which a direct cross-site call cannot do (SameSite=Lax). Point NEXT_PUBLIC_API_BASE_URL at
 * http://localhost:3000/api/v1 to use it. Production builds ignore it.
 */
function apiProxyTarget() {
  const target = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "development" || !target) return undefined;
  const url = new URL(target);
  if (url.pathname !== "/") throw new Error(`API_PROXY_TARGET must be an origin such as https://api.example.com, not "${target}".`);
  return url.origin;
}
const proxyTarget = apiProxyTarget();

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
  async rewrites() {
    return proxyTarget ? [{ source: "/api/v1/:path*", destination: `${proxyTarget}/api/v1/:path*` }] : [];
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
