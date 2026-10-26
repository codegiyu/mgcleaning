"use client";

import { useEffect, useState, type FormEvent } from "react";
import { callApi } from "@/lib/api/callApi";
import type { AdminSession, SiteSettings } from "@/lib/api/endpoints";
import { describeUserAgent } from "@/lib/admin/user-agent";
import { formatWat } from "@/lib/admin/wat-time";

const MIN_PASSWORD_LENGTH = 12;

type Feedback = { kind: "error" | "success"; message: string } | null;

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return feedback.kind === "error"
    ? <p className="admin-error" role="alert">{feedback.message}</p>
    : <p className="admin-success" role="status">{feedback.message}</p>;
}

/** Inputs stay local and are cleared after every attempt; passwords are never stored anywhere in the browser. */
export function AdminPasswordForm({ onChanged }: { onChanged: () => void }) {
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      setFeedback({ kind: "error", message: "The new passwords do not match." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    const result = await callApi("POST_ADMIN_CHANGE_PASSWORD", { payload: { currentPassword, newPassword } });
    setSaving(false);
    form.reset();
    if (result.type === "error") {
      setFeedback({ kind: "error", message: result.message });
      return;
    }
    const revoked = result.data.revokedSessions;
    setFeedback({ kind: "success", message: revoked ? `Password changed. ${revoked} other session${revoked === 1 ? " was" : "s were"} signed out.` : "Password changed." });
    onChanged();
  }

  return (
    <form className="admin-settings-card" onSubmit={(event) => void submit(event)}>
      <h2>Change password</h2>
      <p className="admin-settings-help">Changing your password signs out every other device.</p>
      <label className="admin-field"><span>Current password</span><input name="currentPassword" type="password" autoComplete="current-password" required maxLength={200} /></label>
      <label className="admin-field"><span>New password</span><input name="newPassword" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={200} /><small className="admin-field-help">At least {MIN_PASSWORD_LENGTH} characters.</small></label>
      <label className="admin-field"><span>Confirm new password</span><input name="confirmPassword" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={200} /></label>
      <FeedbackLine feedback={feedback} />
      <div className="admin-save-row"><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Changing…" : "Change password"}</button></div>
    </form>
  );
}

export function AdminSessionList({ refreshKey }: { refreshKey: number }) {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_SESSIONS").then((result) => {
      if (!active) return;
      if (result.type === "error") setFeedback({ kind: "error", message: result.message });
      else setSessions(result.data);
    });
    return () => { active = false; };
  }, [refreshKey, version]);

  async function revoke(id: string) {
    setBusy(id);
    setFeedback(null);
    const result = await callApi("DELETE_ADMIN_SESSION", { pathParams: { id } });
    setBusy("");
    if (result.type === "error") setFeedback({ kind: "error", message: result.message });
    setVersion((current) => current + 1);
  }

  async function revokeOthers() {
    setBusy("others");
    setFeedback(null);
    const result = await callApi("POST_ADMIN_REVOKE_OTHER_SESSIONS");
    setBusy("");
    setFeedback(result.type === "error" ? { kind: "error", message: result.message } : { kind: "success", message: "Other sessions signed out." });
    setVersion((current) => current + 1);
  }

  const others = sessions?.filter((session) => !session.current) ?? [];
  return (
    <section className="admin-settings-card" aria-labelledby="admin-sessions-heading">
      <h2 id="admin-sessions-heading">Signed-in devices</h2>
      <p className="admin-settings-help">Sessions last 12 hours. Sign out any device you do not recognise.</p>
      {!sessions ? <p className="admin-inline-state">Loading sessions…</p> : (
        <ul className="admin-session-list">
          {sessions.map((session) => (
            <li key={session.id}>
              <div>
                <strong>{describeUserAgent(session.userAgent)}{session.current && <span className="admin-status admin-status-published">This device</span>}</strong>
                <small>Last active {formatWat(session.lastUsedAt)} · signed in {formatWat(session.createdAt)}</small>
              </div>
              {!session.current && (
                <button className="admin-secondary-button" type="button" disabled={Boolean(busy)} onClick={() => void revoke(session.id)}>
                  {busy === session.id ? "Signing out…" : "Sign out"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <FeedbackLine feedback={feedback} />
      {others.length > 0 && (
        <div className="admin-save-row">
          <button className="admin-secondary-button" type="button" disabled={Boolean(busy)} onClick={() => void revokeOthers()}>
            {busy === "others" ? "Signing out…" : "Sign out all other devices"}
          </button>
        </div>
      )}
    </section>
  );
}

export function AdminSiteSettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_SETTINGS").then((result) => {
      if (!active) return;
      if (result.type === "error") setFeedback({ kind: "error", message: result.message });
      else setSettings(result.data);
    });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const inbox = String(data.get("inquiryNotificationEmail") ?? "").trim() || null;
    const author = String(data.get("defaultAuthorName") ?? "").trim() || null;
    // Send only what changed so the activity log records real edits.
    const payload = {
      ...(inbox !== settings?.inquiryNotificationEmail ? { inquiryNotificationEmail: inbox } : {}),
      ...(author !== settings?.defaultAuthorName ? { defaultAuthorName: author } : {}),
    };
    if (!Object.keys(payload).length) {
      setFeedback({ kind: "success", message: "No changes to save." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    const result = await callApi("PATCH_ADMIN_SETTINGS", { payload });
    setSaving(false);
    if (result.type === "error") {
      setFeedback({ kind: "error", message: result.message });
      return;
    }
    setSettings(result.data);
    setFeedback({ kind: "success", message: "Settings saved." });
  }

  return (
    <form className="admin-settings-card" onSubmit={(event) => void submit(event)}>
      <h2>Operations</h2>
      <p className="admin-settings-help">Business details shown on the website are managed separately and need approval before they change.</p>
      {!settings ? <p className="admin-inline-state">Loading settings…</p> : (
        <>
          <label className="admin-field">
            <span>Inquiry alert inbox</span>
            <input name="inquiryNotificationEmail" type="email" maxLength={320} defaultValue={settings.inquiryNotificationEmail ?? ""} placeholder={settings.effectiveNotificationEmail} />
            <small className="admin-field-help">New requests are emailed to {settings.effectiveNotificationEmail}. Leave blank to use the server default.</small>
          </label>
          <label className="admin-field">
            <span>Default article author</span>
            <input name="defaultAuthorName" minLength={2} maxLength={120} defaultValue={settings.defaultAuthorName ?? ""} placeholder="M&G Cleaning Services" />
          </label>
          {settings.updatedAt && <small className="admin-field-help">Last changed {formatWat(settings.updatedAt)}.</small>}
        </>
      )}
      <FeedbackLine feedback={feedback} />
      <div className="admin-save-row"><button className="admin-primary-button" type="submit" disabled={saving || !settings}>{saving ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
