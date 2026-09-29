import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArticleCard, ArrowRight } from "@/components/site-ui";
import { PlainArticleBody } from "@/components/plain-article-body";
import { formatArticleDate } from "@/content/demo-content";
import { getService } from "@/content/demo-content";
import { getPublishedBlogPost, getPublishedBlogPosts, toDemoArticle } from "@/lib/blog/public-blog";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd, buildPageMetadata, DEFAULT_OG_IMAGE, graphJsonLd } from "@/lib/seo/site-seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedBlogPost((await params).slug);
  if (!post) return { title: "Article not found" };
  const path = "/blog/" + post.slug;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return buildPageMetadata({ title, description, path, image: post.coverImageUrl || DEFAULT_OG_IMAGE, imageAlt: post.coverImageAlt || post.title, type: "article" });
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPublishedBlogPost((await params).slug);
  if (!post) notFound();
  const related = (await getPublishedBlogPosts()).filter((item) => item.slug !== post.slug).slice(0, 2);
  const publishedDate = post.publishedAt?.slice(0, 10) ?? post.updatedAt.slice(0, 10);
  const relatedService = getService(post.serviceSlug ?? "");
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "The M&G Journal", path: "/blog" }, { name: post.title, path: "/blog/" + post.slug }];
  const articleSchema = articleJsonLd({ slug: post.slug, title: post.title, description: post.excerpt, author: post.authorName, publishedAt: post.publishedAt ?? post.updatedAt, updatedAt: post.updatedAt, image: post.coverImageUrl || DEFAULT_OG_IMAGE });

  return (
    <article className="section-shell article-page">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs), articleSchema)} />
      <header className="article-head">
        <p className="eyebrow">{post.category.toUpperCase()} · M&amp;G JOURNAL</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className="article-byline"><span>{post.authorName}</span><span aria-hidden="true">·</span><time dateTime={publishedDate}>{formatArticleDate(publishedDate)}</time><span aria-hidden="true">·</span><span>{post.category}</span></div>
      </header>
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="article-cover-image" src={post.coverImageUrl} alt={post.coverImageAlt || post.title} />
      ) : (
        <div className="article-hero-art article-art-mint" aria-hidden="true"><span className="article-art-decoration"><span /><span /><span /></span><Image className="article-art-logo" src="/mg-cleaning-logo.svg" alt="" width={220} height={98} /></div>
      )}
      <PlainArticleBody body={post.body} />
      <div className="article-footer-cta"><p>{relatedService ? `Ready to talk about ${relatedService.title.toLowerCase()}?` : "Want to talk through your cleaning needs?"}</p><div className="article-cta-links"><Link className="text-link" href={relatedService ? "/services/" + relatedService.slug : "/services"}>Explore the service <ArrowRight /></Link><Link className="text-link" href={relatedService ? "/book?service=" + encodeURIComponent(relatedService.title) : "/book"}>Book this service <ArrowRight /></Link></div></div>
      {related.length > 0 && <section className="section"><div className="section-heading"><div><p className="eyebrow">KEEP EXPLORING</p><h2>More from the journal.</h2></div><Link className="text-link" href="/blog">All articles <ArrowRight /></Link></div><div className="article-grid">{related.map((item) => <ArticleCard key={item.id} article={toDemoArticle(item)} />)}</div></section>}
    </article>
  );
}
