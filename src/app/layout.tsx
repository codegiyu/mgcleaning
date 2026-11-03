import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { JsonLd } from "@/components/seo/json-ld";
import { contentMode } from "@/content/trust-content";
import { absoluteUrl, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, getSiteUrl, graphJsonLd, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo/site-seo";
import "./globals.css";

/** UI, body, page titles, and card titles. See docs/typography.md for the role map. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Display serif for section titles and accent italics; self-hosted so every device renders the same face. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "M&G Cleaning Services | Professional cleaning solutions",
    template: "%s | M&G Cleaning Services",
  },
  description: "Personalized professional cleaning solutions for homes, offices, short lets, upholstery, specialist surfaces, and post-construction spaces.",
  icons: {
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  robots: process.env.NEXT_PUBLIC_CONTENT_MODE === "production" ? undefined : { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: "M&G Cleaning Services",
    title: "M&G Cleaning Services | Professional cleaning solutions",
    description: "Professional cleaning, thoughtfully planned around your space, needs, and standards.",
    url: absoluteUrl("/"),
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: DEFAULT_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "M&G Cleaning Services | Professional cleaning solutions",
    description: "Professional cleaning, thoughtfully planned around your space, needs, and standards.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const globalStructuredData = contentMode === "production" ? graphJsonLd(websiteJsonLd(), localBusinessJsonLd()) : null;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Progress bar for in-app link navigation; brand yellow, matching --yellow in globals.css. */}
        <NextTopLoader color="#f2c400" height={3} showSpinner={false} shadow="0 0 10px #f2c400,0 0 5px #f2c400" />
        <JsonLd data={globalStructuredData} />{children}
      </body>
    </html>
  );
}
