"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminIcon } from "@/components/admin-shell";
import { callApi } from "@/lib/api/callApi";
import type { AdminReview, ReviewCounts, ReviewStatus } from "@/lib/api/endpoints";
import { reviewProgress, reviewSourceLabel, watToday } from "@/lib/admin/review-form";

export type ReviewFilter = ReviewStatus | "all";

const filters: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "All reviews" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(value));
}

function excerpt(quote: string) {
  const flat = quote.replace(/\s+/g, " ");
  return flat.length > 90 ? `${flat.slice(0, 88)}…` : flat;
}

export function AdminReviewList({ initialStatus }: { initialStatus: ReviewFilter }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [counts, setCounts] = useState<ReviewCounts | null>(null);
  const [status, setStatus] = useState<ReviewFilter>(initialStatus);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_REVIEWS", { params: { status, query, pageSize: 50 } }).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.type === "error") setError(result.message);
      else { setReviews(result.data.items); setCounts(result.data.counts); setError(""); }
    });
    return () => { active = false; };
  }, [query, status]);

  const progress = counts ? reviewProgress(counts, Number(watToday().slice(0, 4))) : null;
  return (
    <section className="admin-content">
      <header className="admin-page-heading">
        <div><h1>Reviews</h1><p>Add the reviews customers send you. Only published reviews with their agreement appear on the website.</p></div>
        <Link className="admin-primary-link" href="/admin/reviews/new">New review <span aria-hidden="true">＋</span></Link>
      </header>
      {progress && (
        <div className="admin-review-progress">
          <div><strong>{progress.label}</strong><span>{progress.detail}</span></div>
          <div className="admin-progress-bar" role="progressbar" aria-label="Reviews published this year" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}><span style={{ width: `${progress.percent}%` }} /></div>
        </div>
      )}
      <div className="admin-blog-toolbar">
        <div className="admin-inquiry-tabs" role="tablist" aria-label="Filter reviews by status">{filters.map((filter) => <button type="button" role="tab" aria-selected={status === filter.id} className={status === filter.id ? "admin-tab admin-tab-active" : "admin-tab"} key={filter.id} onClick={() => { setLoading(true); setStatus(filter.id); }}>{filter.label}{counts && filter.id !== "all" ? ` (${counts[filter.id]})` : ""}</button>)}</div>
        <label className="admin-search admin-search-small"><span className="admin-visually-hidden">Search reviews</span><span aria-hidden="true"><AdminIcon name="search" /></span><input type="search" placeholder="Search names or words…" value={query} onChange={(event) => { setLoading(true); setQuery(event.target.value); }} /></label>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <p className="admin-inline-state">Loading reviews…</p> : reviews.length ? (
        <div className="admin-table-scroll"><table className="admin-table admin-post-table">
          <thead><tr><th scope="col">Review</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Updated</th><th><span className="admin-visually-hidden">Edit review</span></th></tr></thead>
          <tbody>{reviews.map((review) => <tr key={review.id}>
            <td><Link className="admin-post-title" href={`/admin/reviews/${review.id}`}><strong>{review.displayName}</strong><small>{excerpt(review.quote)}</small></Link></td>
            <td>{reviewSourceLabel(review.source)}</td>
            <td><span className={`admin-status admin-status-${review.status}`}>{review.status}</span>{review.featured && <small className="admin-status-note">Featured</small>}</td>
            <td>{formatDate(review.updatedAt)}</td>
            <td><Link className="admin-row-arrow" aria-label={`Edit the review from ${review.displayName}`} href={`/admin/reviews/${review.id}`}><AdminIcon name="chevron" /></Link></td>
          </tr>)}</tbody>
        </table></div>
      ) : <div className="admin-empty-state"><h2>{query || status !== "all" ? "No reviews match." : "No reviews yet."}</h2><p>Copy a review a customer sent on WhatsApp, Instagram, or elsewhere, and confirm they are happy for it to appear on the site.</p><Link className="admin-text-link" href="/admin/reviews/new">Add a review →</Link></div>}
    </section>
  );
}
