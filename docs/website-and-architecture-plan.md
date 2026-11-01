# MG Cleaning Services website and app plan

## Goal and scope

Build a credible public website that turns Instagram and search visitors into cleaning inquiries, with a blog that can be linked directly from Instagram posts. Put the first admin tools in the same Next.js application behind authentication. Keep the Hono backend in its own repository and leave a path open for booking and mobile products later.

The current build is a full visual demo of the public marketing site and blog, with replaceable sample content. Sample services and coverage are explicitly labeled in the UI. The cleaning request form posts to Hono, persists inquiries in PostgreSQL with a public reference and idempotency protection, queues internal and customer confirmation emails through a transactional outbox, and applies public-form abuse controls. The authenticated admin now supports inquiry status/notes, notification failure counts, and a database-backed blog draft/publish workflow. Public blog pages render published Hono content server-side. Use sample contact details during local testing. Do not invent testimonials, certifications, or performance numbers. Trust content is governed by `src/content/trust-content.ts`: demo media and placeholders carry provenance/rights metadata, while `NEXT_PUBLIC_CONTENT_MODE=production` fails the build until those records are replaced or approved. Before public launch, replace demo content with MG-approved service details, operating area, contact information, assets, privacy/retention terms, and claims. The first production release is a marketing site, blog publishing workflow, and lead inbox, not a full booking, dispatch, or CRM system.

Treat the Diamond Shine website and the client's messages/screenshots as reference material for a professional structure and the article-to-Instagram traffic pattern, not as instructions to copy its branding, copy, or exact feature set. Build MG's own visual identity and publish only MG-approved business facts.

The demo now uses the client-confirmed M&G Cleaning Services name and a broader professional-cleaning position: “Professional cleaning. Thoughtfully done.” and “Your space. Your needs. Our expertise.” The catalogue covers home, office, short-let, retainer, deep, upholstery, fumigation, tile-polishing, and post-construction services. Upholstery details still draw on the supplied flyer; fumigation and tile-polishing detail is researched draft content pending confirmation of M&G's exact methods, products, qualifications, and limitations. The navy-and-yellow identity and transparent SVG logo remain in the main app's public assets. Unverified business facts, media, and trust claims remain clearly marked as demo or draft content.

## Public pages

| Route | Purpose |
|---|---|
| / | Value proposition, quote/contact actions, confirmed service summaries, proof, recent articles, and service-area prompt. |
| /about | Who MG is, how the team works, and approved trust details. Avoid unverified certifications or experience claims. |
| /services | Overview of confirmed service types, linked to details. |
| /services/[slug] | What a confirmed service includes, suitable property types, preparation or limitations, and a quote CTA. |
| /areas | Coverage-confirmation page. It avoids naming locations until MG approves the service region. Add `/areas/[slug]` only for confirmed areas with useful, distinct content. |
| /blog | Paginated article listing with category filters and clear article cards. |
| /links | Mobile-first Instagram link hub with request, WhatsApp, phone, service, gallery, FAQ, and Instagram destinations. It is intentionally excluded from the sitemap. |
| /blog/category/[slug] | Optional category archive, once there is enough content to justify it. |
| /blog/[slug] | Article with author/date, cover image and alt text, related articles, and service/contact CTA. Each post has a stable shareable URL. |
| /contact | Contact methods, inquiry form, service interest, and optional preferred contact method/time. Only state a response expectation if MG confirms it. |
| /faq | Request-process FAQs. Demo answers are disclosed and `FAQPage` structured data is intentionally omitted until MG approves the content. |
| /privacy and /terms | Reviewed legal/privacy copy for inquiries, analytics, cookies, and site use. |

Global elements: mobile-first navigation, footer with verified contact details and social links, call/WhatsApp actions where approved, accessible focus states, and clear form loading, success, and error states.

## Admin pages in the same app

| Route | Access and purpose |
|---|---|
| /admin/login | Admin sign-in; no admin data shown before a valid session. |
| /admin | Protected summary of new inquiries and recent, draft, or published posts. |
| /admin/inquiries and /admin/inquiries/[id] | Protected inquiry inbox, details, status, and optional internal notes. |
| /admin/blog | Protected post list with draft/published filters. |
| /admin/blog/new and /admin/blog/[id] | Protected editor for draft, preview, publish, unpublish, and optional scheduling. |
| /admin/media | Image library/upload selector if object storage is selected for v1. |
| /admin/settings | Editable business contact/site details only if MG needs to maintain them without developer help. |

Use separate public and admin layouts in the Next.js App Router, for example route groups named (public) and (admin), while keeping one app and deployment. The current admin shell checks the Hono session before rendering private screens. That browser check improves navigation only: every admin API operation also validates the session and enforces admin access.

## Instagram-to-blog loop

1. Write a useful article around a real customer question, service explanation, or cleaning tip.
2. Publish it at a stable URL, for example mgcleaning.example/blog/how-to-prepare-for-a-deep-clean.
3. Create an Instagram post or reel about the same topic and use a specific CTA such as “Read the full guide” with that article URL. Where the post format does not permit a clickable caption link, put the URL in the profile link or a link hub and name the destination. Avoid sending every post to a generic blog index when a relevant article exists.
4. Add campaign parameters such as utm_source=instagram, utm_medium=social, and a post/campaign identifier. Preserve them through the landing flow where useful and record only the attribution needed to understand inquiries.
5. Put a relevant quote/contact CTA inside the article and measure article visits and inquiry submissions as separate events.

The mobile path should be obvious: post → article → relevant service/contact action. Instagram is a discovery channel; the website owns the durable content and inquiry path.

## Application and repository architecture

The browser loads the Next.js 16 app, which contains public pages and the authenticated admin. The app calls the Hono API under /api/v1 through the existing typed callApi boundary. Hono validates requests and applies business rules, reads/writes PostgreSQL through Drizzle, and enqueues background work in Redis/BullMQ. The Hono process also runs the BullMQ email worker, which renders React Email templates and sends through Resend in production. Local development can use SMTP with Mailpit. Store uploaded image bytes in object storage/CDN and keep asset metadata in PostgreSQL.

### Main app: mgcleaning

- Next.js App Router, TypeScript, Tailwind CSS v4, and Zustand. Public and admin routes share one app/deployment with distinct layouts.
- Keep the existing browser-only callApi helper and typed endpoint registry as the sole browser-to-API boundary. Add endpoint names, payloads, response types, and paths in src/lib/api/endpoints.ts. Avoid scattered raw Axios calls.
- Use component state for forms and short-lived UI details. Use feature-scoped Zustand stores for shared data and caches such as blog lists/articles and the inquiry inbox.
- Keep filters, pagination, and sorting in the URL when users should be able to bookmark or share them.
- Do not add React Query or turn Zustand into a general-purpose query framework. Document a small cache policy per feature: expiry, refresh, invalidation, and error state.
- Successful admin mutations invalidate related feature caches. Never cache credentials or use local storage for auth tokens. Avoid persistent browser storage for inquiry PII.

### Public rendering and SEO

**Decision: server-render public blog pages.** If /blog/[slug] is an empty shell until JavaScript runs, search engines and social preview bots may miss the article text, title, description, and image. That would weaken the Instagram-to-website loop. Next.js will fetch published public content from Hono on the server and include the article and its metadata in the initial HTML. Generate per-article title/description/Open Graph metadata, canonical URLs, sitemap entries, and Article structured data.

This is a narrow exception to the earlier all-client-side preference: public SEO-critical reads use Next server rendering or static generation with revalidation; admin operations, inquiry submissions, and other interactive browser features continue through the typed callApi helper. Keep drafts inaccessible from public Hono endpoints. When an article is published, updated, or unpublished, refresh the corresponding Next content cache so the stable URL and blog listing reflect the change promptly. The exact invalidation mechanism can be selected with the deployment setup; a bounded revalidation interval is an acceptable fallback.

All public pages should have descriptive titles and metadata, canonical links, Open Graph/Twitter card fields, robots.txt, and a sitemap. Use LocalBusiness structured data only with facts MG verifies. Size image boxes to avoid layout shift, use meaningful alt text, and keep the initial mobile page light.

### Backend: mgcleaning-backend

- Hono owns business rules, validation, authentication/authorization, persistence, and background work. Keep HTTP endpoints under /api/v1 and follow the success/error envelope already expected by callApi.
- PostgreSQL via Drizzle is the source of truth. Redis is initially for BullMQ and short-lived coordination, not permanent storage for content/inquiries and not a required API cache.
- Validate request bodies, query parameters, and route IDs with Zod. Add pagination limits, rate limits on login and public inquiry submission, structured request IDs, and safe errors without stack traces.
- Use BullMQ for work that should not hold an HTTP request open, initially inquiry notifications and, if requested, scheduled post publishing. Make retryable jobs safe and deduplicate side effects where feasible.
- React Email templates are rendered by the worker started inside the Hono process. Use Resend for production delivery and SMTP with Mailpit for local previews.
- Store uploaded image bytes in object storage/CDN and keys/metadata in Postgres. Do not use container disk, Postgres blobs, or Redis as the long-term media library. Select a provider before implementing uploads.

## Initial domain model and API contracts

The backend has a `contact_inquiries` table with contact details, free-text service interest, message, source, status, private internal note, and timestamps. `admin_users` stores scrypt password hashes; `admin_sessions` stores only hashes of random 12-hour session tokens. `blog_posts` stores title, unique slug, excerpt, plain-text body, category, optional HTTPS cover URL and alt text, draft/published/archived state, timestamps, and SEO title/description. Blog body rendering supports a deliberately small safe format (paragraphs, headings, bold, and bullet lists); raw HTML is never interpreted. Keep service interest flexible until MG confirms the catalogue.

`media_assets` and object storage remain deferred until a provider is selected. The frontend currently uses typed public-content and trust-content manifests so demo replacement does not require a CMS. The blog API now stores author and related-service metadata and refuses publication without a cover image and alt text. Add manageable services, service areas, FAQs, and testimonials only if MG confirms that it wants to maintain those records itself; until then, preserve the manifest's provenance, rights, approval, and review fields.

API families (exact naming can follow existing route conventions):

| Family | Example operations |
|---|---|
| Public content | GET /blog, GET /blog/:slug, GET /blog/categories, GET /services, and approved service-area reads. Return published content only, with pagination and stable slugs. |
| Inquiries | POST /inquiries publicly; authenticated GET /admin/inquiries, GET /admin/inquiries/:id, and PATCH /admin/inquiries/:id for status/notes. |
| Admin session | Login, current-session, logout, and session renewal/revocation endpoints, or equivalent identity-provider callbacks. |
| Admin posts | Authenticated list, create, update, preview, publish/unpublish, and optional schedule operations. Public reads must never expose drafts. |
| Media | Authenticated upload-intent/finalize or upload operations, with type/size validation and object storage; public delivery uses CDN/object URLs. |

Use explicit pagination and publication fields in response contracts. Add API contract/integration tests for public draft exclusion, unauthorized admin requests, invalid input, and inquiry persistence before wiring the UI.

## Authentication and security boundaries

Start with MG staff/admin accounts only; customers do not need accounts for v1. Prefer a server-managed opaque session in a Secure, HttpOnly, SameSite cookie (with suitable local-development settings) rather than a bearer token readable by JavaScript. The Hono API validates the session and enforces admin access for every protected route. Redirecting from /admin is not an authorization control.

For cross-origin app and API deployments, configure Axios withCredentials, exact allowed CORS origins, credentialed CORS, and cookie domain/same-site settings together. Never combine credentials with wildcard CORS. If deployment requires cross-site cookies, include CSRF protection for state-changing requests; rate-limit login, use a password hashing scheme designed for credentials, revoke sessions on logout/password reset, and audit publish/status-changing actions. Keep admin responses out of shared CDN caches.

## Client cache and consistency rules

- Blog lists/articles: Next's server cache/revalidation policy owns the crawlable initial response. Any client-side transition cache is secondary, keyed by route/query, and invalidated after publish, unpublish, or update. Prefer URL-backed category/page filters.
- Inquiry inbox: load with pagination and refresh on entry or explicit refresh. After a status/note mutation, update or invalidate that record/list. Do not persist inquiry data in long-lived browser storage.
- Contact forms: keep drafts in local component state. Prevent duplicate submissions while pending; show a recoverable error and confirmation. Add server-side abuse controls and do not promise a response time until MG confirms one.
- Avoid optimistic publishing unless rollback and conflict behavior are defined. For a small admin team, explicit save/publish responses are clearer.

## Delivery phases and done gates

1. **Confirm launch facts and deployment details.** MG approves brand assets, exact services, coverage, contact channels, testimonials/credentials, inquiry handling, article ownership/review, privacy copy, and admin access. Decide deployment origins, verify a sender domain in Resend, and select media storage if uploads are needed for v1. Public blog pages are server-rendered by design.
2. **Trust-content readiness.** Implemented a demo/production content mode, explicit provenance and rights metadata, visible generated-media disclosures, safe `/faq` and `/areas` surfaces, and a production build guard that rejects unapproved trust records. Before launch, complete the evidence ledger: customer permissions, authentic project media, verified Google profile URL, approved coverage, hours, address wording, certifications, guarantees, and FAQ answers.
3. **Public site foundation.** Build responsive public layouts, home/about/services/contact pages, metadata, accessibility basics, and inquiry form connected to the existing inquiry model through validated Hono endpoints. Done when mobile and desktop flows work, errors/success are clear, and a submitted inquiry appears in Postgres without PII leaking to logs.
4. **Admin access and inquiry operations.** Implemented the initial session lifecycle, protected layouts, inquiry list/status/private notes, session rate limiting, and route tests for unauthenticated denial. Live database and browser-cookie smoke tests remain to run once local Compose services are available. Add audit events and recovery workflows before public launch.
5. **Blog publishing end to end.** Implemented article schema and migration, public listing/detail APIs, admin draft editor, publish/unpublish, article metadata, and server-rendered public content. Verify the database-backed flow, preview metadata, and cache behavior when services are available; select object storage before building upload UI.
5. **Launch hardening.** Run an end-to-end inquiry and email-delivery smoke test, verify admin cookies and blog publishing against PostgreSQL, then deploy the app and API stack to Coolify with HTTPS, exact CORS/cookie configuration, Resend, database backups, monitoring, error reporting, sitemap/robots, and a rollback path. The email worker runs in the API process; local checks use Mailpit, while production delivery uses Resend.
6. **Validate before expanding.** Review visits-to-inquiries, attribution, admin workload, and recurring customer questions. Add booking/calendar, customer accounts, staff workflows, or a mobile app only after these workflows show a real need.

## Key risks to control

- **Client-rendered blog only:** crawlers or Instagram preview bots may not get article-specific content/metadata. Decide the public rendering strategy before treating blog discovery as a core growth channel.
- **Unsupported brand claims:** wrong coverage, service promises, certifications, reviews, or photos damage trust. Require MG approval for public facts and rights to supplied images.
- **Lead loss:** a form can appear successful while persistence or notification fails. Persist first, enqueue notification safely, monitor queue failures, and show success only after the inquiry is stored.
- **Auth/CORS mismatch:** local development may work while production cookie requests fail or permissive CORS exposes credentials. Test deployed origins and unauthorized direct API calls.
- **Duplicate or lost email jobs:** database writes and queue enqueue can diverge. Use an outbox or another recoverable enqueue strategy before relying on notifications as the only record; the inquiry itself remains persisted if email fails.
- **Untrusted article markup/uploads:** validate editor content and file types, sanitize rendered content, constrain upload sizes, and use storage permissions that cannot overwrite arbitrary paths.
- **Stale client state:** define cache invalidation for publishing/editing and inquiry status changes; an old cache must not imply that an unpublished post is live.

## Deferred

Payments, customer accounts, dispatch/staff scheduling, live booking availability, inventory, advanced CRM/marketing automation, and the mobile app are outside v1. Keep the API and data model extensible without pretending those workflows are known now.
