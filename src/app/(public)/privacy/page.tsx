import { PageIntro } from "@/components/site-ui";
import { businessContactFacts } from "@/content/public-content";
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
      <PageIntro eyebrow="PRIVACY" title="Privacy matters." description="This page explains the information collected through the website request forms and how it is used to respond to you." />
      <article className="legal-page">
        <h2>Information we collect</h2>
        <p>The contact form sends your name, phone number, optional email, topic, and message. The cleaning request form additionally sends your email address, preferred contact method, selected service, preferred date and time, space type, and service location. The M&amp;G Cleaning Services API saves submissions so the team can respond, confirm availability and pricing, and manage follow-up.</p>
        <h2>Use of request information</h2>
        <p>Request details are used to contact you about the cleaning service you asked about. They may be included in internal email notifications to M&amp;G Cleaning Services and in a confirmation email sent to the email address you provide.</p>
        <h2>How long we keep information</h2>
        <p>Requests and messages sent through this website, with any notes the team adds, are deleted automatically 24 months after they were sent. Copies of the related email notifications are cleared after 90 days. Anonymous counts of taps on our contact links are kept for 13 months.</p>
        <h2>Asking us to delete your details</h2>
        <p>You can ask M&amp;G Cleaning Services to delete the details you sent at any time by messaging us on <a href={businessContactFacts.whatsapp.href}>WhatsApp</a> or calling <a href={businessContactFacts.phone.href}>{businessContactFacts.phone.value}</a>. Please mention your request reference if you have it.</p>
        <h2>Cookies and analytics</h2>
        <p>The website does not set advertising or analytics cookies. To understand which posts and campaigns bring visitors, your browser tab keeps the campaign tags of the link you arrived from (for example, an Instagram post) until the tab is closed. Those tags are sent with a request form, and with an anonymous count when you tap a WhatsApp, Instagram, or call link. A tap count records only which link was tapped, the page it was on, and those campaign tags: no name, contact details, or IP address.</p>
        <p className="legal-meta">M&amp;G Cleaning Services is responsible for the information described on this page. Last updated 1 November 2026.</p>
      </article>
    </div>
  );
}
