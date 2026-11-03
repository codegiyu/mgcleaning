import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: { absolute: "Admin sign in | M&G Cleaning Services" },
  description: "Sign in to manage enquiries, reviews, the gallery, and journal articles.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
