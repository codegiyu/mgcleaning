import { PageIntro } from "@/components/site-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Request terms", path: "/terms" }];
export const metadata = buildPageMetadata({ title: "Request terms", description: "Request and appointment information for the M&G Cleaning Services website.", path: "/terms" });

export default function TermsPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="REQUEST INFORMATION" title="A clear starting point." description="Submitting a cleaning request starts a conversation with MG; it does not automatically reserve a visit." />
      <article className="legal-page">
        <h2>Cleaning requests</h2>
        <p>Submitting the request form sends your cleaning needs, preferred timing, and contact details to M&amp;G Cleaning Services. The team will contact you to confirm availability and pricing. We respond within one business day.</p>
        <h2>Not an appointment confirmation</h2>
        <p>A request reference confirms that your request was received. It does not mean that a date, time, price, or cleaning visit has been confirmed. The request becomes a booking only after MG and the customer agree those details by phone or WhatsApp.</p>
      </article>
    </div>
  );
}
