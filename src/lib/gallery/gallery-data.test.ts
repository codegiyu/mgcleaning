import assert from "node:assert/strict";
import { test } from "node:test";
import type { GalleryItem } from "@/components/gallery-lightbox";
import { chooseGalleryItems, parsePublicGallery, toLightboxItem, type PublicGalleryItem } from "./gallery-data.ts";

const MEDIA = "https://media.example.test";
const allowed = (url: string) => url.startsWith(`${MEDIA}/`);

const item = (overrides: Partial<PublicGalleryItem> = {}): PublicGalleryItem => ({
  id: "5a1c2b3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  type: "image",
  src: `${MEDIA}/gallery/2026/11/kitchen.webp`,
  poster: null,
  alt: "A spotless kitchen worktop after a deep clean",
  caption: "Kitchen deep clean",
  serviceSlug: "deep-cleaning",
  tags: ["Home"],
  layout: "standard",
  ...overrides,
});

const video = item({ id: "b", type: "video", src: `${MEDIA}/gallery/2026/11/lobby.mp4`, poster: `${MEDIA}/gallery/2026/11/lobby.webp`, layout: "wide" });
const envelope = (items: unknown[]) => ({ success: true, message: "Published gallery loaded.", responseCode: 200, data: { items } });

test("well-formed items pass through unchanged", () => {
  assert.deepEqual(parsePublicGallery(envelope([item(), video]), allowed), [item(), video]);
});

test("a failed or malformed response is null, so callers can tell it from an empty gallery", () => {
  for (const body of [null, "oops", { success: false }, { success: true, data: {} }, { success: true, data: { items: "x" } }]) {
    assert.equal(parsePublicGallery(body, allowed), null);
  }
  assert.deepEqual(parsePublicGallery(envelope([]), allowed), []);
});

test("items from other hosts, unknown types or layouts, and posterless videos are dropped", () => {
  const bad = [
    item({ src: "https://evil.example/kitchen.webp" }),
    item({ src: "javascript:alert(1)" }),
    { ...item(), type: "gif" },
    { ...item(), layout: "huge" },
    { ...video, poster: null },
    { ...video, poster: "https://evil.example/poster.webp" },
    { ...item(), alt: "" },
    { ...item(), caption: 42 },
    "not an item",
  ];
  assert.deepEqual(parsePublicGallery(envelope([...bad, item()]), allowed), [item()]);
});

test("bad tags are dropped without losing the item", () => {
  const [parsed] = parsePublicGallery(envelope([{ ...item(), tags: ["Home", "", 3, "x".repeat(41), "Office"] }]), allowed) ?? [];
  assert.deepEqual(parsed?.tags, ["Home", "Office"]);
});

test("videos become lightbox videos labelled by their alt text", () => {
  assert.deepEqual(toLightboxItem(video), {
    id: "b", type: "video", src: video.src, poster: video.poster, alt: video.alt, label: video.alt, layout: "wide", tags: ["Home"], caption: "Kitchen deep clean", serviceSlug: "deep-cleaning",
  });
  assert.equal("caption" in toLightboxItem(item({ caption: null })), false);
});

test("published items win; otherwise demo shows placeholders and production shows nothing", () => {
  const published = [toLightboxItem(item())];
  const placeholders: GalleryItem[] = [{ id: "demo", type: "image", src: "/images/demo.webp", alt: "Demo", layout: "standard" }];
  assert.deepEqual(chooseGalleryItems(published, "production", placeholders), published);
  assert.deepEqual(chooseGalleryItems(published, "demo", placeholders), published);
  assert.deepEqual(chooseGalleryItems([], "demo", placeholders), placeholders);
  assert.deepEqual(chooseGalleryItems(null, "demo", placeholders), placeholders);
  assert.deepEqual(chooseGalleryItems([], "production", placeholders), []);
  assert.deepEqual(chooseGalleryItems(null, "production", placeholders), []);
});
