"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminActivityList } from "@/components/admin-activity-list";
import { AdminInquiryDetail } from "@/components/admin-inquiry-detail";
import { callApi } from "@/lib/api/callApi";
import type { AdminInquiry } from "@/lib/api/endpoints";

type RecordState = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; inquiry: AdminInquiry };

/** A shareable page for one inquiry: full details, editing, and its change history. */
export function AdminInquiryRecord({ id }: { id: string }) {
  const [state, setState] = useState<RecordState>({ kind: "loading" });
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_INQUIRY", { pathParams: { id } }).then((result) => {
      if (!active) return;
      setState(result.type === "error" ? { kind: "error", message: result.message } : { kind: "ready", inquiry: result.data });
    });
    return () => { active = false; };
  }, [id]);

  return (
    <section className="admin-content">
      <header className="admin-page-heading">
        <div>
          <h1>{state.kind === "ready" ? state.inquiry.name : "Inquiry"}</h1>
          <p><Link href="/admin/inquiries">All inquiries</Link><span aria-hidden="true"> / </span>{state.kind === "ready" ? state.inquiry.publicReference : "Details"}</p>
        </div>
      </header>
      {state.kind === "loading" && <p className="admin-inline-state">Loading inquiry…</p>}
      {state.kind === "error" && (
        <>
          <p className="admin-error" role="alert">{state.message}</p>
          <Link className="admin-text-link" href="/admin/inquiries">Back to inquiries →</Link>
        </>
      )}
      {state.kind === "ready" && (
        <div className="admin-record-grid">
          <section className="admin-inquiry-detail" aria-label="Inquiry details">
            <AdminInquiryDetail
              key={state.inquiry.id}
              inquiry={state.inquiry}
              onSaved={(updated) => {
                setState({ kind: "ready", inquiry: updated });
                setHistoryVersion((version) => version + 1);
              }}
            />
          </section>
          <section className="admin-record-history" aria-label="Inquiry history">
            <h2>History</h2>
            <AdminActivityList entityType="inquiry" entityId={state.inquiry.id} refreshKey={historyVersion} emptyMessage="No changes yet. Status and note updates appear here." />
          </section>
        </div>
      )}
    </section>
  );
}
