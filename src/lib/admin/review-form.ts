import type { AdminReview, ReviewCounts, ReviewInput, ReviewPatch, ReviewSource, ReviewStatus } from "../api/endpoints.ts";

/** Form state: every field is a string or flag so inputs stay controlled. */
export type ReviewDraft = {
  displayName: string;
  context: string;
  quote: string;
  rating: "" | "1" | "2" | "3" | "4" | "5";
  serviceSlug: string;
  source: ReviewSource;
  receivedOn: string;
  featured: boolean;
  consentConfirmed: boolean;
};

export const QUOTE_MIN = 20;
export const QUOTE_MAX = 600;

/** The yearly target agreed with M&G. */
export const REVIEW_TARGET = 10;

export const reviewSourceOptions: { id: ReviewSource; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google" },
  { id: "email", label: "Email" },
  { id: "in_person", label: "In person" },
  { id: "other", label: "Other" },
];

export function reviewSourceLabel(source: ReviewSource) {
  return reviewSourceOptions.find((option) => option.id === source)?.label ?? source;
}

export const blankReviewDraft: ReviewDraft = {
  displayName: "",
  context: "",
  quote: "",
  rating: "",
  serviceSlug: "",
  source: "whatsapp",
  receivedOn: "",
  featured: false,
  consentConfirmed: false,
};

export function draftFromReview(review: AdminReview): ReviewDraft {
  return {
    displayName: review.displayName,
    context: review.context ?? "",
    quote: review.quote,
    rating: review.rating ? (String(review.rating) as ReviewDraft["rating"]) : "",
    serviceSlug: review.serviceSlug ?? "",
    source: review.source,
    receivedOn: review.receivedOn ?? "",
    featured: review.featured,
    consentConfirmed: Boolean(review.consentConfirmedAt),
  };
}

/** The API body for a draft; blanks become null so clearing a field really clears it. */
export function reviewPayload(draft: ReviewDraft, status: ReviewStatus): ReviewInput {
  return {
    displayName: draft.displayName.trim(),
    context: draft.context.trim() || null,
    quote: draft.quote.trim(),
    rating: draft.rating ? Number(draft.rating) : null,
    serviceSlug: draft.serviceSlug || null,
    source: draft.source,
    receivedOn: draft.receivedOn || null,
    featured: draft.featured,
    status,
    consentConfirmed: draft.consentConfirmed,
  };
}

/** A patch carries the version it was edited from; the API refuses it if someone saved since. */
export function reviewPatch(draft: ReviewDraft, review: Pick<AdminReview, "updatedAt">, status: ReviewStatus): ReviewPatch {
  return { ...reviewPayload(draft, status), expectedUpdatedAt: review.updatedAt };
}

/** What stops a draft from going live, checked before calling the API. */
export function publishBlockers(draft: ReviewDraft) {
  const blockers: string[] = [];
  if (draft.displayName.trim().length < 2) blockers.push("Add the customer's name as it should appear.");
  if (draft.quote.trim().length < QUOTE_MIN) blockers.push(`The review needs at least ${QUOTE_MIN} characters.`);
  if (!draft.consentConfirmed) blockers.push("Confirm the customer agreed to this review and name appearing on the site.");
  return blockers;
}

/** Progress towards the yearly target, for the reviews list. */
export function reviewProgress(counts: ReviewCounts, year: number, target = REVIEW_TARGET) {
  const published = counts.publishedThisYear;
  const remaining = Math.max(0, target - published);
  return {
    label: `${published} of ${target} published in ${year}`,
    remaining,
    detail: remaining ? `${remaining} more to reach the target.` : "Target reached.",
    percent: Math.min(100, Math.round((published / target) * 100)),
  };
}

/** Today's date (YYYY-MM-DD) in West Africa Time, the latest allowed "received on" date. */
export function watToday(now = new Date()) {
  return new Date(now.getTime() + 60 * 60_000).toISOString().slice(0, 10);
}

/** Star text for a rating, with a spoken alternative. */
export function ratingText(rating: number) {
  const value = Math.max(1, Math.min(5, Math.round(rating)));
  return { stars: "★".repeat(value) + "☆".repeat(5 - value), label: `Rated ${value} out of 5` };
}
