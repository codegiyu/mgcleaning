import Link from "next/link";
import { ArrowRight, CTASection, PageIntro } from "@/components/site-ui";
import { getPublicFaqs } from "@/content/trust-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, faqJsonLd, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "FAQs", path: "/faq" }];
export const metadata = buildPageMetadata({ title: "Frequently asked questions", description: "Answers about the M&G Cleaning Services request process, availability, and follow-up.", path: "/faq" });

export default function FaqPage() {
  const faqs = getPublicFaqs();

  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs), faqJsonLd(faqs))} />
      <PageIntro
        eyebrow="QUESTIONS, CLEARER"
        title="Start with the details that matter."
        description="The request process is designed to make scope, availability, and pricing clear before a visit is confirmed."
      />
      <section className="faq-list" aria-label="Frequently asked questions">
        {faqs.length ? faqs.map((faq) => (
          <details className="faq-item" key={faq.id} open={faq.id === "faq-request"}>
            <summary>{faq.question}<span aria-hidden="true">+</span></summary>
            <p>{faq.answer}</p>
          </details>
        )) : (
          <div className="empty-trust-state">
            <h2>FAQs are being prepared.</h2>
            <p>M&amp;G Cleaning Services will publish answers here after the service details have been confirmed.</p>
          </div>
        )}
      </section>
      <section className="trust-next-step">
        <div><p className="eyebrow">STILL UNSURE?</p><h2>Tell us what your space needs.</h2></div>
        <Link className="text-link" href="/book">Start a cleaning request <ArrowRight /></Link>
      </section>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
