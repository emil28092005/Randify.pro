import { describe, it, expect, beforeEach } from "vitest";
import {
  getLocalNotes,
  getLocalInitiative,
  hasLocalData,
  wasAsked,
  markAsked,
  shouldShowImport,
} from "../src/lib/client/import";

describe("import flow helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("returns empty notes when not set", () => {
    expect(getLocalNotes()).toBe("");
  });

  it("returns local notes content", () => {
    localStorage.setItem("dm-notes", "Battle plan: flank left");
    expect(getLocalNotes()).toBe("Battle plan: flank left");
  });

  it("returns empty initiative when not set", () => {
    expect(getLocalInitiative()).toEqual([]);
  });

  it("parses valid initiative from sessionStorage", () => {
    const data = [
      { id: "a", name: "Goblin", initiative: 12, hp: 7 },
      { id: "b", name: "Bandit", initiative: 9 },
    ];
    sessionStorage.setItem("dm-initiative", JSON.stringify(data));
    const result = getLocalInitiative();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Goblin");
    expect(result[0].hp).toBe(7);
    expect(result[1].initiative).toBe(9);
  });

  it("falls back to legacy initiative key", () => {
    sessionStorage.setItem(
      "it-combatants",
      JSON.stringify([{ name: "Old", initiative: 5 }]),
    );
    const result = getLocalInitiative();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Old");
  });

  it("filters out entries without a name", () => {
    sessionStorage.setItem(
      "dm-initiative",
      JSON.stringify([{ id: "x", initiative: 1 }, { name: "Keep", id: "y" }]),
    );
    const result = getLocalInitiative();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Keep");
  });

  it("handles malformed JSON gracefully", () => {
    sessionStorage.setItem("dm-initiative", "not-json");
    expect(getLocalInitiative()).toEqual([]);
  });

  it("hasLocalData returns false for empty storage", () => {
    expect(hasLocalData()).toBe(false);
  });

  it("hasLocalData returns true when notes have content", () => {
    localStorage.setItem("dm-notes", "hi");
    expect(hasLocalData()).toBe(true);
  });

  it("hasLocalData ignores whitespace-only notes", () => {
    localStorage.setItem("dm-notes", "   \n  ");
    expect(hasLocalData()).toBe(false);
  });

  it("hasLocalData returns true when initiative has entries", () => {
    sessionStorage.setItem(
      "dm-initiative",
      JSON.stringify([{ id: "a", name: "X" }]),
    );
    expect(hasLocalData()).toBe(true);
  });

  it("wasAsked toggles via markAsked", () => {
    expect(wasAsked()).toBe(false);
    markAsked();
    expect(wasAsked()).toBe(true);
  });

  it("shouldShowImport: false when not pro", () => {
    localStorage.setItem("dm-notes", "x");
    expect(shouldShowImport("free", 1)).toBe(false);
  });

  it("shouldShowImport: false when pro but no userId", () => {
    localStorage.setItem("dm-notes", "x");
    expect(shouldShowImport("pro", undefined)).toBe(false);
  });

  it("shouldShowImport: false when no local data", () => {
    expect(shouldShowImport("pro", 1)).toBe(false);
  });

  it("shouldShowImport: false when already asked", () => {
    localStorage.setItem("dm-notes", "x");
    markAsked();
    expect(shouldShowImport("pro", 1)).toBe(false);
  });

  it("shouldShowImport: true when pro, has data, not asked", () => {
    localStorage.setItem("dm-notes", "x");
    expect(shouldShowImport("pro", 42)).toBe(true);
  });

  it("shouldShowImport: true with only initiative data", () => {
    sessionStorage.setItem(
      "dm-initiative",
      JSON.stringify([{ id: "a", name: "Orc" }]),
    );
    expect(shouldShowImport("pro", 7)).toBe(true);
  });
});
