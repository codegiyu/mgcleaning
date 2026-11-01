import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, PageIntro, SiteFooter, SiteHeader } from "@/components/site-ui";
import { RequestChannels } from "@/components/contact-channels";

export const metadata: Metadata = { title: "Page not found" };

/** Unmatched URLs and notFound() calls. The root layout has no header, so this page adds it. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section-shell not-found-page">
        <PageIntro eyebrow="PAGE NOT FOUND" title="We couldn't find that page." description="The link may be old or mistyped. Here are the places most people are looking for." />
        <div className="hero-actions">
          <Link className="button button-dark" href="/">Back to the home page <ArrowRight /></Link>
          <Link className="button button-outline" href="/services">Explore services <ArrowRight /></Link>
          <Link className="button button-outline" href="/book">Request a cleaning <ArrowUpRight /></Link>
        </div>
        <RequestChannels variant="inline" />
      </main>
      <SiteFooter />
    </>
  );
}
