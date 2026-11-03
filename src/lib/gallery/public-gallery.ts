import type { GalleryItem } from "@/components/gallery-lightbox";
import { contentMode, getPublicGallery } from "@/content/trust-content";
import { GALLERY_CACHE_SECONDS, GALLERY_TAG } from "@/lib/cache/gallery-tags";
import { API_BASE_URL } from "@/lib/env/api-base-url";
import { isRenderableImageUrl } from "@/lib/media/media-url";
import { chooseGalleryItems, parsePublicGallery, toLightboxItem } from "@/lib/gallery/gallery-data";

/**
 * Published gallery items, cached for up to an hour and purged by tag when the team
 * publishes, edits, reorders, unpublishes, or deletes one. Never throws: if the API is
 * down, demo builds fall back to the placeholder images and production builds render
 * the page's empty state.
 */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  let published: GalleryItem[] | null = null;
  try {
    const response = await fetch(`${API_BASE_URL}/gallery`, { next: { revalidate: GALLERY_CACHE_SECONDS, tags: [GALLERY_TAG] } });
    if (!response.ok) throw new Error(`Gallery request returned ${response.status}.`);
    const items = parsePublicGallery(await response.json(), isRenderableImageUrl);
    if (!items) throw new Error("Gallery response was malformed.");
    published = items.map(toLightboxItem);
  } catch (error) {
    console.error("Published gallery is unavailable.", error instanceof Error ? error.message : error);
  }
  return chooseGalleryItems(published, contentMode, getPublicGallery());
}
