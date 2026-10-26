/**
 * Cache tags for published-article reads. The backend purges exactly these tags
 * (`mgcleaning-backend/src/cache/revalidation.ts`), so keep both sides in sync.
 */
export const BLOG_LIST_TAG = "blog";

export function blogPostTag(slug: string) {
  return `blog:${slug}`;
}

/** Fallback lifetime: if a purge never arrives, cached articles refresh within an hour. */
export const BLOG_CACHE_SECONDS = 3600;
