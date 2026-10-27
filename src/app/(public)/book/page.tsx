import type { Metadata } from "next";
import { PageIntro } from "@/components/site-ui";
import { BookingForm } from "@/components/booking-form";
import { ContactChannels } from "@/components/contact-channels";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, graphJsonLd } from "@/lib/seo/site-seo";

type Props = { searchParams: Promise<{ service?: string }> };

const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Request a cleaning", path: "/book" }];
export const metadata: Metadata = buildPageMetadata({ title: "Request a cleaning", description: "Submit a cleaning request and M&G Cleaning Services will contact you to confirm availability and pricing.", path: "/book" });

export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="section-shell">
      <Breadcrumbs items={breadcrumbs} />
      <JsonLd data={graphJsonLd(breadcrumbJsonLd(breadcrumbs))} />
      <PageIntro eyebrow="REQUEST A CLEANING" title="Let&apos;s plan a fresher space." description="Submit a cleaning request and our team will contact you to confirm availability and pricing. We respond within one business day." />
      <div className="contact-layout">
        <aside className="contact-aside">
          <h2 className="panel-title">This is a request, not a confirmed appointment.</h2>
          <p>Tell us what needs attention and we&apos;ll follow up by phone or WhatsApp to confirm the details, availability, and pricing.</p>
          <ContactChannels channels={["instagram", "phone"]} />
        </aside>
        <BookingForm initialService={params.service ?? ""} />
      </div>
    </div>
  );
}
