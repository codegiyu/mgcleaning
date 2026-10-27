import assert from "node:assert/strict";
import { test } from "node:test";
import { describeActivity, describeActor } from "./activity.ts";

test("describes inquiry status moves and note edits", () => {
  assert.equal(describeActivity({ action: "inquiry.update", metadata: { fields: ["status"], statusFrom: "new", statusTo: "contacted" } }), "Moved from New to Contacted");
  assert.equal(
    describeActivity({ action: "inquiry.update", metadata: { fields: ["internalNote", "status"], statusFrom: "quoted", statusTo: "booked" } }),
    "Moved from Quoted to Booked and updated internal notes",
  );
  assert.equal(describeActivity({ action: "inquiry.update", metadata: { fields: ["internalNote"] } }), "Updated internal notes");
});

test("describes publishing, including the scheduler", () => {
  assert.equal(describeActivity({ action: "post.publish", metadata: { slug: "deep-clean" } }), "Published “deep-clean”");
  assert.equal(describeActivity({ action: "post.publish", metadata: { slug: "deep-clean", scheduled: true } }), "Published “deep-clean” on schedule");
  assert.match(describeActivity({ action: "post.schedule", metadata: { slug: "deep-clean", publishAt: "2026-10-28T08:30:00.000Z" } }), /for 28 Oct 2026, 09:30 WAT$/);
});

test("describes account security events with counts", () => {
  assert.equal(describeActivity({ action: "auth.password_change", metadata: { revokedSessions: 1 } }), "Changed password and signed out 1 other session");
  assert.equal(describeActivity({ action: "auth.session_revoke", metadata: { scope: "others", revokedSessions: 3 } }), "Signed out 3 other sessions");
  assert.equal(describeActivity({ action: "settings.update", metadata: { fields: ["inquiryNotificationEmail"] } }), "Updated settings: alert inbox");
});

test("tolerates unexpected metadata and unknown actions", () => {
  assert.equal(describeActivity({ action: "inquiry.update", metadata: { fields: "status" } }), "Saved without changes");
  assert.equal(describeActivity({ action: "future.action", metadata: {} }), "future.action");
  assert.equal(describeActor(null), "System");
});

test("describes review changes without naming the customer", () => {
  assert.equal(describeActivity({ action: "review.create", metadata: { status: "draft", fields: ["displayName", "quote"] } }), "Added a draft review");
  assert.equal(describeActivity({ action: "review.create", metadata: { status: "published" } }), "Added and published a review");
  assert.equal(describeActivity({ action: "review.unpublish", metadata: { statusFrom: "published", statusTo: "draft" } }), "Unpublished a review");
  assert.equal(describeActivity({ action: "review.delete", metadata: { statusFrom: "published" } }), "Deleted a published review");
});
