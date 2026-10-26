import { revalidateTag } from "next/cache";
import { MAX_REVALIDATION_BODY_BYTES, verifyRevalidationRequest } from "@/lib/cache/revalidate-signature";

/**
 * Signed cache purge called by the backend after a post change commits. Removals expire
 * immediately so an unpublished article is never served again; other changes are served
 * stale while the next visit refreshes them.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 32) {
    return Response.json({ revalidated: false, message: "Revalidation is not configured." }, { status: 503 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_REVALIDATION_BODY_BYTES) {
    return Response.json({ revalidated: false, message: "Request is too large." }, { status: 413 });
  }
  const body = await request.text();
  if (body.length > MAX_REVALIDATION_BODY_BYTES) {
    return Response.json({ revalidated: false, message: "Request is too large." }, { status: 413 });
  }

  const result = verifyRevalidationRequest({
    secret,
    timestamp: request.headers.get("x-revalidate-timestamp"),
    signature: request.headers.get("x-revalidate-signature"),
    body,
    nowSeconds: Math.floor(Date.now() / 1000),
  });
  if (!result.ok) {
    return Response.json({ revalidated: false, message: result.reason }, { status: result.status });
  }

  const profile = result.request.mode === "remove" ? { expire: 0 } : "max";
  for (const tag of result.request.tags) revalidateTag(tag, profile);
  return Response.json({ revalidated: true, tags: result.request.tags, mode: result.request.mode });
}
