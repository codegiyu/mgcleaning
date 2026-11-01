import type { BlogPost } from "@/lib/api/endpoints";
import { articles, getArticle, type DemoArticle } from "@/content/demo-content";
import { contentMode } from "@/content/trust-content";
import { BLOG_CACHE_SECONDS, BLOG_LIST_TAG, blogPostTag } from "@/lib/cache/blog-tags";
import { isRenderableImageUrl } from "@/lib/media/media-url";
import { API_BASE_URL } from "@/lib/env/api-base-url";

export type PublicBlogPost = Pick<
  BlogPost,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "body"
  | "category"
  | "authorName"
  | "serviceSlug"
  | "coverMediaId"
  | "coverImageUrl"
  | "coverImageAlt"
  | "seoTitle"
  | "seoDescription"
  | "publishedAt"
  | "updatedAt"
>;

type BlogEnvelope<T> = {
  success: boolean;
  data?: T;
};

function fromDemo(article: DemoArticle): PublicBlogPost {
  return {
    id: `demo-${article.slug}`,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: [
      ...article.paragraphs,
      "## A few things to keep in mind",
      ...article.takeaways.map((item) => `- ${item}`),
    ].join("\n\n"),
    category: article.category,
    authorName: "M&G Cleaning Services",
    serviceSlug: article.serviceSlug,
    coverMediaId: null,
    coverImageUrl: article.image,
    coverImageAlt: article.title,
    seoTitle: null,
    seoDescription: null,
    publishedAt: new Date(`${article.publishedAt}T12:00:00.000Z`).toISOString(),
    updatedAt: new Date(`${article.publishedAt}T12:00:00.000Z`).toISOString(),
  };
}

function demoFallback(): PublicBlogPost[];
function demoFallback(slug: string): PublicBlogPost | null;
function demoFallback(slug?: string): PublicBlogPost[] | PublicBlogPost | null {
  if (slug !== undefined) {
    const article = getArticle(slug);
    return article ? fromDemo(article) : null;
  }
  return articles.map(fromDemo);
}

/**
 * Cached for up to an hour and purged by tag when the backend publishes, edits, or
 * unpublishes an article (see `src/app/api/revalidate/route.ts`).
 */
async function request<T>(path: string, tags: string[]): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: BLOG_CACHE_SECONDS, tags } });
  const body = (await response.json()) as BlogEnvelope<T>;
  if (!response.ok || !body.success || body.data === undefined) {
    throw new Error("Published articles are not available.");
  }
  return body.data;
}

export async function getPublishedBlogPosts(category?: string) {
  const params = new URLSearchParams({ page: "1", pageSize: "50" });
  if (category && category !== "All") params.set("category", category);
  try {
    const data = await request<{ items: PublicBlogPost[] }>(`/blog?${params.toString()}`, [BLOG_LIST_TAG]);
    return data.items;
  } catch {
    if (contentMode === "demo") {
      const fallback = demoFallback() ?? [];
      return category && category !== "All"
        ? fallback.filter((post) => post.category === category)
        : fallback;
    }
    return [];
  }
}

export async function getPublishedBlogPost(slug: string) {
  try {
    return await request<PublicBlogPost>(`/blog/${encodeURIComponent(slug)}`, [blogPostTag(slug)]);
  } catch {
    if (contentMode === "demo") return demoFallback(slug);
    return null;
  }
}

export function toDemoArticle(post: PublicBlogPost): DemoArticle {
  const paragraphs = post.body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part && !/^#{1,3}\s/.test(part) && !/^-\s/m.test(part));
  const publishedAt = post.publishedAt?.slice(0, 10) ?? post.updatedAt.slice(0, 10);
  const words = post.body.split(/\s+/).length;
  return {
    slug: post.slug,
    serviceSlug: post.serviceSlug ?? "upholstery-cleaning",
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    publishedAt,
    readTime: `${Math.max(1, Math.ceil(words / 220))} min read`,
    tone: "mint",
    image: isRenderableImageUrl(post.coverImageUrl)
      ? post.coverImageUrl
      : contentMode === "demo" ? "/images/generated/journal-deep-clean-prep.webp" : "/mg-cleaning-logo.svg",
    paragraphs,
    takeaways: [],
  };
}
