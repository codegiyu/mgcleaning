# MG Cleaning client-feedback plan

Status: Phases 1–5 implemented (default wording pending Q1/Q2; live email setup pending Q3) · 2026-10-27 · spans `mgcleaning` and `mgcleaning-backend`

## Goal and scope

Implement what was agreed with the client on 2026-10-26:

1. **Messaging first.** WhatsApp, Instagram, and phone are the primary way to request a cleaning; the form stays as the second option. This applies to the home page Quick Answers and the booking page, where bold channel buttons sit above the form.
2. **Response time.** Messages are answered within 15 minutes, which replaces "one business day" everywhere. The 24-hour post-service check-in **stays** unchanged.
3. **Reviews.** The team adds, edits, and deletes the reviews shown on the site from the admin dashboard. Target: at least 10 published before 2026-12-31.
4. **Form submissions in the dashboard.** These already exist (`/admin/inquiries`, inquiry detail page).
5. **Email alert per submission.** This already exists (email outbox → BullMQ → Resend/SMTP, with the recipient set in admin Settings). The remaining work is making the alert actionable and configuring it for real.

**Out of scope (deferred, by decision):**
- Customers submitting their own reviews through a public form. It needs moderation and spam control, and the team can enter reviews themselves.
- Importing or embedding Google reviews.
- Review images or screenshots. These can reuse the R2 media pipeline later with a `review-image` intent.
- `Review`/`AggregateRating` JSON-LD (see D9).
- A live-chat widget and WhatsApp Business API automation.
- A response-time SLA dashboard.

## What already exists (verified in code)

| Agreed item | Current state | Gap |
|---|---|---|
| Submissions in the dashboard | `/admin/inquiries` list with source filter, `/admin/inquiries/[id]` detail with history and email delivery status | None. Walk the client through it. |
| Email on submission | `createEmailOutboxRows` writes an `internal` alert (to `site_settings.inquiry_notification_email`, falling back to `INQUIRY_NOTIFICATION_TO`) and a `customer` receipt in the same transaction as the inquiry; the worker sends with retries and dead-lettering | The alert has no link to the admin record or a reply shortcut. Staging and production still need a real sender domain and inbox. The customer receipt says "one business day". |
| Testimonials | Static `trustTestimonials` (two placeholder slots) and `getPublicTestimonials()` in `src/content/trust-content.ts`; **rendered nowhere** | Everything. Replace them with DB-backed reviews. |
| Channel links | `businessContactFacts.whatsapp/instagram/phone` (confirmed records), `ContactChannels` on Contact and Book | No prominent buttons; the Instagram link opens the profile, not a DM. |

## Domains in play

- **Content governance:** the response-time promise appears in 10 places across both repos, so it needs one source per repo and a regression guard. Reviews are customer claims, so publishing needs recorded consent.
- **State and caching:** reviews follow the blog model, with tag-cached server reads and a signed purge from the existing revalidation outbox. A taken-down review must disappear immediately.
- **Backend security:** new admin CRUD surface. Free text from staff is rendered on the public site, so it is plain text only and validated at the edge.
- **Attribution:** moving traffic from the form to WhatsApp makes the Phase 4 UTM attribution blind, since WhatsApp chats never reach the database.
- **Frontend UX/a11y:** big tap targets on mobile, buttons before the form in DOM order, and external-app links labelled.

## Key decisions

| # | Decision | Why |
|---|---|---|
| D1 | **One response-time source per repo.** In the web app, `businessContactFacts.responseExpectation.value` becomes the 15-minute wording, and every page, FAQ, and form note reads it (no more literal strings). In the backend, a `RESPONSE_EXPECTATION` constant is used in the customer receipt. A web test fails if `business day` appears anywhere in `src/`. | There are 10 hard-coded copies today. The next wording change should be a one-line edit, and the guard stops a stale copy coming back. |
| D2 | **Channel order: WhatsApp → Instagram DM → Call**, through one `RequestChannels` component (variants `buttons` for booking and the CTA, `inline` for the FAQ preview). It reads `businessContactFacts`, so the confirmed-record governance still applies. | One component keeps the order, wording, and tracking identical everywhere, which matches the componentization work already done. |
| D3 | **WhatsApp links carry a prefilled message**: `https://wa.me/2348167715346?text=…` with "Hello M&G, I'd like to request a cleaning" plus the service name when the page knows it (`/book?service=…`, service detail pages). The text is URL-encoded and contains no PII. | The customer experience officer sees what the customer wants from the first message, and it saves the customer from writing an opening line. |
| D4 | **Instagram button opens a DM** (`https://ig.me/m/mgcleaningservices_1`), not the profile. The Contact page keeps the profile link for browsing work. | The goal is a request, not a follow. `ig.me/m/` opens the DM thread in the app on mobile and on the web otherwise. |
| D5 | **The form stays fully functional**, visually second: on `/book` the channel buttons come first, then a "Prefer to write it down? Use the form" divider, then the form. In DOM order the buttons come first so mobile shows them first. | This is the agreed "both" outcome. The form is still the only path that produces a stored, attributed inquiry. |
| D6 | **Reviews live in Postgres**, in a `reviews` table administered through `/v1/admin/reviews`. The public read is `GET /v1/reviews`, which returns published rows only. Static `trustTestimonials` is removed. | Reviews are a client-editable list. The blog stack (Drizzle, admin router, audit, revalidation outbox) already solves every part of it. |
| D7 | **Publishing a review requires `consent_confirmed = true`**, a checkbox the editor ticks: "The customer agreed to this review and name appearing on the site." The API rejects publish without it (422), and the consent and who confirmed it go into the audit event. | This replaces the `AGENTS.md` rule against publishing reviews until MG confirms them. MG's own editor confirming consent *is* that confirmation, and it is recorded. |
| D8 | **Delete is real but deliberate.** **Unpublish** (back to draft) is the everyday take-down and purges the cache immediately (`remove` mode). **Delete** hard-deletes after a confirm dialog. The audit event stores the review id and display name only, not the quote. | The client asked for delete. Keeping deleted customer words in an audit table would defeat a customer's removal request. |
| D9 | **No review structured data.** Reviews render as plain HTML, with no `Review`/`AggregateRating` JSON-LD. | Google treats self-hosted reviews of your own business as self-serving and ignores them or penalises them in rich results. That is risk with no upside. |
| D10 | **Optimistic concurrency on edits.** `PATCH`/`DELETE` take `expectedUpdatedAt`, and a mismatch returns 409 "This review was changed by someone else; reload to see the latest." | Several staff may share the dashboard. Without this, the last writer silently overwrites a correction. |
| D11 | **The public site degrades to "no reviews section"**: if the reviews fetch fails or returns zero rows, the section is not rendered. There are no placeholder slots in production. Reads use `next: { revalidate: 3600, tags: ["reviews"] }`, like the blog. | An API outage must never break the home page or show "sample testimonial" copy to customers. ISR keeps serving the last good list. |
| D12 | **The alert email becomes reply-ready.** It gains a button linking to `/admin/inquiries/{id}` and a "Reply on WhatsApp" link to the customer's number (Nigerian `0…` normalised to `234…`), shown when the customer prefers WhatsApp or either. It also gains a `Reply-To` of the customer's email when provided. | A 15-minute promise means the officer acts from their phone the moment the alert lands. |
| D13 | **Channel-click attribution (recommended, Phase 6).** A `navigator.sendBeacon` to `POST /v1/events/channel-click` records `{ channel, page, firstTouch UTM }`. It has no PII and no cookie, is rate-limited per IP, and is aggregated on the dashboard overview as "WhatsApp/Instagram/Call taps by source, last 30 days". | Without this, the Phase 4 attribution goes dark exactly as traffic moves to WhatsApp. These are clicks, not conversations, and the dashboard says so. |

## Risks and failure modes designed against

- **A 15-minute promise at 3 AM.** Operating hours are still unconfirmed (`businessContactFacts.operatingHours` is pending). An unqualified "15 minutes" invites a broken promise overnight. The default wording is "We reply to messages within 15 minutes" plus the hours once confirmed (open question Q1). This is copy-only once answered, because of D1.
- **The form looks slower than WhatsApp.** The 15-minute promise is scoped to messages. Form copy says the team will contact you "shortly" through your chosen method, and points to WhatsApp for the fastest reply (Q2).
- **A stale review is served after a takedown.** Unpublish and delete queue a `remove`-mode revalidation for tag `reviews` inside the same transaction (outbox), so a website outage only delays the purge, never loses it. There is a test for this.
- **Stored XSS via the review quote.** Zod validation trims and caps lengths, strips control characters, and rejects `<` in the name. Rendering uses React text only, never `dangerouslySetInnerHTML`, and there is a test for this.
- **The alert lands in spam or goes nowhere.** `EMAIL_FROM` still defaults to `notifications@example.com`. Phase 5 is not done until a real sender domain has SPF/DKIM (Resend), the client's inbox is set in Settings, and the Phase 5 smoke test sees the alert delivered on staging.
- **An abandoned outbox.** Migrations 0006–0010 have not run against Postgres yet. Migration 0011 (reviews) must run after them, in order. The runbook's release steps already cover this.

## Phases

Each phase ships as small signed commits, with the backend contract and tests before the UI. Every phase gate is: `tsc` and lint clean, tests green, production build passing, browser check at 375px and desktop, and the entries logged in `reports/commits`.

### Phase 1: Messaging-first copy and channels (web, plus one backend string)

- `public-content.ts`: set `responseExpectation.value` to the 15-minute wording. Add `whatsapp.requestHref(service?)` (prefilled `wa.me`) and `instagram.dmHref`.
- `RequestChannels` component (D2–D4): accessible link buttons that say where they open ("WhatsApp, opens the app"), with 48px minimum targets.
- Copy rewrites, all reading the shared fact:
  - FAQ `faq-request`: message us on WhatsApp or Instagram, or call; the form is also available.
  - FAQ `faq-response`: the 15-minute wording.
  - Home Quick Answers: `RequestChannels inline` under the two answers.
  - Home hero response line.
  - Areas "Response expectation" card.
  - `/book` intro and layout (D5).
  - Booking form note.
  - Confirmation page.
  - `CTASection`: add a WhatsApp button beside "Request a cleaning".
  - Contact page: put `RequestChannels` first.
- Terms page: update the response sentence. It is governed legal copy, so flag it in the evidence ledger.
- Backend: `RESPONSE_EXPECTATION` constant in the customer receipt (D1), with its test updated.
- **Tests:**
  - A guard test that `business day` is absent from `src/`.
  - `requestHref` encodes the service name and never includes user input.
  - The ordering test: the booking page renders channel links before the form.
- **Gate:** visual check that the 24-hour check-in copy is unchanged on home and about.

### Phase 2: Reviews API (backend contract and tests first)

- Migration `0011_reviews`. Columns:
  - `id` (uuid)
  - `display_name` (varchar 80, required, e.g. "Amaka O.")
  - `context` (varchar 80, optional, e.g. "Homeowner, Wuse 2")
  - `quote` (text, 20–600 chars)
  - `rating` (smallint 1–5, nullable)
  - `service_slug` (varchar 80, nullable)
  - `source` (enum: whatsapp | instagram | google | email | in_person | other)
  - `received_on` (date)
  - `featured` (boolean)
  - `status` (draft | published)
  - `consent_confirmed` (boolean), `consent_confirmed_by` (FK admin_users)
  - `published_at`, `created_by`, `updated_by`, `created_at`, `updated_at`
  - Indexes: `(status, featured desc, received_on desc)`.
- Admin routes, all behind the session and trusted-origin checks and all audited:
  - `GET /v1/admin/reviews?status=`
  - `POST /v1/admin/reviews`
  - `GET /v1/admin/reviews/:id`
  - `PATCH /v1/admin/reviews/:id` (D10)
  - `DELETE /v1/admin/reviews/:id` (D8)
- Public route: `GET /v1/reviews` returns published reviews (featured first, then newest), capped at 50, with public fields only (no consent or admin ids).
- `revalidationForReviewChange(before, after)` in `cache/revalidation.ts` returns tag `reviews`. It uses `remove` when leaving published and `refresh` otherwise, and it is queued in the write transaction.
- The overview endpoint gains `reviewCounts: { published, publishedThisYear, drafts }`.
- **Tests (vitest):**
  - Validation bounds and the XSS cases.
  - Publish without consent returns 422.
  - The public list hides drafts and private fields.
  - Stale `expectedUpdatedAt` returns 409.
  - Unpublish and delete queue a `remove` revalidation.
  - Audit events carry no quote text.
  - Unauthenticated requests get 401 and a cross-origin request gets 403.
- Add the endpoints to the web `endpoints.ts` registry with response types.

### Phase 3: Reviews admin

- `/admin/reviews` list: status tabs, a **"N of 10 published in 2026"** progress line, and featured markers.
- `/admin/reviews/new` and `/admin/reviews/[id]`: a form with a live `ReviewCard` preview. The consent checkbox is required to publish. Unpublish and Delete each get a confirm dialog that explains the difference. 409 shows a reload prompt.
- Admin nav item and an overview card.
- **Tests:** form validation and payload mapping (Node test runner) for the pure helpers.
- **Gate:** browser check of create → publish → edit → unpublish → delete against local API.

### Phase 4: Reviews on the public site

- `src/lib/reviews/public-reviews.ts`: a server fetch with tags and a 3600s backstop that returns `[]` on any failure and logs it (D11). Keep the tag name in sync with the backend like `blog-tags`.
- `ReviewCard` (Geist for the quote, eyebrow-style attribution, optional rating as text plus `aria-label`; matches `docs/typography.md`).
- Home "WHAT CLIENTS SAY" section (up to 6, featured first) after the trust-evidence section, rendered only when at least one review exists, and a `/reviews` page listing all published reviews, added to the sitemap only once it has content.
- Remove the static `trustTestimonials` and `getPublicTestimonials`; update the evidence ledger and the `AGENTS.md` review rule (D7).
- **Tests:**
  - The fetch helper returns `[]` on network error or a non-200 response.
  - The section is absent with zero reviews.
  - The signed purge of `reviews` refreshes the home page (browser check against local stack).

### Phase 5: Reply-ready alerts and live email configuration

- Backend:
  - `ADMIN_BASE_URL` env var (Zod-validated URL).
  - The internal alert adds the admin record link and the WhatsApp reply link (D12) and sets `Reply-To` to the customer's email.
  - `NotificationEmail` gains an optional action button.
  - Normalise phone numbers for the `wa.me` link (`0XXXXXXXXXX` → `234XXXXXXXXXX`, reject anything else and omit the link).
- **Tests:**
  - Phone normalisation table.
  - The alert contains the record link.
  - `Reply-To` is only set when an email was provided.
  - The customer receipt uses `RESPONSE_EXPECTATION`.
- **Ops (runbook update, done with the client):**
  - Verify the sender domain in Resend (SPF/DKIM).
  - Set `EMAIL_PROVIDER=resend` and `EMAIL_FROM`.
  - Set the client's inbox in Admin → Settings.
  - Run the staging smoke test and confirm the alert arrives on the officer's phone.

### Phase 6: Channel-click attribution (recommended)

- Backend: a `channel_clicks` table (`channel`, `page_path`, UTM fields, `created_at`; no IP stored) and a `POST /v1/events/channel-click` endpoint.
  - Zod-validated, rate-limited per IP in Redis, and returns 204 with an 8 KB body cap.
  - The overview aggregates by channel and source over 30 days.
- Web: `RequestChannels` fires `navigator.sendBeacon` with the first-touch attribution on click, fire-and-forget, without blocking navigation.
- **Tests:**
  - The beacon payload carries no PII.
  - The endpoint rejects an unknown channel and returns 429 over the limit.
  - The aggregation query.
- **Privacy:** update the privacy page to mention anonymous tap counts. This is governed copy, so flag it.

## Open questions for the client

1. **Q1:** Is "within 15 minutes" around the clock, or during working hours? If it's working hours, what are the hours and days? This also unblocks `operatingHours`, which is still pending.
2. **Q2:** What should the site promise for form submissions? The default is "we'll contact you shortly; for the fastest reply, message us on WhatsApp".
3. **Q3:** Which inbox, or inboxes, should get the submission alerts? Can we add DNS records on their domain for the sender? If they have no domain yet, alerts come from a verified Resend domain we control.
4. **Q4:** For reviews, will customers be shown by first name and initial? Should we show star ratings? Do they have customers' permission for the reviews they plan to upload?

## Phase 1 amendments (as built)

- **Default wording in use until the client answers Q1 and Q2:** messages: "We reply to messages within 15 minutes"; form: "We'll contact you shortly through your preferred contact method. For the fastest reply, message us on WhatsApp." Both live in `src/content/response-expectation.ts` (web) and `src/emails/response-expectation.ts` (backend); changing them is a two-file edit.
- **The FAQ reads the same constants**, so `trust-content.ts` imports them directly (importing `public-content.ts` would create a cycle).
- **The closing call to action leads with WhatsApp** ("Message us on WhatsApp"), with "Other ways to request" linking to `/book`. The home hero keeps "Request a cleaning" as its primary button, since `/book` now opens on the channels.
- **The service detail aside** shows `RequestChannels` with the service prefilled, and links to the form as "Or use the request form".
- **`/book?service=`** now passes only a title that matches the services manifest, both to the WhatsApp message and to the form's preselected service. Unknown values are ignored.
- **WhatsApp text is encoded with `encodeURIComponent`.** `URLSearchParams` writes spaces as `+`, which WhatsApp can show literally.
- **Not covered by an automated test:** the booking page rendering channels before the form. The web test runner has no DOM renderer, so this was checked in the browser at 375px and on desktop instead.

## Phase 2 amendments (as built)

- **Migration `0011_reviews`** adds the table with two database checks: a rating from 1 to 5, and no `published` row without `consent_confirmed_at`. The database enforces the consent rule as well as the API. It must run after `0006`–`0010`, none of which have run against Postgres yet.
- **`received_on` is optional**, because the team may not know when an older review was given. A date after today (WAT) is refused.
- **Audit metadata for every review action holds field names and statuses only.** A delete records the id and previous status, without the display name the plan allowed. The activity page names no customer ("Deleted a published review").
- **No archive status.** Unpublish (back to draft) is the take-down; delete is a hard delete.
- **API timestamps.** `created_at` and `updated_at` are written by the API, not the database default, so `expectedUpdatedAt` round-trips exactly at millisecond precision.
- **Review counts** appear in the admin list response (`counts`) and the overview (`reviewCounts`). "This year" means `published_at` on or after midnight WAT on 1 January.
- **`escapeLike`** moved into `admin-shared.ts`, so the inquiry and review searches share it.
- **The web registry** gains the five admin review endpoints and their types. The public `GET /v1/reviews` is read server-side in Phase 4, like the blog, so it is not in the browser registry.
- **The activity page** has plain-language labels for the five review actions.

## Phase 3 amendments (as built)

- **`ReviewCard` (`src/components/review-card.tsx`) was built now** rather than in Phase 4, so the editor preview is the exact public card. Phase 4 only places it on pages.
- **The editor locks the consent box while a review is live.** To withdraw consent, an editor unpublishes first, which matches the API rule. Once confirmed, the box shows who confirmed it and when (WAT).
- **Unpublish and Delete are separate actions.** Delete opens an inline confirmation, not a browser dialog, that points to Unpublish as the way to keep the review. A 409 from save or delete shows "Load the latest version", which replaces the unsaved changes in the form.
- **The list** shows "N of 10 published in YYYY" with a progress bar, drafts and published counts on the tabs, and a search by name or words. `/admin/reviews?status=draft` opens on that tab.
- **The overview** has a "Reviews published this year" card (N/10, with drafts waiting) and an "Add a review" shortcut.
- **Form helpers** in `src/lib/admin/review-form.ts`, covered by `review-form.test.ts`, handle the draft ↔ API mapping (blanks sent as null), client-side publish blockers, progress, WAT today, and star text.
- **End-to-end check (2026-10-27).** Run against the production web build and the local API, on fresh Postgres 17 with migrations `0000`–`0011` applied: the first real run of `0006`–`0011`. The full flow worked: publishing blocked without consent, draft saved, published (visible on `GET /v1/reviews` with public fields only), consent locked while live, a concurrent edit refused with 409 and "Load the latest version", unpublish (gone from the public list at once), and delete after confirmation. Each step appears in the activity log without customer names. The check found two bugs, both fixed:
  - The website's purge route only accepted `blog` tags, so every `reviews` purge was rejected with 400 until it was added to `ALLOWED_TAG`. Unit tests on each side passed; only the end-to-end run caught it.
  - Older bug: on phones every admin page laid out about 563px wide, because the mobile admin grid used `1fr` and the scrolling nav set its minimum width. This also hid "Sign out" off-screen. It is now `minmax(0,1fr)`.
- **Older bug, fixed in the backend:** after every API restart, the first admin sign-in failed with 503 ("Sign-in is temporarily unavailable"), and so did the first enquiry ("Requests are temporarily unavailable"). The login rate limiter and the enquiry abuse checks open their Redis connection inside the request and, with `enableOfflineQueue: false`, used it before it had connected. Both now go through `lazyProducerConnection()` in `src/queue/redis.ts`, which waits up to 2 s for the connection to be ready and fails fast if it errors or closes. The login connection is also closed on shutdown now. Checked against the local stack: the first sign-in after a restart returns 200 and the first enquiry 201. With Redis stopped, both fail with 503 within about 2 s, and sign-in recovers as soon as Redis returns.

## Phase 4 amendments (as built)

- **`getPublishedReviews()`** (`src/lib/reviews/public-reviews.ts`) reads `GET /v1/reviews` server-side, tagged `reviews` (`src/lib/cache/review-tags.ts`) with a 1-hour backstop. It never throws, and it has **no demo fallback**, so sample reviews can never appear. `parsePublicReviews()` (`review-data.ts`, with tests) drops malformed items and any fields beyond the public ones.
- **Home page:** a "WHAT CLIENTS SAY · In their own words." section after the trust and FAQ section, showing up to 6 reviews with featured ones first. It links to `/reviews` and is not rendered at all when there are no published reviews.
- **`/reviews`:** all published reviews in the same `.review-grid` (3, 2, then 1 column). When empty it shows "Reviews are on their way" and is `noindex`. It joins the sitemap only once it has reviews. There is no site navigation link yet; the home section is the way in (see the follow-up below).
- **Static `trustTestimonials` and `getPublicTestimonials()` were removed.** Their two placeholder slots no longer count towards the production content gate (`assertProductionTrustContent`), because reviews are now governed by the consent rule in the API and database. The `AGENTS.md` review rule and the evidence ledger say where reviews come from.
- **Verified against the local stack.** Publishing three reviews refreshed the prerendered `/reviews` and `/` on demand, with featured first. Unpublishing one removed it on the next request (`remove` mode), and the layout was checked at desktop and 375px. No `Review` or `AggregateRating` data is emitted (D9).
- **Follow-up to decide with the client:** once a few reviews are live, add "Reviews" to the header or footer navigation and the link hub.

## Phase 5 amendments (as built)

- **No new `ADMIN_BASE_URL`.** The dashboard lives on the website origin, so "Open in dashboard" uses the existing, validated `FRONTEND_ORIGIN`. That keeps one fewer variable to get wrong per environment.
- **The buttons are stored on the outbox row** (migration `0012_alert_actions`: `email_outbox.actions jsonb`, `reply_to varchar`) when the inquiry is saved, rather than computed when the email is sent. A retried alert therefore always matches the inquiry as submitted. Older rows default to no buttons.
- **Button order:** WhatsApp, then Call, then dashboard. WhatsApp also appears when the customer stated no preference (contact form). A "Phone call" preference puts Call first and drops WhatsApp.
- **WhatsApp link details.** The prefill carries the request reference only, with no name or message in any link. Numbers are normalised from Nigerian mobile formats (`0…`, `+234…`, `234…`, with spaces, dashes, or brackets). Anything else gets no WhatsApp or Call button but keeps the dashboard link.
- **Plain text and HTML.** The HTML shows the buttons only; the plain-text part repeats the links after the details (`plainTextBody`). The template drops any action that is not `https://`, `tel:+…`, or local `http://localhost`.
- **Test config.** `vitest.config.ts` now runs `*.test.tsx`, for the template render test, and `tsconfig.build.json` excludes those tests from `dist`.
- **Verified locally through Mailpit:**
  - A WhatsApp-preference booking produced the three buttons with correct links and Reply-To set to the customer.
  - The customer receipt has no buttons and no Reply-To.
  - A phone-preference booking produced Call and dashboard only.
  - "Open in dashboard" opened the right record, which shows both emails as Sent.
- **Still to do with the client (Q3):**
  - Verify the sender domain in Resend.
  - Set the officer's inbox in Admin → Settings.
  - Confirm the alert on their phone.

  The steps are in the backend runbook under "Inquiry alerts".
