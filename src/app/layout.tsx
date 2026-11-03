import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { getSiteUrl } from "@/lib/seo/site-seo";
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

/**
 * Settings every page shares. The public site's description, share cards, canonical URL,
 * and structured data live in `(public)/layout.tsx`, so admin, sign-in, and 404 pages
 * never inherit marketing metadata that does not describe them.
 */
export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "M&G Cleaning Services | Professional cleaning solutions",
    template: "%s | M&G Cleaning Services",
  },
  icons: {
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  robots: process.env.NEXT_PUBLIC_CONTENT_MODE === "production" ? undefined : { index: false, follow: false },
};

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
        {children}
      </body>
    </html>
  );
}
