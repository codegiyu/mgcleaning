import assert from "node:assert/strict";
import { test } from "node:test";
import { instagramArticleLink } from "./share-link.ts";

test("tags article links for Instagram with the slug as the campaign", () => {
  assert.equal(
    instagramArticleLink("https://www.mg.example", "deep-clean-prep"),
    "https://www.mg.example/blog/deep-clean-prep?utm_source=instagram&utm_medium=social&utm_campaign=deep-clean-prep",
  );
  assert.match(instagramArticleLink("https://www.mg.example/", "a", "reel"), /&utm_content=reel$/);
});
