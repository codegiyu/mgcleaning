import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PageCTA, PageIntro } from "@/components/site-ui";
import { ReviewCard } from "@/components/review-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedReviews } from "@/lib/reviews/public-reviews";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Reviews", path: "/reviews" }];

/** An empty reviews page is kept out of search results until the first review is published. */
export async function generateMetadata(): Promise<Metadata> {
  const reviews = await getPublishedReviews();
  return buildPageMetadata({
    title: "Customer reviews",
    description: "Reviews from M&G Cleaning Services customers about homes, offices, upholstery, and specialist cleaning, published with their permission.",
    path: "/reviews",
    noIndex: reviews.length === 0,
  });
}

// Reviews are plain HTML: no Review or AggregateRating structured data, because search
// engines treat a business's own reviews of itself as self-serving.
export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro
        eyebrow="CUSTOMER REVIEWS"
        title="What our clients say."
        description="Reviews shared with M&G Cleaning Services by customers, published with their permission."
      />
      <section className="section-flush reviews-page" aria-label="Customer reviews">
        {reviews.length ? (
          <ul className="review-grid">{reviews.map((review) => <ReviewCard key={review.id} review={review} element="li" />)}</ul>
        ) : (
          <div className="empty-trust-state">
            <h2 className="subsection-title">Reviews are on their way.</h2>
            <p>Customer reviews will appear here once they have been shared with us and approved for publication.</p>
            <Link className="text-link" href="/about">See how we work <ArrowRight /></Link>
          </div>
        )}
      </section>
      <PageCTA />
    </div>
  );
}
