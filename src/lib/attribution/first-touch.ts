/**
 * First-touch campaign attribution for this browser tab. Only campaign tags and the
 * landing path are kept: no identifiers, no cookies, nothing that outlives the tab.
 * The API normalises every value again, so this module only trims and bounds them.
 */
export type FirstTouch = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  landingPath: string;
};

export const FIRST_TOUCH_KEY = "mg-first-touch";
const MAX_VALUE_LENGTH = 120;
const MAX_PATH_LENGTH = 200;

/** The Instagram bio links to /links, so an untagged visit there still came from Instagram. */
const LINK_HUB_PATH = "/links";
const LINK_HUB_DEFAULTS = { utmSource: "instagram", utmMedium: "social", utmCampaign: "link-in-bio" } as const;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function param(url: URL, name: string) {
  const value = url.searchParams.get(name)?.trim();
  return value ? value.slice(0, MAX_VALUE_LENGTH) : undefined;
}

export function attributionFromLanding(url: URL): FirstTouch {
  const tagged = {
    utmSource: param(url, "utm_source"),
    utmMedium: param(url, "utm_medium"),
    utmCampaign: param(url, "utm_campaign"),
    utmContent: param(url, "utm_content"),
  };
  const landingPath = url.pathname.slice(0, MAX_PATH_LENGTH) || "/";
  const defaults = landingPath === LINK_HUB_PATH && !tagged.utmSource ? LINK_HUB_DEFAULTS : {};
  const merged: FirstTouch = { ...defaults, landingPath };
  for (const [key, value] of Object.entries(tagged) as Array<[keyof typeof tagged, string | undefined]>) {
    if (value) merged[key] = value;
  }
  return merged;
}

export function readFirstTouch(storage: Pick<Storage, "getItem">): FirstTouch | null {
  const raw = storage.getItem(FIRST_TOUCH_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    if (typeof record.landingPath !== "string") return null;
    const result: FirstTouch = { landingPath: record.landingPath.slice(0, MAX_PATH_LENGTH) };
    for (const key of ["utmSource", "utmMedium", "utmCampaign", "utmContent"] as const) {
      if (typeof record[key] === "string") result[key] = (record[key] as string).slice(0, MAX_VALUE_LENGTH);
    }
    return result;
  } catch {
    return null;
  }
}

/** Keeps the first landing of the tab; later page views never overwrite it. */
export function recordFirstTouch(storage: StorageLike, url: URL): FirstTouch {
  const existing = readFirstTouch(storage);
  if (existing) return existing;
  const touch = attributionFromLanding(url);
  storage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
  return touch;
}
