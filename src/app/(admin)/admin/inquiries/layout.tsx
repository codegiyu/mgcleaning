import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Inquiries" };

export default function InquiriesLayout({ children }: { children: ReactNode }) {
  return children;
}
