import assert from "node:assert/strict";
import { test } from "node:test";
import { homeReviews, parsePublicReviews, type PublicReview } from "./review-data.ts";

const review = (overrides: Partial<PublicReview> = {}): PublicReview => ({
  id: "7d5f0a8e-2b9c-4c1d-9e8f-1a2b3c4d5e6f",
  displayName: "Amaka O.",
  context: "Homeowner, Wuse 2",
  quote: "The team arrived on time and the sofa looks brand new again.",
  rating: 5,
  serviceSlug: "upholstery-cleaning",
  receivedOn: "2026-10-20",
  featured: false,
  ...overrides,
});

const envelope = (items: unknown[]) => ({ success: true, message: "Published reviews loaded.", responseCode: 200, data: { items } });

test("well-formed reviews pass through unchanged", () => {
  const items = [review(), review({ id: "b", context: null, rating: null, serviceSlug: null, receivedOn: null, featured: true })];
  assert.deepEqual(parsePublicReviews(envelope(items)), items);
});

test("a failed or malformed response gives an empty list", () => {
  for (const body of [null, "oops", { success: false }, { success: true, data: {} }, { success: true, data: { items: "x" } }]) {
    assert.deepEqual(parsePublicReviews(body), []);
  }
});

test("malformed items are dropped, not rendered", () => {
  const bad = [
    { ...review(), quote: "" },
    { ...review(), displayName: 42 },
    { ...review(), rating: 7 },
    { ...review(), rating: 4.5 },
    { ...review(), quote: "x".repeat(601) },
    { ...review(), context: 12 },
    null,
  ];
  assert.deepEqual(parsePublicReviews(envelope([...bad, review({ id: "ok" })])).map((item) => item.id), ["ok"]);
});

test("extra fields from the API are not passed on", () => {
  const [parsed] = parsePublicReviews(envelope([{ ...review(), consentConfirmedBy: "someone", status: "draft" }]));
  assert.deepEqual(Object.keys(parsed).sort(), ["context", "displayName", "featured", "id", "quote", "rating", "receivedOn", "serviceSlug"]);
});

test("the home page shows featured reviews first, up to the limit", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"].map((id) => review({ id, featured: id === "e" || id === "g" }));
  assert.deepEqual(homeReviews(items).map((item) => item.id), ["e", "g", "a", "b", "c", "d"]);
  assert.deepEqual(homeReviews(items, 2).map((item) => item.id), ["e", "g"]);
});
