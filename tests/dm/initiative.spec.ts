import { test, expect } from "@playwright/test";

test.describe("Initiative Tracker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dm/#initiative");
  });

  test("add combatant with auto-roll", async ({ page }) => {
    await page.fill("[data-testid='init-name-input']", "Гоблин");
    await page.fill("[data-testid='init-mod-input']", "2");
    await page.click("[data-testid='init-add-btn']");
    await expect(page.locator("[data-testid='init-combatant']")).toBeVisible();
    await expect(page.locator("[data-testid='init-combatant-name']")).toContainText("Гоблин");
  });

  test("sort by initiative descending", async ({ page }) => {
    await page.fill("[data-testid='init-name-input']", "А");
    await page.fill("[data-testid='init-mod-input']", "5");
    await page.fill("[data-testid='init-initiative-input']", "25");
    await page.click("[data-testid='init-add-btn']");

    await page.fill("[data-testid='init-name-input']", "Б");
    await page.fill("[data-testid='init-mod-input']", "0");
    await page.fill("[data-testid='init-initiative-input']", "10");
    await page.click("[data-testid='init-add-btn']");

    const scores = await page.locator("[data-testid='init-score']").allTextContents();
    expect(Number(scores[0])).toBeGreaterThan(Number(scores[1]));
  });

  test("next turn cycles active combatant", async ({ page }) => {
    await page.fill("[data-testid='init-name-input']", "Гоблин");
    await page.fill("[data-testid='init-mod-input']", "2");
    await page.fill("[data-testid='init-initiative-input']", "20");
    await page.click("[data-testid='init-add-btn']");

    await page.fill("[data-testid='init-name-input']", "Орк");
    await page.fill("[data-testid='init-mod-input']", "0");
    await page.fill("[data-testid='init-initiative-input']", "15");
    await page.click("[data-testid='init-add-btn']");

    const firstActive = await page.locator("[data-testid='init-combatant'].active").textContent();
    await page.click("[data-testid='init-next-btn']");
    const secondActive = await page.locator("[data-testid='init-combatant'].active").textContent();
    expect(firstActive).not.toBe(secondActive);
  });

  test("delete combatant", async ({ page }) => {
    await page.fill("[data-testid='init-name-input']", "Гоблин");
    await page.fill("[data-testid='init-mod-input']", "2");
    await page.fill("[data-testid='init-initiative-input']", "20");
    await page.click("[data-testid='init-add-btn']");

    await page.click("[data-testid='init-delete-btn']");
    await expect(page.locator("[data-testid='init-empty-state']")).toBeVisible();
  });

  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("[data-testid='init-section']")).toBeVisible();
  });
});
