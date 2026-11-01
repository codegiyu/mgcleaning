import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { signRevalidation, verifyRevalidationRequest } from "./revalidate-signature.ts";

const secret = "a-test-secret-that-is-at-least-32-chars";
const nowSeconds = 1_793_000_000;

function signed(body: string, timestamp = String(nowSeconds)) {
  return { secret, timestamp, signature: signRevalidation(secret, timestamp, body), body, nowSeconds };
}

describe("revalidation signature", () => {
  test("accepts a correctly signed blog purge", () => {
    const body = JSON.stringify({ tags: ["blog", "blog:deep-clean", "blog"], mode: "remove" });
    assert.deepEqual(verifyRevalidationRequest(signed(body)), {
      ok: true,
      request: { tags: ["blog", "blog:deep-clean"], mode: "remove" },
    });
  });

  test("accepts a signed purge of the reviews list", () => {
    const body = JSON.stringify({ tags: ["reviews"], mode: "remove" });
    assert.deepEqual(verifyRevalidationRequest(signed(body)), { ok: true, request: { tags: ["reviews"], mode: "remove" } });
  });

  test("rejects a body changed after signing", () => {
    const body = JSON.stringify({ tags: ["blog"], mode: "refresh" });
    const input = signed(body);
    const result = verifyRevalidationRequest({ ...input, body: JSON.stringify({ tags: ["blog"], mode: "remove" }) });
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.status, 401);
  });

  test("rejects the wrong secret, missing headers, and malformed signatures", () => {
    const body = JSON.stringify({ tags: ["blog"], mode: "refresh" });
    const timestamp = String(nowSeconds);
    for (const signature of [signRevalidation("another-secret-that-is-also-32-chars!", timestamp, body), null, "zz", "a".repeat(63)]) {
      const result = verifyRevalidationRequest({ secret, timestamp, signature, body, nowSeconds });
      assert.equal(!result.ok && result.status, 401);
    }
    assert.equal(verifyRevalidationRequest({ ...signed(body), timestamp: null }).ok, false);
  });

  test("rejects timestamps outside the replay window", () => {
    const body = JSON.stringify({ tags: ["blog"], mode: "refresh" });
    assert.equal(verifyRevalidationRequest(signed(body, String(nowSeconds - 301))).ok, false);
    assert.equal(verifyRevalidationRequest(signed(body, String(nowSeconds + 301))).ok, false);
    assert.equal(verifyRevalidationRequest(signed(body, String(nowSeconds - 299))).ok, true);
  });

  test("only allows well-formed blog tags and the reviews tag, even when signed", () => {
    for (const payload of [
      { tags: ["products"], mode: "refresh" },
      { tags: ["reviews:amaka"], mode: "refresh" },
      { tags: ["reviewsx"], mode: "refresh" },
      { tags: ["blog:../admin"], mode: "refresh" },
      { tags: [], mode: "refresh" },
      { tags: ["blog"], mode: "purge-everything" },
      { tags: Array.from({ length: 11 }, (_, index) => `blog:post-${index}`), mode: "refresh" },
    ]) {
      const result = verifyRevalidationRequest(signed(JSON.stringify(payload)));
      assert.equal(!result.ok && result.status, 400, JSON.stringify(payload));
    }
    assert.equal(verifyRevalidationRequest(signed("not json")).ok, false);
  });
});
