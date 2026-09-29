import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const isDemo = process.env.NEXT_PUBLIC_CONTENT_MODE !== "production";
  return {
    rules: {
      userAgent: "*",
      allow: isDemo ? undefined : "/",
      disallow: isDemo ? "/" : ["/admin", "/book/confirmation", "/links"],
    },
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
