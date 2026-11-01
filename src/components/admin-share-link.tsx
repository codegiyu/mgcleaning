"use client";

import { useState } from "react";
import { instagramArticleLink } from "@/lib/attribution/share-link";

/** Copyable, campaign-tagged article URL for Instagram, shown once an article is live. */
export function AdminShareLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const link = typeof window === "undefined" ? "" : instagramArticleLink(window.location.origin, slug);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <div className="admin-field admin-share-link">
      <span>Instagram link</span>
      <input readOnly value={link} onFocus={(event) => event.currentTarget.select()} aria-label="Instagram article link" />
      <div className="admin-cover-actions">
        <button className="admin-secondary-button" type="button" onClick={() => void copy()} disabled={!link}>Copy link</button>
        {copied === "copied" && <span className="admin-success" role="status">Copied</span>}
        {copied === "failed" && <span className="admin-error" role="alert">Copy failed. Select the link and copy it.</span>}
      </div>
      <small className="admin-field-help">Use this in the post or link hub so enquiries show which post they came from.</small>
    </div>
  );
}
