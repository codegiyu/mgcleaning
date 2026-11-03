import { deflateSync } from "node:zlib";
import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for an owner on the test stack.");
// Uploads go straight to R2, so this needs a stack with media storage configured.
test.skip(process.env.E2E_MEDIA_UPLOADS !== "1", "Set E2E_MEDIA_UPLOADS=1 on a stack with R2 media storage configured.");

/** A real 2×2 PNG, so the API's file-signature check passes. */
function tinyPng() {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (bytes: Buffer) => {
    let c = 0xffffffff;
    for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(2, 0);
  header.writeUInt32BE(2, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const pixels = Buffer.from([0, 11, 40, 88, 242, 196, 0, 0, 242, 196, 0, 11, 40, 88]);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))]);
}

test("an admin uploads a photo, publishes it to the gallery, and deletes it", async ({ page }) => {
  const alt = `Playwright gallery photo ${Date.now()}`;

  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email!);
  // exact: the show/hide button is named "Show password".
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await page.goto("/admin/gallery");
  await page.locator('input[type="file"][multiple]').setInputFiles([
    { name: "IMG_0042.MOV", mimeType: "video/quicktime", buffer: Buffer.from("not a playable clip") },
    { name: "playwright-photo.png", mimeType: "image/png", buffer: tinyPng() },
  ]);
  // A .mov is refused in the browser with export advice; the photo becomes a draft.
  await expect(page.locator(".admin-gallery-upload").filter({ hasText: "IMG_0042.MOV" })).toContainText("Export it as MP4");
  await expect(page.locator(".admin-gallery-upload").filter({ hasText: "playwright-photo.png" })).toContainText("Added as a draft", { timeout: 30_000 });

  await page.getByRole("button", { name: "Edit “playwright photo”" }).click();
  const dialog = page.getByRole("dialog");
  // Publishing is refused until the rights are confirmed.
  await dialog.getByRole("button", { name: "Publish" }).click();
  await expect(dialog.locator(".admin-editor-feedback")).toContainText("Confirm M&G owns it");
  await dialog.getByRole("textbox").first().fill(alt);
  await dialog.getByLabel(/M&G owns this photo/).check();
  await dialog.getByRole("button", { name: "Publish" }).click();
  await expect(dialog.locator(".admin-editor-feedback")).toContainText("Published.");
  await page.keyboard.press("Escape");

  // The API purges the cached gallery; the public page shows the photo once the purge lands.
  await expect.poll(async () => {
    await page.goto("/gallery");
    return page.getByRole("img", { name: alt }).count();
  }, { timeout: 30_000, intervals: [1_000, 2_000, 3_000] }).toBeGreaterThan(0);

  // The arrows reorder from the keyboard, and focus stays with the moved item.
  await page.goto("/admin/gallery");
  const earlier = page.getByRole("button", { name: `Move “${alt}” earlier` });
  if (await earlier.isEnabled()) {
    await earlier.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").filter({ hasText: /Moved to position/ })).toBeVisible();
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", new RegExp(`Move “${alt}”`));
  }

  // Clean up through the dialog; the photo's files are removed with it.
  await page.getByRole("button", { name: `Edit “${alt}”` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete…" }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByRole("button", { name: `Edit “${alt}”` })).toHaveCount(0);
});
