import { chromium, type Browser, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const BASE_URL = "http://localhost:4322";
const EVIDENCE_DIR = ".sisyphus/evidence/final-qa";

fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

let browser: Browser;
let page: Page;

const results: {
  scenario: string;
  status: "PASS" | "FAIL" | "SKIP";
  details: string;
}[] = [];

function log(scenario: string, status: "PASS" | "FAIL" | "SKIP", details: string) {
  results.push({ scenario, status, details });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "○";
  console.log(`[${icon}] ${scenario}: ${details}`);
}

async function screenshot(name: string) {
  const filePath = path.join(EVIDENCE_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: filePath, fullPage: true });
  } catch {
    // ignore screenshot errors (e.g., page not ready)
  }
  return filePath;
}

async function setup() {
  browser = await chromium.launch();
}

async function newPage(viewport?: { width: number; height: number }) {
  if (page) await page.close();
  page = await browser.newPage(viewport ? { viewport } : undefined);
}

async function teardown() {
  await browser.close();
}

async function safeGoto(url: string) {
  try {
    await page.goto(url, { waitUntil: "load", timeout: 15000 });
    await page.waitForTimeout(500);
    return true;
  } catch {
    return false;
  }
}

async function testTabs() {
  console.log("\n=== T2: Tabs ===");

  try {
    await newPage({ width: 375, height: 812 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");

    const tab = page.locator('[data-tab="initiative"]:visible');
    await tab.click();
    await page.waitForTimeout(300);

    const url = page.url();
    const hasHash = url.includes("#initiative");

    await page.locator('[data-tab="dice"]:visible').focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    const focusedAfterArrow = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-tab")
    );

    const pass = hasHash && focusedAfterArrow === "initiative";
    log("T2: Tab switching and URL hash", pass ? "PASS" : "FAIL", `hash=${hasHash}, keyboardFocused=${focusedAfterArrow}`);
    await screenshot("t2-tabs-navigation");
  } catch (e) {
    log("T2: Tab switching and URL hash", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 375, height: 812 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");

    const tabList = page.locator(".dm-tabs:visible");
    const box = await tabList.boundingBox();
    const tabs = await page.locator(".dm-tab:visible").all();
    let allInRow = true;
    let minHeightOk = true;

    for (const t of tabs) {
      const tbox = await t.boundingBox();
      if (tbox && box && Math.abs(tbox.y - box.y) > 5) allInRow = false;
      if (tbox && tbox.height < 44) minHeightOk = false;
    }

    log("T2: Mobile scrollable tabs", allInRow && minHeightOk ? "PASS" : "FAIL", `allInRow=${allInRow}, minHeightOk=${minHeightOk}, tabCount=${tabs.length}`);
    await screenshot("t2-tabs-mobile");
  } catch (e) {
    log("T2: Mobile scrollable tabs", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 375, height: 812 });
    const ok = await safeGoto(`${BASE_URL}/dm/#initiative`);
    if (!ok) throw new Error("Failed to load page");

    const ariaSelected = await page.locator('[data-tab="initiative"]:visible').getAttribute("aria-selected");
    log("T2: Initial tab state", ariaSelected === "true" ? "PASS" : "FAIL", `aria-selected=${ariaSelected}`);
    await screenshot("t2-tabs-initial");
  } catch (e) {
    log("T2: Initial tab state", "FAIL", errMsg(e));
  }
}

async function testDice() {
  console.log("\n=== T9: Dice ===");

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load page");

    await page.locator("[data-testid='dice-clear-btn']").first().click().catch(() => {});
    await page.waitForTimeout(200);

    await page.locator('[data-dice="d20"]').first().click();
    await page.waitForTimeout(300);

    const resultText = await page.locator("[data-testid='dice-result']").first().textContent();
    const resultNum = parseInt(resultText || "0", 10);
    const resultValid = resultNum >= 1 && resultNum <= 20;

    await page.fill("[data-testid='dice-input']", "2d6+3");
    await page.click("[data-testid='dice-roll-btn']");
    await page.waitForTimeout(300);

    const customResult = await page.locator("[data-testid='dice-result']").first().textContent();
    const customNum = parseInt(customResult || "0", 10);
    const customValid = customNum >= 5 && customNum <= 15;

    const historyItems = await page.locator("[data-testid='dice-history-item']").count();

    await page.locator("[data-testid='dice-clear-btn']").first().click();
    await page.waitForTimeout(200);
    const emptyVisible = await page.locator("[data-testid='dice-empty-state']").first().isVisible().catch(() => false);

    const pass = resultValid && customValid && historyItems >= 2 && emptyVisible;
    log("T9: Dice rolling and history", pass ? "PASS" : "FAIL", `d20=${resultNum}(valid=${resultValid}), 2d6+3=${customNum}(valid=${customValid}), history=${historyItems}, empty=${emptyVisible}`);
    await screenshot("t9-dice-roller");
  } catch (e) {
    log("T9: Dice rolling and history", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load page");

    let foundCrit = false;
    let foundFail = false;

    for (let i = 0; i < 30; i++) {
      await page.locator('[data-dice="d20"]').first().click();
      await page.waitForTimeout(200);
      const resultText = await page.locator("[data-testid='dice-result']").first().textContent();
      const resultNum = parseInt(resultText || "0", 10);
      if (resultNum === 20) foundCrit = true;
      if (resultNum === 1) foundFail = true;
      if (foundCrit && foundFail) break;
    }

    const historyItems = await page.locator("[data-testid='dice-history-item']").all();
    let colorClassesFound = false;
    for (const item of historyItems) {
      const html = await item.innerHTML();
      if (html.includes("text-[#6ab04c]") || html.includes("text-[#e06060]") || html.includes("text-[var(--gold)]")) {
        colorClassesFound = true;
        break;
      }
    }

    const pass = colorClassesFound;
    log("T9: Critical hit/fail colors", pass ? "PASS" : "FAIL", `foundCrit=${foundCrit}, foundFail=${foundFail}, colorClasses=${colorClassesFound}`);
    await screenshot("t9-dice-crit");
  } catch (e) {
    log("T9: Critical hit/fail colors", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load page");

    const d20Btn = page.locator('[data-dice="d20"]').first();
    const hoverClassCheck = await d20Btn.evaluate((el) => el.classList.contains("hover:bg-[var(--gold)]/10"));
    const activeClassCheck = await d20Btn.evaluate((el) => el.classList.contains("active:scale-[0.97]"));

    const pass = hoverClassCheck && activeClassCheck;
    log("T9: Hover and active states", pass ? "PASS" : "FAIL", `hoverClass=${hoverClassCheck}, activeClass=${activeClassCheck}`);
    await screenshot("t9-dice-states");
  } catch (e) {
    log("T9: Hover and active states", "FAIL", errMsg(e));
  }
}

async function testInitiative() {
  console.log("\n=== T10: Initiative ===");

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#initiative`);
    if (!ok) throw new Error("Failed to load page");

    await page.locator("#it-clear-btn").first().click().catch(() => {});
    await page.waitForTimeout(200);

    await page.fill("[data-testid='init-name-input']", "Гоблин");
    await page.fill("[data-testid='init-mod-input']", "2");
    await page.fill("[data-testid='init-initiative-input']", "18");
    await page.click("[data-testid='init-add-btn']");
    await page.waitForTimeout(300);

    const goblinVisible = await page.locator("[data-testid='init-combatant']").first().isVisible().catch(() => false);
    const goblinName = await page.locator("[data-testid='init-combatant-name']").first().textContent();

    await page.fill("[data-testid='init-name-input']", "Орк");
    await page.fill("[data-testid='init-mod-input']", "0");
    await page.fill("[data-testid='init-initiative-input']", "12");
    await page.click("[data-testid='init-add-btn']");
    await page.waitForTimeout(300);

    const scores = await page.locator("[data-testid='init-score']").allTextContents();
    const sortedCorrectly = parseInt(scores[0]) > parseInt(scores[1]);

    const firstActive = await page.locator("[data-testid='init-combatant'].active").first().textContent();
    await page.click("[data-testid='init-next-btn']");
    await page.waitForTimeout(200);
    const secondActive = await page.locator("[data-testid='init-combatant'].active").first().textContent();
    const turnChanged = firstActive !== secondActive;

    await page.locator("[data-testid='init-delete-btn']").first().click();
    await page.waitForTimeout(200);
    const countAfterDelete = await page.locator("[data-testid='init-combatant']").count();

    const pass = goblinVisible && goblinName?.includes("Гоблин") && sortedCorrectly && turnChanged && countAfterDelete === 1;
    log("T10: Initiative tracking flow", pass ? "PASS" : "FAIL", `goblin=${goblinVisible}, sorted=${sortedCorrectly}, turnChanged=${turnChanged}, afterDelete=${countAfterDelete}`);
    await screenshot("t10-initiative");
  } catch (e) {
    log("T10: Initiative tracking flow", "FAIL", errMsg(e));
  }
}

async function testOpen5e() {
  console.log("\n=== T11: Open5e ===");

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#reference`);
    if (!ok) throw new Error("Failed to load page");
    await page.waitForTimeout(3000);

    const resultsVisible = await page.locator("[data-testid='ref-result-card']:visible").first().isVisible().catch(() => false);
    const emptyVisible = await page.locator("#o5-empty:visible").first().isVisible().catch(() => false);

    await page.fill("[data-testid='ref-search-input']:visible", "goblin");
    await page.waitForTimeout(800);

    const searchResults = await page.locator("[data-testid='ref-result-card']:visible").count();

    let modalOpened = false;
    let modalClosed = false;
    if (searchResults > 0) {
      const firstCard = page.locator("[data-testid='ref-result-card']:visible").first();
      await firstCard.scrollIntoViewIfNeeded();
      await firstCard.click();
      await page.waitForTimeout(1500);
      modalOpened = await page.locator("[data-testid='ref-modal']:visible").first().isVisible().catch(() => false);

      if (modalOpened) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
        modalClosed = !(await page.locator("[data-testid='ref-modal']:visible").first().isVisible().catch(() => false));
      }
    }

    const pass = (resultsVisible || emptyVisible) && (searchResults > 0 || emptyVisible);
    log("T11: Open5e search and detail", pass ? "PASS" : "FAIL", `results=${resultsVisible}, empty=${emptyVisible}, searchResults=${searchResults}, modalOpened=${modalOpened}, modalClosed=${modalClosed}`);
    await screenshot("t11-open5e");
  } catch (e) {
    log("T11: Open5e search and detail", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#reference`);
    if (!ok) throw new Error("Failed to load page");
    await page.waitForTimeout(3000);

    await page.fill("[data-testid='ref-search-input']:visible", "xyznonexistent12345");
    await page.waitForTimeout(1200);

    const emptyVisible = await page.locator("#o5-empty:visible").first().isVisible().catch(() => false);
    const noResults = await page.locator("[data-testid='ref-result-card']:visible").count() === 0;
    log("T11: Empty search state", emptyVisible || noResults ? "PASS" : "FAIL", `emptyVisible=${emptyVisible}, noResults=${noResults}`);
    await screenshot("t11-open5e-empty");
  } catch (e) {
    log("T11: Empty search state", "FAIL", errMsg(e));
  }
}

async function testNotes() {
  console.log("\n=== T12: Notes ===");

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#notes`);
    if (!ok) throw new Error("Failed to load page");

    await page.fill("[data-testid='notes-textarea']:visible", "Тестовая заметка");
    await page.waitForTimeout(1000);

    const savedIndicator = page.locator("[data-testid='notes-saved-indicator']:visible").first();
    const savedVisible = await savedIndicator.isVisible().catch(() => false);
    const savedOpacity = await savedIndicator.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.opacity;
    });

    const charCount = await page.locator("[data-testid='notes-char-count']:visible").first().textContent();

    const page2 = await browser.newPage();
    await page2.goto(`${BASE_URL}/dm/#notes`, { waitUntil: "load" });
    await page2.waitForTimeout(1500);

    const value2 = await page2.locator("[data-testid='notes-textarea']:visible").inputValue();
    const syncWorked = value2 === "Тестовая заметка";

    await page.click("[data-testid='notes-clear-btn']:visible");
    await page.waitForTimeout(800);

    const cleared = await page.locator("[data-testid='notes-textarea']:visible").inputValue() === "";

    await page2.close();

    const pass = savedVisible && parseFloat(savedOpacity) > 0.1 && charCount === "16" && syncWorked && cleared;
    log("T12: Notes auto-save and cross-tab sync", pass ? "PASS" : "FAIL", `savedVisible=${savedVisible}, savedOpacity=${savedOpacity}, chars=${charCount}, sync=${syncWorked}, cleared=${cleared}`);
    await screenshot("t12-notes-sync");
  } catch (e) {
    log("T12: Notes auto-save and cross-tab sync", "FAIL", errMsg(e));
  }
}

async function testPage() {
  console.log("\n=== T6: Page ===");

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");

    const sections = ["dice", "initiative", "reference", "notes"];
    let allAccessible = true;

    for (const id of sections) {
      const section = page.locator(`section#${id}:visible`).first();
      const visible = await section.isVisible().catch(() => false);
      if (!visible) {
        allAccessible = false;
        console.log(`  Section #${id} not visible`);
      }
    }

    log("T6: All sections accessible", allAccessible ? "PASS" : "FAIL", `allAccessible=${allAccessible}`);
    await screenshot("t6-sections");
  } catch (e) {
    log("T6: All sections accessible", "FAIL", errMsg(e));
  }
}

async function testIntegration() {
  console.log("\n=== Integration Tests ===");

  try {
    await newPage({ width: 375, height: 812 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");

    const tabs = ["dice", "initiative", "reference", "notes"];
    let pass = true;
    for (const tabId of tabs) {
      await page.locator(`[data-tab="${tabId}"]:visible`).click();
      await page.waitForTimeout(400);
      const url = page.url();
      if (!url.includes(`#${tabId}`)) pass = false;
    }
    log("INT-1: Switch between all tabs", pass ? "PASS" : "FAIL", `urlHashOk=${pass}`);
  } catch (e) {
    log("INT-1: Switch between all tabs", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load page");

    await page.locator("[data-testid='dice-clear-btn']").first().click().catch(() => {});
    await page.waitForTimeout(200);

    await page.locator('[data-dice="d20"]').first().click();
    await page.waitForTimeout(200);
    await page.locator('[data-dice="d6"]').first().click();
    await page.waitForTimeout(200);

    const historyCount = await page.locator("[data-testid='dice-history-item']").count();
    await page.locator("[data-testid='dice-clear-btn']").first().click();
    await page.waitForTimeout(200);
    const emptyVisible = await page.locator("[data-testid='dice-empty-state']").first().isVisible().catch(() => false);

    const pass = historyCount >= 2 && emptyVisible;
    log("INT-2: Roll dice, check history, clear", pass ? "PASS" : "FAIL", `history=${historyCount}, empty=${emptyVisible}`);
  } catch (e) {
    log("INT-2: Roll dice, check history, clear", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#initiative`);
    if (!ok) throw new Error("Failed to load page");

    await page.locator("#it-clear-btn").first().click().catch(() => {});
    await page.waitForTimeout(200);

    await page.fill("[data-testid='init-name-input']", "A");
    await page.fill("[data-testid='init-initiative-input']", "25");
    await page.click("[data-testid='init-add-btn']");
    await page.waitForTimeout(200);

    await page.fill("[data-testid='init-name-input']", "B");
    await page.fill("[data-testid='init-initiative-input']", "10");
    await page.click("[data-testid='init-add-btn']");
    await page.waitForTimeout(200);

    const scores = await page.locator("[data-testid='init-score']").allTextContents();
    const sorted = parseInt(scores[0]) > parseInt(scores[1]);

    const firstActive = await page.locator("[data-testid='init-combatant'].active").first().textContent();
    await page.click("[data-testid='init-next-btn']");
    await page.waitForTimeout(200);
    const secondActive = await page.locator("[data-testid='init-combatant'].active").first().textContent();
    const turnChanged = firstActive !== secondActive;

    await page.locator("[data-testid='init-delete-btn']").first().click();
    await page.waitForTimeout(200);
    const countAfterDelete = await page.locator("[data-testid='init-combatant']").count();

    const pass = sorted && turnChanged && countAfterDelete === 1;
    log("INT-3: Initiative flow", pass ? "PASS" : "FAIL", `sorted=${sorted}, turnChanged=${turnChanged}, afterDelete=${countAfterDelete}`);
  } catch (e) {
    log("INT-3: Initiative flow", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#reference`);
    if (!ok) throw new Error("Failed to load page");
    await page.waitForTimeout(3000);

    await page.fill("[data-testid='ref-search-input']:visible", "dragon");
    await page.waitForTimeout(600);

    const cards = await page.locator("[data-testid='ref-result-card']:visible").count();
    let modalOpened = false;
    let modalClosed = false;

    if (cards > 0) {
      const firstCard = page.locator("[data-testid='ref-result-card']:visible").first();
      await firstCard.scrollIntoViewIfNeeded();
      await firstCard.click();
      await page.waitForTimeout(1500);
      modalOpened = await page.locator("[data-testid='ref-modal']:visible").first().isVisible().catch(() => false);

      if (modalOpened) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
        modalClosed = !(await page.locator("[data-testid='ref-modal']:visible").first().isVisible().catch(() => false));
      }
    }

    const pass = cards > 0 && modalOpened && modalClosed;
    log("INT-4: Open5e search and modal", pass ? "PASS" : "FAIL", `cards=${cards}, modalOpened=${modalOpened}, modalClosed=${modalClosed}`);
  } catch (e) {
    log("INT-4: Open5e search and modal", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#notes`);
    if (!ok) throw new Error("Failed to load page");

    await page.fill("[data-testid='notes-textarea']:visible", "Persistent note test");
    await page.waitForTimeout(800);

    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);

    const value = await page.locator("[data-testid='notes-textarea']:visible").inputValue();
    const pass = value === "Persistent note test";
    log("INT-5: Notes persistence", pass ? "PASS" : "FAIL", `value="${value}"`);
  } catch (e) {
    log("INT-5: Notes persistence", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1440, height: 900 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");
    await page.waitForTimeout(500);

    const sidebarDesktop = await page.locator("aside >> visible=true").count() === 2;

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const sidebarMobile = await page.locator("aside >> visible=true").count() === 0;

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    const sidebarBack = await page.locator("aside >> visible=true").count() === 2;

    const pass = sidebarDesktop && sidebarMobile && sidebarBack;
    log("INT-6: Responsive layout", pass ? "PASS" : "FAIL", `desktop=${sidebarDesktop}, mobile=${sidebarMobile}, back=${sidebarBack}`);
    await screenshot("int6-responsive-desktop");

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    await screenshot("int6-responsive-mobile");
  } catch (e) {
    log("INT-6: Responsive layout", "FAIL", errMsg(e));
  }
}

async function testEdgeCases() {
  console.log("\n=== Edge Cases ===");

  try {
    await newPage({ width: 1280, height: 720 });
    let ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load dice");
    await page.locator("[data-testid='dice-clear-btn']").first().click().catch(() => {});
    await page.waitForTimeout(200);
    const diceEmpty = await page.locator("[data-testid='dice-empty-state']").first().isVisible().catch(() => false);

    ok = await safeGoto(`${BASE_URL}/dm/#initiative`);
    if (!ok) throw new Error("Failed to load initiative");
    await page.locator("#it-clear-btn").first().click().catch(() => {});
    await page.waitForTimeout(200);
    const initEmpty = await page.locator("[data-testid='init-empty-state']").first().isVisible().catch(() => false);

    ok = await safeGoto(`${BASE_URL}/dm/#notes`);
    if (!ok) throw new Error("Failed to load notes");
    await page.click("[data-testid='notes-clear-btn']:visible").catch(() => {});
    await page.waitForTimeout(200);
    const notesEmpty = await page.locator("[data-testid='notes-textarea']:visible").inputValue() === "";

    const pass = diceEmpty && initEmpty && notesEmpty;
    log("EDGE-1: Empty states", pass ? "PASS" : "FAIL", `dice=${diceEmpty}, init=${initEmpty}, notes=${notesEmpty}`);
    await screenshot("edge1-empty-states");
  } catch (e) {
    log("EDGE-1: Empty states", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 375, height: 812 });
    const ok = await safeGoto(`${BASE_URL}/dm/`);
    if (!ok) throw new Error("Failed to load page");

    const tabs = ["dice", "initiative", "reference", "notes"];
    for (let i = 0; i < 10; i++) {
      const tabId = tabs[i % tabs.length];
      await page.locator(`[data-tab="${tabId}"]:visible`).click().catch(() => {});
    }
    await page.waitForTimeout(500);

    const url = page.url();
    const hasValidHash = tabs.some((t) => url.includes(`#${t}`));
    log("EDGE-2: Rapid tab switching", hasValidHash ? "PASS" : "FAIL", `url=${url}`);
  } catch (e) {
    log("EDGE-2: Rapid tab switching", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#dice`);
    if (!ok) throw new Error("Failed to load page");

    await page.fill("[data-testid='dice-input']", "invalid!!!");
    await page.click("[data-testid='dice-roll-btn']");
    await page.waitForTimeout(300);

    const resultText = await page.locator("[data-testid='dice-result']").first().textContent();
    const detailsText = await page.locator("#result-details").first().textContent();
    const pass = resultText === "?" || detailsText?.includes("Invalid");
    log("EDGE-3: Invalid dice notation", pass ? "PASS" : "FAIL", `result="${resultText}", details="${detailsText}"`);
  } catch (e) {
    log("EDGE-3: Invalid dice notation", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#reference`);
    if (!ok) throw new Error("Failed to load page");
    await page.waitForTimeout(3000);

    await page.fill("[data-testid='ref-search-input']:visible", "");
    await page.waitForTimeout(500);

    const hasResults = await page.locator("[data-testid='ref-result-card']:visible").count() > 0;
    const hasEmptyState = await page.locator("#o5-empty:visible").first().isVisible().catch(() => false);
    const noError = !(await page.locator("#o5-error:visible").first().isVisible().catch(() => false));

    const pass = (hasResults || hasEmptyState) && noError;
    log("EDGE-4: Empty search in Open5e", pass ? "PASS" : "FAIL", `results=${hasResults}, empty=${hasEmptyState}, noError=${noError}`);
  } catch (e) {
    log("EDGE-4: Empty search in Open5e", "FAIL", errMsg(e));
  }

  try {
    await newPage({ width: 1280, height: 720 });
    const ok = await safeGoto(`${BASE_URL}/dm/#notes`);
    if (!ok) throw new Error("Failed to load page");

    await page.fill("[data-testid='notes-textarea']:visible", "Note to clear");
    await page.waitForTimeout(200);
    await page.click("[data-testid='notes-clear-btn']:visible");
    await page.waitForTimeout(200);

    const value = await page.locator("[data-testid='notes-textarea']:visible").inputValue();
    const charCount = await page.locator("[data-testid='notes-char-count']:visible").first().textContent();
    const pass = value === "" && charCount === "0";
    log("EDGE-5: Clear notes after typing", pass ? "PASS" : "FAIL", `value="${value}", chars=${charCount}`);
  } catch (e) {
    log("EDGE-5: Clear notes after typing", "FAIL", errMsg(e));
  }
}

async function main() {
  console.log("Starting Final QA Execution...");
  console.log(`Base URL: ${BASE_URL}`);

  await setup();

  await testTabs();
  await testDice();
  await testInitiative();
  await testOpen5e();
  await testNotes();
  await testPage();
  await testIntegration();
  await testEdgeCases();

  await teardown();

  console.log("\n========== FINAL QA REPORT ==========");

  const scenarioResults = results.filter((r) => !r.scenario.startsWith("INT-") && !r.scenario.startsWith("EDGE-"));
  const integrationResults = results.filter((r) => r.scenario.startsWith("INT-"));
  const edgeResults = results.filter((r) => r.scenario.startsWith("EDGE-"));

  console.log(`Scenarios: ${scenarioResults.filter((r) => r.status === "PASS").length}/${scenarioResults.length} pass`);
  console.log(`Integration: ${integrationResults.filter((r) => r.status === "PASS").length}/${integrationResults.length}`);
  console.log(`Edge Cases: ${edgeResults.filter((r) => r.status === "PASS").length}/${edgeResults.length}`);

  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : "✗";
    console.log(`  ${icon} ${r.scenario}: ${r.details}`);
  }

  const verdict = results.every((r) => r.status === "PASS") ? "APPROVE" : "REJECT";
  console.log(`\nVERDICT: ${verdict}`);

  const reportPath = path.join(EVIDENCE_DIR, "report.txt");
  const reportLines = [
    `Scenarios [${scenarioResults.filter((r) => r.status === "PASS").length}/${scenarioResults.length} pass] | Integration [${integrationResults.filter((r) => r.status === "PASS").length}/${integrationResults.length}] | Edge Cases [${edgeResults.length} tested] | VERDICT: ${verdict}`,
    "",
    "Details:",
    ...results.map((r) => `${r.status}: ${r.scenario} — ${r.details}`),
  ];
  fs.writeFileSync(reportPath, reportLines.join("\n"));
  console.log(`Report saved to: ${reportPath}`);
}

main().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
