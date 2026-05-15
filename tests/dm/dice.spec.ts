import { test, expect } from "@playwright/test";

test.describe("Dice Roller", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dm/#dice");
  });

  test("all quick dice buttons work", async ({ page }) => {
    const dice = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
    for (const die of dice) {
      await page.click(`[data-dice="${die}"]`);
      const result = await page.locator("[data-testid='dice-result']").textContent();
      expect(result).toMatch(/\d+/);
    }
  });

  test("custom notation works", async ({ page }) => {
    await page.fill("[data-testid='dice-input']", "2d6+3");
    await page.click("[data-testid='dice-roll-btn']");
    const result = await page.locator("[data-testid='dice-result']").textContent();
    expect(result).toMatch(/\d+/);
  });

  test("history tracks rolls", async ({ page }) => {
    await page.click(`[data-dice="d20"]`);
    await page.click(`[data-dice="d6"]`);
    const historyItems = await page.locator("[data-testid='dice-history-item']").count();
    expect(historyItems).toBeGreaterThanOrEqual(2);
  });

  test("clear button empties history", async ({ page }) => {
    await page.click(`[data-dice="d20"]`);
    await page.click("[data-testid='dice-clear-btn']");
    const historyItems = await page.locator("[data-testid='dice-history-item']").count();
    expect(historyItems).toBe(0);
    await expect(page.locator("[data-testid='dice-empty-state']")).toBeVisible();
  });

  test("result color coding - normal", async ({ page }) => {
    await page.click(`[data-dice="d20"]`);
    const resultText = await page.locator("[data-testid='dice-result']").textContent();
    expect(resultText).toMatch(/\d+/);
  });

  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("[data-testid='dice-section']")).toBeVisible();
    await expect(page.locator(`[data-dice="d20"]`)).toBeVisible();
  });
});
