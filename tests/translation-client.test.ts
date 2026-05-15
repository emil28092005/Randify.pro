import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();

function MockBroadcastChannel(this: unknown) {
  return {
    postMessage: mockPostMessage,
    addEventListener: mockAddEventListener,
    close: vi.fn(),
  };
}

vi.stubGlobal("BroadcastChannel", MockBroadcastChannel as unknown as typeof BroadcastChannel);

describe("translation service", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPostMessage.mockClear();
    mockAddEventListener.mockClear();
  });

  it("stores and retrieves cached translations", async () => {
    const { getCachedTranslation, setCachedTranslation, clearTranslationCache } =
      await import("../src/lib/client/translation");
    clearTranslationCache();

    expect(getCachedTranslation("goblin", "creature")).toBeNull();

    setCachedTranslation("goblin", "creature", { name: "Гоблин" });

    expect(getCachedTranslation("goblin", "creature")).toEqual({ name: "Гоблин" });
    expect(getCachedTranslation("dragon", "creature")).toBeNull();
  });

  it("broadcasts cache updates via BroadcastChannel", async () => {
    const { setCachedTranslation, clearTranslationCache } = await import(
      "../src/lib/client/translation"
    );
    clearTranslationCache();

    setCachedTranslation("goblin", "creature", { name: "Гоблин" });

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "goblin",
        type: "creature",
        data: { name: "Гоблин" },
      }),
    );
  });

  it("fetches translation from API when not cached", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translated: { name: "Гоблин" } }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { fetchTranslation, clearTranslationCache } = await import(
      "../src/lib/client/translation"
    );
    clearTranslationCache();

    const result = await fetchTranslation("goblin", "creature");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/dm/translate?slug=goblin&type=creature",
    );
    expect(result).toEqual({ name: "Гоблин" });
  });

  it("returns cached translation without fetching", async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;

    const {
      setCachedTranslation,
      fetchTranslation,
      clearTranslationCache,
    } = await import("../src/lib/client/translation");
    clearTranslationCache();

    setCachedTranslation("goblin", "creature", { name: "Гоблин" });

    const result = await fetchTranslation("goblin", "creature");

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual({ name: "Гоблин" });
  });

  it("handles fetch errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Not found" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const { fetchTranslation, clearTranslationCache } = await import(
      "../src/lib/client/translation"
    );
    clearTranslationCache();

    await expect(fetchTranslation("unknown", "creature")).rejects.toThrow(
      "Not found",
    );
  });

  it("does not use localStorage", async () => {
    const {
      getCachedTranslation,
      setCachedTranslation,
      clearTranslationCache,
    } = await import("../src/lib/client/translation");
    clearTranslationCache();

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    setCachedTranslation("goblin", "creature", { name: "Гоблин" });
    getCachedTranslation("goblin", "creature");

    expect(setItemSpy).not.toHaveBeenCalled();
    expect(getItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  it("tracks cache size", async () => {
    const {
      setCachedTranslation,
      getTranslationCacheSize,
      clearTranslationCache,
    } = await import("../src/lib/client/translation");
    clearTranslationCache();

    expect(getTranslationCacheSize()).toBe(0);

    setCachedTranslation("a", "creature", { name: "A" });
    setCachedTranslation("b", "spell", { name: "B" });

    expect(getTranslationCacheSize()).toBe(2);
  });
});
