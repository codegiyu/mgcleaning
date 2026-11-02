"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdminPasswordForm } from "@/components/admin-account-settings";
import { callApi } from "@/lib/api/callApi";
import type { AdminIdentity } from "@/lib/api/endpoints";

const navigation = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inquiries" },
  { href: "/admin/blog", label: "Blog", icon: "blog" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
  { href: "/admin/activity", label: "Activity", icon: "activity" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
  { href: "/admin/users", label: "Users", icon: "users", ownerOnly: true },
] as const;

export function AdminIcon({ name }: { name: "overview" | "inquiries" | "blog" | "reviews" | "activity" | "settings" | "users" | "logout" | "search" | "chevron" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "overview") return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "inquiries") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 7 8 6 8-6" /></svg>;
  if (name === "blog") return <svg {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7m-7 4h7" /></svg>;
  if (name === "reviews") return <svg {...common}><path d="M4 5h16v11H9l-5 4z" /><path d="m12 7.6 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" /></svg>;
  if (name === "activity") return <svg {...common}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
  if (name === "users") return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-2.6-4.4" /></svg>;
  if (name === "logout") return <svg {...common}><path d="M10 4H5v16h5m4-4 4-4-4-4m4 4H9" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4 4" /></svg>;
  return <svg {...common}><path d="m9 5 7 7-7 7" /></svg>;
}

const SIGNED_OUT_PAGES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Pages used while signed out: no session check and no dashboard chrome.
  const loginPage = SIGNED_OUT_PAGES.includes(pathname);
  const [sessionState, setSessionState] = useState<"checking" | "ready">(loginPage ? "ready" : "checking");
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (loginPage) return;
    let active = true;
    void callApi("GET_ADMIN_SESSION").then((result) => {
      if (!active) return;
      if (result.type === "error" || !result.data.authenticated) {
        router.replace("/admin/login");
        return;
      }
      setUser(result.data.user);
      setSessionState("ready");
    });
    return () => {
      active = false;
    };
  }, [loginPage, router, sessionVersion]);

  async function signOut() {
    setSigningOut(true);
    await callApi("POST_ADMIN_LOGOUT");
    router.replace("/admin/login");
    router.refresh();
  }

  if (loginPage) return <>{children}</>;
  if (sessionState !== "ready") {
    return <main className="admin-gate" aria-live="polite">Checking admin session…</main>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin" aria-label="M&G Cleaning admin home">
          <Image
            className="admin-brand-logo"
            src="/mg-cleaning-logo.svg"
            alt=""
            width={305}
            height={136}
            priority
          />
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.filter((item) => !("ownerOnly" in item) || user?.role === "owner").map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "admin-nav-link admin-nav-active" : "admin-nav-link"} aria-current={active ? "page" : undefined}>
                <span aria-hidden="true"><AdminIcon name={item.icon} /></span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-user-email" title={user?.email}>{user?.email}{user?.role === "owner" && <small> · Owner</small>}</span>
          <button className="admin-nav-link admin-logout" type="button" onClick={signOut} disabled={signingOut}>
            <span aria-hidden="true"><AdminIcon name="logout" /></span>{signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {user?.mustChangePassword ? (
          // The API refuses everything else until the temporary password is replaced.
          <section className="admin-content admin-first-password">
            <header className="admin-page-heading"><div><h1>Choose your own password</h1><p>Your account was set up with a temporary password. Replace it to start using the dashboard.</p></div></header>
            <AdminPasswordForm onChanged={() => setSessionVersion((current) => current + 1)} />
          </section>
        ) : children}
      </main>
    </div>
  );
}

export function AdminLoginBrand() {
  return (
    <Link className="admin-login-brand" href="/" aria-label="Back to M&G Cleaning Services website">
      <Image src="/mg-cleaning-logo.svg" alt="M&G Cleaning Services" width={305} height={136} priority />
    </Link>
  );
}
