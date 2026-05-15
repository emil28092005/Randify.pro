import { test, expect } from "@playwright/test";

test.describe("DM Dashboard Smoke Tests", () => {
  test("/dm/ loads without errors", async ({ page }) => {
    const response = await page.goto("/dm/");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveTitle(/DM Dashboard/i);
  });

  test("/ru/dm/ loads without errors", async ({ page }) => {
    const response = await page.goto("/ru/dm/");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveTitle(/DM Dashboard/i);
  });
});
