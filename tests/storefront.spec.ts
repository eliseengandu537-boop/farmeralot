import { expect, test } from "@playwright/test";
import catalogue from "../src/data/catalogue-preview.json";

const product = catalogue.products[0];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("main routes render from the saved catalogue with no live-store requests", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  const remoteStoreRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://farmeralot.co.za/**", (route) => { remoteStoreRequests.push(route.request().url()); return route.abort(); });
  for (const path of ["/", "/shop", "/shop?page=2", "/shop?page=3", "/shop?category=bearings", `/product/${product.slug}`, "/cart", "/checkout", "/request-quote", "/about", "/faq", "/my-account", "/warranty-policy", "/refund_policy", "/terms-of-service", "/basket", "/product-category/bearings"]) {
    const response = await page.goto(path);
    expect(response?.ok(), path).toBe(true);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator(".preview-notice")).toContainText("No live orders or payments");
    await expect(page.locator("nextjs-portal").getByText("Runtime Error", { exact: true })).toHaveCount(0);
  }
  expect(remoteStoreRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("catalogue search, categories, pagination and missing products work", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator(".product-card")).toHaveCount(24);
  await page.getByRole("link", { name: "Next →" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".product-card")).toHaveCount(24);
  await page.getByRole("link", { name: "Next →" }).click();
  await expect(page.locator(".product-card")).toHaveCount(8);
  await expect(page.getByRole("link", { name: "Next →" })).toHaveCount(0);
  await page.getByLabel("Search catalogue").fill(product.sku);
  await page.getByRole("button", { name: "Search parts" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-name")).toHaveText(product.name);
  await page.locator(".category-sidebar").getByRole("link", { name: /Bearings/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bearings");
  await expect(page.locator(".product-card")).toHaveCount(8);
  await page.getByLabel("Search catalogue").fill("no-such-part-54321");
  await page.getByRole("button", { name: "Search parts" }).click();
  await expect(page.getByRole("heading", { name: "Let’s track it down." })).toBeVisible();
  await page.goto("/product/no-such-part-54321");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("find");
  await expect(page.locator("main").getByRole("link", { name: "Browse the catalogue" })).toBeVisible();
});

test("basket persists, updates and prepares a complete enquiry without sending it", async ({ page, request }) => {
  await page.goto(`/product/${product.slug}`);
  await page.getByRole("button", { name: "Add to quote basket" }).click();
  await expect(page.getByRole("link", { name: "Cart with 1 items" })).toBeVisible();
  await page.getByRole("link", { name: "View basket →" }).click();
  const quantity = page.getByRole("spinbutton", { name: `Quantity for ${product.name}` });
  await quantity.fill("3");
  await expect(page.getByRole("link", { name: "Cart with 3 items" })).toBeVisible();
  await page.reload();
  await expect(quantity).toHaveValue("3");
  await page.getByRole("link", { name: "Continue to enquiry" }).click();
  await expect(page.locator(".quote-selected-items")).toContainText(`3 × ${product.name}`);
  await page.getByLabel("Your name", { exact: true }).fill("Presentation Test");
  await page.getByLabel("Email address", { exact: true }).fill("demo@example.com");
  await page.getByLabel("Phone number", { exact: true }).fill("0000000000");
  await page.getByLabel("Delivery area", { exact: true }).fill("Presentation only");
  await page.getByLabel("Part details or message").fill("Please confirm fitment.");
  await page.getByRole("button", { name: "Prepare enquiry email" }).click();
  await expect(page.getByRole("status")).toContainText("It has not been sent yet.");
  const email = await page.getByRole("link", { name: "Open email app" }).getAttribute("href");
  expect(email).toContain("mailto:eliseenweb@gmail.com?");
  expect(decodeURIComponent(email!)).toContain(`3 × ${product.name} (SKU: ${product.sku})`);
  expect(decodeURIComponent(email!)).toContain("demo@example.com");
  // This route must refuse even a direct API attempt while preview mode is enabled.
  const checkout = await request.post("/api/wc/checkout", { data: {} });
  expect(checkout.status()).toBe(409);
  await page.getByRole("link", { name: "Edit your basket" }).click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your basket is waiting." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Cart with 0 items" })).toBeVisible();
});

test("mobile quote and basket fit the screen and recover corrupt saved selections", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");
  await page.evaluate(() => localStorage.setItem("farmeralot-presentation-basket-v1", "invalid json"));
  await page.reload();
  await page.locator(".product-card").first().getByRole("button").click();
  await page.getByRole("link", { name: "Cart with 1 items" }).click();
  await expect(page.locator(".cart-line")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Continue to enquiry" }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
