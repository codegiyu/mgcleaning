/**
 * The first save of a new article or review moves the editor to its own URL, which
 * remounts the page and would lose the "saved" message. The editor redirects with
 * `?saved=<status>`; the page passes that status in as a prop (so server and browser
 * render the same message) and the editor then removes it from the address bar.
 */
const MESSAGES: Record<"article" | "review", Record<string, string>> = {
  article: { draft: "Draft saved.", published: "Article published.", scheduled: "Article scheduled." },
  review: { draft: "Draft saved.", published: "Review published." },
};

export function savedNoticeFor(kind: "article" | "review", status: string | undefined) {
  return status ? (MESSAGES[kind][status] ?? "") : "";
}

/** Drops `?saved=` so a reload or shared link does not repeat the message. */
export function clearSavedParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("saved")) return;
  url.searchParams.delete("saved");
  window.history.replaceState(window.history.state, "", url);
}
