import { describe, it, expect, vi, beforeEach } from "vitest";

function mockRequest(url: string, origin: string, method = "GET"): Request {
  return {
    url,
    method,
    headers: {
      get(name: string) {
        if (name.toLowerCase() === "origin") return origin;
        return null;
      },
    },
  } as unknown as Request;
}

function createMockDb() {
  let translationsStore: Array<{
    id: number;
    slug: string;
    type: string;
    language: string;
    content: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  let nextId = 1;

  function evaluateCondition(item: typeof translationsStore[0], condition: unknown): boolean {
    if (!condition || typeof condition !== "object") return true;
    const c = condition as Record<string, unknown>;
    if (c.type === "eq") {
      const colName = (c.column as string).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const itemValue = (item as Record<string, unknown>)[colName];
      return itemValue === c.value;
    }
    if (c.type === "and") {
      const conditions = c.conditions as unknown[];
      return conditions.every((sub) => evaluateCondition(item, sub));
    }
    return true;
  }

  return {
    reset() {
      translationsStore = [];
      nextId = 1;
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((condition: unknown) => ({
          orderBy: vi.fn(() => {
            const filtered = translationsStore.filter((item) => evaluateCondition(item, condition));
            return Promise.resolve(filtered.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()));
          }),
        })),
        orderBy: vi.fn(() => Promise.resolve(translationsStore)),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((vals: { slug: string; type: string; language: string; content: Record<string, unknown> | null }) => ({
        returning: vi.fn(() => {
          const row = {
            id: nextId++,
            ...vals,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          translationsStore.push(row);
          return Promise.resolve([row]);
        }),
      })),
    })),
    _store: translationsStore,
    _setStore(store: typeof translationsStore) {
      translationsStore = store;
    },
  };
}

const mockDb = createMockDb();

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (column: { name: string }, value: unknown) => ({ type: "eq", column: column.name, value }),
    and: (...conditions: unknown[]) => ({ type: "and", conditions }),
  };
});

vi.mock("../src/db/client", () => ({
  db: mockDb,
}));

const mockMonster = {
  name: "Goblin",
  key: "goblin",
  challenge_rating_decimal: "1/4",
  type: "humanoid",
  hit_points: 7,
  armor_class: 15,
};

const mockSpell = {
  name: "Fireball",
  key: "fireball",
  level: 3,
  school: "evocation",
};

const mockTranslatedMonster = {
  name: "Гоблин",
  key: "goblin",
  challenge_rating_decimal: "1/4",
  type: "гуманоид",
  hit_points: 7,
  armor_class: 15,
};

const mockTranslatedSpell = {
  name: "Огненный шар",
  key: "fireball",
  level: 3,
  school: "эвокация",
};

vi.mock("../src/lib/open5e/client", () => ({
  getMonster: vi.fn(async (slug: string) => {
    if (slug === "goblin") return mockMonster;
    throw new Error("Monster not found");
  }),
  getSpell: vi.fn(async (slug: string) => {
    if (slug === "fireball") return mockSpell;
    throw new Error("Spell not found");
  }),
}));

vi.mock("../src/lib/ai/openrouter", () => ({
  translateOpen5eContent: vi.fn(async (_content: Record<string, unknown>, type: string) => {
    if (type === "creature") return mockTranslatedMonster;
    if (type === "spell") return mockTranslatedSpell;
    throw new Error("Unknown type");
  }),
}));

describe("Translate API", () => {
  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=creature", "https://randify.pro", "OPTIONS");
    const response = await OPTIONS!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
  });

  it("returns 400 when slug is missing", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Missing required query parameters");
  });

  it("returns 400 when type is missing", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Missing required query parameters");
  });

  it("returns 400 for invalid type", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=invalid", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Invalid type");
  });

  it("returns cached translation on cache hit (creature)", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    mockDb._setStore([
      { id: 1, slug: "goblin", type: "creature", language: "ru", content: mockTranslatedMonster, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.cached).toBe(true);
    expect(body.translated).toEqual(mockTranslatedMonster);
  });

  it("returns cached translation on cache hit (spell)", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    mockDb._setStore([
      { id: 1, slug: "fireball", type: "spell", language: "ru", content: mockTranslatedSpell, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=fireball&type=spell", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.cached).toBe(true);
    expect(body.translated).toEqual(mockTranslatedSpell);
  });

  it("fetches, translates, caches, and returns on cache miss (creature)", async () => {
    const { getMonster } = await import("../src/lib/open5e/client");
    const { translateOpen5eContent } = await import("../src/lib/ai/openrouter");
    const { GET } = await import("../src/pages/api/dm/translate");

    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.cached).toBe(false);
    expect(body.translated).toEqual(mockTranslatedMonster);
    expect(getMonster).toHaveBeenCalledWith("goblin");
    expect(translateOpen5eContent).toHaveBeenCalledWith(mockMonster, "creature");
  });

  it("fetches, translates, caches, and returns on cache miss (spell)", async () => {
    const { getSpell } = await import("../src/lib/open5e/client");
    const { translateOpen5eContent } = await import("../src/lib/ai/openrouter");
    const { GET } = await import("../src/pages/api/dm/translate");

    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=fireball&type=spell", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.cached).toBe(false);
    expect(body.translated).toEqual(mockTranslatedSpell);
    expect(getSpell).toHaveBeenCalledWith("fireball");
    expect(translateOpen5eContent).toHaveBeenCalledWith(mockSpell, "spell");
  });

  it("returns 502 when Open5e fetch fails", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=unknown&type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Failed to fetch original content from Open5e");
    expect(body.details).toContain("Monster not found");
  });

  it("returns 502 when translation API fails", async () => {
    const { translateOpen5eContent } = await import("../src/lib/ai/openrouter");
    vi.mocked(translateOpen5eContent).mockRejectedValueOnce(new Error("OpenRouter rate limit"));

    const { GET } = await import("../src/pages/api/dm/translate");
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Translation failed");
    expect(body.details).toContain("OpenRouter rate limit");
  });

  it("does not require authentication", async () => {
    const { GET } = await import("../src/pages/api/dm/translate");
    mockDb._setStore([
      { id: 1, slug: "goblin", type: "creature", language: "ru", content: mockTranslatedMonster, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/translate?slug=goblin&type=creature", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
  });
});
