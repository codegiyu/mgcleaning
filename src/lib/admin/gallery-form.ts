import type { AdminGalleryItem, GalleryItemPatch, GalleryItemStatus, GalleryLayout } from "../api/endpoints.ts";

/** Form state: every field is a string or flag so inputs stay controlled. */
export type GalleryDraft = {
  altText: string;
  caption: string;
  serviceSlug: string;
  /** Comma-separated, as typed. */
  tags: string;
  layout: GalleryLayout;
  rightsConfirmed: boolean;
};

export const ALT_MIN = 3;
export const ALT_MAX = 250;
export const CAPTION_MAX = 200;
export const TAG_MAX = 40;
export const TAGS_MAX = 8;
/** Uploads run a few at a time so a phone on mobile data is not saturated. */
export const UPLOAD_CONCURRENCY = 3;

export const galleryLayoutOptions: { id: GalleryLayout; label: string }[] = [
  { id: "standard", label: "Standard tile" },
  { id: "wide", label: "Wide (landscape)" },
  { id: "tall", label: "Tall (portrait)" },
  { id: "featured", label: "Featured (large)" },
];

const GENERIC_ALT = new Set(["Gallery photo", "Gallery video"]);

/**
 * A starting description from the file name, or a generic one that publishing will
 * ask the editor to replace. Camera names such as IMG_0042 describe nothing.
 */
export function defaultAltText(filename: string, kind: "image" | "video") {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  const meaningful = /[a-z]{3}/i.test(base) && !/^(?:img|dsc|dscn|pxl|vid|mvimg|screenshot|whatsapp (?:image|video))\b/i.test(base);
  return meaningful ? base.slice(0, ALT_MAX) : kind === "video" ? "Gallery video" : "Gallery photo";
}

export function draftFromItem(item: AdminGalleryItem): GalleryDraft {
  return {
    altText: item.altText,
    caption: item.caption ?? "",
    serviceSlug: item.serviceSlug ?? "",
    tags: item.tags.join(", "),
    layout: item.layout,
    rightsConfirmed: Boolean(item.rightsConfirmedAt),
  };
}

/** Commas separate tags; repeats, blanks, and anything past the limits are dropped. */
export function parseTags(value: string) {
  const tags = value.split(",").map((tag) => tag.replace(/\s+/g, " ").trim()).filter((tag) => tag && tag.length <= TAG_MAX);
  return [...new Set(tags)].slice(0, TAGS_MAX);
}

export function galleryPatch(draft: GalleryDraft, item: Pick<AdminGalleryItem, "updatedAt">, status: GalleryItemStatus): GalleryItemPatch {
  return {
    altText: draft.altText.trim(),
    caption: draft.caption.trim() || null,
    serviceSlug: draft.serviceSlug || null,
    tags: parseTags(draft.tags),
    layout: draft.layout,
    rightsConfirmed: draft.rightsConfirmed,
    status,
    expectedUpdatedAt: item.updatedAt,
  };
}

/** Reasons publishing would be refused, checked before asking the API. */
export function publishBlockers(draft: GalleryDraft, item: Pick<AdminGalleryItem, "type" | "posterMediaId">) {
  const blockers: string[] = [];
  const alt = draft.altText.trim();
  if (alt.length < ALT_MIN || GENERIC_ALT.has(alt)) blockers.push("Describe what the photo or video shows.");
  if (item.type === "video" && !item.posterMediaId) blockers.push("Add a cover image for the video.");
  if (!draft.rightsConfirmed) blockers.push("Confirm M&G owns it and anyone shown agreed.");
  return blockers;
}

/** The ids with one item moved by `delta` places; unchanged if it would leave the list. */
export function moveId(ids: string[], id: string, delta: -1 | 1) {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

/** Runs `worker` over `items`, at most `limit` at a time, in order of starting. */
export async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await worker(items[index]!);
    }
  });
  await Promise.all(lanes);
}
