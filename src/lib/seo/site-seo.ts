import type { Metadata } from "next";
import { contentMode } from "@/content/trust-content";
import { businessContactFacts, seoBusinessFacts } from "@/content/public-content";

export const DEFAULT_OG_IMAGE = "/images/og/mg-cleaning-services-professional-v3.jpg";
export const DEFAULT_OG_IMAGE_ALT = "M&G Cleaning Services — professional cleaning, thoughtfully done.";
export const DEPLOYED_SITE_URL_FALLBACK = "https://mgcleaning.vercel.app";
export const SITE_NAME = "M&G Cleaning Services";

/** The page title as the browser tab shows it, for share cards that do not apply the title template. */
export function fullTitle(title?: string) {
  if (!title) return `${SITE_NAME} | Professional cleaning solutions`;
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

function withHttpsProtocol(host: string | undefined) {
  const value = host?.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = withHttpsProtocol(
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL,
  );
  const developmentUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined;
  const raw = configuredUrl || vercelUrl || developmentUrl || DEPLOYED_SITE_URL_FALLBACK;
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
  const pageUrl = absoluteUrl(path);
  const shareTitle = fullTitle(title);
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    robots: noIndex || contentMode !== "production" ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: shareTitle,
      description,
      url: pageUrl,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [image],
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
    name: "M&G Cleaning Services",
    url: absoluteUrl("/"),
    description: "Personalized professional cleaning solutions shaped around your space, needs, and standards.",
    publisher: { "@id": organizationId() },
  };
}

/** Structured data wants the international form (+234…), which the `tel:` link already holds. */
const internationalPhone = () => businessContactFacts.phone.href?.replace(/^tel:/, "") || businessContactFacts.phone.value;
const organizationId = () => `${absoluteUrl("/")}#organization`;
const localBusinessApproved = () =>
  seoBusinessFacts.status === "approved" && Boolean(seoBusinessFacts.serviceArea) && Boolean(seoBusinessFacts.googleBusinessProfileUrl) && seoBusinessFacts.openingHours.length > 0;

/**
 * The business node every other node points at (`#organization`). Until MG approves the
 * service area, Google profile, and hours it is a plain Organization built only from the
 * approved contact facts, so pages never claim an address, area, or hours early.
 */
export function organizationJsonLd() {
  if (contentMode !== "production") return null;
  const local = localBusinessJsonLd();
  if (local) return local;
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/mg-cleaning-logo.svg"),
    telephone: internationalPhone(),
    email: businessContactFacts.email.value,
    sameAs: [businessContactFacts.instagram.href].filter(Boolean),
  };
}

export function localBusinessJsonLd() {
  if (contentMode !== "production" || !localBusinessApproved()) return null;

  const data: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": organizationId(),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/mg-cleaning-logo.svg"),
    telephone: internationalPhone(),
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
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name,
    serviceType: name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": organizationId() },
    ...(localBusinessApproved() ? { areaServed: seoBusinessFacts.serviceArea } : {}),
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
  const path = `/blog/${slug}`;
  return {
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
    // Articles signed by the business itself credit the organization, not a person.
    author: author === SITE_NAME ? { "@id": organizationId() } : { "@type": "Person", name: author },
    publisher: { "@id": organizationId() },
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
