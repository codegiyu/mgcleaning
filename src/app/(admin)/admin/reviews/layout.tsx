import type { Metadata } from "next";
import type { ReactNode } from "react";

// The default is completed by the admin template; editor and record pages use this one.
export const metadata: Metadata = { title: { default: "Reviews", template: "%s · Reviews · Admin | M&G Cleaning Services" }, description: "Add the reviews customers send you. Only published reviews with their agreement appear on the website." };

export default function ReviewsLayout({ children }: { children: ReactNode }) {
  return children;
}
