import "client-only";

import { ENDPOINTS } from "@/lib/api/endpoints";
import { channelClickBody, channelFromHref, type ClickPlacement } from "./channel-click";
import { readFirstTouch, recordFirstTouch, type FirstTouch } from "./first-touch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

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

function placementOf(link: Element): ClickPlacement {
  if (link.closest("footer")) return "footer";
  if (link.closest("header, .demo-ribbon")) return "header";
  return "page";
}

/**
 * Counts a tap on a WhatsApp, Instagram, or call link, anonymously and without delaying
 * it: `sendBeacon` survives the page handing off to the app, and its text/plain body
 * needs no CORS preflight. It goes direct rather than through callApi because axios
 * cannot outlive the navigation. Failures are ignored, since the tap matters more than the count.
 */
export function trackChannelClick(target: EventTarget | null) {
  try {
    const link = target instanceof Element ? target.closest("a[href]") : null;
    const channel = channelFromHref(link?.getAttribute("href"));
    if (!link || !channel) return;
    const body = channelClickBody({ channel, placement: placementOf(link), pagePath: window.location.pathname, firstTouch: attributionPayload() });
    const url = `${API_BASE_URL}${ENDPOINTS.POST_CHANNEL_CLICK.path}`;
    if (!navigator.sendBeacon?.(url, body)) {
      void fetch(url, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => undefined);
    }
  } catch {
    // Counting is best-effort; the link still opens.
  }
}
