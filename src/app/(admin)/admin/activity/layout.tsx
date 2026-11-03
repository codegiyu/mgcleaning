import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Activity", description: "Sign-ins, inquiry updates, publishing, reviews, gallery changes, uploads, and settings changes, newest first." };

export default function ActivityLayout({ children }: { children: ReactNode }) {
  return children;
}
