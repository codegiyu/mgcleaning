/**
 * Why a form submission failed, from the API's response code, so the customer is told
 * what to do: fix a field, wait, or reach us another way. A validation error must never
 * read like an outage, or the customer gives up on a request we could have taken.
 */
export type SubmitFailure = "invalid" | "rate-limited" | "unavailable";

export function submitFailure(responseCode: number | undefined): SubmitFailure {
  if (responseCode === 400 || responseCode === 413 || responseCode === 422) return "invalid";
  if (responseCode === 429) return "rate-limited";
  return "unavailable";
}
