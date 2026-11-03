/**
 * Cache tag for the published gallery. The backend purges exactly this tag
 * (`GALLERY_TAG` in `mgcleaning-backend/src/cache/revalidation.ts`), and the
 * revalidation route allows it (`src/lib/cache/revalidate-signature.ts`).
 */
export const GALLERY_TAG = "gallery";

/** Fallback lifetime: if a purge never arrives, the cached gallery refreshes within an hour. */
export const GALLERY_CACHE_SECONDS = 3600;
