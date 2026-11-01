"use client";

import { useEffect } from "react";
import { trackChannelClick } from "@/lib/attribution/session";

/**
 * Counts taps on any WhatsApp, Instagram, or call link on the public site, so campaign
 * reports still see visitors who message instead of using a form. One listener covers
 * every link (buttons, footer, link hub), including middle-clicks.
 */
export function ChannelClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button === 0 || event.button === 1) trackChannelClick(event.target);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("auxclick", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("auxclick", onClick);
    };
  }, []);
  return null;
}
