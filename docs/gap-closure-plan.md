# MG Cleaning gap-closure plan

Status: proposed · 2026-10-26 · spans `mgcleaning` and `mgcleaning-backend`

## Goal and scope

Close the launch-blocking and operational gaps left after the v1 build:

1. Media uploads on Cloudflare R2 (replacing pasted HTTPS cover URLs), following the presign → direct PUT → verify pattern from `freelance/oj/oj-backend`.
2. Blog cache with on-demand refresh on publish/update/unpublish.
3. Admin audit trail and account recovery (password change, session revocation, operator reset).
4. Scheduled publishing.
5. Instagram/UTM attribution through to stored inquiries.
6. Inquiry detail page and admin settings.
7. Live end-to-end smoke test of inquiry → email and admin cookies against the deployed stack.

Out of scope: booking/calendar, customer accounts, payments, a CMS for services/FAQs/testimonials, image transformations (resizing/WebP pipelines), and a mobile app. Trust-content approval stays a client dependency; this plan does not unblock `NEXT_PUBLIC_CONTENT_MODE=production` by itself.

## Domains in play

- **Backend security / storage:** presigned uploads are a write capability handed to the browser; type, size, key, and ownership must be bound server-side.
- **Caching / SSR:** public blog reads are currently `cache: "no-store"` (every page view hits Hono); moving to cached reads introduces the stale-after-unpublish risk.
- **Concurrency and jobs:** scheduled publishing and orphan-upload cleanup are BullMQ jobs that will run at least once and must be idempotent.
- **Privacy and governance:** audit events and UTM data touch PII retention.
- **Observability:** the API logs through `console`, has no request IDs, and the end-to-end smoke test needs something to inspect.

## Key decisions

| # | Decision | Why |
|---|---|---|
| D1 | **Reuse oj's R2 approach:** `@aws-sdk/client-s3` against `https://<account>.r2.cloudflarestorage.com`, `region: "auto"`, `requestChecksumCalculation: "WHEN_REQUIRED"` and `responseChecksumValidation: "WHEN_REQUIRED"`. | Proven in oj. The checksum flags avoid the SDK ≥3.729 browser-PUT signature/CORS breakage on R2. |
| D2 | **Postgres `media_assets` table** replaces oj's Mongo `Document` model, with the same lifecycle: `pending → verified \| failed \| expired`. Columns: `id, key (unique), public_url, content_type, byte_size, width, height, alt_text, intent, status, uploaded_by, expires_at, verified_at, created_at, deleted_at`. | Same semantics in the stack this repo already uses. A media row with alt text lets the editor pick from a library instead of re-uploading. |
| D3 | **Key layout `${R2_FOLDER_PREFIX}/{intent}/{yyyy}/{mm}/{random12}.{ext}`**, generated server-side only, never from the client filename. | Matches oj's server-generated keys. The prefix separates staging and production in one bucket, and the client cannot choose or overwrite paths. Date folders replace oj's `entityId`, because cover images are uploaded before a post exists (oj's "deferred upload" case). |
| D4 | **Tighten oj's pattern on size:** sign `ContentLength` into the `PutObjectCommand` (the client declares the size at presign time and the server rejects anything over the cap), *and* re-check with `HeadObject` at verify. | oj only checks size after upload, so an over-limit object already sits in the bucket. A signed length makes R2 reject a mismatched PUT. |
| D5 | **Strict allowlist:** `cover-image` and `gallery-image` accept `jpg/jpeg/png/webp` only, with **no SVG** (SVG can carry script). Cap at 5 MB. Content type is derived from the extension on the server, not trusted from the client. | oj allows SVG for images. For a public site with admin-only uploads the risk is low, but there is no reason to accept it. |
| D6 | **Public delivery via a custom domain on the bucket** (`media.<domain>`), behind the Cloudflare CDN. `R2_PUBLIC_URL` is the base. Objects are immutable (new key on every upload), so serve with `Cache-Control: public, max-age=31536000, immutable`, set as `CacheControl` on the signed PUT. | Never use the rate-limited `r2.dev` URL in production. Immutable keys mean no CDN purge is ever needed. |
| D7 | **Admin-only uploads.** The presign and verify routes live under the existing admin router (session + `trustedOrigin` check). | No public upload surface. This is oj's admin path only. |
| D8 | **Blog posts reference media by `cover_media_id` (FK)**, and the existing `cover_image_url` column becomes derived. Publish validation requires a *verified* media row. Existing URL-based posts are migrated by keeping `cover_image_url` nullable for legacy rows. | The publish gate becomes "the object really exists in our bucket", not "some HTTPS string". |
| D9 | **Orphan cleanup** runs as a BullMQ repeatable job: expire `pending` rows past `expires_at` (deleting the object if it exists) and delete `verified` assets unreferenced for 7+ days, as a soft delete followed by a hard delete. | oj has no cleanup, so abandoned uploads accumulate. A grace period avoids deleting an image the editor is mid-way through attaching. |
| D10 | **Blog caching uses the previous (non-Cache-Components) model:** `fetch(..., { next: { revalidate: 3600, tags: ["blog", \`blog:${slug}\`] } })`, plus a Next route handler `POST /api/revalidate` that calls `revalidateTag`. Do **not** enable `cacheComponents` in this phase. | Enabling Cache Components changes rendering semantics across the whole app, which is too large a blast radius for this goal. Tag revalidation plus a 1-hour backstop is enough. |
| D11 | **Hono triggers revalidation through the outbox pattern:** after a post's status/content changes, write a `revalidation` job and have the worker POST to `${FRONTEND_INTERNAL_URL}/api/revalidate` with an HMAC-signed body (`REVALIDATE_SECRET`, timestamp ±5 min). | A fire-and-forget fetch in the request handler silently loses an unpublish if the web container is restarting. That loss is the "unpublished post still live" bug. A queue gives retries. |
| D12 | **Scheduled publishing:** new status `scheduled` plus a `publish_at` column. On save, enqueue a delayed BullMQ job with `jobId = post:{id}:{publishAt}`. The job runs `UPDATE … SET status='published' WHERE id=$1 AND status='scheduled' AND publish_at <= now()`, then triggers revalidation. A once-a-minute sweeper repeatable job catches anything missed. | A deterministic job ID dedups reschedules. The conditional UPDATE makes double execution harmless, and the sweeper covers Redis data loss. |
| D13 | **Audit log:** `admin_audit_events (id, actor_id, action, entity_type, entity_id, metadata jsonb, ip_hash, created_at)`, append-only, written **in the same transaction** as the mutation. Covers: login success/failure, logout, password change, session revoke, inquiry status/note change, post create/update/publish/unpublish/schedule, media upload/delete, settings change. | Writing in the same transaction means no mutation without its audit row. IPs are hashed with the existing `INQUIRY_SECURITY_SECRET` approach, never stored raw. |
| D14 | **Recovery without an email reset flow for v1:** (a) authenticated *change password* (requires the current password, revokes all other sessions); (b) *sign out other sessions* / list active sessions; (c) an operator CLI `admin:reset-password` (sibling to `admin:bootstrap`) run in the container, which revokes all sessions. | With one or two admins, an emailed reset token is a new attack surface (token leakage, enumeration) for little gain. Revisit when there are more than three admins. |
| D15 | **UTM capture:** on first landing, the client reads `utm_source/medium/campaign/content` and the `ref` param into `sessionStorage` (first-touch, scoped to the tab, no PII). `BookingForm` and `ContactForm` attach them to the payload. The backend validates them (`max(120)`, a `[\w.-]` charset) and stores them in new `utm_*` columns. `source` stays `"website"`. | sessionStorage matches the existing idempotency-key pattern and avoids a cookie banner. Server-side validation is required because the values are attacker-controlled. |
| D16 | **Settings:** a `site_settings` single-row table for **operational** values only: notification recipients, the public response-time wording, and the default author. Business facts on the public site stay in the governed manifests. | Moving trust-governed facts into an editable table would bypass the evidence ledger and production build guard. |
| D17 | **Structured logging:** introduce `pino` with a request-ID middleware (`X-Request-Id` in and out) and replace `console.*` across the routes and worker. Redact the `phone`, `email`, `password`, and `cookie` paths. | The smoke test and production triage need correlatable logs. This is also a house default. |

## Risks and failure modes designed against

- **Presigned PUT fails only in the browser:** R2 bucket CORS must allow `PUT, HEAD` from the exact admin origin with the `Content-Type` header, and the client must send exactly the signed `Content-Type`. Phase 1 includes a browser-level test, not just an SDK unit test.
- **Upload succeeds but verify never runs** (tab closed): the row stays `pending` and the D9 sweeper expires it. The editor only shows verified assets.
- **Read-modify-write on publish:** the current `PATCH` runs `getPost`, then validates, then `updatePost`. A concurrent edit can publish a post whose cover was just cleared. Fix: do the publish gate as a single conditional `UPDATE … WHERE … AND cover_media_id IS NOT NULL` with a join to a verified media row, or wrap the steps in a transaction with `SELECT … FOR UPDATE`.
- **Error swallowing (existing bug):** `PATCH/POST /admin/blog/posts` maps *every* thrown error to `409 "URL already in use"`. Narrow it to the Postgres `23505` unique-violation code on the slug constraint and let everything else reach `onError` → 500 with a log line. Fix this in Phase 0, because the new FK and status logic will throw new error types.
- **Stale unpublished post:** covered by D11 retries plus the 1-hour backstop. Admin endpoints and `/admin/*` pages stay `no-store`.
- **Clock skew on scheduling:** compare with `now()` in Postgres, not Node's clock, and store `publish_at` as `timestamptz`. The admin UI shows the time in WAT and sends ISO with an offset.
- **Deleting an object that is still referenced:** cleanup checks the FK references in the same query that marks the row deleted (`NOT EXISTS (select 1 from blog_posts where cover_media_id = m.id)`).
- **Audit log as a PII sink:** metadata stores field *names* changed, not values, for inquiries. Notes and contact details are never copied into audit rows.
- **R2 credentials blast radius:** create a bucket-scoped R2 API token (Object Read & Write on this bucket only), not an account-wide key. The bucket is shared across environments (see Resolved decisions), so the token is the boundary to protect.

## Phases

Each phase lands as small, signed commits per repo. The backend contract and tests come before the frontend in every phase.

### Phase 0: Foundations (backend)
- Fix the blanket-409 error mapping and the publish read-modify-write race.
- Add pino plus the request-ID middleware; replace `console.*`.
- Add the `admin_audit_events` schema and migration, plus a `recordAudit(tx, …)` helper; wire it into the existing login/logout, inquiry patch, and post create/update.
- Also found and fixed during Phase 0: the CORS preflight did not allow the `Idempotency-Key` header, so cross-origin form submissions would fail; and the client IP was taken from the client-controlled first `X-Forwarded-For` entry, so the inquiry rate limit could be bypassed.
- **Gate:** existing 22 tests pass; new tests cover 23505 → 409 and other errors → 500; an audit row is written for each existing mutation, and a rolled-back mutation leaves no audit row; no PII in the log output of a test inquiry, checked with a redaction snapshot of a pino line.

### Phase 1: R2 media (backend, then web)
- Backend: R2 env vars in the Zod env (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_FOLDER_PREFIX`, `R2_PUBLIC_URL`), required when `NODE_ENV=production`. Add `storage/r2.ts` (client, presign, head, delete); the `media_assets` schema and migration; `POST /admin/media/presign`, `POST /admin/media/:id/verify`, `GET /admin/media` (paginated, verified only), `PATCH /admin/media/:id` (alt text), and `DELETE /admin/media/:id` (blocked when referenced). Add `blog_posts.cover_media_id` and update the publish gate.
- Web: endpoint registry entries; a `useMediaUpload` hook (presign → `fetch` PUT with progress via XHR → verify), modelled on oj's `use-file-upload.ts` but without the toast library, keeping the existing inline status pattern; a cover-image picker in `admin-blog-editor.tsx` (upload new or choose from library, alt text required); render the cover with `next/image` and `images.remotePatterns` for `media.<domain>`.
- Infrastructure (manual, documented in the README): bucket, custom domain, CORS rule, scoped token, Coolify env.
- **Gate:** unit tests for the extension/size/content-type allowlist, key generation, and verify (missing object → failed; oversize → failed and object deleted; expired → expired). A Playwright check that a real browser PUT to a staging bucket succeeds from the admin origin and is rejected from a foreign origin. Publish is rejected without a verified cover.

### Phase 2: Blog caching and scheduled publishing
- Web: tagged `fetch` in `public-blog.ts`; `app/api/revalidate/route.ts` with HMAC plus timestamp verification and `revalidateTag`.
- Backend: a `revalidation` queue and worker (retry with backoff, then a DLQ counted in the admin overview); enqueue on any change to a post's public state. Add the `scheduled` status, `publish_at`, the delayed job, and the sweeper.
- Web: a "Schedule" action in the editor with a WAT datetime input; a scheduled badge in the post list.
- **Gate:** a test that a published post is visible, then unpublished, then gone from `/blog/[slug]` within one revalidation cycle, with the queue retrying if the web app is down. A test that running the scheduled job twice publishes once. The revalidate route returns 401 on a bad signature and on a replay older than 5 minutes.

### Phase 3: Admin operations
- Backend: change password (current password required, revokes other sessions, audited); list and revoke sessions; the `admin:reset-password` script; `GET /admin/audit` (paginated, filter by entity); `site_settings` read/write; the worker reads the notification recipient from settings with an env fallback.
- Web: the `/admin/inquiries/[id]` detail page (full fields, UTM, status/note editing, audit history for that inquiry); an `/admin/settings` page (account security and operational settings); an activity view.
- **Gate:** route tests for wrong-current-password → 400 with a rate limit applied; revoked sessions → 401 on the next call; the settings change is audited; the inquiry detail page returns 404 for an unknown or malformed ID.

### Phase 4: Attribution
- Backend: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` columns, validated; included in the internal notification email and the admin list filters.
- Web: a first-touch capture component in the public layout; both forms attach the values; `/links` hub links carry `utm_source=instagram&utm_medium=social`.
- **Gate:** a contract test that invalid UTM values are rejected or truncated as specified; a landing with UTM → book → submit stores the values (Playwright).

### Phase 5: Launch smoke test
- A scripted smoke test (`mgcleaning-backend/scripts/smoke.ts`), run against staging: health → inquiry submit → outbox row reaches `sent` (Resend) → admin login over HTTPS cookie → read the inquiry → upload a cover → publish a post → public page shows it → unpublish → gone.
- Document Postgres backup and **a tested restore** in the README, plus the rollback path (Coolify previous deployment).
- **Gate:** the smoke test passes against staging twice in a row; a restore is exercised once into a scratch database.

## Not doing (accepted trade-offs)

- No image resizing or WebP variants (Cloudflare Images or a worker); uploads are capped at 5 MB, and `next/image` optimises on request.
- No email-based password reset (D14).
- No multi-instance Next cache handler; the single Coolify web container keeps the in-memory cache. Revisit if the web app scales horizontally.
- No manageable services/FAQs/testimonials tables; they stay in governed manifests.
- No analytics vendor; UTM data lives with inquiries only.

## Resolved decisions (2026-10-26)

- **Bucket topology:** one R2 bucket with `R2_FOLDER_PREFIX` per environment (`staging-files`, `production-files`), as in oj. Accepted trade-off: a staging credential can reach production objects, so keep the token scoped to this bucket and rotate it if the staging environment is compromised.
- **Upload scope:** blog covers only for now. `intent` stays an enum so gallery media can be added later.

## Phase 1 amendments (2026-10-26)

- **D9 narrowed:** cleanup expires abandoned uploads and removes objects for expired, failed, and deleted rows, but never deletes verified images automatically. They form the reusable media library, so removing them would break "choose from library".
- **D2 trimmed:** `width`/`height` were dropped from `media_assets`; covers render in a fixed 16:9 frame, so client-reported dimensions would be unverified data with no consumer. Verification also checks each file's leading bytes against its declared image type.
- **Legacy cover URLs** no longer satisfy the publish check; a post needs a verified upload. No real articles were published with URL-only covers.

## Phase 2 amendments (2026-10-27)

- **D11 delivery without BullMQ:** purges are rows in a `cache_revalidations` outbox written in the post's transaction. A dispatcher in the API process claims them with `FOR UPDATE SKIP LOCKED` every 5 seconds, and immediately after a commit. Redis is not involved, so losing Redis cannot drop an unpublish purge.
- **D11 purge modes:** removals (unpublish, archive, live slug change) use `revalidateTag(tag, { expire: 0 })`. The recommended `"max"` profile would serve the removed article to the next visitor while it refreshes. Other changes use `"max"`.
- **D12 sweeper only:** scheduled posts are published by a 30-second conditional `UPDATE` with no delayed BullMQ jobs, so there are no job IDs to deduplicate or reschedule. Worst-case lateness is about 30 seconds.
- **Web tests:** pure modules are tested with Node's built-in runner (`--experimental-strip-types`), so no test dependency was added.

## Phase 3 amendments (2026-10-27)

- **D16 narrowed:** settings hold the inquiry alert inbox and the default article author only. The public response-time wording stays in the governed trust-content manifest, because it is a customer-facing claim covered by the evidence ledger and production build guard.
- **One alert inbox:** the setting is a single address (falling back to `INQUIRY_NOTIFICATION_TO`). The email outbox keeps one internal notification per inquiry; add a team mailbox or distribution list for several recipients.
- **Activity page:** the audit trail also has its own admin page (`/admin/activity`) alongside the per-inquiry history.

## Open questions

1. Media domain: confirm `media.<domain>` once the production domain is final, and whether the domain's DNS is on Cloudflare.
