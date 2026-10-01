import type { Metadata } from "next";
import { PageIntro } from "@/components/site-ui";
import { ContactForm } from "@/components/contact-form";
import { DemoDisclosure } from "@/components/trust-ui";
import { contentMode } from "@/content/trust-content";
import { businessContactFacts } from "@/content/public-content";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }];
export const metadata: Metadata = buildPageMetadata({ title: "Contact", description: "Contact M&G Cleaning Services by phone, WhatsApp, Instagram, or the inquiry form.", path: "/contact" });

export default function ContactPage() {
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="YOUR SPACE · YOUR NEEDS · OUR EXPERTISE" title="Let’s talk about your space." description="Have a question, an existing booking to discuss, or a result you would like to achieve? Send a message and the M&G team will get back to you." />
      {contentMode === "demo" ? <DemoDisclosure>Phone, WhatsApp, and Instagram are confirmed contact channels. Official email, operating hours, and service-area details are still awaiting publication approval.</DemoDisclosure> : null}
      <div className="contact-layout">
        <aside className="contact-aside">
          <h2>Prefer to talk directly?</h2>
          <p>Use this page for questions and conversations. When you are ready to request a cleaning visit, use the dedicated booking form.</p>
          <div className="contact-info-block"><span>{businessContactFacts.instagram.label.toUpperCase()}</span><strong><a href={businessContactFacts.instagram.href} target="_blank" rel="noreferrer">{businessContactFacts.instagram.value}</a></strong><small>Follow the confirmed M&amp;G Cleaning Services profile</small></div>
          <div className="contact-info-block"><span>CALL OR WHATSAPP</span><strong><a href={businessContactFacts.phone.href}>{businessContactFacts.phone.value}</a><a href={businessContactFacts.whatsapp.href}>WhatsApp</a></strong><small>Call or message the team directly</small></div>
          <div className="contact-info-block"><span>{businessContactFacts.email.label.toUpperCase()}</span><strong>{businessContactFacts.email.value ?? "To be confirmed"}</strong><small>The official inbox will be added when M&amp;G Cleaning Services supplies it.</small></div>
          <div className="contact-info-block"><span>{businessContactFacts.operatingHours.label.toUpperCase()}</span><strong>{businessContactFacts.operatingHours.value ?? "To be confirmed"}</strong><small>{businessContactFacts.responseExpectation.value}</small></div>
          <div className="contact-info-block"><span>BRAND PROMISE</span><strong>Professional cleaning. Thoughtfully done.</strong><small>Your space. Your needs. Our expertise.</small></div>
        </aside>
        <ContactForm />
      </div>
    </div>
  );
}
