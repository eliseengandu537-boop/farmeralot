import { expect, test } from "@playwright/test";
import catalogue from "../src/data/catalogue-preview.json";

test("every category shows its saved products or an explicit preview notice", async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const category of catalogue.categories) {
    const products = catalogue.products.filter((product) => product.categories.some((item) => item.id === category.id));
    const response = await page.goto(`/shop?category=${category.slug}`);
    expect(response?.status(), category.name).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.name);
    await expect(page.locator(".product-card")).toHaveCount(Math.min(24, products.length));
    expect(await page.locator(".product-name").allTextContents()).toEqual(products.slice(0, 24).map((product) => product.name));
    await expect(page.getByRole("link", { name: "Next →" })).toHaveCount(products.length > 24 ? 1 : 0);
    if (!products.length) {
      await expect(page.locator(".empty-state")).toContainText("No saved products in this category");
      await page.locator(".empty-state").getByRole("link", { name: "Request a quote" }).click();
      await expect(page.getByLabel("Part details or message")).toHaveValue(`Category: ${category.name}`);
    }
    await page.goto(`/product-category/${category.slug}`);
    await expect(page).toHaveURL(new RegExp(`/shop\\?category=${category.slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.name);
  }
  expect(errors).toEqual([]);
});

test("category pagination avoids an empty next page and permits returning from an old page link", async ({ page }) => {
  await page.goto("/shop?category=accessories");
  await expect(page.locator(".product-card")).toHaveCount(24);
  await expect(page.getByRole("link", { name: "Next →" })).toHaveCount(0);
  await page.goto("/shop?category=accessories&page=2");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.getByRole("link", { name: "← Previous" }).click();
  await expect(page.locator(".product-card")).toHaveCount(24);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Accessories");
});
