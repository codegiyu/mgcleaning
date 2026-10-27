/**
 * Cache tag for the published reviews list. The backend purges exactly this tag
 * (`REVIEWS_TAG` in `mgcleaning-backend/src/cache/revalidation.ts`), and the
 * revalidation route allows it (`src/lib/cache/revalidate-signature.ts`).
 */
export const REVIEWS_TAG = "reviews";

/** Fallback lifetime: if a purge never arrives, cached reviews refresh within an hour. */
export const REVIEWS_CACHE_SECONDS = 3600;
