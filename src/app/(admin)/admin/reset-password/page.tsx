import type { Metadata } from "next";
import { AdminResetPasswordForm } from "@/components/admin-password-reset";

// no-referrer: belt and braces, though the token is in the fragment, which is never sent.
export const metadata: Metadata = { title: { absolute: "Reset password | M&G Cleaning Services" }, robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function AdminResetPasswordPage() {
  return <AdminResetPasswordForm />;
}
