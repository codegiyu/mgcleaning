import assert from "node:assert/strict";
import { test } from "node:test";
import type { AdminReview } from "../api/endpoints.ts";
import { blankReviewDraft, draftFromReview, publishBlockers, ratingText, reviewPatch, reviewPayload, reviewProgress, watToday } from "./review-form.ts";

const review: AdminReview = {
  id: "7d5f0a8e-2b9c-4c1d-9e8f-1a2b3c4d5e6f",
  displayName: "Amaka O.",
  context: null,
  quote: "The team was on time and the sofa looks brand new again.",
  rating: 4,
  serviceSlug: null,
  source: "instagram",
  receivedOn: null,
  featured: true,
  status: "published",
  consentConfirmedAt: "2026-10-27T09:00:00.000Z",
  consentConfirmedBy: null,
  publishedAt: "2026-10-27T09:00:00.000Z",
  createdBy: null,
  updatedBy: null,
  createdAt: "2026-10-27T09:00:00.000Z",
  updatedAt: "2026-10-27T09:05:00.123Z",
};

test("a stored review round-trips through the form", () => {
  const draft = draftFromReview(review);
  assert.deepEqual(draft, { displayName: "Amaka O.", context: "", quote: review.quote, rating: "4", serviceSlug: "", source: "instagram", receivedOn: "", featured: true, consentConfirmed: true });
  assert.deepEqual(reviewPayload(draft, "published"), {
    displayName: "Amaka O.", context: null, quote: review.quote, rating: 4, serviceSlug: null, source: "instagram", receivedOn: null, featured: true, status: "published", consentConfirmed: true,
  });
});

test("blank fields are sent as null and text is trimmed", () => {
  const payload = reviewPayload({ ...blankReviewDraft, displayName: "  Tunde A. ", quote: "  Spotless office after the deep clean, thank you!  ", context: "   " }, "draft");
  assert.equal(payload.displayName, "Tunde A.");
  assert.equal(payload.quote, "Spotless office after the deep clean, thank you!");
  assert.equal(payload.context, null);
  assert.equal(payload.rating, null);
});

test("a patch names the version it was edited from", () => {
  assert.equal(reviewPatch(draftFromReview(review), review, "draft").expectedUpdatedAt, "2026-10-27T09:05:00.123Z");
});

test("publishing is blocked until name, quote, and consent are in place", () => {
  assert.equal(publishBlockers(blankReviewDraft).length, 3);
  assert.deepEqual(publishBlockers(draftFromReview(review)), []);
  assert.match(publishBlockers({ ...draftFromReview(review), consentConfirmed: false })[0], /agreed/);
});

test("progress counts towards the yearly target and stops at it", () => {
  assert.deepEqual(reviewProgress({ published: 4, publishedThisYear: 3, draft: 2 }, 2026), { label: "3 of 10 published in 2026", remaining: 7, detail: "7 more to reach the target.", percent: 30 });
  assert.deepEqual(reviewProgress({ published: 14, publishedThisYear: 12, draft: 0 }, 2026), { label: "12 of 10 published in 2026", remaining: 0, detail: "Target reached.", percent: 100 });
});

test("today in WAT rolls over an hour before UTC midnight", () => {
  assert.equal(watToday(new Date("2026-10-27T22:59:00.000Z")), "2026-10-27");
  assert.equal(watToday(new Date("2026-10-27T23:00:00.000Z")), "2026-10-28");
});

test("ratings render as five stars with a spoken label", () => {
  assert.deepEqual(ratingText(4), { stars: "★★★★☆", label: "Rated 4 out of 5" });
});
