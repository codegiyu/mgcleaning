import assert from "node:assert/strict";
import { test } from "node:test";
import { submitFailure } from "./submit-error.ts";

test("rejected details ask the customer to check the form", () => {
  for (const code of [400, 413, 422]) assert.equal(submitFailure(code), "invalid");
});

test("too many requests asks the customer to wait", () => {
  assert.equal(submitFailure(429), "rate-limited");
});

test("anything else is treated as the service being unavailable", () => {
  for (const code of [0, undefined, 500, 502, 503]) assert.equal(submitFailure(code), "unavailable");
});
