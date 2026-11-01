import { services } from "@/content/demo-content";
import { ratingText } from "@/lib/admin/review-form";

export type ReviewCardData = {
  displayName: string;
  context: string | null;
  quote: string;
  rating: number | null;
  serviceSlug: string | null;
};

/**
 * One customer review, as plain text. Used on the public site and as the admin preview,
 * so editors see exactly what visitors will. Blank lines in the quote start a new paragraph.
 */
export function ReviewCard({ review, element: Element = "figure" }: { review: ReviewCardData; element?: "figure" | "li" }) {
  const service = review.serviceSlug ? services.find((item) => item.slug === review.serviceSlug)?.title : undefined;
  const rating = review.rating ? ratingText(review.rating) : null;
  const paragraphs = review.quote.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const content = (
    <>
      {rating && <p className="review-rating"><span aria-hidden="true">{rating.stars}</span><span className="sr-only">{rating.label}</span></p>}
      <blockquote className="review-quote">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</blockquote>
      <figcaption className="review-attribution">
        <strong>{review.displayName}</strong>
        {review.context && <span>{review.context}</span>}
        {service && <span>{service}</span>}
      </figcaption>
    </>
  );
  return Element === "li" ? <li className="review-card"><figure>{content}</figure></li> : <figure className="review-card">{content}</figure>;
}
