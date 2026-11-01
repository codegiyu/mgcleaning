import Link from "next/link";
import { ArrowRight, InfoCard, PageCTA, PageIntro, SectionHeading } from "@/components/site-ui";
import { TrustFactList } from "@/components/trust-ui";
import { messageResponseExpectation } from "@/content/response-expectation";
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
          <SectionHeading
            layout="stacked"
            size="subsection"
            eyebrow={hasApprovedArea ? "CONFIRMED COVERAGE" : "COVERAGE TO BE CONFIRMED"}
            title={hasApprovedArea ? "Check the confirmed service region." : "Tell us where you are."}
            description={hasApprovedArea ? "The current service-area details are shown below. Message us or send a request so M&G Cleaning Services can confirm the specific address and timing." : "Share your location with us and the team will confirm whether your address is within the current service area."}
          />
          {hasApprovedArea ? <TrustFactList facts={facts} /> : null}
          <Link className="button button-dark" href="/book">Request coverage confirmation <ArrowRight /></Link>
        </div>
      </section>
      <section className="area-notes">
        <InfoCard element="div" title="What to include">Your area or neighborhood, the type of space, and the service you would like to discuss.</InfoCard>
        <InfoCard element="div" title="What happens next">M&amp;G Cleaning Services will follow up through your preferred contact method and confirm availability and pricing.</InfoCard>
        <InfoCard element="div" title="Response expectation">Message us on WhatsApp or Instagram, or call, with your area. {messageResponseExpectation}.</InfoCard>
      </section>
      <section className="next-step">
        <SectionHeading divider size="subsection" eyebrow="NEED A QUICK ANSWER?" title="Read the request FAQs." action={{ href: "/faq", label: "View FAQs" }} />
      </section>
      <PageCTA />
    </div>
  );
}
