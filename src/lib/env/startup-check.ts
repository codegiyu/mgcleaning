import { assertWebEnv } from "./validate";

/**
 * The settings the server actually runs with. `NEXT_PUBLIC_*` values are inlined at
 * build time (the Docker image passes them as build arguments, not runtime variables),
 * so they must be read with these literal references; only `REVALIDATE_SECRET` is a
 * runtime variable.
 */
export function currentWebEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_CONTENT_MODE: process.env.NEXT_PUBLIC_CONTENT_MODE,
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL,
    NEXT_PUBLIC_TURNSTILE_MODE: process.env.NEXT_PUBLIC_TURNSTILE_MODE,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  };
}

/**
 * Node.js-only startup check, imported from `src/instrumentation.ts` behind the runtime
 * guard so the Edge build never sees `process.exit`. A misconfigured production server
 * stops with a clear message instead of answering every request with 500.
 */
export function checkWebEnvOrExit() {
  try {
    assertWebEnv(currentWebEnv());
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
