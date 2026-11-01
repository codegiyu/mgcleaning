"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminActivityList } from "@/components/admin-activity-list";
import { AdminInquiryDetail } from "@/components/admin-inquiry-detail";
import { callApi } from "@/lib/api/callApi";
import type { AdminInquiry, InquiryNotification } from "@/lib/api/endpoints";

type RecordState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; inquiry: AdminInquiry; notifications: InquiryNotification[] };

/** A shareable page for one inquiry: full details, editing, and its change history. */
export function AdminInquiryRecord({ id }: { id: string }) {
  const [state, setState] = useState<RecordState>({ kind: "loading" });
  const [historyVersion, setHistoryVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_INQUIRY", { pathParams: { id } }).then((result) => {
      if (!active) return;
      if (result.type === "error") {
        setState({ kind: "error", message: result.message });
        return;
      }
      const { notifications, ...inquiry } = result.data;
      setState({ kind: "ready", inquiry, notifications });
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
              notifications={state.notifications}
              onSaved={(updated) => {
                setState({ kind: "ready", inquiry: updated, notifications: state.notifications });
                setHistoryVersion((version) => version + 1);
              }}
            />
          </section>
          <section className="admin-record-history" aria-label="Inquiry history">
            <h2>History</h2>
            <AdminActivityList entityType="inquiry" entityId={state.inquiry.id} refreshKey={historyVersion} emptyMessage="No changes yet. Status and note updates appear here." />
            <AdminInquiryDelete id={state.inquiry.id} reference={state.inquiry.publicReference} />
          </section>
        </div>
      )}
    </section>
  );
}

/**
 * Owners can permanently delete an enquiry, for example when the customer asks for their
 * details to be removed. Its emails go with it; the activity log keeps only the reference.
 */
function AdminInquiryDelete({ id, reference }: { id: string; reference: string }) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_SESSION").then((result) => {
      if (active && result.type === "success" && result.data.authenticated) setIsOwner(result.data.user.role === "owner");
    });
    return () => { active = false; };
  }, []);

  if (!isOwner) return null;

  async function remove() {
    setDeleting(true);
    setError("");
    const result = await callApi("DELETE_ADMIN_INQUIRY", { pathParams: { id } });
    setDeleting(false);
    if (result.type === "error") { setError(result.message); setConfirming(false); return; }
    router.push("/admin/inquiries");
  }

  return (
    <div className="admin-danger-zone admin-inquiry-delete">
      <h2>Delete this enquiry</h2>
      <p>Use this when the customer asks for their details to be removed. Enquiries are also deleted automatically after 24 months.</p>
      {confirming ? (
        <div className="admin-confirm" role="alertdialog" aria-labelledby="delete-inquiry-title">
          <strong id="delete-inquiry-title">Delete {reference} permanently?</strong>
          <p>This removes the customer&apos;s details, notes, and emails. It cannot be undone.</p>
          <div className="admin-cover-actions">
            <button className="admin-danger-button" type="button" disabled={deleting} onClick={() => void remove()}>{deleting ? "Deleting…" : "Delete permanently"}</button>
            <button className="admin-secondary-button" type="button" autoFocus disabled={deleting} onClick={() => setConfirming(false)}>Keep enquiry</button>
          </div>
        </div>
      ) : <button className="admin-secondary-button" type="button" onClick={() => setConfirming(true)}>Delete enquiry…</button>}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}
