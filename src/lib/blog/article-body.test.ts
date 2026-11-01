import assert from "node:assert/strict";
import { test } from "node:test";
import { parseArticleBody, parseInline, safeHref } from "./article-body.ts";

test("the editor's H2 button gives an h2, and ### gives an h3", () => {
  const blocks = parseArticleBody("## Before the visit\n\n### Clear the floor\n\n# Older single-hash heading");
  assert.deepEqual(blocks.map((block) => block.type === "heading" && block.level), [2, 3, 2]);
});

test("paragraphs, lists, and blank lines group as before", () => {
  const blocks = parseArticleBody("First line\nsame paragraph\n\n- one\n- two\n\nLast paragraph");
  assert.deepEqual(blocks.map((block) => block.type), ["paragraph", "list", "paragraph"]);
  assert.equal(blocks[1]?.type === "list" && blocks[1].items.length, 2);
});

test("repeated bullet text is kept, not merged", () => {
  const [list] = parseArticleBody("- Vacuum\n- Vacuum");
  assert.equal(list?.type === "list" && list.items.length, 2);
});

test("bold, italic, and links are recognised inline", () => {
  assert.deepEqual(parseInline("Book **today** or *soon*: [request a cleaning](/book)."), [
    { type: "text", text: "Book " },
    { type: "strong", text: "today" },
    { type: "text", text: " or " },
    { type: "em", text: "soon" },
    { type: "text", text: ": " },
    { type: "link", text: "request a cleaning", href: "/book", external: false },
    { type: "text", text: "." },
  ]);
});

test("only site paths and https links are linked", () => {
  assert.deepEqual(safeHref("/services/fumigation"), { href: "/services/fumigation", external: false });
  assert.deepEqual(safeHref("https://wa.me/2348167715346"), { href: "https://wa.me/2348167715346", external: true });
  for (const href of ["javascript:alert(1)", "//evil.example", "http://plain.example", "data:text/html,hi", "mailto:a@b.c"]) {
    assert.equal(safeHref(href), null, href);
  }
  for (const text of ["[click](javascript:alert(1))", "[click](//evil.example)", "[click](http://plain.example)"]) {
    const parts = parseInline(text);
    assert.ok(parts.every((part) => part.type !== "link"), text);
    assert.ok(parts.some((part) => part.type === "text" && part.text === "click"), text);
  }
});
