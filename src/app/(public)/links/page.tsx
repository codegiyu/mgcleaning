import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/site-ui";
import { DemoDisclosure } from "@/components/trust-ui";
import { contentMode } from "@/content/trust-content";
import { businessContactFacts } from "@/content/public-content";
import { buildPageMetadata } from "@/lib/seo/site-seo";

export const metadata = buildPageMetadata({ title: "MG Cleaning links", description: "Find MG Cleaning Service, request a cleaning, or message the team.", path: "/links", noIndex: true });

export default function LinksPage() {
  return (
    <div className="link-hub-page">
      <Link className="link-hub-logo" href="/" aria-label="M&G Cleaning Service home">
        <Image src="/mg-cleaning-logo.svg" alt="M&G Cleaning Service" width={305} height={136} />
      </Link>
      <p className="eyebrow">M&amp;G CLEANING SERVICE</p>
      <h1>Deep clean.<br /><em>Fresh feel.</em></h1>
      <p className="link-hub-lede">Cleaning conversations, service details, and a clear way to request help with your space.</p>
      {contentMode === "demo" ? <DemoDisclosure>Demo link hub · Contact channels shown here are confirmed; remaining business details are awaiting approval.</DemoDisclosure> : null}
      <nav className="link-hub-actions" aria-label="MG Cleaning quick links">
        <Link className="link-hub-primary" href="/book">Request a cleaning <ArrowUpRight /></Link>
        <a href={businessContactFacts.whatsapp.href} target="_blank" rel="noreferrer">Message on WhatsApp <ArrowUpRight /></a>
        <a href={businessContactFacts.phone.href}>Call {businessContactFacts.phone.value} <ArrowUpRight /></a>
        <Link href="/services">Explore services <ArrowUpRight /></Link>
        <Link href="/gallery">View the gallery <ArrowUpRight /></Link>
        <Link href="/faq">Read FAQs <ArrowUpRight /></Link>
        <Link href="/areas">Check service availability <ArrowUpRight /></Link>
        <a href={businessContactFacts.instagram.href} target="_blank" rel="noreferrer">Follow on Instagram <ArrowUpRight /></a>
      </nav>
      <p className="link-hub-footer">{businessContactFacts.responseExpectation.value}</p>
    </div>
  );
}
