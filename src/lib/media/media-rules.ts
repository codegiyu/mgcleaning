import type { MediaIntent } from "@/lib/api/endpoints";

/** Mirror the backend defaults (`MEDIA_MAX_UPLOAD_BYTES`, `MEDIA_MAX_VIDEO_UPLOAD_BYTES`); the server enforces the real limits. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
/** Gallery clips are short; the browser checks length because the server cannot without decoding. */
export const MAX_VIDEO_SECONDS = 60;

const IMAGE_EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const VIDEO_EXTENSIONS: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm" };

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS).join(",");
/** `.mov` is listed so the picker offers it and the editor gets the export advice, not a silent refusal. */
export const ACCEPTED_GALLERY_TYPES = [...Object.keys(IMAGE_EXTENSIONS), ...Object.keys(VIDEO_EXTENSIONS), "video/quicktime", ".mov"].join(",");

export const MOV_ADVICE = "iPhone .mov clips do not play in most browsers. Export it as MP4 first (on iPhone: Settings → Camera → Formats → Most Compatible, or share it from Photos as MP4).";

type FileLike = { type: string; name: string; size: number };

export function mediaKindOf(file: Pick<FileLike, "type">): "image" | "video" | null {
  if (IMAGE_EXTENSIONS[file.type]) return "image";
  if (VIDEO_EXTENSIONS[file.type]) return "video";
  return null;
}

export function fileExtension(file: FileLike) {
  const fromType = IMAGE_EXTENSIONS[file.type] ?? VIDEO_EXTENSIONS[file.type];
  if (fromType) return fromType;
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName && fromName !== file.name.toLowerCase() ? fromName : "";
}

const megabytes = (bytes: number) => `${bytes / (1024 * 1024)} MB`;

/** Quick client-side check for a clear message; the API repeats every check. */
export function validateMediaFile(file: FileLike, intent: MediaIntent): string | null {
  const kind = mediaKindOf(file);
  const isMov = file.type === "video/quicktime" || file.name.toLowerCase().endsWith(".mov");
  if (intent === "gallery" && isMov) return MOV_ADVICE;
  if (!kind || (kind === "video" && intent !== "gallery")) {
    return intent === "gallery" ? "Choose a JPG, PNG, or WebP image, or an MP4 or WebM video." : "Choose a JPG, PNG, or WebP image.";
  }
  if (file.size === 0) return "That file is empty.";
  if (kind === "image" && file.size > MAX_IMAGE_BYTES) return `Images must be ${megabytes(MAX_IMAGE_BYTES)} or smaller.`;
  if (kind === "video" && file.size > MAX_VIDEO_BYTES) return `Videos must be ${megabytes(MAX_VIDEO_BYTES)} or smaller.`;
  return null;
}

export function validateVideoDuration(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return "That video could not be read. Try exporting it as MP4 again.";
  if (seconds > MAX_VIDEO_SECONDS + 0.5) return `Videos must be ${MAX_VIDEO_SECONDS} seconds or shorter. This one is ${Math.round(seconds)} seconds.`;
  return null;
}
