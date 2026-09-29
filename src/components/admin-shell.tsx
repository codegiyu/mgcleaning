"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { callApi } from "@/lib/api/callApi";

const navigation = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inquiries" },
  { href: "/admin/blog", label: "Blog", icon: "blog" },
];

export function AdminIcon({ name }: { name: "overview" | "inquiries" | "blog" | "logout" | "search" | "chevron" }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "overview") return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>;
  if (name === "inquiries") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 7 8 6 8-6" /></svg>;
  if (name === "blog") return <svg {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7m-7 4h7" /></svg>;
  if (name === "logout") return <svg {...common}><path d="M10 4H5v16h5m4-4 4-4-4-4m4 4H9" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4 4" /></svg>;
  return <svg {...common}><path d="m9 5 7 7-7 7" /></svg>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loginPage = pathname === "/admin/login";
  const [sessionState, setSessionState] = useState<"checking" | "ready">(loginPage ? "ready" : "checking");
  const [email, setEmail] = useState("");
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
      setEmail(result.data.user.email);
      setSessionState("ready");
    });
    return () => {
      active = false;
    };
  }, [loginPage, router]);

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
          {navigation.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "admin-nav-link admin-nav-active" : "admin-nav-link"} aria-current={active ? "page" : undefined}>
                <span aria-hidden="true"><AdminIcon name={item.icon as "overview" | "inquiries" | "blog"} /></span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="admin-user-email" title={email}>{email}</span>
          <button className="admin-nav-link admin-logout" type="button" onClick={signOut} disabled={signingOut}>
            <span aria-hidden="true"><AdminIcon name="logout" /></span>{signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export function AdminLoginBrand() {
  return (
    <Link className="admin-login-brand" href="/" aria-label="Back to M&G Cleaning Service website">
      <Image src="/mg-cleaning-logo.svg" alt="M&G Cleaning Service" width={305} height={136} priority />
    </Link>
  );
}
