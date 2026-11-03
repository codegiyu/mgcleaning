import type { Metadata } from "next";
import { AdminForgotPasswordForm } from "@/components/admin-password-reset";

export const metadata: Metadata = {
  title: { absolute: "Forgot password | M&G Cleaning Services" },
  description: "Enter your account email and we’ll send you a link to choose a new password.",
  robots: { index: false, follow: false },
};

export default function AdminForgotPasswordPage() {
  return <AdminForgotPasswordForm />;
}
