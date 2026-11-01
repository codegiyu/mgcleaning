import assert from "node:assert/strict";
import { test } from "node:test";
import { assertWebEnv, webEnvProblems } from "./validate.ts";

const production = {
  NODE_ENV: "production",
  NEXT_PUBLIC_API_BASE_URL: "https://api.mgcleaning.ng/api/v1",
  NEXT_PUBLIC_SITE_URL: "https://mgcleaning.ng",
  NEXT_PUBLIC_CONTENT_MODE: "production",
  REVALIDATE_SECRET: "a-shared-revalidation-secret-of-40-chars",
};

const keysOf = (problems: string[]) => problems.map((problem) => problem.split(":")[0]);

test("a complete production configuration passes", () => {
  assert.deepEqual(webEnvProblems(production), []);
});

test("development needs nothing", () => {
  assert.deepEqual(webEnvProblems({}), []);
});

test("production refuses missing or insecure settings", () => {
  assert.deepEqual(keysOf(webEnvProblems({ ...production, NEXT_PUBLIC_API_BASE_URL: undefined })), ["NEXT_PUBLIC_API_BASE_URL"]);
  assert.deepEqual(keysOf(webEnvProblems({ ...production, NEXT_PUBLIC_SITE_URL: "http://mgcleaning.ng" })), ["NEXT_PUBLIC_SITE_URL"]);
  assert.deepEqual(keysOf(webEnvProblems({ ...production, REVALIDATE_SECRET: "too-short" })), ["REVALIDATE_SECRET"]);
  assert.deepEqual(keysOf(webEnvProblems({ ...production, NEXT_PUBLIC_CONTENT_MODE: "staging" })), ["NEXT_PUBLIC_CONTENT_MODE"]);
  assert.deepEqual(keysOf(webEnvProblems({ ...production, NEXT_PUBLIC_TURNSTILE_MODE: "on" })), ["NEXT_PUBLIC_TURNSTILE_SITE_KEY"]);
});

test("a local production-mode run may use http://localhost", () => {
  assert.deepEqual(webEnvProblems({ ...production, NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000/api/v1", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }), []);
});

test("the startup check lists every problem at once", () => {
  assert.throws(() => assertWebEnv({ NODE_ENV: "production" }), /NEXT_PUBLIC_API_BASE_URL[\s\S]*NEXT_PUBLIC_SITE_URL[\s\S]*REVALIDATE_SECRET/);
});
