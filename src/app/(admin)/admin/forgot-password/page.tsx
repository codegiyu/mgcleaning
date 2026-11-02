import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/components/admin-password-reset";

export const metadata: Metadata = { title: { absolute: "Forgot password | M&G Cleaning Services" }, robots: { index: false, follow: false } };

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
