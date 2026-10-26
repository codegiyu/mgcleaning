/**
 * M&G works in West Africa Time (UTC+1, no daylight saving). Schedule inputs are
 * entered as WAT wall-clock time and always sent to the API with an explicit offset,
 * so the admin's own browser timezone never changes when an article goes live.
 */
export const WAT_OFFSET = "+01:00";
const WAT_OFFSET_MS = 60 * 60 * 1000;

/** `2026-10-28T09:30` (from `<input type="datetime-local">`) → `2026-10-28T09:30:00+01:00`. */
export function watInputToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  return `${value}:00${WAT_OFFSET}`;
}

/** Any ISO instant → the WAT wall-clock value for a `datetime-local` input. */
export function isoToWatInput(iso: string) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  return new Date(time + WAT_OFFSET_MS).toISOString().slice(0, 16);
}

export function formatWat(iso: string) {
  return `${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))} WAT`;
}
