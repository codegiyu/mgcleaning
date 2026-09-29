"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLoginBrand } from "@/components/admin-shell";
import { callApi } from "@/lib/api/callApi";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    void callApi("GET_ADMIN_SESSION").then((result) => {
      if (active && result.type === "success" && result.data.authenticated) router.replace("/admin");
    });
    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const result = await callApi("POST_ADMIN_LOGIN", {
      payload: { email: email.trim(), password },
    });
    setPending(false);
    if (result.type === "error") {
      setError(result.message);
      return;
    }
    setPassword("");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-panel">
        <AdminLoginBrand />
        <h1>Admin sign in</h1>
        <p>Sign in to manage enquiries and journal articles.</p>
        <form className="admin-form" onSubmit={submit}>
          <label className="admin-field">
            <span>Email address</span>
            <input autoComplete="username" type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input autoComplete="current-password" type="password" required maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
        </form>
        <Link className="admin-back-link" href="/">Back to the website</Link>
      </div>
    </main>
  );
}
