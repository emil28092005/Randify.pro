import { test, expect } from "@playwright/test";

test.describe("Open5e Reference", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dm/#reference");
  });

  test("tab switching works", async ({ page }) => {
    await page.click("[data-testid='ref-tab-monsters']:visible");
    await expect(page.locator("[data-testid='ref-monsters-list']:visible")).toBeVisible();

    await page.click("[data-testid='ref-tab-spells']:visible");
    await expect(page.locator("[data-testid='ref-spells-list']:visible")).toBeVisible();
  });

  test("search filtering", async ({ page }) => {
    await page.click("[data-testid='ref-tab-monsters']:visible");
    await page.fill("[data-testid='ref-search-input']:visible", "goblin");
    await page.waitForTimeout(400);
    await expect(page.locator("[data-testid='ref-result-card']:visible").filter({ hasText: /goblin/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test("detail modal opens and closes", async ({ page }) => {
    await page.click("[data-testid='ref-tab-monsters']:visible");
    await page.waitForSelector("[data-testid='ref-result-card']:visible", { timeout: 15000 });
    await page.locator("[data-testid='ref-result-card']:visible").first().click();
    await expect(page.locator("[data-testid='ref-modal']:visible")).toBeVisible();

    await page.click("[data-testid='ref-modal-overlay']:visible", { position: { x: 10, y: 10 } });
    await expect(page.locator("[data-testid='ref-modal']:visible")).toHaveCount(0);
  });

  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("[data-testid='ref-section']:visible")).toBeVisible();
  });
});
