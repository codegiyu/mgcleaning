import { REVIEWS_CACHE_SECONDS, REVIEWS_TAG } from "@/lib/cache/review-tags";
import { parsePublicReviews, type PublicReview } from "@/lib/reviews/review-data";
import { API_BASE_URL } from "@/lib/env/api-base-url";

/**
 * Published reviews, cached for up to an hour and purged by tag when the team
 * publishes, edits, unpublishes, or deletes one. Never throws: if the API is down
 * the page renders without reviews (and keeps the last good list while cached).
 * There is no demo fallback, so sample reviews can never appear.
 */
export async function getPublishedReviews(): Promise<PublicReview[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, { next: { revalidate: REVIEWS_CACHE_SECONDS, tags: [REVIEWS_TAG] } });
    if (!response.ok) throw new Error(`Reviews request returned ${response.status}.`);
    return parsePublicReviews(await response.json());
  } catch (error) {
    console.error("Published reviews are unavailable; rendering without them.", error instanceof Error ? error.message : error);
    return [];
  }
}
