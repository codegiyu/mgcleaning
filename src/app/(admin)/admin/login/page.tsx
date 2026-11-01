import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = { title: { absolute: "Admin sign in | M&G Cleaning Services" }, robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
