import assert from "node:assert/strict";
import { test } from "node:test";
import type { AdminGalleryItem } from "../api/endpoints.ts";
import { defaultAltText, draftFromItem, galleryPatch, moveId, parseTags, publishBlockers, runPool } from "./gallery-form.ts";

const item = (overrides: Partial<AdminGalleryItem> = {}): AdminGalleryItem => ({
  id: "a", type: "image", mediaId: "m", posterMediaId: null, altText: "A spotless kitchen", caption: null, serviceSlug: null, tags: ["Home", "Kitchen"], layout: "wide",
  position: 1, status: "draft", rightsConfirmedAt: null, rightsConfirmedBy: null, publishedAt: null, createdBy: null, updatedBy: null,
  createdAt: "2026-11-03T09:00:00.000Z", updatedAt: "2026-11-03T09:00:00.000Z", mediaUrl: "https://media.example.test/a.webp", mediaContentType: "image/webp", posterUrl: null,
  ...overrides,
});

test("starting alt text comes from a meaningful file name, never a camera name", () => {
  assert.equal(defaultAltText("kitchen-deep_clean.jpg", "image"), "kitchen deep clean");
  assert.equal(defaultAltText("IMG_0042.JPG", "image"), "Gallery photo");
  assert.equal(defaultAltText("PXL_20261103.mp4", "video"), "Gallery video");
  assert.equal(defaultAltText("WhatsApp Image 2026-11-02.jpeg", "image"), "Gallery photo");
  assert.equal(defaultAltText("1234.png", "image"), "Gallery photo");
  assert.equal(defaultAltText("<b>sofa</b>.png", "image"), "bsofa/b");
});

test("tags are split on commas, trimmed, deduplicated, and capped", () => {
  assert.deepEqual(parseTags(" Home , home,Home,  Office  ,, "), ["Home", "home", "Office"]);
  assert.equal(parseTags(Array.from({ length: 10 }, (_, index) => `t${index}`).join(",")).length, 8);
  assert.deepEqual(parseTags(`ok, ${"x".repeat(41)}`), ["ok"]);
});

test("a patch carries every field, the target status, and the version it was edited from", () => {
  const draft = { ...draftFromItem(item()), caption: "  ", tags: "Home, Office", rightsConfirmed: true };
  assert.deepEqual(galleryPatch(draft, item(), "published"), {
    altText: "A spotless kitchen", caption: null, serviceSlug: null, tags: ["Home", "Office"], layout: "wide", rightsConfirmed: true, status: "published", expectedUpdatedAt: "2026-11-03T09:00:00.000Z",
  });
  assert.equal(draftFromItem(item()).tags, "Home, Kitchen");
});

test("publishing needs a real description, rights, and a cover for videos", () => {
  const ready = { ...draftFromItem(item()), rightsConfirmed: true };
  assert.deepEqual(publishBlockers(ready, item()), []);
  assert.equal(publishBlockers({ ...ready, altText: "Gallery photo" }, item()).length, 1);
  assert.equal(publishBlockers({ ...ready, rightsConfirmed: false }, item()).length, 1);
  assert.deepEqual(publishBlockers(ready, item({ type: "video" })), ["Add a cover image for the video."]);
  assert.deepEqual(publishBlockers(ready, item({ type: "video", posterMediaId: "p" })), []);
});

test("moving swaps with a neighbour and stops at either end", () => {
  assert.deepEqual(moveId(["a", "b", "c"], "b", -1), ["b", "a", "c"]);
  assert.deepEqual(moveId(["a", "b", "c"], "b", 1), ["a", "c", "b"]);
  assert.deepEqual(moveId(["a", "b", "c"], "a", -1), ["a", "b", "c"]);
  assert.deepEqual(moveId(["a", "b", "c"], "c", 1), ["a", "b", "c"]);
  assert.deepEqual(moveId(["a"], "z", 1), ["a"]);
});

test("the pool never runs more than the limit at once and finishes every item", async () => {
  let running = 0;
  let peak = 0;
  const done: number[] = [];
  await runPool([1, 2, 3, 4, 5, 6, 7], 3, async (value) => {
    running += 1;
    peak = Math.max(peak, running);
    await new Promise((resolve) => setTimeout(resolve, 5 * (value % 3)));
    done.push(value);
    running -= 1;
  });
  assert.equal(peak, 3);
  assert.deepEqual([...done].sort(), [1, 2, 3, 4, 5, 6, 7]);
});
