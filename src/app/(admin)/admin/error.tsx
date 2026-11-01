"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Admin page error", error);
  }, [error]);

  return (
    <section className="admin-content">
      <header className="admin-page-heading"><div><h1>Something went wrong</h1><p>This page could not be shown. Your saved work is not affected.</p></div></header>
      <div className="admin-cover-actions">
        <button className="admin-primary-button" type="button" onClick={() => retry()}>Try again</button>
        <Link className="admin-secondary-button admin-link-button" href="/admin">Back to the overview</Link>
      </div>
    </section>
  );
}
