import type { Metadata } from "next";
import type { ReactNode } from "react";

// The default is completed by the admin template; editor and record pages use this one.
export const metadata: Metadata = { title: { default: "Inquiries", template: "%s · Inquiries · Admin | M&G Cleaning Services" }, description: "Review and manage website enquiries." };

export default function InquiriesLayout({ children }: { children: ReactNode }) {
  return children;
}
