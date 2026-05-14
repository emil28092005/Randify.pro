import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  searchMonsters,
  getMonster,
  searchSpells,
  getSpell,
} from "../src/lib/open5e/client";
import { createMockStorage } from "./utils";

const API_BASE = "https://api.open5e.com/v2";

describe("Open5e Client", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchMonsters", () => {
    it("searches monsters by name", async () => {
      const mockData = {
        results: [
          {
            name: "Adult Red Dragon",
            key: "adult-red-dragon",
            challenge_rating_decimal: "17.00",
            type: "dragon",
            hit_points: 256,
            armor_class: 19,
          },
        ],
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      const results = await searchMonsters("dragon");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Adult Red Dragon");
      expect(results[0].key).toBe("adult-red-dragon");
    });

    it("includes filters in query string", async () => {
      const mockData = { results: [] };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      await searchMonsters("dragon", { type: "dragon", cr__lte: "5" });
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(url).toContain("name__icontains=dragon");
      expect(url).toContain("type=dragon");
      expect(url).toContain("cr__lte=5");
    });

    it("handles API errors by throwing", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
      ) as unknown as typeof fetch;

      await expect(searchMonsters("dragon")).rejects.toThrow();
    });
  });

  describe("getMonster", () => {
    it("fetches a single monster by key", async () => {
      const mockData = {
        name: "Goblin",
        key: "goblin",
        challenge_rating_decimal: "0.25",
        type: "humanoid",
        hit_points: 7,
        armor_class: 15,
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      const result = await getMonster("goblin");
      expect(result.name).toBe("Goblin");
      expect(result.key).toBe("goblin");
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/creatures/goblin/`,
        expect.any(Object)
      );
    });

    it("throws on 404", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
        })
      ) as unknown as typeof fetch;

      await expect(getMonster("nonexistent")).rejects.toThrow("Not Found");
    });
  });

  describe("searchSpells", () => {
    it("searches spells by name", async () => {
      const mockData = {
        results: [
          {
            name: "Fireball",
            key: "fireball",
            level: 3,
            school: "evocation",
          },
        ],
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      const results = await searchSpells("fire");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Fireball");
      expect(results[0].level).toBe(3);
    });

    it("includes filters in query string", async () => {
      const mockData = { results: [] };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      await searchSpells("heal", { level__lte: "3", school: "evocation" });
      const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(url).toContain("name__icontains=heal");
      expect(url).toContain("level__lte=3");
      expect(url).toContain("school=evocation");
    });
  });

  describe("getSpell", () => {
    it("fetches a single spell by key", async () => {
      const mockData = {
        name: "Magic Missile",
        key: "magic-missile",
        level: 1,
        school: "evocation",
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      const result = await getSpell("magic-missile");
      expect(result.name).toBe("Magic Missile");
      expect(result.level).toBe(1);
    });
  });

  describe("cache integration", () => {
    it("returns cached data without calling fetch", async () => {
      const cached = [
        {
          name: "Cached Dragon",
          key: "cached-dragon",
          challenge_rating_decimal: "10.00",
          type: "dragon",
          hit_points: 200,
          armor_class: 18,
        },
      ];
      mockStorage.setItem(
        "open5e:monsters:dragon",
        JSON.stringify({ data: cached, timestamp: Date.now() })
      );

      global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as unknown as typeof fetch;

      const results = await searchMonsters("dragon");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Cached Dragon");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("stores data in cache after fetch", async () => {
      const mockData = {
        results: [
          {
            name: "New Monster",
            key: "new-monster",
            challenge_rating_decimal: "1.00",
            type: "beast",
            hit_points: 10,
            armor_class: 12,
          },
        ],
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      ) as unknown as typeof fetch;

      await searchMonsters("new");
      const stored = mockStorage.getItem("open5e:monsters:new");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(mockData.results);
      expect(typeof parsed.timestamp).toBe("number");
    });

    it("falls back to stale cache on API error", async () => {
      const cached = [
        {
          name: "Stale Dragon",
          key: "stale-dragon",
          challenge_rating_decimal: "5.00",
          type: "dragon",
          hit_points: 100,
          armor_class: 16,
        },
      ];
      mockStorage.setItem(
        "open5e:monsters:dragon",
        JSON.stringify({ data: cached, timestamp: Date.now() })
      );

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
      ) as unknown as typeof fetch;

      const results = await searchMonsters("dragon");
      expect(results).toEqual(cached);
    });

    it("triggers new fetch when cache is expired", async () => {
      const staleData = [
        {
          name: "Old Monster",
          key: "old-monster",
          challenge_rating_decimal: "1.00",
          type: "beast",
          hit_points: 10,
          armor_class: 12,
        },
      ];
      mockStorage.setItem(
        "open5e:monsters:dragon",
        JSON.stringify({ data: staleData, timestamp: Date.now() - 25 * 60 * 60 * 1000 })
      );

      const freshData = {
        results: [
          {
            name: "Fresh Monster",
            key: "fresh-monster",
            challenge_rating_decimal: "2.00",
            type: "beast",
            hit_points: 20,
            armor_class: 14,
          },
        ],
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(freshData),
        })
      ) as unknown as typeof fetch;

      const results = await searchMonsters("dragon");
      expect(results[0].name).toBe("Fresh Monster");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("uses correct cache keys for different endpoints", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        })
      ) as unknown as typeof fetch;

      await searchMonsters("dragon");
      await getMonster("goblin");
      await searchSpells("fire");
      await getSpell("fireball");

      expect(mockStorage.getItem("open5e:monsters:dragon")).not.toBeNull();
      expect(mockStorage.getItem("open5e:monster:goblin")).not.toBeNull();
      expect(mockStorage.getItem("open5e:spells:fire")).not.toBeNull();
      expect(mockStorage.getItem("open5e:spell:fireball")).not.toBeNull();
    });
  });
});
