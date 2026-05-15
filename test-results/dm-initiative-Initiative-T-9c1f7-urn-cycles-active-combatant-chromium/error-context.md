# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dm/initiative.spec.ts >> Initiative Tracker >> next turn cycles active combatant
- Location: tests/dm/initiative.spec.ts:31:3

# Error details

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-testid=\'init-next-btn\']')
    - locator resolved to <button type="button" id="it-next-btn" data-testid="init-next-btn" data-astro-source-loc="51:94" data-astro-source-file="/home/emil/Desktop/Coding/AI/Randify.pro/src/components/dm/DmButton.astro" class="inline-flex items-center justify-center font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] transition-all duration-[var(--transition-base)] cursor-pointer disabled:opacity-50 disabled:cursor-…>Следующий ход</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Initiative Tracker", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/dm/#initiative");
  6  |   });
  7  | 
  8  |   test("add combatant with auto-roll", async ({ page }) => {
  9  |     await page.fill("[data-testid='init-name-input']", "Гоблин");
  10 |     await page.fill("[data-testid='init-mod-input']", "2");
  11 |     await page.click("[data-testid='init-add-btn']");
  12 |     await expect(page.locator("[data-testid='init-combatant']")).toBeVisible();
  13 |     await expect(page.locator("[data-testid='init-combatant-name']")).toContainText("Гоблин");
  14 |   });
  15 | 
  16 |   test("sort by initiative descending", async ({ page }) => {
  17 |     await page.fill("[data-testid='init-name-input']", "А");
  18 |     await page.fill("[data-testid='init-mod-input']", "5");
  19 |     await page.fill("[data-testid='init-initiative-input']", "25");
  20 |     await page.click("[data-testid='init-add-btn']");
  21 | 
  22 |     await page.fill("[data-testid='init-name-input']", "Б");
  23 |     await page.fill("[data-testid='init-mod-input']", "0");
  24 |     await page.fill("[data-testid='init-initiative-input']", "10");
  25 |     await page.click("[data-testid='init-add-btn']");
  26 | 
  27 |     const scores = await page.locator("[data-testid='init-score']").allTextContents();
  28 |     expect(Number(scores[0])).toBeGreaterThan(Number(scores[1]));
  29 |   });
  30 | 
  31 |   test("next turn cycles active combatant", async ({ page }) => {
  32 |     await page.fill("[data-testid='init-name-input']", "Гоблин");
  33 |     await page.fill("[data-testid='init-mod-input']", "2");
  34 |     await page.fill("[data-testid='init-initiative-input']", "20");
  35 |     await page.click("[data-testid='init-add-btn']");
  36 | 
  37 |     await page.fill("[data-testid='init-name-input']", "Орк");
  38 |     await page.fill("[data-testid='init-mod-input']", "0");
  39 |     await page.fill("[data-testid='init-initiative-input']", "15");
  40 |     await page.click("[data-testid='init-add-btn']");
  41 | 
  42 |     const firstActive = await page.locator("[data-testid='init-combatant'].active").textContent();
> 43 |     await page.click("[data-testid='init-next-btn']");
     |                ^ Error: page.click: Target page, context or browser has been closed
  44 |     const secondActive = await page.locator("[data-testid='init-combatant'].active").textContent();
  45 |     expect(firstActive).not.toBe(secondActive);
  46 |   });
  47 | 
  48 |   test("delete combatant", async ({ page }) => {
  49 |     await page.fill("[data-testid='init-name-input']", "Гоблин");
  50 |     await page.fill("[data-testid='init-mod-input']", "2");
  51 |     await page.fill("[data-testid='init-initiative-input']", "20");
  52 |     await page.click("[data-testid='init-add-btn']");
  53 | 
  54 |     await page.click("[data-testid='init-delete-btn']");
  55 |     await expect(page.locator("[data-testid='init-empty-state']")).toBeVisible();
  56 |   });
  57 | 
  58 |   test("mobile viewport renders correctly", async ({ page }) => {
  59 |     await page.setViewportSize({ width: 375, height: 812 });
  60 |     await expect(page.locator("[data-testid='init-section']")).toBeVisible();
  61 |   });
  62 | });
  63 | 
```