import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  // Each section sets its own title; the overview uses the default.
  title: { default: "Overview · Admin", template: "%s · Admin | M&G Cleaning Services" },
  description: "A quick look at enquiries, message taps, reviews, and the journal.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
