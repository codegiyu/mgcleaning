import { SiteFooter, SiteHeader } from "@/components/site-ui";
import { ScrollRevealController } from "@/components/scroll-reveal-controller";
import { AttributionCapture } from "@/components/attribution-capture";
import { ChannelClickTracker } from "@/components/channel-click-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, graphJsonLd, organizationJsonLd, SITE_NAME, websiteJsonLd } from "@/lib/seo/site-seo";
import type { Metadata } from "next";

const SITE_DESCRIPTION = "Personalized professional cleaning solutions for homes, offices, short lets, upholstery, specialist surfaces, and post-construction spaces.";
const SHARE_DESCRIPTION = "Professional cleaning, thoughtfully planned around your space, needs, and standards.";

/** Defaults for public pages; each page replaces them through `buildPageMetadata`. */
export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Professional cleaning solutions`,
    description: SHARE_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Professional cleaning solutions`,
    description: SHARE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/** The site and the business it belongs to, on every public page (production builds only). */
const siteStructuredData = graphJsonLd(websiteJsonLd(), organizationJsonLd());

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={siteStructuredData} />
      <AttributionCapture />
      <ChannelClickTracker />
      <ScrollRevealController />
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </>
  );
}
