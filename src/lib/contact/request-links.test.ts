import assert from "node:assert/strict";
import { test } from "node:test";
import { instagramDmHref, requestMessage, whatsappRequestHref } from "./request-links.ts";

const whatsappUrl = "https://wa.me/2348167715346";

test("the WhatsApp link keeps the number and prefills a general request", () => {
  const url = new URL(whatsappRequestHref(whatsappUrl));
  assert.equal(url.origin + url.pathname, whatsappUrl);
  assert.equal(url.searchParams.get("text"), "Hello M&G Cleaning Services, I'd like to request a cleaning.");
});

test("the WhatsApp link names the service and encodes it", () => {
  const href = whatsappRequestHref(whatsappUrl, "Upholstery & Rug Care");
  assert.match(href, /Upholstery%20%26%20Rug%20Care\.$/, "spaces and ampersands are percent-encoded");
  assert.equal(new URL(href).searchParams.get("text"), "Hello M&G Cleaning Services, I'd like to request Upholstery & Rug Care.");
});

test("the request message strips control characters and caps the service", () => {
  assert.equal(requestMessage("Deep\nclean"), "Hello M&G Cleaning Services, I'd like to request Deepclean.");
  assert.equal(requestMessage("   "), "Hello M&G Cleaning Services, I'd like to request a cleaning.");
  assert.ok(requestMessage("x".repeat(500)).length < 140);
});

test("the Instagram link opens a direct message for the handle", () => {
  assert.equal(instagramDmHref("@mgcleaningservices_1"), "https://ig.me/m/mgcleaningservices_1");
});
