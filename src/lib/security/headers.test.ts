import assert from "node:assert/strict";
import { test } from "node:test";
import { contentSecurityPolicy, securityHeaders, type SecurityHeaderOptions } from "./headers.ts";

const production: SecurityHeaderOptions = {
  apiBaseUrl: "https://api.mgcleaning.example/api/v1",
  mediaBaseUrl: "https://media.mgcleaning.example",
  siteUrl: "https://mgcleaning.example",
  turnstile: false,
  isDev: false,
};

const directive = (policy: string, name: string) => policy.split("; ").find((part) => part.startsWith(`${name} `));

test("production locks the page to the site, the API, R2 uploads, and the media host", () => {
  const policy = contentSecurityPolicy(production);
  assert.equal(directive(policy, "connect-src"), "connect-src 'self' https://api.mgcleaning.example https://*.r2.cloudflarestorage.com");
  assert.equal(directive(policy, "img-src"), "img-src 'self' data: blob: https://media.mgcleaning.example");
  assert.equal(directive(policy, "media-src"), "media-src 'self' blob: https://media.mgcleaning.example");
  assert.equal(directive(policy, "frame-ancestors"), "frame-ancestors 'none'");
  assert.equal(directive(policy, "object-src"), "object-src 'none'");
  assert.equal(directive(policy, "frame-src"), "frame-src 'none'");
  assert.ok(!policy.includes("unsafe-eval"));
  assert.ok(policy.endsWith("upgrade-insecure-requests"));
});

test("production sends HSTS and the other hardening headers", () => {
  const keys = securityHeaders(production).map((header) => header.key);
  for (const key of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]) {
    assert.ok(keys.includes(key), key);
  }
});

test("a local http site gets no HSTS and no request upgrading", () => {
  const local = { ...production, siteUrl: "http://localhost:3000", apiBaseUrl: "http://localhost:4000/api/v1", mediaBaseUrl: undefined };
  assert.ok(!securityHeaders(local).some((header) => header.key === "Strict-Transport-Security"));
  assert.ok(!contentSecurityPolicy(local).includes("upgrade-insecure-requests"));
  assert.equal(directive(contentSecurityPolicy(local), "connect-src"), "connect-src 'self' http://localhost:4000 https://*.r2.cloudflarestorage.com");
});

test("Turnstile and dev tooling are allowed only when switched on", () => {
  const withTurnstile = contentSecurityPolicy({ ...production, turnstile: true });
  assert.ok(directive(withTurnstile, "script-src")?.includes("https://challenges.cloudflare.com"));
  assert.equal(directive(withTurnstile, "frame-src"), "frame-src https://challenges.cloudflare.com");
  const dev = contentSecurityPolicy({ ...production, isDev: true });
  assert.ok(directive(dev, "script-src")?.includes("'unsafe-eval'"));
  assert.ok(directive(dev, "connect-src")?.includes("ws:"));
});

test("a malformed URL is left out rather than breaking the policy", () => {
  assert.equal(directive(contentSecurityPolicy({ ...production, apiBaseUrl: "not a url", mediaBaseUrl: "::" }), "connect-src"), "connect-src 'self' https://*.r2.cloudflarestorage.com");
});
