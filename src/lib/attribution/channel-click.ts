import type { FirstTouch } from "./first-touch.ts";

export type ClickChannel = "whatsapp" | "instagram" | "phone";
export type ClickPlacement = "header" | "page" | "footer";

/**
 * Which messaging channel a link opens, judged from its href so every WhatsApp,
 * Instagram, and call link on the site is counted without tagging each one.
 */
export function channelFromHref(href: string | null | undefined): ClickChannel | null {
  if (!href) return null;
  if (/^tel:/i.test(href)) return "phone";
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol === "whatsapp:") return "whatsapp";
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "");
  if (host === "wa.me" || host === "api.whatsapp.com") return "whatsapp";
  if (host === "ig.me" || host === "instagram.com") return "instagram";
  return null;
}

/**
 * The beacon body: the channel, where it was tapped, and the tab's first-touch campaign
 * tags. Nothing that identifies the visitor, and no query string from the page.
 */
export function channelClickBody(click: { channel: ClickChannel; placement: ClickPlacement; pagePath: string; firstTouch: Partial<FirstTouch> | null }) {
  const { firstTouch } = click;
  return JSON.stringify({
    channel: click.channel,
    placement: click.placement,
    pagePath: click.pagePath.split(/[?#]/)[0].slice(0, 200) || "/",
    ...(firstTouch?.utmSource ? { utmSource: firstTouch.utmSource } : {}),
    ...(firstTouch?.utmMedium ? { utmMedium: firstTouch.utmMedium } : {}),
    ...(firstTouch?.utmCampaign ? { utmCampaign: firstTouch.utmCampaign } : {}),
    ...(firstTouch?.utmContent ? { utmContent: firstTouch.utmContent } : {}),
    ...(firstTouch?.landingPath ? { landingPath: firstTouch.landingPath } : {}),
  });
}
