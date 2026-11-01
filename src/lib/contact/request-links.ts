/**
 * Links that open a cleaning request in the customer's own messaging app. The prefilled
 * text names the service when the page knows it; callers pass only a service title
 * from the services manifest, never raw query input.
 */
const MAX_SERVICE_LENGTH = 80;

export function requestMessage(service?: string) {
  const cleaned = service?.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, MAX_SERVICE_LENGTH);
  return cleaned
    ? `Hello M&G Cleaning Services, I'd like to request ${cleaned}.`
    : "Hello M&G Cleaning Services, I'd like to request a cleaning.";
}

/**
 * `https://wa.me/<number>` plus a prefilled request message. Encoded with
 * encodeURIComponent (spaces as %20): URLSearchParams writes spaces as `+`, which
 * WhatsApp can show literally.
 */
export function whatsappRequestHref(whatsappUrl: string, service?: string) {
  return `${whatsappUrl.replace(/\/$/, "")}?text=${encodeURIComponent(requestMessage(service))}`;
}

/** Opens a direct-message thread rather than the profile: the app on mobile, the web otherwise. */
export function instagramDmHref(handle: string) {
  return `https://ig.me/m/${encodeURIComponent(handle.replace(/^@/, ""))}`;
}
