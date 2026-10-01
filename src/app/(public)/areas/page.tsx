import Link from "next/link";
import { ArrowRight, CTASection, PageIntro } from "@/components/site-ui";
import { TrustFactList } from "@/components/trust-ui";
import { contentMode, getPublicTrustFacts } from "@/content/trust-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Service areas", path: "/areas" }];
export const metadata = buildPageMetadata({ title: "Service areas", description: "Ask M&G Cleaning Services to confirm service availability for your area.", path: "/areas" });

export default function AreasPage() {
  const facts = getPublicTrustFacts().filter((fact) => fact.kind === "service-area");
  const hasApprovedArea = contentMode === "production" && facts.some((fact) => fact.status === "approved" && fact.value);

  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro
        eyebrow="SERVICE AVAILABILITY"
        title="Let’s confirm your area."
        description="Share your location and the service you need. Our team will confirm availability for your area before the visit is arranged."
      />
      <section className="area-availability-card">
        <div className="area-availability-icon" aria-hidden="true">⌖</div>
        <div>
          <p className="eyebrow">{hasApprovedArea ? "CONFIRMED COVERAGE" : "COVERAGE TO BE CONFIRMED"}</p>
          <h2>{hasApprovedArea ? "Check the confirmed service region." : "Tell us where you are."}</h2>
          <p>{hasApprovedArea ? "The current service-area details are shown below. Submit a request so M&G Cleaning Services can confirm the specific address and timing." : "Share your location with us and the team will confirm whether your address is within the current service area."}</p>
          {hasApprovedArea ? <TrustFactList facts={facts} /> : null}
          <Link className="button button-dark" href="/book">Request coverage confirmation <ArrowRight /></Link>
        </div>
      </section>
      <section className="area-notes">
        <div><strong>What to include</strong><p>Your area or neighborhood, the type of space, and the service you would like to discuss.</p></div>
        <div><strong>What happens next</strong><p>M&amp;G Cleaning Services will follow up through your preferred contact method and confirm availability and pricing.</p></div>
        <div><strong>Response expectation</strong><p>The current request flow aims to respond within one business day.</p></div>
      </section>
      <section className="trust-next-step">
        <div><p className="eyebrow">NEED A QUICK ANSWER?</p><h2>Read the request FAQs.</h2></div>
        <Link className="text-link" href="/faq">View FAQs <ArrowRight /></Link>
      </section>
      <section className="section" style={{ paddingTop: 0 }}><CTASection compact /></section>
    </div>
  );
}
