import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { contentMode } from "@/content/trust-content";
import { absoluteUrl, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, getSiteUrl, graphJsonLd, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo/site-seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><JsonLd data={globalStructuredData} />{children}</body>
    </html>
  );
}
