"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/api/callApi";
import type { AuditEntityType, AuditEvent } from "@/lib/api/endpoints";
import { describeActivity, describeActor } from "@/lib/admin/activity";
import { formatWat } from "@/lib/admin/wat-time";

type ListState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: AuditEvent[]; total: number; page: number; loadingMore: boolean };

/**
 * Audit trail, newest first. Change `refreshKey` after a save to reload it. History is
 * fetched fresh each time and never cached in the browser.
 */
export function AdminActivityList({
  entityType,
  entityId,
  pageSize = 20,
  refreshKey = 0,
  emptyMessage = "No activity recorded yet.",
}: {
  entityType?: AuditEntityType;
  entityId?: string;
  pageSize?: number;
  refreshKey?: number;
  emptyMessage?: string;
}) {
  const [state, setState] = useState<ListState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_AUDIT", { params: { entityType, entityId, page: 1, pageSize } }).then((result) => {
      if (!active) return;
      setState(result.type === "error"
        ? { kind: "error", message: result.message }
        : { kind: "ready", items: result.data.items, total: result.data.total, page: 1, loadingMore: false });
    });
    return () => { active = false; };
  }, [entityId, entityType, pageSize, refreshKey]);

  async function loadMore() {
    if (state.kind !== "ready") return;
    setState({ ...state, loadingMore: true });
    const nextPage = state.page + 1;
    const result = await callApi("GET_ADMIN_AUDIT", { params: { entityType, entityId, page: nextPage, pageSize } });
    if (result.type === "error") {
      setState({ kind: "error", message: result.message });
      return;
    }
    setState({ kind: "ready", items: [...state.items, ...result.data.items], total: result.data.total, page: nextPage, loadingMore: false });
  }

  if (state.kind === "loading") return <p className="admin-inline-state">Loading activity…</p>;
  if (state.kind === "error") return <p className="admin-error" role="alert">{state.message}</p>;
  if (!state.items.length) return <p className="admin-inline-state">{emptyMessage}</p>;
  return (
    <div className="admin-activity">
      <ol className="admin-activity-list">
        {state.items.map((event) => (
          <li key={event.id}>
            <strong>{describeActivity(event)}</strong>
            <span>{describeActor(event.actorEmail)} · <time dateTime={event.createdAt}>{formatWat(event.createdAt)}</time></span>
          </li>
        ))}
      </ol>
      {state.items.length < state.total && (
        <button className="admin-secondary-button" type="button" disabled={state.loadingMore} onClick={() => void loadMore()}>
          {state.loadingMore ? "Loading…" : "Show older activity"}
        </button>
      )}
    </div>
  );
}
