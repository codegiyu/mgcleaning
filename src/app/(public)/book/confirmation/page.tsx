import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/site-ui";
import { demoSite } from "@/content/demo-content";
import { buildPageMetadata } from "@/lib/seo/site-seo";

type Props = { searchParams: Promise<{ reference?: string }> };

export const metadata: Metadata = buildPageMetadata({ title: "Request received", description: "Your M&G Cleaning Services request has been received.", path: "/book/confirmation", noIndex: true });

export default async function BookingConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const reference = params.reference?.trim();

  return (
    <div className="section-shell">
      <PageIntro
        eyebrow="REQUEST RECEIVED"
        title="We&apos;ve got your cleaning request."
        description="Our team will contact you to confirm availability and pricing. We respond within one business day."
      />
      <section className="legal-page" aria-labelledby="confirmation-title">
        <h2 id="confirmation-title">What happens next?</h2>
        <p>
          This is not yet a confirmed appointment. The M&amp;G team will review the details you sent and follow up using your preferred contact method: phone or WhatsApp.
        </p>
        {reference ? (
          <p className="form-confirmation" role="status">
            Your request reference is <strong>{reference}</strong>. Keep it handy if you need to contact us.
          </p>
        ) : (
          <p className="form-confirmation" role="status">
            Your request was received. If you need to follow up, please contact us using the details below.
          </p>
        )}
        <h2>Need to reach us first?</h2>
        <p>
          Call <a href={demoSite.phoneUrl}>{demoSite.phoneNumber}</a> or message us on <a href={demoSite.whatsappUrl}>WhatsApp</a>.
        </p>
        <p><Link className="text-link" href="/">Return to the home page</Link></p>
      </section>
    </div>
  );
}
