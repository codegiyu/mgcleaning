/**
 * Parses the plain-text article format the editor writes. It is deliberately small, and
 * nothing in it can produce HTML: every piece becomes React text or a known element.
 *
 *   ## Heading        -> h2 (the editor's H2 button; a single "#" is accepted too)
 *   ### Subheading    -> h3
 *   - item            -> bullet list
 *   **bold**, *italic*, [text](https://… or /path)
 *   blank line        -> new paragraph
 */
export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "link"; text: string; href: string; external: boolean };

export type Block =
  | { type: "heading"; level: 2 | 3; inline: Inline[] }
  | { type: "paragraph"; inline: Inline[] }
  | { type: "list"; items: Inline[][] };

/** Only site paths and https links are linked; anything else stays plain text. */
export function safeHref(href: string): { href: string; external: boolean } | null {
  const value = href.trim();
  if (/^\/(?!\/)[^\s]*$/.test(value)) return { href: value, external: false };
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !/\s/.test(value)) return { href: url.toString(), external: true };
  } catch {
    // Not a URL; fall through.
  }
  return null;
}

const INLINE_PATTERN = /(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  for (const part of text.split(INLINE_PATTERN)) {
    if (!part) continue;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const target = safeHref(link[2]!);
      parts.push(target ? { type: "link", text: link[1]!, ...target } : { type: "text", text: link[1]! });
    } else if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      parts.push({ type: "strong", text: part.slice(2, -2) });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      parts.push({ type: "em", text: part.slice(1, -1) });
    } else {
      parts.push({ type: "text", text: part });
    }
  }
  return parts;
}

export function parseArticleBody(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", inline: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list.map(parseInline) });
    list = [];
  };

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    const bullet = /^-\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1]!.length === 3 ? 3 : 2, inline: parseInline(heading[2]!) });
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]!);
    } else if (!trimmed) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}
