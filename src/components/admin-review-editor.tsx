"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ReviewCard } from "@/components/review-card";
import { services } from "@/content/demo-content";
import { callApi } from "@/lib/api/callApi";
import type { AdminReview, ReviewStatus } from "@/lib/api/endpoints";
import { formatWat } from "@/lib/admin/wat-time";
import {
  blankReviewDraft,
  draftFromReview,
  publishBlockers,
  QUOTE_MAX,
  QUOTE_MIN,
  reviewPatch,
  reviewPayload,
  reviewSourceOptions,
  watToday,
  type ReviewDraft,
} from "@/lib/admin/review-form";

const CONFLICT = 409;

export function AdminReviewEditor({ id }: { id?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<ReviewDraft>(blankReviewDraft);
  const [review, setReview] = useState<AdminReview | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [today] = useState(() => watToday());

  function showLoaded(loaded: AdminReview) {
    setReview(loaded);
    setDraft(draftFromReview(loaded));
    setConflict(false);
    setError("");
  }

  useEffect(() => {
    if (!id) return;
    let active = true;
    void callApi("GET_ADMIN_REVIEW", { pathParams: { id } }).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.type === "error") setError(result.message);
      else showLoaded(result.data);
    });
    return () => { active = false; };
  }, [id]);

  /** After a 409, replace the form with the version someone else saved. */
  async function reloadLatest(reviewId: string) {
    const result = await callApi("GET_ADMIN_REVIEW", { pathParams: { id: reviewId } });
    if (result.type === "error") setError(result.message);
    else { showLoaded(result.data); setNotice("Loaded the latest version."); }
  }

  function update<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(targetStatus: ReviewStatus) {
    if (formRef.current && !formRef.current.reportValidity()) return;
    if (targetStatus === "published") {
      const blockers = publishBlockers(draft);
      if (blockers.length) { setError(blockers.join(" ")); setNotice(""); return; }
    }
    setSaving(true);
    setError("");
    setNotice("");
    const result = review
      ? await callApi("PATCH_ADMIN_REVIEW", { pathParams: { id: review.id }, payload: reviewPatch(draft, review, targetStatus) })
      : await callApi("POST_ADMIN_REVIEW", { payload: reviewPayload(draft, targetStatus) });
    setSaving(false);
    if (result.type === "error") {
      setConflict(result.error.responseCode === CONFLICT);
      setError(result.message);
      return;
    }
    const wasPublished = review?.status === "published";
    setReview(result.data);
    setDraft(draftFromReview(result.data));
    setNotice(
      targetStatus === "published" ? (wasPublished ? "Review updated on the website." : "Review published.")
        : wasPublished ? "Review unpublished. It no longer appears on the website."
          : "Draft saved.",
    );
    if (!id) router.replace(`/admin/reviews/${result.data.id}`);
  }

  async function remove() {
    if (!review) return;
    setSaving(true);
    setError("");
    const result = await callApi("DELETE_ADMIN_REVIEW", { pathParams: { id: review.id }, params: { expectedUpdatedAt: review.updatedAt } });
    setSaving(false);
    if (result.type === "error") {
      setConfirmingDelete(false);
      setConflict(result.error.responseCode === CONFLICT);
      setError(result.message);
      return;
    }
    router.push("/admin/reviews");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(review?.status ?? "draft");
  }

  if (loading) return <section className="admin-content"><p className="admin-inline-state">Loading review…</p></section>;
  if (id && !review && error) return <section className="admin-content"><p className="admin-error" role="alert">{error}</p><Link className="admin-text-link" href="/admin/reviews">Back to reviews →</Link></section>;

  const published = review?.status === "published";
  const saveLabel = saving ? "Saving…" : published ? "Save changes" : "Save draft";
  return (
    <form ref={formRef} className="admin-editor-page" onSubmit={submit}>
      <header className="admin-editor-header">
        <div><h1>Reviews</h1><p><Link href="/admin/reviews">All reviews</Link><span aria-hidden="true"> / </span>{review ? "Edit review" : "New review"}</p></div>
        <div className="admin-editor-actions">
          <button className="admin-secondary-button" type="submit" disabled={saving}>{saveLabel}</button>
          {published && <button className="admin-secondary-button" type="button" disabled={saving} onClick={() => void save("draft")}>Unpublish</button>}
          <button className="admin-primary-button" type="button" disabled={saving} onClick={() => void save("published")}>{published ? "Update review" : "Publish"}</button>
        </div>
      </header>
      <div className="admin-editor-grid">
        <section className="admin-editor-main">
          <label className="admin-field"><span>Customer&apos;s full name</span><input required minLength={2} maxLength={80} autoComplete="off" value={draft.displayName} onChange={(event) => update("displayName", event.target.value)} placeholder="e.g. Amaka Okafor" /><small className="admin-field-help">Shown in full on the website, so the customer must be happy with that. No links or symbols such as &lt; or &gt;.</small></label>
          <label className="admin-field"><span>Line under the name <em>(optional)</em></span><input maxLength={80} value={draft.context} onChange={(event) => update("context", event.target.value)} placeholder="e.g. Homeowner, Wuse 2" /></label>
          <label className="admin-field"><span>Review</span><textarea required minLength={QUOTE_MIN} maxLength={QUOTE_MAX} rows={7} value={draft.quote} onChange={(event) => update("quote", event.target.value)} placeholder="Paste the customer's words. Leave a blank line between paragraphs." /><small className="admin-character-count">{draft.quote.length}/{QUOTE_MAX}</small></label>
          <div className="admin-form-row">
            <label className="admin-field"><span>Star rating <em>(shown as stars)</em></span><select value={draft.rating} onChange={(event) => update("rating", event.target.value as ReviewDraft["rating"])}><option value="">No rating</option>{["5", "4", "3", "2", "1"].map((value) => <option key={value} value={value}>{value} out of 5</option>)}</select></label>
            <label className="admin-field"><span>Service <em>(optional)</em></span><select value={draft.serviceSlug} onChange={(event) => update("serviceSlug", event.target.value)}><option value="">Not specified</option>{services.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select></label>
          </div>
          <div className="admin-form-row">
            <label className="admin-field"><span>Where it came from</span><select value={draft.source} onChange={(event) => update("source", event.target.value as ReviewDraft["source"])}>{reviewSourceOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
            <label className="admin-field"><span>Date received <em>(optional)</em></span><input type="date" max={today} value={draft.receivedOn} onChange={(event) => update("receivedOn", event.target.value)} /></label>
          </div>
          <label className="admin-checkbox"><input type="checkbox" checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} /><span><strong>Feature this review</strong><small>Featured reviews are shown first on the home page.</small></span></label>
          <label className="admin-checkbox admin-consent"><input type="checkbox" checked={draft.consentConfirmed} disabled={published} onChange={(event) => update("consentConfirmed", event.target.checked)} /><span><strong>The customer agreed to this review and their full name appearing on the website.</strong><small>{published ? "To withdraw consent, unpublish the review first." : review?.consentConfirmedAt ? `Confirmed ${formatWat(review.consentConfirmedAt)}.` : "Required before publishing. Ask the customer if you are not sure."}</small></span></label>
        </section>
        <aside className="admin-editor-settings">
          <h2>Preview</h2>
          <p className="admin-field-help">How the review appears on the website.{review ? <> Status: <span className={`admin-status admin-status-${review.status}`}>{review.status}</span></> : null}</p>
          <div className="admin-review-preview"><ReviewCard review={{ displayName: draft.displayName.trim() || "Customer name", context: draft.context.trim() || null, quote: draft.quote.trim() || "The customer's review will appear here.", rating: draft.rating ? Number(draft.rating) : null, serviceSlug: draft.serviceSlug || null }} /></div>
          {review && (
            <div className="admin-danger-zone">
              <h2>Remove this review</h2>
              <p>{published ? "Unpublish takes it off the website straight away and keeps it here as a draft." : "Drafts are never shown on the website."} Delete removes it permanently.</p>
              {confirmingDelete ? (
                <div className="admin-confirm" role="alertdialog" aria-labelledby="delete-review-title" aria-describedby="delete-review-text">
                  <strong id="delete-review-title">Delete this review permanently?</strong>
                  <p id="delete-review-text">This cannot be undone.{published ? " To take it off the website but keep it, use Unpublish instead." : ""}</p>
                  <div className="admin-cover-actions">
                    <button className="admin-danger-button" type="button" disabled={saving} onClick={() => void remove()}>{saving ? "Deleting…" : "Delete permanently"}</button>
                    <button className="admin-secondary-button" type="button" disabled={saving} autoFocus onClick={() => setConfirmingDelete(false)}>Keep review</button>
                  </div>
                </div>
              ) : <button className="admin-secondary-button" type="button" disabled={saving} onClick={() => setConfirmingDelete(true)}>Delete review…</button>}
            </div>
          )}
        </aside>
      </div>
      {(error || notice) && (
        <div className={error ? "admin-error admin-editor-feedback" : "admin-success admin-editor-feedback"} role={error ? "alert" : "status"}>
          {error || notice}
          {conflict && review && <> <button className="admin-text-button" type="button" onClick={() => void reloadLatest(review.id)}>Load the latest version</button> (your unsaved changes here will be replaced).</>}
        </div>
      )}
      <div className="admin-editor-bottom-actions"><Link className="admin-text-link" href="/admin/reviews">Cancel and return to reviews</Link><button className="admin-primary-button" type="button" disabled={saving} onClick={() => void save(review?.status ?? "draft")}>{saveLabel}</button></div>
    </form>
  );
}
