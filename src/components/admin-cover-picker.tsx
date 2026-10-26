"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { callApi } from "@/lib/api/callApi";
import type { MediaAsset } from "@/lib/api/endpoints";
import { ACCEPTED_IMAGE_TYPES, ImageUploadError, uploadImage } from "@/lib/media/upload-image";

export type SelectedCover = { id: string; url: string; altText: string | null };

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number; filename: string }
  | { kind: "error"; message: string };

type LibraryState =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "ready"; items: MediaAsset[] }
  | { kind: "error"; message: string };

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

/**
 * Upload a new cover straight to storage, or reuse a verified image. Only verified
 * uploads are ever passed to `onChange`, so the editor never references a pending file.
 */
export function AdminCoverPicker({
  cover,
  altText,
  disabled,
  onChange,
}: {
  cover: SelectedCover | null;
  altText: string;
  disabled?: boolean;
  onChange: (cover: SelectedCover | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [upload, setUpload] = useState<UploadState>({ kind: "idle" });
  const [library, setLibrary] = useState<LibraryState>({ kind: "closed" });

  useEffect(() => () => abortRef.current?.abort(), []);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({ kind: "uploading", progress: 0, filename: file.name });
    try {
      const asset = await uploadImage(file, {
        intent: "blog-cover",
        altText,
        signal: controller.signal,
        onProgress: (progress) => setUpload({ kind: "uploading", progress, filename: file.name }),
      });
      setUpload({ kind: "idle" });
      onChange({ id: asset.id, url: asset.url, altText: asset.altText });
      if (library.kind === "ready") setLibrary({ kind: "ready", items: [asset, ...library.items] });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setUpload({ kind: "idle" });
        return;
      }
      setUpload({
        kind: "error",
        message: error instanceof ImageUploadError ? error.message : "The image could not be uploaded. Please try again.",
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  async function openLibrary() {
    if (library.kind === "ready" || library.kind === "loading") {
      setLibrary({ kind: "closed" });
      return;
    }
    setLibrary({ kind: "loading" });
    const result = await callApi("GET_ADMIN_MEDIA", { params: { page: 1, pageSize: 24 } });
    setLibrary(result.type === "error" ? { kind: "error", message: result.message } : { kind: "ready", items: result.data.items });
  }

  const uploading = upload.kind === "uploading";
  return (
    <div className="admin-field admin-cover-picker">
      <span>Cover image</span>
      {cover ? (
        <div className="admin-cover-preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from the media domain */}
          <img src={cover.url} alt="" />
        </div>
      ) : (
        <p className="admin-cover-empty">No cover yet. Publishing needs one.</p>
      )}
      <div className="admin-cover-actions">
        <button className="admin-secondary-button" type="button" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {cover ? "Replace image" : "Upload image"}
        </button>
        <button className="admin-secondary-button" type="button" disabled={disabled || uploading} onClick={() => void openLibrary()} aria-expanded={library.kind !== "closed"}>
          {library.kind === "ready" ? "Hide library" : "Choose from library"}
        </button>
        {cover && (
          <button className="admin-secondary-button" type="button" disabled={disabled || uploading} onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} className="admin-visually-hidden" type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={(event) => void handleFile(event)} tabIndex={-1} aria-hidden="true" />
      <small className="admin-field-help">JPG, PNG, or WebP up to 5 MB.</small>
      {uploading && (
        <div className="admin-upload-progress" role="status" aria-live="polite">
          <span>Uploading {upload.filename}…</span>
          <progress max={1} value={upload.progress} aria-label="Upload progress" />
          <button className="admin-text-button" type="button" onClick={() => abortRef.current?.abort()}>Cancel</button>
        </div>
      )}
      {upload.kind === "error" && <p className="admin-error" role="alert">{upload.message}</p>}
      {library.kind === "loading" && <p className="admin-inline-state">Loading images…</p>}
      {library.kind === "error" && <p className="admin-error" role="alert">{library.message}</p>}
      {library.kind === "ready" && (
        library.items.length === 0 ? (
          <p className="admin-inline-state">No uploaded images yet.</p>
        ) : (
          <ul className="admin-media-grid" aria-label="Uploaded images">
            {library.items.map((item) => {
              const selected = item.id === cover?.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={selected ? "admin-media-option admin-media-option-selected" : "admin-media-option"}
                    aria-pressed={selected}
                    disabled={disabled || uploading}
                    onClick={() => onChange({ id: item.id, url: item.url, altText: item.altText })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from the media domain */}
                    <img src={item.url} alt={item.altText ?? ""} loading="lazy" />
                    <span>{item.originalFilename ?? "Image"}{item.byteSize ? ` · ${formatBytes(item.byteSize)}` : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}
