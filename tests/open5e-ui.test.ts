import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  Open5eUIManager,
  type UIState,
} from "../src/lib/client/open5e-ui";

vi.mock("../src/lib/open5e/client", () => ({
  searchMonsters: vi.fn(),
  searchSpells: vi.fn(),
  getMonster: vi.fn(),
  getSpell: vi.fn(),
}));

import {
  searchMonsters,
  searchSpells,
  getMonster,
  getSpell,
} from "../src/lib/open5e/client";
import type { Monster } from "../src/lib/open5e/client";

const mockedSearchMonsters = vi.mocked(searchMonsters);
const mockedSearchSpells = vi.mocked(searchSpells);
const mockedGetMonster = vi.mocked(getMonster);
const mockedGetSpell = vi.mocked(getSpell);

describe("Open5eUIManager", () => {
  let manager: Open5eUIManager;
  let stateUpdates: UIState[];

  beforeEach(() => {
    vi.clearAllMocks();
    stateUpdates = [];
    manager = new Open5eUIManager((state) => {
      stateUpdates.push({ ...state });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("starts with monsters tab", () => {
      expect(manager.state.tab).toBe("monsters");
    });

    it("starts with empty query", () => {
      expect(manager.state.query).toBe("");
    });

    it("starts on page 1", () => {
      expect(manager.state.page).toBe(1);
    });

    it("starts with no results", () => {
      expect(manager.state.results).toEqual([]);
    });

    it("starts not loading", () => {
      expect(manager.state.loading).toBe(false);
    });

    it("starts with no error", () => {
      expect(manager.state.error).toBeNull();
    });

    it("starts with no selected item", () => {
      expect(manager.state.selectedItem).toBeNull();
    });
  });

  describe("setTab", () => {
    it("switches to spells tab", () => {
      manager.setTab("spells");
      expect(manager.state.tab).toBe("spells");
    });

    it("resets page to 1 when switching tabs", () => {
      manager.state.page = 3;
      manager.setTab("spells");
      expect(manager.state.page).toBe(1);
    });

    it("clears selected item when switching tabs", () => {
      manager.state.selectedItem = { name: "Goblin", key: "goblin" };
      manager.setTab("spells");
      expect(manager.state.selectedItem).toBeNull();
    });

    it("triggers search when switching tabs", async () => {
      mockedSearchSpells.mockResolvedValue([]);
      manager.state.query = "fire";
      await manager.setTab("spells");
      expect(mockedSearchSpells).toHaveBeenCalled();
    });
  });

  describe("setQuery", () => {
    it("updates query state", () => {
      manager.setQuery("goblin");
      expect(manager.state.query).toBe("goblin");
    });

    it("resets page to 1", () => {
      manager.state.page = 3;
      manager.setQuery("dragon");
      expect(manager.state.page).toBe(1);
    });

    it("searches monsters after debounce", async () => {
      mockedSearchMonsters.mockResolvedValue([
        {
          name: "Goblin",
          key: "goblin",
          challenge_rating_decimal: "0.25",
          type: "humanoid",
          hit_points: 7,
          armor_class: 15,
        },
      ]);

      await manager.setQuery("goblin");
      expect(mockedSearchMonsters).toHaveBeenCalledWith("goblin", undefined);
    });

    it("searches spells in spells tab", async () => {
      mockedSearchSpells.mockResolvedValue([
        {
          name: "Fireball",
          key: "fireball",
          level: 3,
          school: "evocation",
        },
      ]);

      manager.setTab("spells");
      await manager.setQuery("fire");
      expect(mockedSearchSpells).toHaveBeenCalledWith("fire", undefined);
    });
  });

  describe("monster CR filter", () => {
    it("sets CR filter", () => {
      manager.setMonsterCrFilter("0.25");
      expect(manager.state.monsterCrFilter).toBe("0.25");
    });

    it("searches with CR filter", async () => {
      mockedSearchMonsters.mockResolvedValue([]);
      manager.setMonsterCrFilter("1");
      await manager.search();
      expect(mockedSearchMonsters).toHaveBeenCalledWith("", {
        challenge_rating_decimal: "1",
      });
    });

    it("clears CR filter when empty string", async () => {
      mockedSearchMonsters.mockResolvedValue([]);
      manager.state.monsterCrFilter = "2";
      manager.setMonsterCrFilter("");
      await manager.search();
      expect(mockedSearchMonsters).toHaveBeenCalledWith("", undefined);
    });
  });

  describe("spell level filter", () => {
    it("sets spell level filter", () => {
      manager.setSpellLevelFilter("3");
      expect(manager.state.spellLevelFilter).toBe("3");
    });

    it("searches with level filter", async () => {
      mockedSearchSpells.mockResolvedValue([]);
      manager.setTab("spells");
      manager.setSpellLevelFilter("1");
      await manager.search();
      expect(mockedSearchSpells).toHaveBeenCalledWith("", { level: "1" });
    });

    it("searches with cantrip filter as level 0", async () => {
      mockedSearchSpells.mockResolvedValue([]);
      manager.setTab("spells");
      manager.setSpellLevelFilter("0");
      await manager.search();
      expect(mockedSearchSpells).toHaveBeenCalledWith("", { level: "0" });
    });
  });

  describe("search results", () => {
    it("stores monster results", async () => {
      const mockMonsters = [
        {
          name: "Goblin",
          key: "goblin",
          challenge_rating_decimal: "0.25",
          type: "humanoid",
          hit_points: 7,
          armor_class: 15,
        },
        {
          name: "Orc",
          key: "orc",
          challenge_rating_decimal: "0.50",
          type: "humanoid",
          hit_points: 15,
          armor_class: 13,
        },
      ];
      mockedSearchMonsters.mockResolvedValue(mockMonsters);

      await manager.search();
      expect(manager.state.results).toHaveLength(2);
      expect(manager.state.results[0].name).toBe("Goblin");
    });

    it("stores spell results", async () => {
      const mockSpells = [
        {
          name: "Magic Missile",
          key: "magic-missile",
          level: 1,
          school: "evocation",
        },
      ];
      mockedSearchSpells.mockResolvedValue(mockSpells);

      manager.setTab("spells");
      await manager.search();
      expect(manager.state.results).toHaveLength(1);
      expect(manager.state.results[0].name).toBe("Magic Missile");
    });

    it("sets loading during search", async () => {
      let resolveSearch!: (value: Monster[]) => void;
      const searchPromise = new Promise<Monster[]>((resolve) => {
        resolveSearch = resolve;
      });
      mockedSearchMonsters.mockReturnValue(searchPromise);

      const searchPromise2 = manager.search();
      expect(manager.state.loading).toBe(true);
      resolveSearch([]);
      await searchPromise2;
      expect(manager.state.loading).toBe(false);
    });

    it("clears error on successful search", async () => {
      manager.state.error = "Previous error";
      mockedSearchMonsters.mockResolvedValue([]);
      await manager.search();
      expect(manager.state.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("sets error on API failure", async () => {
      mockedSearchMonsters.mockRejectedValue(new Error("Network error"));
      await manager.search();
      expect(manager.state.error).toBe("Network error");
    });

    it("clears results on error", async () => {
      manager.state.results = [
        { name: "Goblin", key: "goblin" },
      ];
      mockedSearchMonsters.mockRejectedValue(new Error("Failed"));
      await manager.search();
      expect(manager.state.results).toEqual([]);
    });
  });

  describe("empty state", () => {
    it("has empty results when search returns nothing", async () => {
      mockedSearchMonsters.mockResolvedValue([]);
      await manager.search();
      expect(manager.state.results).toHaveLength(0);
    });
  });

  describe("pagination", () => {
    const mockMonsters = Array.from({ length: 25 }, (_, i) => ({
      name: `Monster ${i + 1}`,
      key: `monster-${i + 1}`,
      challenge_rating_decimal: "1.00",
      type: "beast",
      hit_points: 10,
      armor_class: 12,
    }));

    beforeEach(() => {
      mockedSearchMonsters.mockResolvedValue(mockMonsters);
    });

    it("returns paginated results", async () => {
      await manager.search();
      const paginated = manager.getPaginatedResults();
      expect(paginated).toHaveLength(10);
      expect(paginated[0].name).toBe("Monster 1");
    });

    it("calculates total pages", async () => {
      await manager.search();
      expect(manager.state.totalPages).toBe(3);
    });

    it("advances to next page", async () => {
      await manager.search();
      manager.nextPage();
      expect(manager.state.page).toBe(2);
      const paginated = manager.getPaginatedResults();
      expect(paginated[0].name).toBe("Monster 11");
    });

    it("goes back to previous page", async () => {
      await manager.search();
      manager.nextPage();
      manager.prevPage();
      expect(manager.state.page).toBe(1);
      const paginated = manager.getPaginatedResults();
      expect(paginated[0].name).toBe("Monster 1");
    });

    it("does not go below page 1", () => {
      manager.prevPage();
      expect(manager.state.page).toBe(1);
    });

    it("does not go above total pages", async () => {
      await manager.search();
      manager.state.page = 3;
      manager.nextPage();
      expect(manager.state.page).toBe(3);
    });
  });

  describe("detail view", () => {
    it("fetches monster details", async () => {
      const mockMonster = {
        name: "Adult Red Dragon",
        key: "adult-red-dragon",
        challenge_rating_decimal: "17.00",
        type: "dragon",
        hit_points: 256,
        armor_class: 19,
      };
      mockedGetMonster.mockResolvedValue(mockMonster);

      await manager.selectItem("adult-red-dragon");
      expect(manager.state.selectedItem).toEqual(mockMonster);
      expect(mockedGetMonster).toHaveBeenCalledWith("adult-red-dragon");
    });

    it("fetches spell details", async () => {
      const mockSpell = {
        name: "Fireball",
        key: "fireball",
        level: 3,
        school: "evocation",
      };
      mockedGetSpell.mockResolvedValue(mockSpell);

      manager.setTab("spells");
      await manager.selectItem("fireball");
      expect(manager.state.selectedItem).toEqual(mockSpell);
      expect(mockedGetSpell).toHaveBeenCalledWith("fireball");
    });

    it("clears selected item", () => {
      manager.state.selectedItem = { name: "Goblin", key: "goblin" };
      manager.clearSelectedItem();
      expect(manager.state.selectedItem).toBeNull();
    });
  });

  describe("CR formatting", () => {
    it("formats known CR values", () => {
      expect(Open5eUIManager.formatCr("0.125")).toBe("1/8");
      expect(Open5eUIManager.formatCr("0.25")).toBe("1/4");
      expect(Open5eUIManager.formatCr("0.5")).toBe("1/2");
      expect(Open5eUIManager.formatCr("1.00")).toBe("1");
      expect(Open5eUIManager.formatCr("5.00")).toBe("5");
    });

    it("returns raw value for unknown CR", () => {
      expect(Open5eUIManager.formatCr("3.50")).toBe("3.5");
    });
  });

  describe("spell level formatting", () => {
    it("formats cantrip", () => {
      expect(Open5eUIManager.formatSpellLevel(0)).toBe("Заговор");
    });

    it("formats level 1-9", () => {
      expect(Open5eUIManager.formatSpellLevel(1)).toBe("1-й уровень");
      expect(Open5eUIManager.formatSpellLevel(5)).toBe("5-й уровень");
      expect(Open5eUIManager.formatSpellLevel(9)).toBe("9-й уровень");
    });
  });

  describe("debounced search", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("debounces search by 300ms", async () => {
      mockedSearchMonsters.mockResolvedValue([]);

      manager.setQueryDebounced("g");
      manager.setQueryDebounced("go");
      manager.setQueryDebounced("gob");
      manager.setQueryDebounced("goblin");

      expect(mockedSearchMonsters).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      await Promise.resolve();

      expect(mockedSearchMonsters).toHaveBeenCalledTimes(1);
      expect(mockedSearchMonsters).toHaveBeenCalledWith("goblin", undefined);
    });
  });
});
