import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Gallery", description: "Photos and short videos of M&G work. New uploads start as drafts; only published items with confirmed rights appear on the website." };

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
