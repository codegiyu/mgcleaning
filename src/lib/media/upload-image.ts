import "client-only";

import { callApi } from "@/lib/api/callApi";
import type { MediaAsset, MediaIntent } from "@/lib/api/endpoints";
import { fileExtension, validateMediaFile } from "@/lib/media/media-rules";

export { ACCEPTED_IMAGE_TYPES } from "@/lib/media/media-rules";

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

/**
 * Direct upload to R2. Deliberately not the shared axios client: the presigned URL is
 * cross-origin to the API, must not carry cookies, and must send exactly the signed headers.
 */
function putFile(
  url: string,
  headers: Record<string, string>,
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    for (const [name, value] of Object.entries(headers)) request.setRequestHeader(name, value);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new ImageUploadError("The file could not be stored. Please try again."));
    };
    request.onerror = () => reject(new ImageUploadError("The upload was interrupted. Check your connection and try again."));
    request.onabort = () => reject(new DOMException("Upload cancelled.", "AbortError"));
    signal?.addEventListener("abort", () => request.abort(), { once: true });
    request.send(file);
  });
}

/** Request a signed URL, put the file straight into storage, then have the API verify it. Gallery uploads may be video. */
export async function uploadMedia(
  file: File,
  options: { intent: MediaIntent; altText?: string; onProgress?: (fraction: number) => void; signal?: AbortSignal },
): Promise<MediaAsset> {
  const invalid = validateMediaFile(file, options.intent);
  if (invalid) throw new ImageUploadError(invalid);

  const ticket = await callApi("POST_ADMIN_MEDIA_UPLOAD", {
    payload: {
      intent: options.intent,
      fileExtension: fileExtension(file),
      byteSize: file.size,
      filename: file.name.slice(0, 200),
      ...(options.altText?.trim() ? { altText: options.altText.trim() } : {}),
    },
    signal: options.signal,
  });
  if (ticket.type === "error") throw new ImageUploadError(ticket.message);

  const { asset, upload } = ticket.data;
  await putFile(upload.url, upload.headers, file, options.onProgress ?? (() => undefined), options.signal);

  const verified = await callApi("POST_ADMIN_MEDIA_VERIFY", { pathParams: { id: asset.id }, signal: options.signal });
  if (verified.type === "error") throw new ImageUploadError(verified.message);
  return verified.data;
}
