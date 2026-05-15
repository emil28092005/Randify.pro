import { test, expect } from "@playwright/test";

test.describe("Notes Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dm/#notes");
  });

  test("typing in textarea works", async ({ page }) => {
    await page.fill("[data-testid='notes-textarea']:visible", "Тестовая заметка");
    await expect(page.locator("[data-testid='notes-textarea']:visible")).toHaveValue("Тестовая заметка");
  });

  test("auto-save indicator appears", async ({ page }) => {
    await page.fill("[data-testid='notes-textarea']:visible", "Тест");
    await page.waitForTimeout(600);
    await expect(page.locator("[data-testid='notes-saved-indicator']:visible")).toBeVisible();
  });

  test("clear button empties notes", async ({ page }) => {
    await page.fill("[data-testid='notes-textarea']:visible", "Тестовая заметка");
    await page.click("[data-testid='notes-clear-btn']:visible");
    await expect(page.locator("[data-testid='notes-textarea']:visible")).toHaveValue("");
  });

  test("character counter updates", async ({ page }) => {
    await page.fill("[data-testid='notes-textarea']:visible", "12345");
    await expect(page.locator("[data-testid='notes-char-count']:visible")).toContainText("5");
  });

  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("[data-testid='notes-section']:visible")).toBeVisible();
  });
});
