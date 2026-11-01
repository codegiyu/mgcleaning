import { z } from "zod";

/** True for local addresses, where production-mode test runs use plain http. */
function isLocal(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

const optionalUrl = z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional());

const webEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_API_BASE_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    NEXT_PUBLIC_CONTENT_MODE: z.enum(["demo", "production"]).default("demo"),
    NEXT_PUBLIC_MEDIA_BASE_URL: optionalUrl,
    NEXT_PUBLIC_TURNSTILE_MODE: z.enum(["off", "on"]).default("off"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    REVALIDATE_SECRET: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== "production") return;
    const refuse = (path: string, message: string) => context.addIssue({ code: "custom", path: [path], message });
    for (const key of ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_SITE_URL"] as const) {
      const url = value[key];
      if (!url) refuse(key, `${key} is required in production.`);
      else if (!url.startsWith("https://") && !isLocal(url)) refuse(key, `${key} must use https:// in production.`);
    }
    // Without it, the API's purges are rejected and unpublished articles and reviews stay cached for an hour.
    if (!value.REVALIDATE_SECRET || value.REVALIDATE_SECRET.length < 32) {
      refuse("REVALIDATE_SECRET", "REVALIDATE_SECRET of at least 32 characters (matching the API's) is required in production.");
    }
    if (value.NEXT_PUBLIC_TURNSTILE_MODE === "on" && !value.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      refuse("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY is required when Turnstile is on.");
    }
  });

/** The problems with a set of variables, as "NAME: message" lines; empty when valid. */
export function webEnvProblems(source: Record<string, string | undefined>) {
  const result = webEnvSchema.safeParse(source);
  return result.success ? [] : result.error.issues.map((issue) => `${String(issue.path[0] ?? "env")}: ${issue.message}`);
}

/** Throws with every problem listed; called once when the server starts. */
export function assertWebEnv(source: Record<string, string | undefined>) {
  const problems = webEnvProblems(source);
  if (problems.length) throw new Error(`The website is misconfigured:\n- ${problems.join("\n- ")}`);
}
