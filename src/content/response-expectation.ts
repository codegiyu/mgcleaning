/**
 * The response promises, in one place. Pages, FAQs, and forms read these instead of
 * writing their own; `src/content/response-expectation.test.ts` fails if an old promise
 * comes back. Keep in sync with `src/emails/response-expectation.ts` in the backend.
 *
 * The 15-minute figure was given by the client on 2026-10-26. Whether it holds outside
 * working hours (8am–7pm, supplied 2026-11-02) is still open; see
 * docs/client-feedback-plan.md, Q1 and Q2.
 */
export const messageResponseExpectation = "We reply to messages within 15 minutes";

export const formResponseExpectation = "We'll contact you shortly through your preferred contact method. For the fastest reply, message us on WhatsApp.";
