import Image from "next/image";
import Link from "next/link";
import { ArticleCard, ArrowRight, ArrowUpRight, CTASection, InfoCard, SectionHeading, sequenceLabel, ServiceCard } from "@/components/site-ui";
import { RequestChannels } from "@/components/contact-channels";
import { articles, services, whyMgReasons } from "@/content/demo-content";
import { messageResponseExpectation } from "@/content/response-expectation";
import { getPublicFaqs } from "@/content/trust-content";
import { getPublishedBlogPosts, toDemoArticle } from "@/lib/blog/public-blog";
import { ReviewCard } from "@/components/review-card";
import { getPublishedReviews } from "@/lib/reviews/public-reviews";
import { homeReviews } from "@/lib/reviews/review-data";
import { buildPageMetadata } from "@/lib/seo/site-seo";

export const metadata = buildPageMetadata({
  title: "Professional cleaning solutions",
  description: "Personalized professional cleaning for homes, offices, short lets, upholstery, specialist surfaces, and post-construction spaces.",
  path: "/",
});

export default async function HomePage() {
  const [publishedPosts, reviews] = await Promise.all([getPublishedBlogPosts(), getPublishedReviews()]);
  const shownReviews = homeReviews(reviews);
  const featuredArticles = publishedPosts.length ? publishedPosts.slice(0, 3).map(toDemoArticle) : articles;
  const featuredServices = ["retainer-cleaning", "fumigation", "tile-polishing"].flatMap((slug) => {
    const service = services.find((item) => item.slug === slug);
    return service ? [service] : [];
  });
  return (
    <>
      <section className="home-hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">M&amp;G CLEANING SERVICES · PROFESSIONAL CLEANING SOLUTIONS</p>
          <h1>Professional cleaning.<br /><em>Thoughtfully done.</em></h1>
          <p className="hero-lede">From homes and offices to upholstery and post-construction spaces, we deliver personalized cleaning solutions designed around your space, your needs, and your standards.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/book">Request a cleaning <ArrowUpRight /></Link>
            <Link className="button button-outline" href="/services">Explore services <ArrowRight /></Link>
          </div>
          <div className="hero-meta"><span className="status-dot" aria-hidden="true" />Personalized service · Professional team · Attention to detail</div>
          <p className="hero-response">{messageResponseExpectation}.</p>
        </div>
        <div className="hero-visual">
          <div className="hero-art-wrap"><Image src="/images/generated/hero-professional-cleaning-v2.png" alt="M&G cleaning professional caring for a bright modern space" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="hero-side-label">YOUR SPACE. YOUR NEEDS. OUR EXPERTISE.</div>
          <div className="hero-note"><span className="hero-note-top"><i>✳</i> TAILORED CLEANING</span><strong>The right solution for your space.</strong><small>We assess your needs, agree the scope, and deliver with care.</small></div>
        </div>
      </section>
      <div className="trust-strip"><div className="section-shell trust-strip-inner"><span className="trust-label">The M&amp;G experience</span><div className="trust-items"><span className="trust-pill"><span>✦</span> Personalized service</span><span className="trust-pill"><span>✦</span> Professional team</span><span className="trust-pill"><span>✦</span> Attention to detail</span><span className="trust-pill"><span>♡</span> 24-hour follow-up</span></div></div></div>
      <section className="section section-shell why-mg-section">
        <SectionHeading eyebrow="WHY M&G" title={<>A professional service,<br />built around you.</>} description="We combine clear communication, thoughtful planning, and careful execution to deliver a cleaning experience tailored to each space." />
        <div className="why-mg-grid">{whyMgReasons.map((reason, index) => <InfoCard key={reason.title} variant="panel" label={sequenceLabel(index)} title={reason.title}>{reason.description}</InfoCard>)}</div>
      </section>
      <section className="section section-shell trust-evidence-section">
        <SectionHeading
          eyebrow="CLEAR FROM THE START"
          title={<>A thoughtful service,<br />from request to follow-up.</>}
          description="We keep the process straightforward: understand your priorities, agree the scope, deliver with care, and check in after the service."
          action={{ href: "/about", label: "See how we work" }}
        />
        <div className="trust-proof-grid">
          <InfoCard label="PERSONALIZED SERVICE" title="Tell us what matters most.">We listen to your priorities and understand the space before recommending the right cleaning approach.</InfoCard>
          <InfoCard label="CLEAR SCOPE" title="Know what to expect." href="/services" linkLabel="Explore services">The service scope, availability, and pricing are confirmed with you before the team gets to work.</InfoCard>
          <InfoCard label="24-HOUR FOLLOW-UP" title="Care continues after the clean." href="/faq" linkLabel="Read the FAQs">We check in within 24 hours of your service to make sure you are satisfied with the result.</InfoCard>
        </div>
        <div className="faq-preview">
          <SectionHeading as="h3" size="subsection" eyebrow="QUICK ANSWERS" title="Before you send a request." action={{ href: "/faq", label: "All FAQs" }} />
          <div className="faq-preview-grid">{getPublicFaqs().slice(0, 3).map((faq) => <InfoCard key={faq.id} element="div" titleAs="h4" title={faq.question}>{faq.answer}</InfoCard>)}</div>
          <RequestChannels variant="inline" />
        </div>
      </section>
      {shownReviews.length > 0 && (
        <section className="section section-shell section-flush">
          <SectionHeading
            eyebrow="WHAT CLIENTS SAY"
            title="In their own words."
            description="Reviews shared by M&G Cleaning Services customers, published with their permission."
            action={reviews.length > shownReviews.length ? { href: "/reviews", label: `Read all ${reviews.length} reviews` } : { href: "/reviews", label: "See all reviews" }}
          />
          <ul className="review-grid">{shownReviews.map((review) => <ReviewCard key={review.id} review={review} element="li" />)}</ul>
        </section>
      )}
      <section className="section section-shell">
        <SectionHeading
          eyebrow="PROFESSIONAL CLEANING SOLUTIONS"
          title={<>A service for<br />every space.</>}
          description="Choose from ongoing cleaning plans and focused specialist care, all shaped around the result your space needs."
          action={{ href: "/services", label: "Explore all services" }}
        />
        <div className="service-grid">{featuredServices.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}</div>
      </section>
      <section className="section section-shell section-flush">
        <div className="approach-band">
          <div className="approach-visual"><Image src="/images/generated/about-consultation-v2.png" alt="M&G cleaning professional assessing a client&apos;s space" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <SectionHeading
            className="approach-copy"
            layout="stacked"
            eyebrow="THE M&G APPROACH"
            title="Good work starts with listening."
            description="Tell us what you need. We'll assess the space, recommend the right solution, agree the scope, deliver, and follow up within 24 hours."
            action={{ href: "/about", label: "See how we work" }}
          />
        </div>
      </section>
      <section className="section journal-section"><div className="section-shell">
        <SectionHeading
          eyebrow="THE M&G JOURNAL"
          title={<>Small ideas for<br />a fresher space.</>}
          description="Practical notes on home care, workspaces, hosting, specialist surfaces, and cleaning preparation."
          action={{ href: "/blog", label: "Visit the journal" }}
        />
        <div className="article-grid">{featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
      </div></section>
      <section className="section section-shell home-cta"><CTASection /></section>
    </>
  );
}
