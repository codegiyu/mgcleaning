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
    default: "M&G Cleaning Service | Deep clean. Fresh feel.",
    template: "%s | M&G Cleaning Service",
  },
  description: "Upholstery cleaning for sofas, chairs, mattresses, and more. Because your comfort matters.",
  icons: {
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  robots: process.env.NEXT_PUBLIC_CONTENT_MODE === "production" ? undefined : { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    siteName: "M&G Cleaning Service",
    title: "M&G Cleaning Service | Deep clean. Fresh feel.",
    description: "Upholstery cleaning for sofas, chairs, mattresses, and more.",
    url: absoluteUrl("/"),
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: DEFAULT_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "M&G Cleaning Service | Deep clean. Fresh feel.",
    description: "Upholstery cleaning for sofas, chairs, mattresses, and more.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
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
