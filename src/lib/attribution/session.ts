import "client-only";

import { readFirstTouch, recordFirstTouch, type FirstTouch } from "./first-touch";

/** Storage can throw (private mode, blocked site data); attribution is optional, so failures are ignored. */
export function captureFirstTouch() {
  try {
    recordFirstTouch(window.sessionStorage, new URL(window.location.href));
  } catch {
    // Attribution is best-effort; the visit and any enquiry continue without it.
  }
}

/** Fields to spread into an inquiry payload; empty when nothing was captured. */
export function attributionPayload(): Partial<FirstTouch> {
  try {
    return readFirstTouch(window.sessionStorage) ?? {};
  } catch {
    return {};
  }
}
