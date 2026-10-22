import { expect, test } from "@playwright/test";

test("product enquiry button collects a demo lead, previews the admin email, and retains edits when closed", async ({ page }) => {
  const external: string[] = [];
  await page.route(/api\.(openai|resend)\.com/, (route) => { external.push(route.request().url()); return route.abort(); });
  await page.goto("/");
  const whatsapp = page.locator(".assistant-whatsapp").getByRole("link", { name: /Get in chat with us/ });
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toContainText("+27 83 630 3818");
  await expect(whatsapp).toHaveAttribute("href", "https://wa.me/27836303818?text=Hi%20Farmeralot%2C%20please%20help%20me%20find%20a%20product.");
  await page.getByRole("button", { name: "What product are you looking for?", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Farmeralot assistant" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("No emails sent");
  const input = dialog.getByLabel("Message the Farmeralot assistant");
  for (const answer of ["I need two alternators for a tractor", "Pretoria, Gauteng", "Demo Farmer", "Example Farm", "farmer@example.com", "0120000000"]) {
    await input.fill(answer); await dialog.getByRole("button", { name: "Send message", exact: true }).click();
  }
  await expect(dialog.getByLabel("Your name", { exact: true })).toHaveValue("Demo Farmer");
  await expect(dialog.getByLabel("Town / suburb and province")).toHaveValue("Pretoria, Gauteng");
  await dialog.getByLabel("Company or farm (optional)").fill("Edited Example Farm");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "What product are you looking for?", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "What product are you looking for?", exact: true }).click();
  await expect(dialog.getByLabel("Company or farm (optional)")).toHaveValue("Edited Example Farm");
  await dialog.getByRole("button", { name: "Preview lead email" }).click();
  await expect(dialog.getByText("Your demo lead is ready.")).toBeVisible();
  const preview = dialog.getByRole("article", { name: "Lead email preview" });
  await expect(preview).toContainText("eliseenweb@gmail.com");
  await expect(preview).toContainText("Edited Example Farm");
  await expect(preview).toContainText("regional routing is not enabled");
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download email preview" }).click();
  expect((await download).suggestedFilename()).toBe("farmeralot-demo-lead.html");
  await dialog.getByRole("button", { name: "Edit details" }).click();
  await dialog.getByLabel("Town / suburb and province").fill("Cape Town, Western Cape");
  await dialog.getByRole("button", { name: "Preview lead email" }).click();
  await expect(preview).toContainText("Cape Town, Western Cape");
  await expect(preview).toContainText("eliseenweb@gmail.com");
  await dialog.getByRole("button", { name: "Start another enquiry" }).click();
  await expect(dialog.getByRole("heading", { name: "Let’s find what your farm needs." })).toBeVisible();
  expect(external).toEqual([]);
  expect(await page.evaluate(() => Object.values(localStorage).some((value) => /farmer@example.com|Demo Farmer/.test(value)))).toBe(false);
});

test("mobile assistant validates chat answers, permits skipping company, and fits reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const whatsapp = page.locator(".assistant-whatsapp").getByRole("link", { name: /Get in chat with us/ });
  const launcher = page.getByRole("button", { name: "What product are you looking for?", exact: true });
  for (const control of [whatsapp, launcher]) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.y + box!.height).toBeLessThan(844);
  }
  await launcher.click();
  await expect(whatsapp).toBeHidden();
  const dialog = page.getByRole("dialog", { name: "Farmeralot assistant" });
  const input = dialog.getByLabel("Message the Farmeralot assistant");
  for (const answer of ["Bearings", "Cape Town, Western Cape", "Demo Customer"]) { await input.fill(answer); await input.press("Enter"); }
  await dialog.getByRole("button", { name: "Skip company name" }).click();
  await input.fill("wrong-email"); await input.press("Enter");
  await expect(dialog.getByRole("log")).toContainText("valid email address");
  await input.fill("customer@example.com"); await input.press("Enter");
  await input.fill("hello"); await input.press("Enter");
  await expect(dialog.getByRole("log")).toContainText("7–15 digits");
  await input.fill("0210000000"); await input.press("Enter");
  await expect(dialog.getByLabel("Company or farm (optional)")).toHaveValue("");
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.y).toBeGreaterThanOrEqual(30);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390); expect(box!.y + box!.height).toBeLessThan(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Preview lead email" }).click();
  await expect(dialog.getByText("Your demo lead is ready.")).toBeVisible();
  await page.screenshot({ path: ".artifacts/assistant-mobile.png" });
});
