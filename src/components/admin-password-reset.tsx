"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { AdminPasswordInput } from "@/components/admin-password-input";
import { AdminLoginBrand } from "@/components/admin-shell";
import { callApi } from "@/lib/api/callApi";

const MIN_PASSWORD_LENGTH = 12;

const subscribeToHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHashToken = () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";

function SignedOutPanel({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="admin-login-page">
      <div className="admin-login-panel">
        <AdminLoginBrand />
        <h1>{title}</h1>
        <p>{intro}</p>
        {children}
        <Link className="admin-back-link" href="/admin/login">Back to sign in</Link>
      </div>
    </main>
  );
}

/** Asks for a reset link. The API answers the same for any email, so this page does too. */
export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await callApi("POST_ADMIN_PASSWORD_RESET_REQUEST", { payload: { email: email.trim() } });
    setPending(false);
    if (result.type === "error") {
      setError(result.message);
      return;
    }
    setSent(result.message);
  }

  return (
    <SignedOutPanel title="Forgot your password?" intro="Enter your account email and we'll send you a link to choose a new password.">
      {sent ? (
        <p className="admin-success" role="status">{sent}</p>
      ) : (
        <form className="admin-form" onSubmit={submit}>
          <label className="admin-field">
            <span>Email address</span>
            <input autoComplete="username" type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
    </SignedOutPanel>
  );
}

/** Reads the token from the link's fragment (never sent to a server) and sets the new password. */
export function AdminResetPasswordForm() {
  // null while rendering on the server, "" when the link has no token.
  const token = useSyncExternalStore(subscribeToHash, readHashToken, () => null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The two passwords don't match.");
      return;
    }
    setPending(true);
    const result = await callApi("POST_ADMIN_PASSWORD_RESET_CONFIRM", { payload: { token: token ?? "", newPassword: password } });
    setPending(false);
    if (result.type === "error") {
      setError(result.message);
      return;
    }
    setPassword("");
    setConfirmation("");
    setDone(result.message);
  }

  if (token === "") {
    return (
      <SignedOutPanel title="Reset link missing" intro="Open the link from your reset email again, or ask for a new one.">
        <Link className="admin-primary-button" href="/admin/forgot-password">Ask for a new link</Link>
      </SignedOutPanel>
    );
  }

  return (
    <SignedOutPanel title="Choose a new password" intro={`Use at least ${MIN_PASSWORD_LENGTH} characters. Every device signed in to your account will be signed out.`}>
      {done ? (
        <>
          <p className="admin-success" role="status">{done}</p>
          <Link className="admin-primary-button" href="/admin/login">Sign in</Link>
        </>
      ) : (
        <form className="admin-form" onSubmit={submit}>
          <label className="admin-field">
            <span>New password</span>
            <AdminPasswordInput autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Confirm new password</span>
            <AdminPasswordInput autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} maxLength={200} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </label>
          {error && (
            <p className="admin-error" role="alert">
              {error} {/expired|invalid/i.test(error) && <Link href="/admin/forgot-password">Ask for a new link</Link>}
            </p>
          )}
          <button className="admin-primary-button" type="submit" disabled={pending || token === null}>{pending ? "Saving…" : "Set new password"}</button>
        </form>
      )}
    </SignedOutPanel>
  );
}
