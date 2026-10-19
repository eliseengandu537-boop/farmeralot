import { expect, test } from "@playwright/test";

test("desktop scroll, anchored panels, video control and route navigation work together", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await expect(page.locator("#hero-heading")).toHaveAttribute("data-word-reveal", "visible");
  await page.getByRole("button", { name: "Pause background video" }).click();
  await expect.poll(() => page.locator(".hero-video").evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);

  await page.getByRole("link", { name: "Discover the difference" }).click();
  await expect.poll(() => page.evaluate(() => {
    const targetTop = document.querySelector("#our-service")!.getBoundingClientRect().top;
    return Math.abs(targetTop - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
  })).toBeLessThan(8);
  await expect(page.locator(".site-header")).toHaveClass(/is-scrolled/);
  await expect(page.locator("html")).not.toHaveClass(/lenis-scrolling/);

  const thirdPanel = page.locator(".service-panel").nth(2);
  await thirdPanel.evaluate((panel) => window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(panel).top), behavior: "instant" }));
  await expect.poll(() => page.locator(".service-panel").first().evaluate((panel: HTMLElement) => panel.inert)).toBe(true);

  // Use a local content route so this motion check does not depend on WooCommerce uptime.
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Our story" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.getByRole("link", { name: "Farmeralot home", exact: true }).click();
  await expect(page.locator("#hero-heading")).toHaveAttribute("data-word-reveal", "visible");
  expect(errors).toEqual([]);
});

test("touch scrolling stays native and the mobile menu is keyboard accessible", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000");
  await expect(page.locator("#hero-heading")).toHaveAttribute("data-word-reveal", "visible");
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
  await page.locator("#our-service").scrollIntoViewIfNeeded();
  expect(await page.locator(".service-panel").first().evaluate((panel) => getComputedStyle(panel).position)).toBe("relative");
  await context.close();
});

test("reduced motion shows all words and keeps video and scroll effects still", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator(".hero-video")).toBeHidden();
  await expect.poll(() => page.locator(".hero-video").evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  expect(await page.locator("#hero-heading .scroll-word").first().evaluate((word) => ({ opacity: getComputedStyle(word).opacity, transform: getComputedStyle(word).transform }))).toEqual({ opacity: "1", transform: "none" });
  expect(await page.locator(".service-panel").first().evaluate((panel) => getComputedStyle(panel).position)).toBe("relative");
});

test("motion preferences can change while the page is open", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  expect(await page.locator("#categories .scroll-word").first().evaluate((word) => getComputedStyle(word).opacity)).toBe("1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveClass(/lenis/);
});

test("the farm video plays on arrival, remembers pause, and stops under the next card", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".service-video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBe(0);
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0)).toBe(true);
  await page.getByRole("button", { name: "Pause farm video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);

  const thirdPanel = page.locator(".service-panel").nth(2);
  const coverVideo = () => thirdPanel.evaluate((panel) => window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(panel).top), behavior: "instant" }));
  await coverVideo();
  await expect(page.locator(".service-panel").first()).toHaveAttribute("inert", "");
  await page.locator(".service-stack").evaluate((stack) => window.scrollTo({ top: stack.getBoundingClientRect().top + window.scrollY - 160, behavior: "instant" }));
  await expect(page.locator(".service-panel").first()).not.toHaveAttribute("inert", "");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Play farm video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await coverVideo();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test("the farm video stays still for reduced motion until explicitly played", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const video = page.locator(".service-video");
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused && element.readyState === 0)).toBe(true);
  await page.getByRole("button", { name: "Play farm video" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0)).toBe(true);
  await page.locator("#categories").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test("the complete page remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000");
  const words = page.locator("#hero-heading .scroll-word");
  await expect(words).toHaveCount(4);
  expect(await words.first().evaluate((word) => ({ opacity: getComputedStyle(word).opacity, transform: getComputedStyle(word).transform }))).toEqual({ opacity: "1", transform: "none" });
  expect(await page.locator(".service-panel").first().evaluate((panel) => getComputedStyle(panel).position)).toBe("relative");
  await expect(page.getByRole("link", { name: "Explore the catalogue" })).toBeVisible();
  await context.close();
});
