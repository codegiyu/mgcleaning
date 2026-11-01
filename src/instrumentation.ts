/** Runs once when the server starts: refuse to run with missing or insecure settings. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkWebEnvOrExit } = await import("./lib/env/startup-check");
    checkWebEnvOrExit();
  }
}
