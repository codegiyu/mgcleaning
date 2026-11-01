"use client";

import { useEffect } from "react";
import { PageIntro } from "@/components/site-ui";
import { demoSite } from "@/content/demo-content";

/** A public page failed to render. Offer a retry and the channels that never depend on this site. */
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Public page error", error);
  }, [error]);

  return (
    <div className="section-shell error-page">
      <PageIntro eyebrow="SOMETHING WENT WRONG" title="This page didn't load properly." description="Please try again. If you were about to request a cleaning, you can message us on WhatsApp or call instead." />
      <div className="hero-actions">
        <button className="button button-dark" type="button" onClick={() => retry()}>Try again</button>
        <a className="button button-outline" href={demoSite.whatsappUrl} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
        <a className="button button-outline" href={demoSite.phoneUrl}>Call {demoSite.phoneNumber}</a>
      </div>
    </div>
  );
}
