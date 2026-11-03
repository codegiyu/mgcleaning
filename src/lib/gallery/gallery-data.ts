import type { GalleryItem } from "@/components/gallery-lightbox";

/** A published item as the public site receives it from `GET /v1/gallery`. */
export type PublicGalleryItem = {
  id: string;
  type: "image" | "video";
  src: string;
  poster: string | null;
  alt: string;
  caption: string | null;
  serviceSlug: string | null;
  tags: string[];
  layout: "featured" | "tall" | "standard" | "wide";
};

const MAX_ITEMS = 300;
const LAYOUTS = new Set(["featured", "tall", "standard", "wide"]);

const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const optionalText = (value: unknown, max: number) => (value === null || value === undefined ? null : isText(value, max) ? value : undefined);

function toItem(item: unknown, isAllowedUrl: (url: string) => boolean): PublicGalleryItem | null {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  if (!isText(value.id, 64) || !isText(value.alt, 250) || !isText(value.src, 2048) || !isAllowedUrl(value.src)) return null;
  if (value.type !== "image" && value.type !== "video") return null;
  if (typeof value.layout !== "string" || !LAYOUTS.has(value.layout)) return null;
  const caption = optionalText(value.caption, 200);
  const serviceSlug = optionalText(value.serviceSlug, 120);
  const poster = optionalText(value.poster, 2048);
  if (caption === undefined || serviceSlug === undefined || poster === undefined) return null;
  if (poster !== null && !isAllowedUrl(poster)) return null;
  // A video without a poster would show as a blank tile; the API never publishes one.
  if (value.type === "video" && poster === null) return null;
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => isText(tag, 40)).slice(0, 8) : [];
  return { id: value.id, type: value.type, src: value.src, poster, alt: value.alt, caption, serviceSlug, tags, layout: value.layout as PublicGalleryItem["layout"] };
}

/**
 * Read the API envelope defensively: anything malformed, or pointing at a host other
 * than the media domain, is dropped rather than rendered. A bad response yields null,
 * which callers treat as "the API could not be read" (not "nothing is published").
 */
export function parsePublicGallery(body: unknown, isAllowedUrl: (url: string) => boolean): PublicGalleryItem[] | null {
  if (!body || typeof body !== "object") return null;
  const envelope = body as { success?: unknown; data?: { items?: unknown } };
  if (envelope.success !== true || !Array.isArray(envelope.data?.items)) return null;
  return envelope.data.items
    .slice(0, MAX_ITEMS)
    .map((item) => toItem(item, isAllowedUrl))
    .filter((item): item is PublicGalleryItem => item !== null);
}

export function toLightboxItem(item: PublicGalleryItem): GalleryItem {
  const shared = { id: item.id, src: item.src, alt: item.alt, layout: item.layout, tags: item.tags, ...(item.caption ? { caption: item.caption } : {}), ...(item.serviceSlug ? { serviceSlug: item.serviceSlug } : {}) };
  return item.type === "video" ? { ...shared, type: "video", poster: item.poster ?? undefined, label: item.alt } : { ...shared, type: "image" };
}

/**
 * What the gallery page shows. Published items always win. Until something is published,
 * or while the API cannot be read, demo builds show the labelled placeholder images and
 * production builds show nothing (the page's "being prepared" state).
 */
export function chooseGalleryItems(published: GalleryItem[] | null, mode: "demo" | "production", placeholders: GalleryItem[]): GalleryItem[] {
  if (published && published.length > 0) return published;
  return mode === "demo" ? placeholders : [];
}
