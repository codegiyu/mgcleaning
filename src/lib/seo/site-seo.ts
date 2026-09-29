import type { Metadata } from "next";
import { contentMode } from "@/content/trust-content";
import { businessContactFacts, seoBusinessFacts } from "@/content/public-content";

export const DEFAULT_OG_IMAGE = "/images/og/mg-cleaning-default-v2.png";
export const DEFAULT_OG_IMAGE_ALT = "M&G Cleaning Service — professional cleaning for homes, offices, and upholstery.";

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }

  if (contentMode === "production" && (url.protocol !== "https:" || /localhost|127\.0\.0\.1|\.local$/i.test(url.hostname))) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS production domain when NEXT_PUBLIC_CONTENT_MODE=production.");
  }

  return url;
}

export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = "website",
  noIndex = false,
}: {
  title?: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const imageUrl = absoluteUrl(image);
  const pageUrl = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: noIndex || contentMode !== "production" ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      siteName: "M&G Cleaning Service",
      title,
      description,
      url: pageUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(items.at(-1)?.path ?? "/")}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: "M&G Cleaning Service",
    url: absoluteUrl("/"),
    description: "Upholstery and cleaning services shaped around your space.",
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

export function localBusinessJsonLd() {
  if (contentMode !== "production" || seoBusinessFacts.status !== "approved" || !seoBusinessFacts.serviceArea || !seoBusinessFacts.googleBusinessProfileUrl || !seoBusinessFacts.openingHours.length) return null;

  const data: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": `${absoluteUrl("/")}#organization`,
    name: "M&G Cleaning Service",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/mg-cleaning-logo.svg"),
    telephone: businessContactFacts.phone.value,
    areaServed: seoBusinessFacts.serviceArea,
    openingHoursSpecification: seoBusinessFacts.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
    })),
    sameAs: [businessContactFacts.instagram.href, seoBusinessFacts.googleBusinessProfileUrl].filter(Boolean),
  };

  if (seoBusinessFacts.address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: seoBusinessFacts.address.streetAddress,
      addressLocality: seoBusinessFacts.address.addressLocality,
      addressRegion: seoBusinessFacts.address.addressRegion,
      addressCountry: seoBusinessFacts.address.addressCountry,
    };
  }

  return data;
}

export function serviceJsonLd({
  name,
  description,
  path,
  serviceSlug,
}: {
  name: string;
  description: string;
  path: string;
  serviceSlug: string;
}) {
  if (contentMode !== "production") return null;
  const organization = localBusinessJsonLd();
  if (!organization) return null;
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name,
    serviceType: name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": `${absoluteUrl("/")}#organization` },
    areaServed: seoBusinessFacts.serviceArea,
    identifier: serviceSlug,
  };
}

export function articleJsonLd({
  slug,
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  image,
}: {
  slug: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  image: string;
}) {
  if (contentMode !== "production") return null;
  const organization = localBusinessJsonLd();
  if (!organization) return null;
  const path = `/blog/${slug}`;
  return {
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    author: { "@type": "Person", name: author },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    datePublished: publishedAt,
    dateModified: updatedAt,
    image: [absoluteUrl(image)],
    url: absoluteUrl(path),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  if (contentMode !== "production" || faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/faq")}#faq-page`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function graphJsonLd(...items: Array<Record<string, unknown> | null>) {
  if (contentMode !== "production") return null;
  const validItems = items.filter((item): item is Record<string, unknown> => item !== null);
  return validItems.length ? { "@context": "https://schema.org", "@graph": validItems } : null;
}
