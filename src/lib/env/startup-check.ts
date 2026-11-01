import { assertWebEnv } from "./validate";

/**
 * Node.js-only startup check, imported from `src/instrumentation.ts` behind the runtime
 * guard so the Edge build never sees `process.exit`. A misconfigured production server
 * stops with a clear message instead of answering every request with 500.
 */
export function checkWebEnvOrExit() {
  try {
    assertWebEnv(process.env);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
