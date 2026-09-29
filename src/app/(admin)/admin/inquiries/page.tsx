"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon } from "@/components/admin-shell";
import { callApi } from "@/lib/api/callApi";
import type { AdminInquiry, InquiryStatus } from "@/lib/api/endpoints";

const filters: { id: InquiryStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "booked", label: "Booked" },
  { id: "closed", label: "Closed" },
];

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const selectedIdRef = useRef("");
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("new");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setQuery(queryInput.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_INQUIRIES", {
      params: { status, query, page, pageSize: 20 },
    }).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.type === "error") {
        setError(result.message);
        return;
      }
      setError("");
      setItems(result.data.items);
      setTotal(result.data.total);
      if (!result.data.items.some((item) => item.id === selectedIdRef.current)) {
        const first = result.data.items[0];
        selectedIdRef.current = first?.id ?? "";
        setSelectedId(first?.id ?? "");
        setSelectedStatus(first?.status ?? "new");
        setNote(first?.internalNote ?? "");
      }
    });
    return () => { active = false; };
  }, [page, query, status]);

  function selectInquiry(inquiry: AdminInquiry) {
    selectedIdRef.current = inquiry.id;
    setSelectedId(inquiry.id);
    setSelectedStatus(inquiry.status);
    setNote(inquiry.internalNote ?? "");
    setSaved(false);
    setError("");
  }

  async function saveUpdates() {
    if (!selected) return;
    setSaving(true);
    setSaved(false);
    setError("");
    const result = await callApi("PATCH_ADMIN_INQUIRY", {
      pathParams: { id: selected.id },
      payload: { status: selectedStatus, internalNote: note.trim() || null },
    });
    setSaving(false);
    if (result.type === "error") {
      setError(result.message);
      return;
    }
    if (status !== "all" && result.data.status !== status) {
      setItems((current) => current.filter((item) => item.id !== result.data.id));
      setTotal((current) => Math.max(0, current - 1));
      setSelectedId("");
      selectedIdRef.current = "";
      setSaved(false);
    } else {
      setItems((current) => current.map((item) => item.id === result.data.id ? result.data : item));
      setSaved(true);
    }
  }

  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <section className="admin-content admin-inquiry-page">
      <header className="admin-page-heading">
        <div><h1>Inquiries</h1><p>Review and manage website enquiries.</p></div>
        <label className="admin-search"><span className="admin-visually-hidden">Search inquiries</span><span aria-hidden="true"><AdminIcon name="search" /></span><input type="search" placeholder="Search inquiries…" value={queryInput} onChange={(event) => { setLoading(true); setQueryInput(event.target.value); }} /></label>
      </header>
      <div className="admin-inquiry-tabs" role="tablist" aria-label="Filter inquiries by status">
        {filters.map((filter) => <button type="button" role="tab" aria-selected={status === filter.id} className={status === filter.id ? "admin-tab admin-tab-active" : "admin-tab"} key={filter.id} onClick={() => { setLoading(true); setStatus(filter.id); setPage(1); }}>{filter.label}</button>)}
      </div>
      {error && <p className="admin-error admin-page-error" role="alert">{error}</p>}
      <div className="admin-inquiry-workspace">
        <section className="admin-inquiry-table-wrap" aria-label="Inquiry list">
          {loading ? <p className="admin-inline-state">Loading enquiries…</p> : items.length === 0 ? <p className="admin-inline-state">No enquiries match this view.</p> : (
            <div className="admin-table-scroll"><table className="admin-table">
               <thead><tr><th scope="col">Customer</th><th scope="col">Type</th><th scope="col">Service</th><th scope="col">Received</th><th scope="col">Status</th><th><span className="admin-visually-hidden">Open inquiry</span></th></tr></thead>
              <tbody>{items.map((item) => <tr key={item.id} className={selectedId === item.id ? "admin-row-selected" : undefined}>
                <td><button className="admin-row-select" type="button" onClick={() => selectInquiry(item)}><strong>{item.name}</strong><small>{item.phone}</small></button></td>
                <td>{item.inquiryType === "booking" ? "Booking" : "Contact"}</td>
                <td>{item.serviceInterest || "Not specified"}</td>
                <td>{dateLabel(item.createdAt)}</td>
                <td><span className={`admin-status admin-status-${item.status}`}>{item.status}</span></td>
                <td><button type="button" className="admin-row-arrow" aria-label={`View inquiry from ${item.name}`} onClick={() => selectInquiry(item)}><AdminIcon name="chevron" /></button></td>
              </tr>)}</tbody>
            </table></div>
          )}
          <div className="admin-table-footer"><span>Showing {items.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, total)} of {total} enquiries</span><div><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page <= 1 || loading}>Previous</button><span>{page} / {pages}</span><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.min(pages, current + 1)); }} disabled={page >= pages || loading}>Next</button></div></div>
        </section>
        <aside className="admin-inquiry-detail" aria-label="Inquiry details">
          {selected ? <>
             <div className="admin-detail-heading"><h2>Inquiry details</h2><span>{dateLabel(selected.createdAt)}</span></div>
             <div className="admin-detail-section"><span>Request reference</span><p>{selected.publicReference}</p></div>
             <div className="admin-detail-contact"><span>Customer</span><strong>{selected.name}</strong><a href={`tel:${selected.phone}`}>{selected.phone}</a>{selected.email && <a href={`mailto:${selected.email}`}>{selected.email}</a>}</div>
            <div className="admin-detail-section"><span>Request type</span><p>{selected.inquiryType === "booking" ? "Booking request" : "Contact message"}</p></div>
            {selected.topic && <div className="admin-detail-section"><span>Topic</span><p>{selected.topic}</p></div>}
            <div className="admin-detail-section"><span>Service interest</span><p>{selected.serviceInterest || "Not specified"}</p></div>
             {selected.inquiryType === "booking" && <div className="admin-detail-section"><span>Request preferences</span><p>{[selected.preferredDate, selected.preferredTime, selected.location, selected.spaceType].filter(Boolean).join(" · ") || "Not specified"}</p><small>Follow up by: {selected.preferredContactMethod === "phone" ? "Phone call" : selected.preferredContactMethod === "whatsapp" ? "WhatsApp" : selected.preferredContactMethod === "either" ? "Phone or WhatsApp" : "Not specified"}</small></div>}
            <div className="admin-detail-section"><span>Customer message</span><p className="admin-customer-message">{selected.message}</p></div>
            <label className="admin-field"><span>Status</span><select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as InquiryStatus)}>{filters.filter((item) => item.id !== "all").map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="admin-field"><span>Internal notes</span><textarea rows={4} maxLength={4_000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add notes for the team. These are not visible to the customer." /></label>
            <div className="admin-save-row"><button className="admin-primary-button" type="button" onClick={saveUpdates} disabled={saving}>{saving ? "Saving…" : "Save updates"}</button>{saved && <span className="admin-success" role="status">Saved</span>}</div>
          </> : <p className="admin-inline-state">Select an inquiry to see its details.</p>}
        </aside>
      </div>
    </section>
  );
}
