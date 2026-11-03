import "client-only";

/** Poster images are capped at this width; larger frames only add bytes. */
const MAX_FRAME_WIDTH = 1600;

export class FrameCaptureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrameCaptureError";
  }
}

/** A hidden video element that resolves once metadata (duration and size) is known. */
function loadVideo(src: string, crossOrigin: boolean) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    if (crossOrigin) video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new FrameCaptureError("That video could not be read. Try exporting it as MP4 again."));
    video.src = src;
  });
}

/** Reads a local file's length in seconds before anything is uploaded. */
export async function readVideoDuration(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideo(url, false);
    return video.duration;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seek(video: HTMLVideoElement, seconds: number) {
  return new Promise<void>((resolve, reject) => {
    video.onseeked = () => resolve();
    video.onerror = () => reject(new FrameCaptureError("That moment of the video could not be read."));
    video.currentTime = seconds;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
}

/**
 * Grabs one frame as an image, so a video gets a cover without any server-side
 * processing. A local file always works; a stored video only works when the media
 * domain sends CORS headers, otherwise the canvas is tainted and this throws.
 */
export async function captureFrame(source: File | string, atSeconds: number): Promise<Blob> {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    const video = await loadVideo(url, typeof source === "string");
    await seek(video, Math.min(Math.max(0, atSeconds), Math.max(0, video.duration - 0.05)));
    const scale = Math.min(1, MAX_FRAME_WIDTH / (video.videoWidth || MAX_FRAME_WIDTH));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((video.videoWidth || 1280) * scale);
    canvas.height = Math.round((video.videoHeight || 720) * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new FrameCaptureError("This browser cannot capture a video frame.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    let blob: Blob | null;
    try {
      // Safari cannot encode WebP and returns PNG instead; JPEG keeps that small.
      blob = await canvasBlob(canvas, "image/webp");
      if (!blob || blob.type !== "image/webp") blob = await canvasBlob(canvas, "image/jpeg");
    } catch {
      throw new FrameCaptureError("This video's frames cannot be captured here. Upload a cover image instead.");
    }
    if (!blob) throw new FrameCaptureError("The frame could not be saved. Upload a cover image instead.");
    return blob;
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(url);
  }
}

/** Wraps a captured frame as a file the upload helper accepts. */
export function frameFile(blob: Blob, videoName: string) {
  const base = videoName.replace(/\.[^.]+$/, "").slice(0, 150) || "video";
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${base}-cover.${extension}`, { type: blob.type });
}
