import assert from "node:assert/strict";
import { test } from "node:test";
import { formatWat, isoToWatInput, watInputToIso } from "./wat-time.ts";

test("treats schedule input as WAT regardless of the browser timezone", () => {
  const iso = watInputToIso("2026-10-28T09:30");
  assert.equal(iso, "2026-10-28T09:30:00+01:00");
  assert.equal(new Date(iso!).toISOString(), "2026-10-28T08:30:00.000Z");
});

test("rejects incomplete input instead of guessing", () => {
  assert.equal(watInputToIso(""), null);
  assert.equal(watInputToIso("2026-10-28"), null);
});

test("round-trips a stored instant back to the WAT input value", () => {
  assert.equal(isoToWatInput("2026-10-28T08:30:00.000Z"), "2026-10-28T09:30");
  assert.equal(isoToWatInput("2026-12-31T23:30:00.000Z"), "2027-01-01T00:30");
  assert.equal(isoToWatInput("not a date"), "");
});

test("labels formatted times as WAT", () => {
  assert.match(formatWat("2026-10-28T08:30:00.000Z"), /28 Oct 2026, 09:30 WAT/);
});
