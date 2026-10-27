import type { Metadata } from "next";
import { PageIntro } from "@/components/site-ui";
import { ContactForm } from "@/components/contact-form";
import { ContactBlock, ContactChannels } from "@/components/contact-channels";
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
      <div className="contact-layout">
        <aside className="contact-aside">
          <h2 className="panel-title">Prefer to talk directly?</h2>
          <p>Use this page for questions and conversations. When you are ready to request a cleaning visit, use the dedicated booking form.</p>
          <ContactChannels channels={["instagram", "phone", "email", "hours"]}>
            <ContactBlock label="Brand promise" note="Your space. Your needs. Our expertise.">Professional cleaning. Thoughtfully done.</ContactBlock>
          </ContactChannels>
        </aside>
        <ContactForm />
      </div>
    </div>
  );
}
