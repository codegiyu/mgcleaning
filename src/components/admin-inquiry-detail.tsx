"use client";

import Link from "next/link";
import { useState } from "react";
import { callApi } from "@/lib/api/callApi";
import type { AdminInquiry, InquiryNotification, InquiryStatus } from "@/lib/api/endpoints";

export const inquiryStatusOptions: { id: InquiryStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "closed", label: "Closed" },
];

export function inquiryDateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

const notificationKindLabels: Record<InquiryNotification["kind"], string> = { internal: "Team alert", customer: "Customer confirmation" };
const notificationStatusLabels: Record<InquiryNotification["status"], string> = {
  pending: "queued",
  processing: "sending",
  sent: "sent",
  failed: "retrying",
  dead_letter: "failed",
};

function contactMethodLabel(value: AdminInquiry["preferredContactMethod"]) {
  if (value === "phone") return "Phone call";
  if (value === "whatsapp") return "WhatsApp";
  if (value === "either") return "Phone or WhatsApp";
  return "Not specified";
}

/**
 * Inquiry fields plus status/note editing. Render with `key={inquiry.id}` so the
 * editable fields reset when a different inquiry is shown.
 */
export function AdminInquiryDetail({
  inquiry,
  onSaved,
  fullPageHref,
  notifications,
}: {
  inquiry: AdminInquiry;
  onSaved: (updated: AdminInquiry) => void;
  fullPageHref?: string;
  /** Email delivery state; only the full record loads it. */
  notifications?: InquiryNotification[];
}) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [note, setNote] = useState(inquiry.internalNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const result = await callApi("PATCH_ADMIN_INQUIRY", {
      pathParams: { id: inquiry.id },
      payload: { status, internalNote: note.trim() || null },
    });
    setSaving(false);
    if (result.type === "error") {
      setError(result.message);
      return;
    }
    setSaved(true);
    onSaved(result.data);
  }

  return (
    <>
      <div className="admin-detail-heading">
        <h2>Inquiry details</h2>
        <span>{inquiryDateLabel(inquiry.createdAt)}</span>
      </div>
      {fullPageHref && <Link className="admin-text-link admin-detail-link" href={fullPageHref}>Open full record and history →</Link>}
      <div className="admin-detail-section"><span>Request reference</span><p>{inquiry.publicReference}</p></div>
      <div className="admin-detail-contact"><span>Customer</span><strong>{inquiry.name}</strong><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>{inquiry.email && <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>}</div>
      <div className="admin-detail-section"><span>Request type</span><p>{inquiry.inquiryType === "booking" ? "Booking request" : "Contact message"}</p></div>
      {inquiry.topic && <div className="admin-detail-section"><span>Topic</span><p>{inquiry.topic}</p></div>}
      <div className="admin-detail-section"><span>Service interest</span><p>{inquiry.serviceInterest || "Not specified"}</p></div>
      {inquiry.inquiryType === "booking" && (
        <div className="admin-detail-section">
          <span>Request preferences</span>
          <p>{[inquiry.preferredDate, inquiry.preferredTime, inquiry.location, inquiry.spaceType].filter(Boolean).join(" · ") || "Not specified"}</p>
          <small>Follow up by: {contactMethodLabel(inquiry.preferredContactMethod)}</small>
        </div>
      )}
      <div className="admin-detail-section">
        <span>Came from</span>
        <p>{[inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign, inquiry.utmContent].filter(Boolean).join(" / ") || "Direct or unknown"}</p>
        {inquiry.landingPath && <small>First page: {inquiry.landingPath}</small>}
      </div>
      {notifications && (
        <div className="admin-detail-section">
          <span>Emails</span>
          {notifications.length ? notifications.map((item) => (
            <p key={item.kind}>
              {notificationKindLabels[item.kind]}: <span className={`admin-status admin-status-email-${item.status}`}>{notificationStatusLabels[item.status]}</span>
              {item.status === "dead_letter" && " — check the email provider, then re-queue (see the operations runbook)"}
            </p>
          )) : <p>No emails were queued for this inquiry.</p>}
        </div>
      )}
      <div className="admin-detail-section"><span>Customer message</span><p className="admin-customer-message">{inquiry.message}</p></div>
      <label className="admin-field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as InquiryStatus)}>{inquiryStatusOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="admin-field"><span>Internal notes</span><textarea rows={4} maxLength={4_000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add notes for the team. These are not visible to the customer." /></label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-save-row"><button className="admin-primary-button" type="button" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save updates"}</button>{saved && <span className="admin-success" role="status">Saved</span>}</div>
    </>
  );
}
