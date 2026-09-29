import type { MetadataRoute } from "next";
import { services } from "@/content/demo-content";
import { contentMode } from "@/content/trust-content";
import { getPublicServiceDetails } from "@/content/public-content";
import { getPublishedBlogPosts } from "@/lib/blog/public-blog";
import { getSiteUrl } from "@/lib/seo/site-seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (contentMode !== "production") return [];
  const base = getSiteUrl();
  // This SEO/content pass updated the metadata and crawl surface for every stable page.
  // Future copy or business-fact edits should update this explicit date rather than using
  // the build time, which would make lastmod change on every deployment.
  const stablePageLastModified = new Date("2026-09-29T00:00:00.000Z");
  const stablePages = ["/", "/about", "/services", "/blog", "/gallery", "/faq", "/areas", "/book", "/contact", "/privacy", "/terms"];
  const articles = await getPublishedBlogPosts();
  const approvedServices = getPublicServiceDetails();
  const serviceDetailsBySlug = new Map(approvedServices.map((details) => [details.serviceSlug, details]));
  return [
    ...stablePages.map((path) => ({ url: new URL(path, base).toString(), lastModified: stablePageLastModified, changeFrequency: "monthly" as const })),
    ...services.filter((service) => serviceDetailsBySlug.has(service.slug)).map((service) => {
      const details = serviceDetailsBySlug.get(service.slug);
      return {
        url: new URL("/services/" + service.slug, base).toString(),
        ...(details?.lastReviewedAt ? { lastModified: new Date(details.lastReviewedAt) } : {}),
        changeFrequency: "monthly" as const,
      };
    }),
    ...articles.map((article) => ({
      url: new URL("/blog/" + article.slug, base).toString(),
      ...(article.updatedAt || article.publishedAt ? { lastModified: new Date(article.updatedAt ?? article.publishedAt!) } : {}),
      changeFrequency: "monthly" as const,
    })),
  ];
}
