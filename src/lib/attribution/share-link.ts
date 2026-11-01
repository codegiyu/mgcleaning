/**
 * Article link for an Instagram post or reel. Tagging the campaign with the article slug
 * lets the inquiry inbox show which post led to an enquiry.
 */
export function instagramArticleLink(origin: string, slug: string, content?: string) {
  const url = new URL(`/blog/${encodeURIComponent(slug)}`, origin);
  url.searchParams.set("utm_source", "instagram");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", slug);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}
