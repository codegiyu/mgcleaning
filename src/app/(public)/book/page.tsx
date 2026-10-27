import type { Metadata } from "next";
import { PageIntro } from "@/components/site-ui";
import { BookingForm } from "@/components/booking-form";
import { RequestChannels } from "@/components/contact-channels";
import { services } from "@/content/demo-content";
import { messageResponseExpectation } from "@/content/response-expectation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

type Props = { searchParams: Promise<{ service?: string }> };

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Request a cleaning", path: "/book" }];
export const metadata: Metadata = buildPageMetadata({ title: "Request a cleaning", description: "Message M&G Cleaning Services on WhatsApp or Instagram, call, or send the request form to plan a cleaning.", path: "/book" });

export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  // Only a known service title reaches the prefilled WhatsApp message.
  const service = services.find((item) => item.title === params.service)?.title;
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="REQUEST A CLEANING" title="Let&apos;s plan a fresher space." description={`The quickest way is a message: WhatsApp us, send an Instagram DM, or call, and tell us what needs cleaning. ${messageResponseExpectation}.`} />
      <div className="contact-layout">
        <aside className="contact-aside">
          <h2 className="panel-title">Message us to request a cleaning.</h2>
          <p>No form needed. Tell us what needs cleaning, where, and when suits you, and our customer experience team will take it from there.</p>
          <RequestChannels service={service} />
          <p className="request-note">A request is not a confirmed appointment. We confirm the details, availability, and pricing with you first.</p>
        </aside>
        <BookingForm initialService={service ?? ""} />
      </div>
    </div>
  );
}
