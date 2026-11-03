import type { Metadata } from "next";
import { AdminResetPasswordForm } from "@/components/admin-password-reset";

// no-referrer: belt and braces, though the token is in the fragment, which is never sent.
export const metadata: Metadata = {
  title: { absolute: "Choose a new password | M&G Cleaning Services" },
  description: "Choose a new password for your M&G Cleaning Services admin account with the link from your reset email.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminResetPasswordPage() {
  return <AdminResetPasswordForm />;
}
