"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { services } from "@/content/demo-content";
import { callApi } from "@/lib/api/callApi";
import type { AdminGalleryItem, GalleryItemStatus } from "@/lib/api/endpoints";
import { formatWat } from "@/lib/admin/wat-time";
import {
  ALT_MAX,
  CAPTION_MAX,
  draftFromItem,
  galleryLayoutOptions,
  galleryPatch,
  publishBlockers,
  TAGS_MAX,
  type GalleryDraft,
} from "@/lib/admin/gallery-form";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/media/media-rules";
import { ImageUploadError, uploadMedia } from "@/lib/media/upload-image";
import { captureFrame, frameFile } from "@/lib/media/video-frame";

const CONFLICT = 409;

/**
 * Edit one gallery item in a modal dialog: the browser traps focus inside it and
 * Escape closes it. Every save names the version it started from, so another editor's
 * change is reported instead of overwritten.
 */
export function AdminGalleryEditor({
  item,
  onSaved,
  onDeleted,
  onClose,
}: {
  item: AdminGalleryItem;
  onSaved: (item: AdminGalleryItem) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(item);
  const [draft, setDraft] = useState<GalleryDraft>(() => draftFromItem(item));
  const [saving, setSaving] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function update<K extends keyof GalleryDraft>(key: K, value: GalleryDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function showSaved(saved: AdminGalleryItem, message: string) {
    setCurrent(saved);
    setDraft(draftFromItem(saved));
    setConflict(false);
    setError("");
    setNotice(message);
    onSaved(saved);
  }

  function showError(message: string, responseCode?: number) {
    setConflict(responseCode === CONFLICT);
    setError(message);
    setNotice("");
  }

  async function reloadLatest() {
    const result = await callApi("GET_ADMIN_GALLERY_ITEM", { pathParams: { id: current.id } });
    if (result.type === "error") { showError(result.message); return; }
    showSaved(result.data, "Loaded the latest version.");
  }

  async function save(targetStatus: GalleryItemStatus) {
    if (targetStatus === "published") {
      const blockers = publishBlockers(draft, current);
      if (blockers.length) { showError(blockers.join(" ")); return; }
    }
    setSaving(true);
    const result = await callApi("PATCH_ADMIN_GALLERY_ITEM", { pathParams: { id: current.id }, payload: galleryPatch(draft, current, targetStatus) });
    setSaving(false);
    if (result.type === "error") { showError(result.message, result.error.responseCode); return; }
    const wasPublished = current.status === "published";
    showSaved(
      result.data,
      targetStatus === "published" ? (wasPublished ? "Updated on the website." : "Published. It appears on the website within a minute.")
        : wasPublished ? "Unpublished. It no longer appears on the website." : "Draft saved.",
    );
  }

  /** Uploads a cover image, then attaches it in a separate versioned save. */
  async function attachCover(file: File) {
    setCoverBusy(true);
    setError("");
    try {
      const poster = await uploadMedia(file, { intent: "gallery", altText: draft.altText.trim() || current.altText });
      const result = await callApi("PATCH_ADMIN_GALLERY_ITEM", { pathParams: { id: current.id }, payload: { posterMediaId: poster.id, expectedUpdatedAt: current.updatedAt } });
      if (result.type === "error") { showError(result.message, result.error.responseCode); return; }
      // Keep any unsaved text the editor has typed; only the cover and version change.
      setCurrent(result.data);
      onSaved(result.data);
      setNotice("Cover image updated.");
    } catch (caught) {
      showError(caught instanceof ImageUploadError || (caught instanceof Error && caught.name === "FrameCaptureError") ? caught.message : "The cover image could not be saved. Please try again.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function captureCurrentFrame() {
    const seconds = videoRef.current?.currentTime ?? 0;
    setCoverBusy(true);
    try {
      const frame = await captureFrame(current.mediaUrl, seconds);
      await attachCover(frameFile(frame, current.altText));
    } catch {
      setCoverBusy(false);
      showError("This video's frames cannot be captured in the browser. Upload a cover image instead.");
    }
  }

  function handleCoverFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void attachCover(file);
  }

  async function remove() {
    setSaving(true);
    const result = await callApi("DELETE_ADMIN_GALLERY_ITEM", { pathParams: { id: current.id }, params: { expectedUpdatedAt: current.updatedAt } });
    setSaving(false);
    if (result.type === "error") { setConfirmingDelete(false); showError(result.message, result.error.responseCode); return; }
    onDeleted(current.id);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(current.status);
  }

  const published = current.status === "published";
  const isVideo = current.type === "video";
  const busy = saving || coverBusy;
  return (
    // The dialog's own Escape handling closes it; `onClose` keeps React's state in step.
    <dialog ref={dialogRef} className="admin-gallery-dialog" aria-labelledby="gallery-editor-title" onClose={onClose}>
      <form className="admin-gallery-editor" onSubmit={submit}>
        <header className="admin-gallery-editor-header">
          <div>
            <h2 id="gallery-editor-title">Edit {isVideo ? "video" : "photo"}</h2>
            <p>Status: <span className={`admin-status admin-status-${current.status}`}>{current.status}</span></p>
          </div>
          <button className="admin-icon-button" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}><span aria-hidden="true">✕</span></button>
        </header>

        <div className="admin-gallery-editor-grid">
          <div className="admin-gallery-preview">
            {isVideo ? (
              // Shown without crossOrigin so it plays even if the media domain sends no CORS headers.
              <video ref={videoRef} src={current.mediaUrl} poster={current.posterUrl ?? undefined} controls muted playsInline preload="metadata" aria-label={draft.altText} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview from the media domain
              <img src={current.mediaUrl} alt="" />
            )}
            {isVideo && (
              <div className="admin-gallery-cover">
                <span>Cover image</span>
                {current.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from the media domain
                  <img src={current.posterUrl} alt="" />
                ) : <p className="admin-cover-empty">No cover yet. Publishing a video needs one.</p>}
                <div className="admin-cover-actions">
                  <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => void captureCurrentFrame()}>Use the paused frame</button>
                  <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => coverInputRef.current?.click()}>Upload a cover image</button>
                </div>
                <small className="admin-field-help">Pause the video on a good moment, then use that frame.{coverBusy ? " Saving the cover…" : ""}</small>
                <input ref={coverInputRef} className="admin-visually-hidden" type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={handleCoverFile} tabIndex={-1} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="admin-gallery-fields">
            <label className="admin-field">
              <span>Describe what it shows</span>
              <textarea required minLength={3} maxLength={ALT_MAX} rows={3} value={draft.altText} onChange={(event) => update("altText", event.target.value)} />
              <small className="admin-field-help">Read aloud to people using screen readers, e.g. &ldquo;A cleaner polishing a tiled office lobby&rdquo;. No links or &lt; &gt;.</small>
            </label>
            <label className="admin-field">
              <span>Caption <em>(optional)</em></span>
              <input maxLength={CAPTION_MAX} value={draft.caption} onChange={(event) => update("caption", event.target.value)} placeholder="e.g. Office lobby, Wuse 2" />
            </label>
            <div className="admin-form-row">
              <label className="admin-field">
                <span>Service <em>(optional)</em></span>
                <select value={draft.serviceSlug} onChange={(event) => update("serviceSlug", event.target.value)}>
                  <option value="">Not specified</option>
                  {services.map((service) => <option key={service.slug} value={service.slug}>{service.title}</option>)}
                </select>
              </label>
              <label className="admin-field">
                <span>Tile size</span>
                <select value={draft.layout} onChange={(event) => update("layout", event.target.value as GalleryDraft["layout"])}>
                  {galleryLayoutOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <label className="admin-field">
              <span>Tags <em>(optional)</em></span>
              <input value={draft.tags} onChange={(event) => update("tags", event.target.value)} placeholder="e.g. Office, Floors" />
              <small className="admin-field-help">Separate with commas. Up to {TAGS_MAX}.</small>
            </label>
            <label className="admin-checkbox admin-consent">
              <input type="checkbox" checked={draft.rightsConfirmed} disabled={published} onChange={(event) => update("rightsConfirmed", event.target.checked)} />
              <span>
                <strong>M&amp;G owns this {isVideo ? "video" : "photo"}, and any customer or property shown agreed to it appearing on the website.</strong>
                <small>{published ? "To withdraw this, unpublish first." : current.rightsConfirmedAt ? `Confirmed ${formatWat(current.rightsConfirmedAt)}.` : "Required before publishing."}</small>
              </span>
            </label>
          </div>
        </div>

        {(error || notice) && (
          <div className={error ? "admin-error admin-editor-feedback" : "admin-success admin-editor-feedback"} role={error ? "alert" : "status"}>
            {error || notice}
            {conflict && <> <button className="admin-text-button" type="button" onClick={() => void reloadLatest()}>Load the latest version</button> (your unsaved changes here will be replaced).</>}
          </div>
        )}

        <footer className="admin-gallery-editor-actions">
          {confirmingDelete ? (
            <div className="admin-confirm" role="alertdialog" aria-labelledby="delete-gallery-title" aria-describedby="delete-gallery-text">
              <strong id="delete-gallery-title">Delete this {isVideo ? "video" : "photo"} permanently?</strong>
              <p id="delete-gallery-text">Its files are removed too. This cannot be undone.{published ? " To keep it but hide it, use Unpublish." : ""}</p>
              <div className="admin-cover-actions">
                <button className="admin-danger-button" type="button" disabled={saving} onClick={() => void remove()}>{saving ? "Deleting…" : "Delete permanently"}</button>
                <button className="admin-secondary-button" type="button" disabled={saving} autoFocus onClick={() => setConfirmingDelete(false)}>Keep it</button>
              </div>
            </div>
          ) : (
            <>
              <button className="admin-text-button admin-gallery-delete" type="button" disabled={busy} onClick={() => setConfirmingDelete(true)}>Delete…</button>
              <div className="admin-editor-actions">
                <button className="admin-secondary-button" type="submit" disabled={busy}>{saving ? "Saving…" : published ? "Save changes" : "Save draft"}</button>
                {published && <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => void save("draft")}>Unpublish</button>}
                {!published && <button className="admin-primary-button" type="button" disabled={busy} onClick={() => void save("published")}>Publish</button>}
              </div>
            </>
          )}
        </footer>
      </form>
    </dialog>
  );
}
