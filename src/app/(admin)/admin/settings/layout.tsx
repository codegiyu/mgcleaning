import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Settings", description: "Your account security and day-to-day operational settings." };

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
