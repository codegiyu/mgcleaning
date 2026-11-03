import type { Metadata } from "next";
import type { ReactNode } from "react";

// The default is completed by the admin template; editor and record pages use this one.
export const metadata: Metadata = { title: { default: "Blog", template: "%s · Blog · Admin | M&G Cleaning Services" }, description: "Write useful articles and share them from Instagram." };

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
