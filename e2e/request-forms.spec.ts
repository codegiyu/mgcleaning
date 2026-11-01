import { expect, test, type Page } from "@playwright/test";

/** A date a few days ahead in the visitor's local calendar, as the date input expects. */
function dateInDays(days: number) {
  const date = new Date(Date.now() + days * 86_400_000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

async function fillBookingText(page: Page) {
  const form = page.locator("form.contact-form");
  await form.getByLabel("Your name").fill("Playwright Customer");
  await form.getByLabel("Phone number").fill("0816 771 5346");
  await form.getByLabel("Email address").fill("playwright@example.test");
  await form.getByLabel("Preferred date").fill(dateInDays(5));
  await form.getByLabel("Service location or area").fill("Wuse 2, Abuja");
  await form.getByLabel("Tell us about the space").fill("Two sofas and an armchair need a deep clean.");
  return form;
}

test("@phone the booking page leads with WhatsApp, Instagram, and call before the form", async ({ page }) => {
  await page.goto("/book");
  const channels = page.locator(".request-channels").first();
  await expect(channels.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /^https:\/\/wa\.me\//);
  const channelsBox = await channels.boundingBox();
  const formBox = await page.locator("form.contact-form").boundingBox();
  expect(channelsBox && formBox && channelsBox.y < formBox.y).toBe(true);
});

test("a booking with a choice left empty is stopped in the browser, not sent", async ({ page }) => {
  await page.goto("/book");
  const form = await fillBookingText(page);
  let sent = false;
  page.on("request", (request) => { if (request.url().includes("/inquiries") && request.method() === "POST") sent = true; });
  await form.getByRole("button", { name: /Submit cleaning request/ }).click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(form.getByLabel("Service needed")).toBeFocused();
  expect(await form.locator("select:invalid").count()).toBe(4);
  expect(sent).toBe(false);
});

test("a complete booking reaches the confirmation page with a reference", async ({ page }) => {
  await page.goto("/book");
  const form = await fillBookingText(page);
  await form.getByLabel("Service needed").selectOption({ index: 1 });
  await form.getByLabel("Space type").selectOption("Home");
  await form.getByLabel("Preferred time").selectOption({ index: 1 });
  await form.getByLabel("How should we follow up?").selectOption("whatsapp");
  await form.getByRole("button", { name: /Submit cleaning request/ }).click();
  await expect(page).toHaveURL(/\/book\/confirmation\?reference=MG-/);
  await expect(page.getByRole("status")).toContainText(/MG-\d{8}-[0-9A-F]{6}/);
});

test("the contact form sends a message", async ({ page }) => {
  await page.goto("/contact");
  const form = page.locator("form.contact-form");
  await form.getByLabel("Your name").fill("Playwright Visitor");
  await form.getByLabel("Phone number").fill("0816 771 5347");
  await form.getByLabel("What is this about?").selectOption("General question");
  await form.getByLabel("Your message").fill("Do you clean upholstery on weekends?");
  await form.getByRole("button", { name: /Send message/ }).click();
  await expect(form.locator(".form-confirmation")).toBeVisible();
});

test("an unknown address shows the branded not-found page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found | M&G Cleaning Services");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn't find that page.");
});
