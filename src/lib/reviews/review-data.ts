/** A published review as the public site receives it from `GET /v1/reviews`. */
export type PublicReview = {
  id: string;
  displayName: string;
  context: string | null;
  quote: string;
  rating: number | null;
  serviceSlug: string | null;
  receivedOn: string | null;
  featured: boolean;
};

/** Reviews shown on the home page; the rest are on /reviews. */
export const HOME_REVIEW_LIMIT = 6;

const MAX_REVIEWS = 50;

const isText = (value: unknown, max: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const optionalText = (value: unknown, max: number) => (value === null || value === undefined ? null : isText(value, max) ? value : undefined);

function toReview(item: unknown): PublicReview | null {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  const context = optionalText(value.context, 80);
  const serviceSlug = optionalText(value.serviceSlug, 120);
  const receivedOn = optionalText(value.receivedOn, 10);
  const rating = value.rating === null || value.rating === undefined ? null : value.rating;
  if (!isText(value.id, 64) || !isText(value.displayName, 80) || !isText(value.quote, 600)) return null;
  if (context === undefined || serviceSlug === undefined || receivedOn === undefined) return null;
  if (rating !== null && !(typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5)) return null;
  return { id: value.id, displayName: value.displayName, context, quote: value.quote, rating, serviceSlug, receivedOn, featured: value.featured === true };
}

/**
 * Read the API envelope defensively: anything malformed is dropped rather than
 * rendered, and a bad response yields an empty list (the sections then hide).
 */
export function parsePublicReviews(body: unknown): PublicReview[] {
  if (!body || typeof body !== "object") return [];
  const envelope = body as { success?: unknown; data?: { items?: unknown } };
  if (envelope.success !== true || !Array.isArray(envelope.data?.items)) return [];
  return envelope.data.items.slice(0, MAX_REVIEWS).map(toReview).filter((review): review is PublicReview => review !== null);
}

/** Featured reviews first, keeping the API's order otherwise. */
export function homeReviews(reviews: PublicReview[], limit = HOME_REVIEW_LIMIT) {
  return [...reviews.filter((review) => review.featured), ...reviews.filter((review) => !review.featured)].slice(0, limit);
}
