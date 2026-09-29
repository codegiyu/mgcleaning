<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MG Cleaning web app

- Read `README.md` for the two-repository layout and current product notes.
- Use the bundled Next.js 16 documentation under `node_modules/next/dist/docs/` before framework changes.
- Keep frontend-to-backend requests in the browser through `src/lib/api/callApi.ts`; add typed routes and response shapes to `src/lib/api/endpoints.ts`.
- Use Zustand for shared state or feature-level client caches and local component state for short-lived UI state. Do not add React Query.
- Do not publish service, location, review, or certification claims until MG confirms them.
