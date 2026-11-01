import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for an owner on the test stack.");

test("an owner publishes a review and it appears on the home page", async ({ page }) => {
  const name = `Playwright Reviewer ${Date.now()}`;

  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await page.goto("/admin/reviews/new");
  // The editor's labels include help text and a character count, so fields are found by placeholder.
  await page.getByPlaceholder("e.g. Amaka Okafor").fill(name);
  await page.getByPlaceholder(/Paste the customer's words/).fill("Careful, punctual, and thorough. The flat looks brand new.");
  await page.getByLabel(/Star rating/).selectOption("5");

  // Publishing is refused until consent is confirmed.
  await page.getByRole("button", { name: "Publish" }).click();
  // Next.js adds its own role="alert" route announcer, so target the editor's feedback line.
  await expect(page.locator(".admin-editor-feedback")).toContainText("agreed");
  await page.getByLabel(/The customer agreed to this review/).check();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.locator(".admin-editor-feedback")).toContainText("Review published.");

  // The API purges the cached reviews; the home page shows it once the purge lands.
  await expect.poll(async () => {
    await page.goto("/");
    return page.locator(".review-card").filter({ hasText: name }).count();
  }, { timeout: 30_000, intervals: [1_000, 2_000, 3_000] }).toBe(1);

  // Clean up: unpublish, then delete through the editor.
  await page.goto("/admin/reviews");
  await page.getByRole("link", { name: new RegExp(name) }).first().click();
  await page.getByRole("button", { name: "Delete review…" }).click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page).toHaveURL(/\/admin\/reviews$/);
});
