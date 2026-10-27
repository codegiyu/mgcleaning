"use client";

import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/attribution/session";

/** Records the tab's first landing page and campaign tags so an enquiry can say where it came from. */
export function AttributionCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
