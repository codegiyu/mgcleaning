import assert from "node:assert/strict";
import { test } from "node:test";
import { channelClickBody, channelFromHref } from "./channel-click.ts";

test("recognises WhatsApp, Instagram, and call links", () => {
  assert.equal(channelFromHref("https://wa.me/2348167715346?text=Hello"), "whatsapp");
  assert.equal(channelFromHref("https://api.whatsapp.com/send?phone=2348167715346"), "whatsapp");
  assert.equal(channelFromHref("https://ig.me/m/mgcleaningservices_1"), "instagram");
  assert.equal(channelFromHref("https://www.instagram.com/mgcleaningservices_1/"), "instagram");
  assert.equal(channelFromHref("tel:+2348167715346"), "phone");
});

test("ignores every other link", () => {
  for (const href of ["/book", "https://mgcleaning.example/contact", "mailto:hello@example.com", "https://wa.me.evil.example/x", "https://evil.example/?u=wa.me", "javascript:void(0)", "", null]) {
    assert.equal(channelFromHref(href), null, String(href));
  }
});

test("the beacon carries the channel, placement, page, and campaign tags only", () => {
  const body = JSON.parse(channelClickBody({
    channel: "whatsapp",
    placement: "footer",
    pagePath: "/services/fumigation?ref=abc#top",
    firstTouch: { utmSource: "instagram", utmMedium: "social", utmCampaign: "link-in-bio", landingPath: "/links" },
  }));
  assert.deepEqual(body, { channel: "whatsapp", placement: "footer", pagePath: "/services/fumigation", utmSource: "instagram", utmMedium: "social", utmCampaign: "link-in-bio", landingPath: "/links" });
});

test("a direct visit sends no campaign fields", () => {
  assert.deepEqual(JSON.parse(channelClickBody({ channel: "phone", placement: "page", pagePath: "/", firstTouch: null })), { channel: "phone", placement: "page", pagePath: "/" });
});
