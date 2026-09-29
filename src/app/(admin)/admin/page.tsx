"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { callApi } from "@/lib/api/callApi";
import type { AllEndpoints } from "@/lib/api/endpoints";

type Overview = AllEndpoints["GET_ADMIN_OVERVIEW"]["response"];

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_OVERVIEW").then((result) => {
      if (!active) return;
      if (result.type === "error") setError(result.message);
      else setOverview(result.data);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="admin-content">
      <header className="admin-page-heading"><div><h1>Overview</h1><p>A quick look at enquiries and the journal.</p></div></header>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-summary-grid">
        <Link className="admin-summary" href="/admin/inquiries"><span>New enquiries</span><strong>{overview?.inquiryCounts.new ?? "—"}</strong><small>Open the inquiry inbox</small></Link>
        <Link className="admin-summary" href="/admin/inquiries"><span>All enquiries</span><strong>{overview?.inquiryCounts.total ?? "—"}</strong><small>Review and follow up</small></Link>
        <Link className="admin-summary" href="/admin/blog?status=draft"><span>Draft articles</span><strong>{overview?.postCounts.draft ?? "—"}</strong><small>Continue writing</small></Link>
        <Link className="admin-summary" href="/admin/blog?status=published"><span>Published articles</span><strong>{overview?.postCounts.published ?? "—"}</strong><small>Manage the journal</small></Link>
        <Link className="admin-summary" href="/admin/inquiries"><span>Email failures</span><strong>{overview?.emailOutboxCounts ? overview.emailOutboxCounts.failed + overview.emailOutboxCounts.deadLetter : "—"}</strong><small>Check request notifications</small></Link>
      </div>
      <div className="admin-overview-links">
        <div><h2>Customer follow-up</h2><p>Review new enquiries, add private notes, and update their progress.</p><Link className="admin-text-link" href="/admin/inquiries">Go to inquiries →</Link></div>
        <div><h2>Publish useful articles</h2><p>Save a draft, then share its article link in an Instagram post.</p><Link className="admin-text-link" href="/admin/blog/new">Write an article →</Link></div>
      </div>
    </section>
  );
}
