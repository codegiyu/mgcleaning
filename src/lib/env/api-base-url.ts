/**
 * The API base URL, inlined at build time. The localhost fallback only serves local
 * development: production servers refuse to start without the variable (see
 * `src/lib/env/validate.ts`, run from `src/instrumentation.ts`), and the Docker build
 * refuses to build without it.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
