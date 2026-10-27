import assert from "node:assert/strict";
import { test } from "node:test";
import { attributionFromLanding, FIRST_TOUCH_KEY, readFirstTouch, recordFirstTouch } from "./first-touch.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  };
}

test("captures UTM tags and the landing path without the query string", () => {
  const touch = attributionFromLanding(new URL("https://mg.example/blog/deep-clean?utm_source=instagram&utm_medium=social&utm_campaign=spring&fbclid=abc"));
  assert.deepEqual(touch, { utmSource: "instagram", utmMedium: "social", utmCampaign: "spring", landingPath: "/blog/deep-clean" });
});

test("attributes untagged link-hub visits to the Instagram bio", () => {
  assert.deepEqual(attributionFromLanding(new URL("https://mg.example/links")), {
    utmSource: "instagram",
    utmMedium: "social",
    utmCampaign: "link-in-bio",
    landingPath: "/links",
  });
  assert.equal(attributionFromLanding(new URL("https://mg.example/links?utm_source=whatsapp")).utmSource, "whatsapp");
  assert.equal(attributionFromLanding(new URL("https://mg.example/links?utm_source=whatsapp")).utmMedium, undefined);
});

test("records the first landing only", () => {
  const storage = memoryStorage();
  recordFirstTouch(storage, new URL("https://mg.example/blog/deep-clean?utm_source=instagram"));
  const later = recordFirstTouch(storage, new URL("https://mg.example/book?utm_source=google"));
  assert.equal(later.utmSource, "instagram");
  assert.equal(later.landingPath, "/blog/deep-clean");
});

test("bounds oversized values and ignores corrupt storage", () => {
  const touch = attributionFromLanding(new URL(`https://mg.example/?utm_campaign=${"x".repeat(500)}`));
  assert.equal(touch.utmCampaign?.length, 120);
  assert.equal(readFirstTouch(memoryStorage({ [FIRST_TOUCH_KEY]: "{not json" })), null);
  assert.equal(readFirstTouch(memoryStorage({ [FIRST_TOUCH_KEY]: JSON.stringify({ utmSource: "x" }) })), null);
  assert.deepEqual(readFirstTouch(memoryStorage({ [FIRST_TOUCH_KEY]: JSON.stringify({ landingPath: "/", utmSource: 7 }) })), { landingPath: "/" });
});
