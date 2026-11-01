import assert from "node:assert/strict";
import { test } from "node:test";
import { describeUserAgent } from "./user-agent.ts";

test("summarises common browsers and platforms", () => {
  assert.equal(describeUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"), "Chrome on Windows");
  assert.equal(describeUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0"), "Edge on Windows");
  assert.equal(describeUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"), "Safari on iOS");
  assert.equal(describeUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0"), "Firefox on Linux");
  assert.equal(describeUserAgent("Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36"), "Chrome on Android");
});

test("falls back without guessing", () => {
  assert.equal(describeUserAgent(null), "Unknown browser");
  assert.equal(describeUserAgent("curl/8.0"), "Browser");
});
