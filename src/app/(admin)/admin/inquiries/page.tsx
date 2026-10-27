"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon } from "@/components/admin-shell";
import { AdminInquiryDetail, inquiryDateLabel, inquiryStatusOptions } from "@/components/admin-inquiry-detail";
import { callApi } from "@/lib/api/callApi";
import type { AdminInquiry, InquiryStatus } from "@/lib/api/endpoints";

const filters: { id: InquiryStatus | "all"; label: string }[] = [{ id: "all", label: "All" }, ...inquiryStatusOptions];
const sourceFilters = [
  { id: "", label: "All sources" },
  { id: "instagram", label: "Instagram" },
  { id: "direct", label: "Direct or unknown" },
] as const;
type SourceFilter = (typeof sourceFilters)[number]["id"];

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [source, setSource] = useState<SourceFilter>("");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const selectedIdRef = useRef("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      params: { status, query, page, pageSize: 20, source: source || undefined },
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
      }
    });
    return () => { active = false; };
  }, [page, query, source, status]);

  function selectInquiry(inquiry: AdminInquiry) {
    selectedIdRef.current = inquiry.id;
    setSelectedId(inquiry.id);
    setError("");
  }

  function handleSaved(updated: AdminInquiry) {
    if (status !== "all" && updated.status !== status) {
      setItems((current) => current.filter((item) => item.id !== updated.id));
      setTotal((current) => Math.max(0, current - 1));
      setSelectedId("");
      selectedIdRef.current = "";
    } else {
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    }
  }

  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <section className="admin-content admin-inquiry-page">
      <header className="admin-page-heading">
        <div><h1>Inquiries</h1><p>Review and manage website enquiries.</p></div>
        <label className="admin-search"><span className="admin-visually-hidden">Search inquiries</span><span aria-hidden="true"><AdminIcon name="search" /></span><input type="search" placeholder="Search inquiries…" value={queryInput} onChange={(event) => { setLoading(true); setQueryInput(event.target.value); }} /></label>
      </header>
      <div className="admin-inquiry-filters"><div className="admin-inquiry-tabs" role="tablist" aria-label="Filter inquiries by status">
        {filters.map((filter) => <button type="button" role="tab" aria-selected={status === filter.id} className={status === filter.id ? "admin-tab admin-tab-active" : "admin-tab"} key={filter.id} onClick={() => { setLoading(true); setStatus(filter.id); setPage(1); }}>{filter.label}</button>)}
      </div>
        <label className="admin-source-filter"><span>Source</span><select value={source} onChange={(event) => { setLoading(true); setSource(event.target.value as SourceFilter); setPage(1); }}>{sourceFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
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
                <td>{inquiryDateLabel(item.createdAt)}</td>
                <td><span className={`admin-status admin-status-${item.status}`}>{item.status}</span></td>
                <td><button type="button" className="admin-row-arrow" aria-label={`View inquiry from ${item.name}`} onClick={() => selectInquiry(item)}><AdminIcon name="chevron" /></button></td>
              </tr>)}</tbody>
            </table></div>
          )}
          <div className="admin-table-footer"><span>Showing {items.length ? (page - 1) * 20 + 1 : 0}–{Math.min(page * 20, total)} of {total} enquiries</span><div><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} disabled={page <= 1 || loading}>Previous</button><span>{page} / {pages}</span><button type="button" onClick={() => { setLoading(true); setPage((current) => Math.min(pages, current + 1)); }} disabled={page >= pages || loading}>Next</button></div></div>
        </section>
        <aside className="admin-inquiry-detail" aria-label="Inquiry details">
          {selected
            ? <AdminInquiryDetail key={selected.id} inquiry={selected} onSaved={handleSaved} fullPageHref={`/admin/inquiries/${selected.id}`} />
            : <p className="admin-inline-state">Select an inquiry to see its details.</p>}
        </aside>
      </div>
    </section>
  );
}
