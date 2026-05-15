# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dm/notes.spec.ts >> Notes Panel >> typing in textarea works
- Location: tests/dm/notes.spec.ts:8:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:4321/dm/#notes", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Notes Panel", () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto("/dm/#notes");
     |                ^ Error: page.goto: Target page, context or browser has been closed
  6  |   });
  7  | 
  8  |   test("typing in textarea works", async ({ page }) => {
  9  |     await page.fill("[data-testid='notes-textarea']:visible", "Тестовая заметка");
  10 |     await expect(page.locator("[data-testid='notes-textarea']:visible")).toHaveValue("Тестовая заметка");
  11 |   });
  12 | 
  13 |   test("auto-save indicator appears", async ({ page }) => {
  14 |     await page.fill("[data-testid='notes-textarea']:visible", "Тест");
  15 |     await page.waitForTimeout(600);
  16 |     await expect(page.locator("[data-testid='notes-saved-indicator']:visible")).toBeVisible();
  17 |   });
  18 | 
  19 |   test("clear button empties notes", async ({ page }) => {
  20 |     await page.fill("[data-testid='notes-textarea']:visible", "Тестовая заметка");
  21 |     await page.click("[data-testid='notes-clear-btn']:visible");
  22 |     await expect(page.locator("[data-testid='notes-textarea']:visible")).toHaveValue("");
  23 |   });
  24 | 
  25 |   test("character counter updates", async ({ page }) => {
  26 |     await page.fill("[data-testid='notes-textarea']:visible", "12345");
  27 |     await expect(page.locator("[data-testid='notes-char-count']:visible")).toContainText("5");
  28 |   });
  29 | 
  30 |   test("mobile viewport renders correctly", async ({ page }) => {
  31 |     await page.setViewportSize({ width: 375, height: 812 });
  32 |     await expect(page.locator("[data-testid='notes-section']:visible")).toBeVisible();
  33 |   });
  34 | });
  35 | 
```