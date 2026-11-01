import assert from "node:assert/strict";
import { test } from "node:test";
import { savedNoticeFor } from "./saved-notice.ts";

test("the saved status from the URL becomes the editor's message", () => {
  assert.equal(savedNoticeFor("article", "draft"), "Draft saved.");
  assert.equal(savedNoticeFor("article", "scheduled"), "Article scheduled.");
  assert.equal(savedNoticeFor("review", "published"), "Review published.");
});

test("unknown or missing statuses show nothing", () => {
  assert.equal(savedNoticeFor("review", undefined), "");
  assert.equal(savedNoticeFor("review", "scheduled"), "");
  assert.equal(savedNoticeFor("review", "<script>"), "");
});
