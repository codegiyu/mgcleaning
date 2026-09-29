# M&G Cleaning Service web app

This repository contains the customer-facing M&G Cleaning Service website, built with Next.js 16, TypeScript, Tailwind CSS v4, and Zustand. The Hono API and background workers live in the sibling [`mgcleaning-backend`](../mgcleaning-backend) repository.

See the [website and architecture plan](docs/website-and-architecture-plan.md) for the public page map, blog and Instagram flow, authenticated admin scope, API/data design, security boundaries, and delivery phases.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Start the app with `npm run dev`.

The backend API defaults to `http://localhost:4000/api/v1`; set `NEXT_PUBLIC_API_BASE_URL` to change it.

## Docker and Coolify

The root `Dockerfile` builds a multi-stage production image using Next.js standalone output. The final image runs as the unprivileged `nextjs` user and listens on port `3000`.

For Coolify, create a Dockerfile application from this repository, expose port `3000`, and assign the public website domain. Set these **build-time** variables before deployment (they are public URLs, not secrets):

- `NEXT_PUBLIC_API_BASE_URL=https://api.<your-domain>/api/v1`
- `NEXT_PUBLIC_SITE_URL=https://<your-domain>`
- `NEXT_PUBLIC_CONTENT_MODE=demo` while reviewing the generated design content; switch to `production` only after the trust-content approval gate passes.
- `NEXT_PUBLIC_TURNSTILE_MODE=off` initially; set to `on` with the matching public site key if the backend Turnstile feature is activated.

Keep the website and API on the same registrable domain (for example, `mgcleaning.example` and `api.mgcleaning.example`) so the current `SameSite=Lax` admin session cookie can accompany credentialed browser requests. Set the backend `FRONTEND_ORIGIN` to the website origin exactly. The API must be publicly reachable over HTTPS because browser calls and public server-rendered blog reads use this URL.

Build and run locally with Docker by passing both public URL build arguments:

```sh
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1 \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_CONTENT_MODE=demo \
  --build-arg NEXT_PUBLIC_TURNSTILE_MODE=off \
  -t mgcleaning-web .
docker run --rm -p 3000:3000 mgcleaning-web
```

Next.js inlines `NEXT_PUBLIC_*` values into the built application, so changing these values in Coolify requires a new build and deploy. Production content mode intentionally fails the build while generated or unapproved trust records remain in `src/content/trust-content.ts`.

On Vercel, social metadata resolves the site origin in this order: `NEXT_PUBLIC_SITE_URL`, Vercel's production/deployment URL, then `https://mgcleaning.vercel.app`. Set `NEXT_PUBLIC_SITE_URL` when the permanent domain is ready; the fallback prevents canonical and social-image tags from ever publishing localhost URLs in production builds.

The SEO layer follows the same gate: demo builds use canonical URLs for local testing but emit `noindex, nofollow`, block crawlers in `robots.txt`, return an empty sitemap, and suppress structured data. After approved content is supplied, set `NEXT_PUBLIC_CONTENT_MODE=production` and an HTTPS `NEXT_PUBLIC_SITE_URL`; production then emits page-specific canonical, Open Graph, Twitter, breadcrumb, WebSite, LocalBusiness, Service, Article, and FAQ metadata where the corresponding facts are approved.

## API and state conventions

- Use the browser-only `callApi` helper in `src/lib/api/callApi.ts` for frontend-to-backend calls.
- Keep endpoint paths and request/response types in `src/lib/api/endpoints.ts`.
- Use Zustand feature stores for shared state or client-side response caches; keep short-lived form state local to the component.
- React Query is not used.

The typed endpoint registry and centralized request/result shape follow the pattern in Firefall's `pinpoint-admin` app. Admin authentication is handled by the Hono backend using an HttpOnly session cookie; the browser does not store auth tokens.

## Demo content

This preview uses the M&G Cleaning Service name, navy-and-yellow identity, logo, upholstery service details, and phrases extracted from the supplied flyer. Additional service descriptions and blog articles are sample content stored in `src/content/demo-content.ts`. The inquiry form now posts to the Hono API; local development stores test submissions in PostgreSQL and captures queued email in Mailpit. Use sample contact details only. Confirm actual business details, the notification recipient, privacy/retention terms, and replace sample content before a public launch.

Admin sign-in, inquiry management, and database-backed blog drafting/publishing are now implemented. Public blog listing and article pages render published API content server-side; local development falls back to the supplied sample articles if the API is offline.

Trust content is governed separately in `src/content/trust-content.ts`. Demo gallery media and placeholder testimonial/FAQ/service-area content are visibly disclosed and are not launch evidence. Replace them with approved records, rights, and sources before setting `NEXT_PUBLIC_CONTENT_MODE=production`; the production build guard will reject unapproved trust records.

The launch replacement checklist is maintained in [`docs/trust-content-evidence-ledger.md`](docs/trust-content-evidence-ledger.md). Confirmed phone, WhatsApp, Instagram, and response-expectation facts are stored as approved records; official email, operating hours, Abuja coverage, and other business claims remain blocked until supplied.

The recommended blog cadence and publication checklist are in [`docs/editorial-calendar.md`](docs/editorial-calendar.md).

To create the first admin, configure `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` in the backend `.env`, run the backend migrations, and execute `npm run admin:bootstrap` from `mgcleaning-backend`. Use a unique password of at least 12 characters and remove it from the environment after bootstrapping. Before public launch, add the live inquiry/mail smoke test, review access and recovery procedures, and replace the clearly labeled sample content with MG-approved copy.
