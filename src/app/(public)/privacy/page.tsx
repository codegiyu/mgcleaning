import { PageIntro } from "@/components/site-ui";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }];
export const metadata = buildPageMetadata({ title: "Privacy", description: "Privacy information for the M&G Cleaning Services website and request forms.", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="PRIVACY" title="Privacy matters." description="This page explains the information collected through the website request forms. It should be reviewed with MG&apos;s final legal and retention details before launch." />
      <article className="legal-page">
        <h2>Information in this demo</h2>
        <p>The contact form sends your name, phone number, optional email, topic, and message. The cleaning request form additionally sends your email address, preferred contact method, selected service, preferred date and time, space type, and service location. The M&amp;G Cleaning Services API saves submissions so the team can respond, confirm availability and pricing, and manage follow-up.</p>
        <h2>Use of request information</h2>
        <p>Request details are used to contact you about the cleaning service you asked about. They may be included in internal email notifications to M&amp;G Cleaning Services and in a confirmation email sent to the email address you provide. The final production policy should state the data controller, retention period, security measures, and how to request access or deletion.</p>
        <h2>Cookies and analytics</h2>
        <p>This demo does not intentionally set advertising or analytics cookies. Any future analytics or tracking must be disclosed and configured to match the approved privacy policy.</p>
      </article>
    </div>
  );
}
