import type { BlogPost } from "@/lib/api/endpoints";
import { articles, getArticle, type DemoArticle } from "@/content/demo-content";
import { contentMode } from "@/content/trust-content";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

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
    authorName: "M&G Cleaning Service",
    serviceSlug: article.serviceSlug,
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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
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
    const data = await request<{ items: PublicBlogPost[] }>(`/blog?${params.toString()}`);
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
    return await request<PublicBlogPost>(`/blog/${encodeURIComponent(slug)}`);
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
    image: post.coverImageUrl || (contentMode === "demo" ? "/images/generated/journal-deep-clean-prep.png" : "/mg-cleaning-logo.svg"),
    paragraphs,
    takeaways: [],
  };
}
