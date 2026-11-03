import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Users", description: "Owners manage accounts and settings. Staff handle enquiries, reviews, the gallery, and the journal." };

export default function UsersLayout({ children }: { children: ReactNode }) {
  return children;
}
