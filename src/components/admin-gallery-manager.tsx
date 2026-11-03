"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AdminGalleryEditor } from "@/components/admin-gallery-editor";
import { callApi } from "@/lib/api/callApi";
import type { AdminGalleryItem, GalleryItemStatus } from "@/lib/api/endpoints";
import { defaultAltText, moveId, runPool, UPLOAD_CONCURRENCY } from "@/lib/admin/gallery-form";
import { ACCEPTED_GALLERY_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, mediaKindOf, validateMediaFile, validateVideoDuration } from "@/lib/media/media-rules";
import { ImageUploadError, uploadMedia } from "@/lib/media/upload-image";
import { captureFrame, frameFile, readVideoDuration } from "@/lib/media/video-frame";

export type GalleryFilter = GalleryItemStatus | "all";

const filters: { id: GalleryFilter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
];

const CONFLICT = 409;

type UploadTask = {
  key: string;
  name: string;
  state: "waiting" | "checking" | "uploading" | "cover" | "saving" | "done" | "error";
  progress: number;
  message?: string;
};

const stepLabel: Record<UploadTask["state"], string> = {
  waiting: "Waiting",
  checking: "Checking",
  uploading: "Uploading",
  cover: "Making a cover image",
  saving: "Adding to the gallery",
  done: "Added as a draft",
  error: "Not added",
};

function errorMessage(error: unknown) {
  if (error instanceof ImageUploadError) return error.message;
  if (error instanceof Error && error.name === "FrameCaptureError") return error.message;
  return "The file could not be uploaded. Please try again.";
}

/** Always the whole gallery: reordering needs every item, and the status filter is applied here. */
const fetchGallery = () => callApi("GET_ADMIN_GALLERY");

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

function thumbnail(item: AdminGalleryItem) {
  return item.type === "video" ? item.posterUrl : item.mediaUrl;
}

export function AdminGalleryManager({ initialStatus }: { initialStatus: GalleryFilter }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const moveButtons = useRef(new Map<string, HTMLButtonElement>());
  const [items, setItems] = useState<AdminGalleryItem[]>([]);
  const [limit, setLimit] = useState(300);
  const [status, setStatus] = useState<GalleryFilter>(initialStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staleOrder, setStaleOrder] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function showLoaded(result: Awaited<ReturnType<typeof fetchGallery>>) {
    setLoading(false);
    if (result.type === "error") { setError(result.message); return; }
    setItems(result.data.items);
    setLimit(result.data.limit);
    setError("");
    setStaleOrder(false);
  }

  function reload() {
    setLoading(true);
    void fetchGallery().then(showLoaded);
  }

  useEffect(() => {
    let active = true;
    void fetchGallery().then((result) => { if (active) showLoaded(result); });
    return () => { active = false; abortRef.current?.abort(); };
  }, []);

  function updateTask(key: string, change: Partial<UploadTask>) {
    setUploads((current) => current.map((task) => (task.key === key ? { ...task, ...change } : task)));
  }

  function addItem(item: AdminGalleryItem) {
    setItems((current) => [...current, item]);
  }

  async function addFile(file: File, key: string, signal: AbortSignal) {
    const kind = mediaKindOf(file);
    const invalid = validateMediaFile(file, "gallery");
    if (invalid || !kind) { updateTask(key, { state: "error", message: invalid ?? "Unsupported file." }); return; }
    try {
      let cover: Blob | null = null;
      if (kind === "video") {
        updateTask(key, { state: "checking" });
        const seconds = await readVideoDuration(file);
        const tooLong = validateVideoDuration(seconds);
        if (tooLong) { updateTask(key, { state: "error", message: tooLong }); return; }
        // A frame a little way in is rarely black; the editor can pick another later.
        cover = await captureFrame(file, Math.min(1, seconds / 10)).catch(() => null);
      }
      updateTask(key, { state: "uploading", progress: 0 });
      const altText = defaultAltText(file.name, kind);
      const media = await uploadMedia(file, { intent: "gallery", altText, signal, onProgress: (progress) => updateTask(key, { progress }) });
      let posterMediaId: string | undefined;
      if (cover) {
        updateTask(key, { state: "cover" });
        posterMediaId = (await uploadMedia(frameFile(cover, file.name), { intent: "gallery", altText, signal })).id;
      }
      updateTask(key, { state: "saving" });
      const created = await callApi("POST_ADMIN_GALLERY_ITEM", { payload: { mediaId: media.id, altText, ...(posterMediaId ? { posterMediaId } : {}) }, signal });
      if (created.type === "error") { updateTask(key, { state: "error", message: created.message }); return; }
      addItem(created.data);
      updateTask(key, { state: "done", message: kind === "video" && !posterMediaId ? "Add a cover image before publishing." : undefined });
    } catch (caught) {
      updateTask(key, isAbort(caught) ? { state: "error", message: "Cancelled." } : { state: "error", message: errorMessage(caught) });
    }
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const room = Math.max(0, limit - items.length);
    const accepted = files.slice(0, room);
    const tasks: UploadTask[] = files.map((file, index) => ({
      key: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      state: index < room ? "waiting" : "error",
      progress: 0,
      message: index < room ? undefined : `The gallery holds up to ${limit} items.`,
    }));
    setUploads((current) => [...current.filter((task) => task.state !== "done" && task.state !== "error"), ...tasks]);
    const controller = new AbortController();
    abortRef.current = controller;
    await runPool(accepted.map((file, index) => ({ file, key: tasks[index]!.key })), UPLOAD_CONCURRENCY, ({ file, key }) => addFile(file, key, controller.signal));
    if (abortRef.current === controller) abortRef.current = null;
  }

  async function move(item: AdminGalleryItem, delta: -1 | 1) {
    // Ignored rather than disabled while saving, so the pressed button keeps keyboard focus.
    if (savingOrder) return;
    const previous = items;
    const ids = moveId(previous.map((entry) => entry.id), item.id, delta);
    if (ids.every((id, index) => id === previous[index]?.id)) return;
    const byId = new Map(previous.map((entry) => [entry.id, entry]));
    const reordered = ids.map((id) => byId.get(id)!);
    setItems(reordered);
    const position = ids.indexOf(item.id) + 1;
    setAnnouncement(`Moved to position ${position} of ${ids.length}.`);
    // Keep focus with the moved item so repeated presses keep moving it; at either end
    // that arrow is disabled, so focus its other arrow instead.
    requestAnimationFrame(() => {
      const same = moveButtons.current.get(`${item.id}:${delta}`);
      (same && !same.disabled ? same : moveButtons.current.get(`${item.id}:${-delta}`))?.focus();
    });
    setSavingOrder(true);
    const result = await callApi("PUT_ADMIN_GALLERY_ORDER", { payload: { ids } });
    setSavingOrder(false);
    if (result.type === "error") {
      setItems(previous);
      setStaleOrder(result.error.responseCode === CONFLICT);
      setError(result.message);
      setAnnouncement("");
      return;
    }
    setItems(result.data.items);
    setError("");
  }

  function replaceItem(updated: AdminGalleryItem) {
    setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((entry) => entry.id !== id));
    setEditingId(null);
    setAnnouncement("Gallery item deleted.");
  }

  const counts = { published: items.filter((item) => item.status === "published").length, draft: items.filter((item) => item.status === "draft").length };
  const visible = status === "all" ? items : items.filter((item) => item.status === status);
  const canReorder = status === "all" && items.length > 1;
  const busy = uploads.some((task) => !["done", "error"].includes(task.state));
  const editing = editingId ? items.find((item) => item.id === editingId) ?? null : null;

  return (
    <section className="admin-content">
      <header className="admin-page-heading">
        <div>
          <h1>Gallery</h1>
          <p>Photos and short videos of M&amp;G work. New uploads start as drafts; only published items with confirmed rights appear on the website.</p>
        </div>
        <button className="admin-primary-button" type="button" disabled={items.length >= limit} onClick={() => inputRef.current?.click()}>
          Add photos or videos <span aria-hidden="true">＋</span>
        </button>
      </header>
      <input ref={inputRef} className="admin-visually-hidden" type="file" multiple accept={ACCEPTED_GALLERY_TYPES} onChange={(event) => void handleFiles(event)} tabIndex={-1} aria-hidden="true" />
      <p className="admin-field-help admin-gallery-help">
        Photos: JPG, PNG, or WebP up to {MAX_IMAGE_BYTES / (1024 * 1024)} MB. Videos: MP4 or WebM up to {MAX_VIDEO_BYTES / (1024 * 1024)} MB and {MAX_VIDEO_SECONDS} seconds; silent clips or burned-in captions work best. iPhone .mov clips need exporting as MP4 first.
      </p>

      {uploads.length > 0 && (
        <div className="admin-gallery-uploads" aria-label="Uploads">
          <ul>
            {uploads.map((task) => (
              <li key={task.key} className={`admin-gallery-upload admin-gallery-upload-${task.state}`}>
                <span className="admin-gallery-upload-name">{task.name}</span>
                <span role="status" aria-live="polite">{stepLabel[task.state]}{task.state === "uploading" ? ` ${Math.round(task.progress * 100)}%` : ""}{task.message ? `: ${task.message}` : ""}</span>
                {task.state === "uploading" && <progress max={1} value={task.progress} aria-label={`Upload progress for ${task.name}`} />}
              </li>
            ))}
          </ul>
          <div className="admin-cover-actions">
            {busy ? (
              <button className="admin-text-button" type="button" onClick={() => abortRef.current?.abort()}>Cancel uploads</button>
            ) : (
              <button className="admin-text-button" type="button" onClick={() => setUploads([])}>Clear this list</button>
            )}
          </div>
        </div>
      )}

      <div className="admin-blog-toolbar">
        <div className="admin-inquiry-tabs" role="tablist" aria-label="Filter the gallery by status">
          {filters.map((filter) => (
            <button type="button" role="tab" aria-selected={status === filter.id} className={status === filter.id ? "admin-tab admin-tab-active" : "admin-tab"} key={filter.id} onClick={() => setStatus(filter.id)}>
              {filter.label}{!loading && filter.id !== "all" ? ` (${counts[filter.id]})` : ""}
            </button>
          ))}
        </div>
        {status === "all" && items.length > 1 && <p className="admin-field-help">Use the arrows to set the order shown on the website.{savingOrder ? " Saving…" : ""}</p>}
        {status !== "all" && <p className="admin-field-help">Switch to Everything to change the order.</p>}
      </div>
      <p className="admin-visually-hidden" role="status" aria-live="polite">{announcement}</p>
      {error && (
        <p className="admin-error" role="alert">
          {error}
          {staleOrder && <> <button className="admin-text-button" type="button" onClick={reload}>Reload the gallery</button></>}
        </p>
      )}

      {loading ? <p className="admin-inline-state">Loading the gallery…</p> : visible.length ? (
        <ol className="admin-gallery-grid">
          {visible.map((item, index) => {
            const src = thumbnail(item);
            return (
              <li key={item.id} className="admin-gallery-card">
                <div className="admin-gallery-thumb">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from the media domain
                    <img src={src} alt="" loading="lazy" />
                  ) : (
                    <span className="admin-gallery-no-cover">No cover yet</span>
                  )}
                  {item.type === "video" && <span className="admin-gallery-badge">Video</span>}
                </div>
                <div className="admin-gallery-card-body">
                  <span className={`admin-status admin-status-${item.status}`}>{item.status}</span>
                  <strong title={item.altText}>{item.altText}</strong>
                  {item.caption && <small>{item.caption}</small>}
                </div>
                <div className="admin-gallery-card-actions">
                  {canReorder && (
                    <>
                      <button
                        ref={(node) => { if (node) moveButtons.current.set(`${item.id}:-1`, node); else moveButtons.current.delete(`${item.id}:-1`); }}
                        className="admin-icon-button" type="button" disabled={index === 0}
                        aria-label={`Move “${item.altText}” earlier`} onClick={() => void move(item, -1)}
                      ><span aria-hidden="true">↑</span></button>
                      <button
                        ref={(node) => { if (node) moveButtons.current.set(`${item.id}:1`, node); else moveButtons.current.delete(`${item.id}:1`); }}
                        className="admin-icon-button" type="button" disabled={index === visible.length - 1}
                        aria-label={`Move “${item.altText}” later`} onClick={() => void move(item, 1)}
                      ><span aria-hidden="true">↓</span></button>
                    </>
                  )}
                  <button className="admin-secondary-button" type="button" aria-label={`Edit “${item.altText}”`} onClick={() => setEditingId(item.id)}>Edit</button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="admin-empty-state">
          <h2>{status === "all" ? "The gallery is empty." : status === "draft" ? "No drafts." : "Nothing is published yet."}</h2>
          <p>Add photos or short videos of finished work. Check that M&amp;G owns them and that any customer or property shown has agreed before publishing.</p>
          {status === "all" && <button className="admin-text-link admin-text-button" type="button" onClick={() => inputRef.current?.click()}>Add photos or videos →</button>}
        </div>
      )}

      {editing && <AdminGalleryEditor item={editing} onSaved={replaceItem} onDeleted={removeItem} onClose={() => setEditingId(null)} />}
    </section>
  );
}
