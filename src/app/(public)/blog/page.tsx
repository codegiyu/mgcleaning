import Link from "next/link";
import { ArticleCard, PageIntro } from "@/components/site-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";
import { getPublishedBlogPosts, toDemoArticle } from "@/lib/blog/public-blog";

type Props = { searchParams: Promise<{ category?: string }> };

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "The M&G Journal", path: "/blog" }];
export const metadata = buildPageMetadata({ title: "The M&G Journal", description: "Practical articles on home care, workspaces, hosting, specialist surfaces, and cleaning preparation.", path: "/blog" });

export default async function BlogPage({ searchParams }: Props) {
  const selected = (await searchParams).category ?? "All";
  const allPosts = await getPublishedBlogPosts();
  const posts = selected === "All" ? allPosts : allPosts.filter((post) => post.category === selected);
  const categories = ["All", ...new Set(allPosts.map((post) => post.category))];
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="M&G CLEANING SERVICES · JOURNAL" title="The M&G Journal" description="Practical notes on home care, workspaces, hosting, specialist surfaces, and preparing for a professional clean." align="center" />
      <div className="page-content">
        <nav className="category-tabs" aria-label="Filter journal by topic">
          {categories.map((category) => <Link key={category} className={category === selected ? "category-tab category-tab-active" : "category-tab"} href={category === "All" ? "/blog" : "/blog?category=" + encodeURIComponent(category)}>{category}</Link>)}
        </nav>
        <div className="article-listing">{posts.map((post) => <ArticleCard key={post.id} article={toDemoArticle(post)} />)}</div>
        {posts.length === 0 && <p className="blog-empty">No published articles in this topic yet.</p>}
      </div>
    </div>
  );
}
