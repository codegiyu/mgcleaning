import { createHmac, timingSafeEqual } from "node:crypto";

export type RevalidationMode = "refresh" | "remove";
export type RevalidationRequest = { tags: string[]; mode: RevalidationMode };
export type VerificationResult =
  | { ok: true; request: RevalidationRequest }
  | { ok: false; status: 400 | 401; reason: string };

/**
 * Only the blog tags and the reviews list can be purged, so a leaked secret cannot flush
 * unrelated caches. Keep in sync with the backend's tags in `src/cache/revalidation.ts`.
 */
const ALLOWED_TAG = /^(?:blog(?::[a-z0-9]+(?:-[a-z0-9]+)*)?|reviews)$/;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 200;
/** Requests older (or newer) than this are rejected to limit replay. */
export const MAX_CLOCK_SKEW_SECONDS = 300;
export const MAX_REVALIDATION_BODY_BYTES = 4096;

export function signRevalidation(secret: string, timestamp: string, body: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

function signaturesMatch(expected: string, received: string) {
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = /^[0-9a-f]{64}$/i.test(received) ? Buffer.from(received, "hex") : Buffer.alloc(0);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

function parseRequest(body: string): RevalidationRequest | null {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const { tags, mode } = value as { tags?: unknown; mode?: unknown };
  if (mode !== "refresh" && mode !== "remove") return null;
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS) return null;
  if (!tags.every((tag) => typeof tag === "string" && tag.length <= MAX_TAG_LENGTH && ALLOWED_TAG.test(tag))) return null;
  return { tags: [...new Set(tags as string[])], mode };
}

/** Authenticates first, then parses: unsigned callers learn nothing about the payload format. */
export function verifyRevalidationRequest(input: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  body: string;
  nowSeconds: number;
}): VerificationResult {
  const { secret, timestamp, signature, body, nowSeconds } = input;
  if (!timestamp || !signature || !/^\d{1,12}$/.test(timestamp)) {
    return { ok: false, status: 401, reason: "Missing or malformed signature." };
  }
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_CLOCK_SKEW_SECONDS) {
    return { ok: false, status: 401, reason: "Signature timestamp is outside the allowed window." };
  }
  if (!signaturesMatch(signRevalidation(secret, timestamp, body), signature)) {
    return { ok: false, status: 401, reason: "Invalid signature." };
  }
  const request = parseRequest(body);
  if (!request) return { ok: false, status: 400, reason: "Invalid revalidation request." };
  return { ok: true, request };
}
