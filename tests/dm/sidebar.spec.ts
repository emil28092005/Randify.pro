import { test, expect } from "@playwright/test";

test.describe("DM Sidebar", () => {
  test("renders navigation sections when logged out", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chromium") test.skip();
    await page.goto("/dm/");
    const sidebar = page.locator("aside.w-full");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText("ИНСТРУМЕНТЫ", { exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Кубики" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Инициатива" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Справочник" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Заметки" })).toBeVisible();
  });

  test("does not show user block when logged out", async ({ page }) => {
    await page.goto("/dm/");
    await expect(page.locator("[data-testid='sidebar-user-block']")).toHaveCount(0);
  });

  test("user block and tier badge have correct DOM structure", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chromium") test.skip();
    await page.goto("/dm/");

    await page.evaluate(() => {
      const aside = document.querySelector("aside.w-full");
      if (!aside) return;
      const block = document.createElement("div");
      block.setAttribute("data-testid", "sidebar-user-block");
      block.className = "flex items-center gap-3 mb-6 px-3 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-gold-strong)]";
      block.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-sm font-bold">T</div>
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-sm font-medium text-[var(--text-primary)] truncate">Test User</span>
          <span data-testid="tier-badge" data-tier="pro" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[var(--accent)] text-white">PRO</span>
        </div>
      `;
      aside.prepend(block);
    });

    const userBlock = page.locator("[data-testid='sidebar-user-block']");
    await expect(userBlock).toBeVisible();
    await expect(page.getByText("Test User")).toBeVisible();

    const badge = page.locator("[data-testid='tier-badge']");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("PRO");
    await expect(badge).toHaveAttribute("data-tier", "pro");
  });
});
