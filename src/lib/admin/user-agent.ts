/** "Chrome on Windows"-style label so an admin can recognise their own sessions. Best effort only. */
export function describeUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown browser";
  const browser =
    /Edg\//.test(userAgent) ? "Edge"
      : /OPR\/|Opera/.test(userAgent) ? "Opera"
        : /Firefox\//.test(userAgent) ? "Firefox"
          : /Chrome\/|CriOS\//.test(userAgent) ? "Chrome"
            : /Safari\//.test(userAgent) ? "Safari"
              : "Browser";
  const platform =
    /iPhone|iPad|iPod/.test(userAgent) ? "iOS"
      : /Android/.test(userAgent) ? "Android"
        : /Windows/.test(userAgent) ? "Windows"
          : /Mac OS X|Macintosh/.test(userAgent) ? "macOS"
            : /Linux/.test(userAgent) ? "Linux"
              : "";
  return platform ? `${browser} on ${platform}` : browser;
}
