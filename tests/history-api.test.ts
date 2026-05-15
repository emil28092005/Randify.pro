/* eslint-disable @typescript-eslint/no-explicit-any -- API handlers expect a full Astro APIContext; tests provide only the fields under test and spread `{} as any` for the rest. Typing the remainder would obscure the test intent. */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUser = {
  id: 1,
  vkId: null,
  yandexId: null,
  email: null,
  name: "Test User",
  avatar: null,
  tier: "free" as const,
  boostyVerifiedAt: null,
  createdAt: new Date("2024-01-01"),
};

function mockRequest(
  url: string,
  origin: string,
  method = "GET"
): Request {
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

interface NpcItem {
  id: number;
  userId: number;
  name: string;
  race: string | null;
  role: string | null;
  level: number | null;
  tone: string | null;
  content: unknown;
  createdAt: Date;
}

function createMockDb() {
  let npcsStore: NpcItem[] = [];

  function evaluateCondition(item: NpcItem, condition: unknown): boolean {
    if (!condition || typeof condition !== "object") return true;
    const c = condition as Record<string, unknown>;
    if (c.type === "eq") {
      const colName = (c.column as string).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const itemValue = (item as unknown as Record<string, unknown>)[colName];
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
      npcsStore = [];
    },
    _setStore(store: NpcItem[]) {
      npcsStore = store;
    },
    select: vi.fn((selectArg?: { total: unknown }) => {
      if (selectArg && "total" in selectArg) {
        return {
          from: vi.fn(() => ({
            where: vi.fn((condition: unknown) => {
              const filtered = npcsStore.filter((item) => evaluateCondition(item, condition));
              return Promise.resolve([{ total: filtered.length }]);
            }),
          })),
        };
      }
      return {
        from: vi.fn(() => ({
          where: vi.fn((condition: unknown) => {
            const filtered = npcsStore.filter((item) => evaluateCondition(item, condition));
            const ordered = filtered.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return {
              orderBy: vi.fn(() => ({
                limit: vi.fn((n: number) => ({
                  offset: vi.fn((o: number) => Promise.resolve(ordered.slice(o, o + n))),
                })),
              })),
            };
          }),
        })),
      };
    }),
  };
}

const mockDb = createMockDb();

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (column: { name: string }, value: unknown) => ({ type: "eq", column: column.name, value }),
    and: (...conditions: unknown[]) => ({ type: "and", conditions }),
    desc: (column: { name: string }) => ({ type: "desc", column: column.name, direction: "desc" }),
    count: () => ({ getSQL: () => ({ type: "count" }) }),
    sql: Object.assign(
      (strings: TemplateStringsArray, ...values: unknown[]) => ({ type: "sql", strings, values }),
      { raw: (value: unknown) => ({ type: "raw", value }) }
    ),
  };
});

vi.mock("../src/db/client", () => ({
  db: mockDb,
}));

describe("AI History API", () => {
  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: null },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/ai/history");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history",
      "https://randify.pro",
      "OPTIONS"
    );
    const response = await OPTIONS!({
      request,
      locals: { user: null },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://randify.pro"
    );
  });

  it("GET returns user's NPC history ordered by createdAt DESC", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    const now = new Date();
    const earlier = new Date(now.getTime() - 3600_000);
    mockDb._setStore([
      {
        id: 1,
        userId: 1,
        name: "NPC Older",
        race: "Human",
        role: "Merchant",
        level: 5,
        tone: "Friendly",
        content: { description: "Older NPC" },
        createdAt: earlier,
      },
      {
        id: 2,
        userId: 1,
        name: "NPC Newer",
        race: "Elf",
        role: "Warrior",
        level: 10,
        tone: "Grim",
        content: { description: "Newer NPC" },
        createdAt: now,
      },
    ]);
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.items[0].name).toBe("NPC Newer");
    expect(body.items[1].name).toBe("NPC Older");
  });

  it("GET paginates with limit and offset", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    const now = new Date();
    mockDb._setStore(
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        userId: 1,
        name: `NPC ${i + 1}`,
        race: "Human",
        role: "Warrior",
        level: i + 1,
        tone: "Neutral",
        content: { description: `NPC ${i + 1}` },
        createdAt: new Date(now.getTime() - i * 60_000),
      }))
    );
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history?limit=2&offset=1",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(5);
    expect(body.items[0].name).toBe("NPC 2");
    expect(body.items[1].name).toBe("NPC 3");
  });

  it("GET returns empty state when user has no NPCs", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    mockDb._setStore([]);
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("GET never returns other users' NPCs", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    mockDb._setStore([
      {
        id: 1,
        userId: 2,
        name: "Other User NPC",
        race: "Orc",
        role: "Boss",
        level: 20,
        tone: "Evil",
        content: { description: "Should not appear" },
        createdAt: new Date(),
      },
    ]);
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("GET clamps limit above MAX_LIMIT to MAX_LIMIT", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    const now = new Date();
    mockDb._setStore(
      Array.from({ length: 101 }, (_, i) => ({
        id: i + 1,
        userId: 1,
        name: `NPC ${i + 1}`,
        race: "Human",
        role: "Warrior",
        level: 1,
        tone: "Neutral",
        content: { description: `NPC ${i + 1}` },
        createdAt: new Date(now.getTime() - i * 1000),
      }))
    );
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history?limit=200",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(100);
    expect(body.total).toBe(101);
  });

  it("GET handles negative offset by clamping to 0", async () => {
    const { GET } = await import("../src/pages/api/dm/ai/history");
    const now = new Date();
    mockDb._setStore([
      {
        id: 1,
        userId: 1,
        name: "NPC 1",
        race: "Human",
        role: "Warrior",
        level: 1,
        tone: "Neutral",
        content: { description: "NPC 1" },
        createdAt: now,
      },
    ]);
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/history?offset=-5",
      "https://randify.pro"
    );
    const response = await GET!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].name).toBe("NPC 1");
  });
});