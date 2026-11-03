# M&G Cleaning Services web app

This repository contains the customer-facing M&G Cleaning Services website, built with Next.js 16, TypeScript, and Tailwind CSS v4. The Hono API and background workers live in the sibling [`mgcleaning-backend`](../mgcleaning-backend) repository.

See the [website and architecture plan](docs/website-and-architecture-plan.md) for the public page map, blog and Instagram flow, authenticated admin scope, API/data design, security boundaries, and delivery phases.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Start the app with `npm run dev`.

The backend API defaults to `http://localhost:4000/api/v1`; set `NEXT_PUBLIC_API_BASE_URL` to change it.

**Using the live API locally.** Pointing `NEXT_PUBLIC_API_BASE_URL` straight at a deployed API works for public pages and forms, but admin sign-in will not stick: the API's session cookie is `SameSite=Lax` on the API's own domain, and browsers do not send it on requests from `localhost`. Instead, let the dev server proxy the API:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
API_PROXY_TARGET=https://mgcleaning-api.firefalltechnologies.ng
```

`next dev` then forwards `/api/v1/*` to that origin (`rewrites` in `next.config.ts`), so the browser only ever talks to `localhost` and the session cookie stays first-party. The API must list `http://localhost:3000` in `FRONTEND_ORIGINS`. Chrome, Edge, and Firefox accept the API's `Secure` cookie on `http://localhost`. Everything you do is real: enquiries, edits, and sign-ins reach production and its activity log. Production builds ignore `API_PROXY_TARGET`.

## Docker and Coolify

The root `Dockerfile` builds a multi-stage production image using Next.js standalone output. The final image runs as the unprivileged `nextjs` user and listens on port `3100` (the server's `3000` is taken; override with the `PORT` runtime variable).

For Coolify, create a Dockerfile application from this repository, set its port to `3100`, and assign the public website domain. Set these **build-time** variables before deployment (they are public URLs, not secrets):

- `NEXT_PUBLIC_API_BASE_URL=https://api.<your-domain>/api/v1`
- `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
- `NEXT_PUBLIC_CONTENT_MODE=demo` while reviewing the generated design content; switch to `production` only after the trust-content approval gate passes.
- `NEXT_PUBLIC_TURNSTILE_MODE=off` initially; set to `on` with the matching public site key if the backend Turnstile feature is activated.
- `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.<your-domain>`: the R2 custom domain (the backend `R2_PUBLIC_URL`). It is added to `images.remotePatterns`, and blog covers from any other host fall back to the default artwork instead of breaking the page.

**Hosting the website on Vercel.** The `*.vercel.app` address cannot be used for the live site: it is a different site from the API, so the admin cookie would never reach it. Add a custom domain on the same parent domain as the API (for example `mgcleaning.firefalltechnologies.ng` for the website and `mgcleaning-api.firefalltechnologies.ng` for the API) in the Vercel project's Domains settings, with the CNAME record Vercel shows. Then, in Vercel's environment variables for Production, set the three `NEXT_PUBLIC_*` values above to those domains (`NEXT_PUBLIC_SITE_URL=https://mgcleaning.firefalltechnologies.ng`, `NEXT_PUBLIC_API_BASE_URL=https://mgcleaning-api.firefalltechnologies.ng/api/v1`), set `REVALIDATE_SECRET`, and redeploy, since `NEXT_PUBLIC_*` values are baked in at build time. On the API, set `FRONTEND_ORIGIN` to the same website origin. Vercel preview deployments have other addresses, so admin sign-in works only on the custom domain.

Keep the website and API on the same registrable domain (for example, `mgcleaning.example` and `api.mgcleaning.example`) so the current `SameSite=Lax` admin session cookie can accompany credentialed browser requests. Set the backend `FRONTEND_ORIGIN` to the website origin exactly. The API must be publicly reachable over HTTPS because browser calls and public server-rendered blog reads use this URL.

Build and run locally with Docker by passing both public URL build arguments:

```sh
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_CONTENT_MODE=demo \
  --build-arg NEXT_PUBLIC_TURNSTILE_MODE=off \
  -t mgcleaning-web .
docker run --rm -p 3000:3100 mgcleaning-web
```

Set `REVALIDATE_SECRET` as a **runtime** variable (not a build argument) to the same 32+ character value as the backend's `REVALIDATE_SECRET`. Published-article reads are cached for up to an hour and tagged `blog` / `blog:<slug>`. The backend calls `POST /api/revalidate` with an HMAC signature after every change that affects the public site; removals (unpublish, archive, slug change) expire immediately, and other changes refresh in the background. Without the secret the route returns 503 and pages fall back to the hourly refresh.

A production server (`NODE_ENV=production`) checks its settings when it starts (`src/instrumentation.ts`, rules in `src/lib/env/validate.ts`) and exits with a list of problems unless:
- `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL` are set and use `https://` (plain `http://localhost` is allowed for local runs);
- `REVALIDATE_SECRET` has 32+ characters;
- a Turnstile site key is set when Turnstile is on.

`npm start` runs the standalone production build locally (`scripts/start-standalone.mjs`).

Next.js inlines `NEXT_PUBLIC_*` values into the built application, so changing these values in Coolify requires a new build and deploy. Production content mode intentionally fails the build while generated or unapproved trust records remain in `src/content/trust-content.ts`.

On Vercel, social metadata resolves the site origin in this order: `NEXT_PUBLIC_SITE_URL`, Vercel's production/deployment URL, then `https://mgcleaning.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` when the permanent domain is ready; the fallback prevents canonical and social-image tags from ever publishing localhost URLs in production builds.

The SEO layer follows the same gate: demo builds use canonical URLs for local testing but emit `noindex, nofollow`, block crawlers in `robots.txt`, return an empty sitemap, and suppress structured data. After approved content is supplied, set `NEXT_PUBLIC_CONTENT_MODE=production` and an HTTPS `NEXT_PUBLIC_SITE_URL`; production then emits page-specific canonical, Open Graph, Twitter, breadcrumb, WebSite, LocalBusiness, Service, Article, and FAQ metadata where the corresponding facts are approved.

## Checks

Release, staging smoke-test, backup, restore, and rollback procedures for both apps live in the backend's [operations runbook](../mgcleaning-backend/docs/operations-runbook.md).


Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. `npm test` uses Node's built-in test runner with type stripping (`node --experimental-strip-types --test`), so pure modules under `src/**/*.test.ts` need no extra test dependencies; such modules import siblings with explicit `.ts` extensions and avoid `@/` aliases.

End-to-end tests (`e2e/`, Playwright) run against a live stack: the production build (`npm run build && npm start`) and the API with Postgres and Redis. They cover:
- the booking form, both blocked and complete;
- the contact form;
- the not-found page;
- the phone layout of the booking page;
- an owner publishing a review that then appears on the home page.

They create real records, so use a local or CI stack. Run them with:

```bash
E2E_ADMIN_EMAIL=<owner> E2E_ADMIN_PASSWORD=<password> npm run test:e2e
```

Run `npx playwright install chromium` once beforehand.

CI (`.github/workflows/ci.yml`) has two jobs:
- **checks:** lint, typecheck, unit tests, build, and a production dependency audit;
- **e2e:** starts Postgres, Redis, Mailpit, the API (checked out from the public `codegiyu/mgcleaning-backend`: its `main` for pushes to `main`, otherwise `staging`) and the website, then runs Playwright.

## API and state conventions

- Use the browser-only `callApi` helper in `src/lib/api/callApi.ts` for frontend-to-backend calls.
- Keep endpoint paths and request/response types in `src/lib/api/endpoints.ts`.
- Use Zustand feature stores for shared state or client-side response caches (add the package with the first store; none exists yet); keep short-lived form state local to the component.
- React Query is not used.

The typed endpoint registry and centralized request/result shape follow the pattern in Firefall's `pinpoint-admin` app. Admin authentication is handled by the Hono backend using an HttpOnly session cookie; the browser does not store auth tokens.

## Demo content

This preview uses the client-confirmed M&G Cleaning Services name, navy-and-yellow identity, broader professional-cleaning positioning, nine service categories, and a five-step service process. Fumigation and tile-polishing detail is researched draft content pending confirmation of M&G's exact methods, products, qualifications, and limitations. Additional service descriptions and blog articles remain review content in `src/content/demo-content.ts`. The inquiry form posts to the Hono API; local development stores test submissions in PostgreSQL and captures queued email in Mailpit. Use sample contact details only. Confirm actual business details, the notification recipient, privacy/retention terms, and replace or approve draft content before a public launch.

Admin sign-in, inquiry management, and database-backed blog drafting/publishing are now implemented. Public pages record first-touch campaign attribution for the browser tab in `sessionStorage` (`mg-first-touch`): the UTM tags and the first page visited, with no identifiers or cookies. Untagged visits to `/links` count as `instagram / social / link-in-bio`, because the Instagram bio links there. The booking and contact forms send it with the enquiry, the inquiry detail shows "Came from", the inbox can be filtered by source, and live articles show a copyable Instagram link tagged with the article slug as the campaign. Admins can also open each inquiry at `/admin/inquiries/<id>` with its full change history, review all admin activity at `/admin/activity`, and use `/admin/settings` to change their password, sign out other devices, and set the inquiry alert inbox and default article author. Owners manage accounts at `/admin/users`: add staff or owners, change roles, deactivate, and reset passwords. New and reset accounts get a one-time temporary password and must choose their own at first sign-in. Staff see everything except Users and cannot change site settings. Customer reviews are managed at `/admin/reviews`: add the customer's words, an optional rating, service, and source, preview the public card, and publish once the customer's agreement is confirmed (unpublish takes a review off the site at once; delete is permanent). The list tracks progress towards the target of 10 published reviews a year. Published reviews appear on the home page (up to six, featured first) and at `/reviews`. Both are server-rendered and cached under the `reviews` tag, refresh as soon as the team changes a review, and show nothing (never sample copy) while there are none or the API is unreachable. Gallery photos and short videos are managed at `/admin/gallery`: upload several at once (JPG, PNG, or WebP up to 5 MB; MP4 or WebM up to 50 MB and 60 seconds, with iPhone `.mov` clips refused with export advice), and each becomes a draft. Videos get a cover image grabbed from a frame in the browser at upload time; editors can pick another paused frame or upload one. Publishing needs a real description and confirmation that M&G owns the media and anyone shown agreed. Up and down arrows set the public order (they work from the keyboard), and any admin, staff included, can delete an item, which also removes its files. The public `/gallery` page is cached under the `gallery` tag and refreshes when the team changes a published item; demo builds show labelled placeholder images until something is published, and production builds show a "being prepared" state instead. Blog covers are uploaded from the editor straight to Cloudflare R2 (presigned `PUT`, then server-side verification) or picked from previously uploaded images; see the backend README for the upload contract and bucket setup. Public blog listing and article pages render published API content server-side; local development falls back to the supplied sample articles if the API is offline.

Trust content is governed separately in `src/content/trust-content.ts`. Placeholder testimonial/FAQ/service-area content is visibly disclosed and is not launch evidence; the placeholder gallery images there appear only in demo builds. Replace them with approved records, rights, and sources before setting `NEXT_PUBLIC_CONTENT_MODE=production`; the production build guard will reject unapproved trust records.

The launch replacement checklist is maintained in [`docs/trust-content-evidence-ledger.md`](docs/trust-content-evidence-ledger.md). Confirmed phone, WhatsApp, Instagram, and response-expectation facts are stored as approved records; official email, operating hours, Abuja coverage, and other business claims remain blocked until supplied.

The recommended blog cadence and publication checklist are in [`docs/editorial-calendar.md`](docs/editorial-calendar.md).

To create the first admin, configure `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` in the backend `.env`, run the backend migrations, and start the API: it creates any missing owner accounts on start (`npm run admin:bootstrap` in `mgcleaning-backend` does the same by hand). Use a unique password of at least 12 characters and remove it from the environment after bootstrapping. The first account is an owner; add staff from **Admin → Users**. Before public launch, run the staging smoke test and recovery procedures in the backend runbook, and replace the clearly labeled sample content with MG-approved copy (the production build refuses to run until it is approved).
