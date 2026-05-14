import { describe, it, expect } from "vitest";
import {
  sortByInitiative,
  getNextActiveIndex,
  rollInitiative,
  type Combatant,
} from "../src/lib/client/initiative";

describe("sortByInitiative", () => {
  it("sorts combatants by initiative descending", () => {
    const combatants: Combatant[] = [
      { id: "1", name: "Goblin", initiative: 15 },
      { id: "2", name: "Warrior", initiative: 18 },
      { id: "3", name: "Mage", initiative: 12 },
    ];
    const sorted = sortByInitiative(combatants);
    expect(sorted[0].name).toBe("Warrior");
    expect(sorted[1].name).toBe("Goblin");
    expect(sorted[2].name).toBe("Mage");
  });

  it("places higher initiative first when values differ", () => {
    const combatants: Combatant[] = [
      { id: "1", name: "A", initiative: 5 },
      { id: "2", name: "B", initiative: 20 },
    ];
    expect(sortByInitiative(combatants)[0].name).toBe("B");
  });

  it("returns empty array for empty input", () => {
    expect(sortByInitiative([])).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const combatants: Combatant[] = [
      { id: "1", name: "Goblin", initiative: 15 },
      { id: "2", name: "Warrior", initiative: 18 },
    ];
    const originalOrder = combatants.map((c) => c.name);
    sortByInitiative(combatants);
    expect(combatants.map((c) => c.name)).toEqual(originalOrder);
  });
});

describe("getNextActiveIndex", () => {
  it("cycles to next active combatant", () => {
    expect(getNextActiveIndex(0, 3)).toBe(1);
    expect(getNextActiveIndex(1, 3)).toBe(2);
    expect(getNextActiveIndex(2, 3)).toBe(0);
  });

  it("wraps from last to first", () => {
    expect(getNextActiveIndex(2, 3)).toBe(0);
  });

  it("returns 0 when list has one combatant", () => {
    expect(getNextActiveIndex(0, 1)).toBe(0);
  });

  it("returns 0 for empty list", () => {
    expect(getNextActiveIndex(0, 0)).toBe(0);
  });
});

describe("rollInitiative", () => {
  it("returns a number between 1 and 20 plus modifier", () => {
    const result = rollInitiative(0);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(20);
  });

  it("applies positive modifier", () => {
    const result = rollInitiative(5);
    expect(result).toBeGreaterThanOrEqual(6);
    expect(result).toBeLessThanOrEqual(25);
  });

  it("applies negative modifier", () => {
    const result = rollInitiative(-2);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(18);
  });
});
