import Image from "next/image";
import Link from "next/link";
import { ArticleCard, ArrowRight, ArrowUpRight, CTASection, ServiceCard } from "@/components/site-ui";
import { DemoDisclosure, TestimonialPlaceholder, TrustProofCard } from "@/components/trust-ui";
import { articles, services, whyMgReasons } from "@/content/demo-content";
import { getPublicFaqs, getPublicTestimonials } from "@/content/trust-content";
import { getPublishedBlogPosts, toDemoArticle } from "@/lib/blog/public-blog";
import { buildPageMetadata } from "@/lib/seo/site-seo";

export const metadata = buildPageMetadata({
  title: "Professional cleaning solutions",
  description: "Personalized professional cleaning for homes, offices, short lets, upholstery, specialist surfaces, and post-construction spaces.",
  path: "/",
});

export default async function HomePage() {
  const publishedPosts = await getPublishedBlogPosts();
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
          <p className="hero-response">We respond within one business day.</p>
        </div>
        <div className="hero-visual">
          <div className="hero-art-wrap"><Image src="/images/generated/hero-professional-cleaning-v2.png" alt="M&G cleaning professional caring for a bright modern space" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="hero-side-label">YOUR SPACE. YOUR NEEDS. OUR EXPERTISE.</div>
          <div className="hero-note"><span className="hero-note-top"><i>✳</i> TAILORED CLEANING</span><strong>The right solution for your space.</strong><small>We assess your needs, agree the scope, and deliver with care.</small></div>
        </div>
      </section>
      <div className="trust-strip"><div className="section-shell trust-strip-inner"><span className="trust-label">The M&amp;G experience</span><div className="trust-items"><span className="trust-pill"><span>✦</span> Personalized service</span><span className="trust-pill"><span>✦</span> Professional team</span><span className="trust-pill"><span>✦</span> Attention to detail</span><span className="trust-pill"><span>♡</span> 24-hour follow-up</span></div></div></div>
      <section className="section section-shell why-mg-section">
        <div className="section-heading"><div><p className="eyebrow">WHY M&amp;G</p><h2>A professional service,<br />built around you.</h2></div><p>We combine clear communication, thoughtful planning, and careful execution to deliver a cleaning experience tailored to each space.</p></div>
        <div className="why-mg-grid">{whyMgReasons.map((reason, index) => <article className="why-mg-card" key={reason.title}><span>0{index + 1}</span><h3>{reason.title}</h3><p>{reason.description}</p></article>)}</div>
      </section>
      <section className="section section-shell trust-evidence-section">
        <div className="section-heading"><div><p className="eyebrow">TRUST, BUILT CAREFULLY</p><h2>Proof should be<br />earned and clear.</h2></div><div><p>This preview shows where authentic customer feedback, project media, and verified business details will live. Generated demo material is identified openly while M&amp;G Cleaning Services gathers launch-ready evidence.</p><Link className="text-link" href="/gallery">See the demo gallery <ArrowRight /></Link></div></div>
        <DemoDisclosure>Generated images and sample testimonial cards are for design review only · They are not customer proof.</DemoDisclosure>
        <div className="trust-proof-grid">
          <TrustProofCard eyebrow="GOOGLE PROFILE" title="A verified profile link belongs here." description="The live Google Business Profile URL and any review references will be added only after M&G Cleaning Services confirms them." />
          <TrustProofCard eyebrow="SERVICE AREA" title="Abuja coverage should be confirmed." description="Abuja is the current coverage candidate. Tell us your area and the team will confirm availability rather than publishing an unapproved promise." href="/areas" linkLabel="Check service areas" />
          <TrustProofCard eyebrow="FREQUENTLY ASKED" title="Clear answers before you request." description="The FAQ explains the current request flow without inventing hours, pricing, guarantees, or cancellation policies." href="/faq" linkLabel="Read the FAQs" />
        </div>
        <div className="testimonial-preview">
          <div className="testimonial-preview-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h3>Real words will go here.</h3></div><p>These cards are deliberately placeholders until customers give M&amp;G Cleaning Services permission to publish authentic feedback.</p></div>
          <div className="testimonial-grid">{getPublicTestimonials().map((testimonial) => <TestimonialPlaceholder key={testimonial.id} testimonial={testimonial} />)}</div>
        </div>
        <div className="faq-preview">
          <div className="faq-preview-heading"><div><p className="eyebrow">QUICK ANSWERS</p><h3>Before you send a request.</h3></div><Link className="text-link" href="/faq">All FAQs <ArrowRight /></Link></div>
          <div className="faq-preview-grid">{getPublicFaqs().slice(0, 3).map((faq) => <div className="faq-preview-item" key={faq.id}><strong>{faq.question}</strong><p>{faq.answer}</p></div>)}</div>
        </div>
      </section>
      <section className="section section-shell">
        <div className="section-heading"><div><p className="eyebrow">PROFESSIONAL CLEANING SOLUTIONS</p><h2>A service for<br />every space.</h2></div><div><p>Choose from ongoing cleaning plans and focused specialist care, all shaped around the result your space needs.</p><Link className="text-link" href="/services">Explore all services <ArrowRight /></Link></div></div>
        <div className="service-grid">{featuredServices.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}</div>
      </section>
      <section className="section section-shell" style={{ paddingTop: 0 }}>
        <div className="approach-band"><div className="approach-visual"><Image src="/images/generated/about-consultation-v2.png" alt="M&G cleaning professional assessing a client&apos;s space" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="approach-copy"><p className="eyebrow">THE M&amp;G APPROACH</p><h2>Good work starts with listening.</h2><p>Tell us what you need. We&apos;ll assess the space, recommend the right solution, agree the scope, deliver, and follow up within 24 hours.</p><Link className="text-link" href="/about">See how we work <ArrowRight /></Link></div></div>
      </section>
      <section className="section journal-section"><div className="section-shell">
        <div className="section-heading"><div><p className="eyebrow">THE M&amp;G JOURNAL · DEMO</p><h2>Small ideas for<br />a fresher space.</h2></div><p>Practical notes on home care, workspaces, hosting, specialist surfaces, and cleaning preparation.</p></div>
        <div className="article-grid">{featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
        <div style={{ marginTop: 25 }}><Link className="text-link" href="/blog">Visit the journal <ArrowRight /></Link></div>
      </div></section>
      <section className="section section-shell" style={{ paddingTop: 70 }}><CTASection /></section>
    </>
  );
}
