/**
 * Public base URL of the R2 media domain, inlined at build time. `next.config.ts`
 * allows the same origin in `images.remotePatterns`, so only these URLs (and local
 * `/` paths) may be handed to `next/image`; any other host would throw at render.
 */
export const MEDIA_BASE_URL = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(/\/+$/, "");

export function isRenderableImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return Boolean(MEDIA_BASE_URL) && url.startsWith(`${MEDIA_BASE_URL}/`);
}
