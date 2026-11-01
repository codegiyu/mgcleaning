"use client";

import { useEffect } from "react";
import { demoSite } from "@/content/demo-content";

/**
 * Last-resort page when the root layout itself fails. It replaces the whole document, so
 * it carries its own minimal styling and the contact routes that work without this site.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Root layout error", error);
  }, [error]);

  const link = { color: "#081f49", fontWeight: 700 } as const;
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#ffffff", color: "#1b2b49" }}>
        <title>Something went wrong | M&amp;G Cleaning Services</title>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ color: "#9a7800", fontSize: 12, fontWeight: 800, letterSpacing: ".18em" }}>M&amp;G CLEANING SERVICES</p>
          <h1 style={{ margin: "12px 0", fontSize: 34, lineHeight: 1.1 }}>The site is having trouble right now.</h1>
          <p style={{ color: "#68748a", lineHeight: 1.7 }}>
            Please try again in a moment. To request a cleaning straight away, <a style={link} href={demoSite.whatsappUrl}>message us on WhatsApp</a> or call <a style={link} href={demoSite.phoneUrl}>{demoSite.phoneNumber}</a>.
          </p>
          <button type="button" onClick={() => retry()} style={{ marginTop: 16, border: 0, borderRadius: 99, background: "#081f49", color: "#ffffff", padding: "13px 22px", fontWeight: 800, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
