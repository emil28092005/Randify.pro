import { test, expect } from "@playwright/test";

test.describe("Data Migration", () => {
  async function seedStorage(page: any) {
    await page.goto("/dm/");
    await page.evaluate(() => {
      sessionStorage.setItem(
        "dm-dice-history",
        JSON.stringify([
          { notation: "d20", result: 15, timestamp: Date.now() },
          { notation: "2d6+3", result: 11, timestamp: Date.now() },
        ])
      );
      sessionStorage.setItem(
        "dm-initiative",
        JSON.stringify([
          { name: "Гоблин", modifier: 2, initiative: 18, active: true },
        ])
      );
      localStorage.setItem("dm-notes", "Старые заметки из предыдущей версии");
    });
    await page.reload();
  }

  test("dice history old data loads and migrates correctly", async ({ page }) => {
    await seedStorage(page);
    await page.goto("/dm/#dice");
    await expect(page.locator("#dice:visible")).toBeVisible();

    const items = page.locator("[data-testid='dice-history-item']");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("d20");
    await expect(items.nth(0)).toContainText("15");
    await expect(items.nth(1)).toContainText("2d6+3");
    await expect(items.nth(1)).toContainText("11");

    const migrated = await page.evaluate(() => {
      const raw = sessionStorage.getItem("dm-dice-history");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.every(
        (entry: any) =>
          entry.total !== undefined &&
          Array.isArray(entry.rolls)
      );
    });
    expect(migrated).toBe(true);
  });

  test("initiative old data loads and can be deleted", async ({ page }) => {
    await seedStorage(page);
    await page.goto("/dm/#initiative");
    await expect(page.locator("#initiative:visible")).toBeVisible();

    const panelHidden = await page.evaluate(() => {
      return document.getElementById("it-list-panel")?.classList.contains("hidden") ?? true;
    });
    expect(panelHidden).toBe(false);

    const list = page.locator("#it-list");
    await expect(list).toBeVisible();
    const item = list.locator("li");
    await expect(item).toHaveCount(1);
    await expect(item).toContainText("Гоблин");
    await expect(item).toContainText("18");

    const deleteBtn = item.locator(".it-delete-btn");
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();
    await expect(item).toHaveCount(0);
    await expect(page.locator("[data-testid='init-empty-state']")).toBeVisible();

    const migrated = await page.evaluate(() => {
      const raw = sessionStorage.getItem("dm-initiative");
      if (!raw) return true;
      const parsed = JSON.parse(raw);
      return parsed.length === 0 || parsed.every((c: any) => typeof c.id === "string");
    });
    expect(migrated).toBe(true);
  });

  test("notes old data loads correctly", async ({ page }) => {
    await seedStorage(page);
    await page.goto("/dm/#notes");
    await expect(page.locator("#notes:visible")).toBeVisible();

    const textarea = page.locator("#notes-textarea").first();
    await expect(textarea).toHaveValue("Старые заметки из предыдущей версии");
  });
});
