import Image from "next/image";
import Link from "next/link";
import { ArticleCard, ArrowRight, ArrowUpRight, CTASection, ServiceCard } from "@/components/site-ui";
import { DemoDisclosure, TestimonialPlaceholder, TrustProofCard } from "@/components/trust-ui";
import { articles, services } from "@/content/demo-content";
import { getPublicFaqs, getPublicTestimonials } from "@/content/trust-content";
import { getPublishedBlogPosts, toDemoArticle } from "@/lib/blog/public-blog";
import { buildPageMetadata } from "@/lib/seo/site-seo";

export const metadata = buildPageMetadata({
  title: "M&G Cleaning Service | Deep clean. Fresh feel.",
  description: "Cleaning and upholstery care shaped around your space. Submit a request and MG Cleaning will follow up to confirm availability and pricing.",
  path: "/",
});

export default async function HomePage() {
  const publishedPosts = await getPublishedBlogPosts();
  const featuredArticles = publishedPosts.length ? publishedPosts.slice(0, 3).map(toDemoArticle) : articles;
  return (
    <>
      <section className="home-hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">M&amp;G CLEANING SERVICE · UPHOLSTERY SPECIALISTS</p>
          <h1>Deep clean.<br /><em>Fresh feel.</em></h1>
          <p className="hero-lede">Upholstery cleaning for sofas, chairs, mattresses, and more. Because your comfort matters.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/book">Request a cleaning <ArrowUpRight /></Link>
            <Link className="button button-outline" href="/services">Explore services <ArrowRight /></Link>
          </div>
          <div className="hero-meta"><span className="status-dot" aria-hidden="true" />Clear scope · Thoughtful preparation · Follow-up after your request</div>
          <p className="hero-response">We respond within one business day.</p>
        </div>
        <div className="hero-visual">
          <div className="hero-art-wrap"><Image src="/images/generated/hero-upholstery.png" alt="Cleaner refreshing a bright cream sofa" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="hero-side-label">BECAUSE YOUR COMFORT MATTERS</div>
          <div className="hero-note"><span className="hero-note-top"><i>✳</i> UPHOLSTERY CLEANING</span><strong>Sit back and relax.</strong><small>We&apos;ll handle the rest. That&apos;s the M&amp;G promise.</small></div>
        </div>
      </section>
      <div className="trust-strip"><div className="section-shell trust-strip-inner"><span className="trust-label">The M&amp;G approach</span><div className="trust-items"><span className="trust-pill"><span>✦</span> Clear scope</span><span className="trust-pill"><span>✦</span> Thoughtful preparation</span><span className="trust-pill"><span>✦</span> Detailed cleaning</span><span className="trust-pill"><span>♡</span> Follow-up after your request</span></div></div></div>
      <section className="section section-shell trust-evidence-section">
        <div className="section-heading"><div><p className="eyebrow">TRUST, BUILT CAREFULLY</p><h2>Proof should be<br />earned and clear.</h2></div><div><p>This preview shows where authentic customer feedback, project media, and verified business details will live. Generated demo material is identified openly while MG Cleaning gathers launch-ready evidence.</p><Link className="text-link" href="/gallery">See the demo gallery <ArrowRight /></Link></div></div>
        <DemoDisclosure>Generated images and sample testimonial cards are for design review only · They are not customer proof.</DemoDisclosure>
        <div className="trust-proof-grid">
          <TrustProofCard eyebrow="GOOGLE PROFILE" title="A verified profile link belongs here." description="The live Google Business Profile URL and any review references will be added only after MG Cleaning confirms them." />
          <TrustProofCard eyebrow="SERVICE AREA" title="Abuja coverage should be confirmed." description="Abuja is the current coverage candidate. Tell us your area and the team will confirm availability rather than publishing an unapproved promise." href="/areas" linkLabel="Check service areas" />
          <TrustProofCard eyebrow="FREQUENTLY ASKED" title="Clear answers before you request." description="The FAQ explains the current request flow without inventing hours, pricing, guarantees, or cancellation policies." href="/faq" linkLabel="Read the FAQs" />
        </div>
        <div className="testimonial-preview">
          <div className="testimonial-preview-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h3>Real words will go here.</h3></div><p>These cards are deliberately placeholders until customers give MG Cleaning permission to publish authentic feedback.</p></div>
          <div className="testimonial-grid">{getPublicTestimonials().map((testimonial) => <TestimonialPlaceholder key={testimonial.id} testimonial={testimonial} />)}</div>
        </div>
        <div className="faq-preview">
          <div className="faq-preview-heading"><div><p className="eyebrow">QUICK ANSWERS</p><h3>Before you send a request.</h3></div><Link className="text-link" href="/faq">All FAQs <ArrowRight /></Link></div>
          <div className="faq-preview-grid">{getPublicFaqs().slice(0, 3).map((faq) => <div className="faq-preview-item" key={faq.id}><strong>{faq.question}</strong><p>{faq.answer}</p></div>)}</div>
        </div>
      </section>
      <section className="section section-shell">
        <div className="section-heading"><div><p className="eyebrow">UPHOLSTERY CLEANING</p><h2>Because your comfort<br />matters.</h2></div><div><p>Deep vacuuming, stain and spot treatment, odor elimination, deodorizing, and sanitizing — for sofas, chairs, mattresses, and more.</p><Link className="text-link" href="/services/upholstery-cleaning">Explore upholstery cleaning <ArrowRight /></Link></div></div>
        <div className="service-grid">{[services[3], services[4], services[0]].map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}</div>
      </section>
      <section className="section section-shell" style={{ paddingTop: 0 }}>
        <div className="approach-band"><div className="approach-visual"><Image src="/images/generated/promise-upholstery.png" alt="Cleaner carefully refreshing a cream sofa" fill sizes="(max-width: 760px) 100vw, 50vw" /></div><div className="approach-copy"><p className="eyebrow">THE M&amp;G PROMISE</p><h2>Sit back and relax.</h2><p>We&apos;ll handle the rest. Deep cleaning care for your upholstery, because your comfort matters.</p><Link className="text-link" href="/about">Get to know our approach <ArrowRight /></Link></div></div>
      </section>
      <section className="section journal-section"><div className="section-shell">
        <div className="section-heading"><div><p className="eyebrow">THE M&amp;G JOURNAL · DEMO</p><h2>Small ideas for<br />a fresher space.</h2></div><p>Practical notes on upholstery care, home routines, hosting, and shared spaces.</p></div>
        <div className="article-grid">{featuredArticles.map((article) => <ArticleCard key={article.slug} article={article} />)}</div>
        <div style={{ marginTop: 25 }}><Link className="text-link" href="/blog">Visit the journal <ArrowRight /></Link></div>
      </div></section>
      <section className="section section-shell" style={{ paddingTop: 70 }}><CTASection /></section>
    </>
  );
}
