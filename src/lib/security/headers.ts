/**
 * Response headers for every page, built from the deployment's settings.
 *
 * The CSP follows the "Without Nonces" setup from the Next.js docs: a nonce would make
 * every cached (ISR) page render on each request, so scripts allow 'unsafe-inline' and
 * everything else is locked to this site, the API, and the media host. The main gains
 * are blocking framing (clickjacking on /admin), plugins, base-tag and form-target
 * hijacking, and data being sent to unknown hosts.
 */
export type SecurityHeaderOptions = {
  apiBaseUrl: string;
  mediaBaseUrl?: string;
  siteUrl: string;
  turnstile: boolean;
  isDev: boolean;
};

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
/**
 * Admin uploads `PUT` straight to R2's S3 endpoint (`<bucket>.<account>.r2.cloudflarestorage.com`)
 * with a presigned URL. The account id is not a website setting, so the policy allows any R2
 * endpoint; uploads still need a URL signed by the API.
 */
const R2_UPLOAD_ORIGIN = "https://*.r2.cloudflarestorage.com";

function originOf(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function contentSecurityPolicy(options: SecurityHeaderOptions) {
  const api = originOf(options.apiBaseUrl);
  const media = originOf(options.mediaBaseUrl);
  const httpsSite = originOf(options.siteUrl)?.startsWith("https://") ?? false;
  const turnstile = options.turnstile ? [TURNSTILE_ORIGIN] : [];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(options.isDev ? ["'unsafe-eval'"] : []), ...turnstile],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(media ? [media] : [])],
    // Gallery videos play from the media host; `blob:` lets the admin read a picked clip's length and frames.
    "media-src": ["'self'", "blob:", ...(media ? [media] : [])],
    "font-src": ["'self'"],
    // The browser calls the API directly (forms, admin, tap beacons) and uploads media to R2; dev adds the HMR socket.
    "connect-src": ["'self'", ...(api ? [api] : []), R2_UPLOAD_ORIGIN, ...(options.isDev ? ["ws:"] : [])],
    "frame-src": turnstile.length ? turnstile : ["'none'"],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  // Only on an HTTPS site: upgrading a local http://localhost API call would break it.
  if (httpsSite) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders(options: SecurityHeaderOptions) {
  const httpsSite = originOf(options.siteUrl)?.startsWith("https://") ?? false;
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(options) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    ...(httpsSite && !options.isDev ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
  ];
}
