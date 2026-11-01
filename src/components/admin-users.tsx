"use client";

import { useEffect, useState, type FormEvent } from "react";
import { callApi } from "@/lib/api/callApi";
import type { AdminAccount, AdminAccountWithPassword, AdminRole } from "@/lib/api/endpoints";
import { formatWat } from "@/lib/admin/wat-time";

type PendingAction = { id: string; action: "deactivate" | "reset" } | null;
type Issued = { email: string; temporaryPassword: string; reason: "created" | "reset" } | null;

const roleLabel = (role: AdminRole) => (role === "owner" ? "Owner" : "Staff");

/**
 * Owner-only account management. Temporary passwords come from the server, are shown
 * once here for the owner to pass on privately, and must be replaced at first sign-in.
 */
export function AdminUsers() {
  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [issued, setIssued] = useState<Issued>(null);
  const [copied, setCopied] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_USERS").then((result) => {
      if (!active) return;
      if (result.type === "error") setError(result.message);
      else setAccounts(result.data);
    });
    void callApi("GET_ADMIN_SESSION").then((result) => {
      if (active && result.type === "success" && result.data.authenticated) setCurrentUserId(result.data.user.id);
    });
    return () => { active = false; };
  }, [version]);

  function showIssued(result: AdminAccountWithPassword, reason: "created" | "reset") {
    setIssued({ email: result.user.email, temporaryPassword: result.temporaryPassword, reason });
    setCopied(false);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy("create");
    setError("");
    const result = await callApi("POST_ADMIN_USER", { payload: { email: String(data.get("email") ?? ""), role: String(data.get("role")) as AdminRole } });
    setBusy("");
    if (result.type === "error") { setError(result.message); return; }
    form.reset();
    showIssued(result.data, "created");
    setVersion((current) => current + 1);
  }

  async function change(account: AdminAccount, payload: { role?: AdminRole; active?: boolean }) {
    setBusy(account.id);
    setError("");
    setPending(null);
    const result = await callApi("PATCH_ADMIN_USER", { pathParams: { id: account.id }, payload });
    setBusy("");
    if (result.type === "error") setError(result.message);
    setVersion((current) => current + 1);
  }

  async function reset(account: AdminAccount) {
    setBusy(account.id);
    setError("");
    setPending(null);
    const result = await callApi("POST_ADMIN_USER_RESET_PASSWORD", { pathParams: { id: account.id } });
    setBusy("");
    if (result.type === "error") { setError(result.message); return; }
    showIssued(result.data, "reset");
    setVersion((current) => current + 1);
  }

  async function copy() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="admin-content">
      <header className="admin-page-heading"><div><h1>Users</h1><p>Owners manage accounts and settings. Staff handle enquiries, reviews, and the journal.</p></div></header>

      <form className="admin-settings-card admin-user-create" onSubmit={(event) => void create(event)}>
        <h2>Add an account</h2>
        <div className="admin-form-row">
          <label className="admin-field"><span>Email address</span><input name="email" type="email" required maxLength={320} autoComplete="off" placeholder="name@example.com" /></label>
          <label className="admin-field"><span>Role</span><select name="role" defaultValue="staff"><option value="staff">Staff</option><option value="owner">Owner</option></select></label>
        </div>
        <div className="admin-save-row"><button className="admin-primary-button" type="submit" disabled={busy === "create"}>{busy === "create" ? "Creating…" : "Create account"}</button></div>
      </form>

      {issued && (
        <div className="admin-issued-password" role="status">
          <strong>{issued.reason === "created" ? "Account created" : "Password reset"} for {issued.email}</strong>
          <p>Give them this temporary password privately, for example in person or by phone. It is shown only once, and they must choose their own password when they first sign in.</p>
          <div className="admin-issued-row">
            <code>{issued.temporaryPassword}</code>
            <button className="admin-secondary-button" type="button" onClick={() => void copy()}>{copied ? "Copied" : "Copy"}</button>
            <button className="admin-text-button" type="button" onClick={() => setIssued(null)}>Done</button>
          </div>
        </div>
      )}

      {error && <p className="admin-error" role="alert">{error}</p>}

      {!accounts ? (!error && <p className="admin-inline-state">Loading accounts…</p>) : (
        <div className="admin-table-scroll"><table className="admin-table admin-user-table">
          <thead><tr><th scope="col">Account</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Added</th><th scope="col"><span className="admin-visually-hidden">Actions</span></th></tr></thead>
          <tbody>{accounts.map((account) => {
            const isSelf = account.id === currentUserId;
            const active = !account.deactivatedAt;
            return (
              <tr key={account.id}>
                <td><strong>{account.email}</strong>{isSelf && <small className="admin-status-note">This is you</small>}</td>
                <td>{roleLabel(account.role)}</td>
                <td>
                  <span className={`admin-status ${active ? "admin-status-published" : "admin-status-archived"}`}>{active ? "Active" : "Deactivated"}</span>
                  {active && account.mustChangePassword && <small className="admin-status-note">Must set a password</small>}
                </td>
                <td>{formatWat(account.createdAt)}</td>
                <td className="admin-user-actions">
                  {isSelf ? <small className="admin-status-note">Change your password in Settings</small> : pending?.id === account.id ? (
                    <span className="admin-confirm admin-confirm-inline">
                      {pending.action === "deactivate" ? "Deactivate and sign them out?" : "Issue a new temporary password and sign them out?"}
                      <button className="admin-danger-button" type="button" disabled={busy === account.id} onClick={() => void (pending.action === "deactivate" ? change(account, { active: false }) : reset(account))}>Yes</button>
                      <button className="admin-secondary-button" type="button" autoFocus onClick={() => setPending(null)}>Cancel</button>
                    </span>
                  ) : (
                    <span className="admin-cover-actions">
                      <button className="admin-secondary-button" type="button" disabled={Boolean(busy) || !active} onClick={() => void change(account, { role: account.role === "owner" ? "staff" : "owner" })}>
                        {account.role === "owner" ? "Make staff" : "Make owner"}
                      </button>
                      {active
                        ? <button className="admin-secondary-button" type="button" disabled={Boolean(busy)} onClick={() => setPending({ id: account.id, action: "deactivate" })}>Deactivate</button>
                        : <button className="admin-secondary-button" type="button" disabled={Boolean(busy)} onClick={() => void change(account, { active: true })}>Reactivate</button>}
                      {active && <button className="admin-secondary-button" type="button" disabled={Boolean(busy)} onClick={() => setPending({ id: account.id, action: "reset" })}>Reset password</button>}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
    </section>
  );
}
