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

const mockUser2 = {
  id: 2,
  vkId: null,
  yandexId: null,
  email: null,
  name: "Other User",
  avatar: null,
  tier: "free" as const,
  boostyVerifiedAt: null,
  createdAt: new Date("2024-01-01"),
};

function mockRequest(
  url: string,
  origin: string,
  method = "GET",
  body?: unknown
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
    json: async () => body,
  } as unknown as Request;
}

function createMockDb() {
  let sessionsStore: Array<{
    id: number;
    userId: number;
    name: string;
    participants: unknown[];
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  let nextSessionId = 1;

  function evaluateCondition(item: typeof sessionsStore[0], condition: unknown): boolean {
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
      sessionsStore = [];
      nextSessionId = 1;
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((condition: unknown) => ({
          orderBy: vi.fn(() => {
            const filtered = sessionsStore.filter((item) => evaluateCondition(item, condition));
            return Promise.resolve(filtered.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()));
          }),
        })),
        orderBy: vi.fn(() => Promise.resolve(sessionsStore)),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((vals: { userId: number; name: string; participants: unknown[] }) => ({
        returning: vi.fn(() => {
          const session = {
            id: nextSessionId++,
            ...vals,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          sessionsStore.push(session);
          return Promise.resolve([session]);
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((vals: Partial<{ name: string; participants: unknown[] }>) => ({
        where: vi.fn((condition: unknown) => ({
          returning: vi.fn(() => {
            const idx = sessionsStore.findIndex((item) => evaluateCondition(item, condition));
            if (idx !== -1) {
              Object.assign(sessionsStore[idx], vals, { updatedAt: new Date() });
              return Promise.resolve([{ ...sessionsStore[idx] }]);
            }
            return Promise.resolve([]);
          }),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn((condition: unknown) => ({
        returning: vi.fn(() => {
          const idx = sessionsStore.findIndex((item) => evaluateCondition(item, condition));
          if (idx !== -1) {
            const removed = sessionsStore.splice(idx, 1);
            return Promise.resolve(removed);
          }
          return Promise.resolve([]);
        }),
      })),
    })),
    _store: sessionsStore,
    _setStore(store: typeof sessionsStore) {
      sessionsStore = store;
    },
  };
}

let mockDb = createMockDb();

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

describe("Initiative API", () => {
  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    const { GET } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("POST returns 401 when unauthenticated", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", { name: "Combat" });
    const response = await POST!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("PUT returns 401 when unauthenticated", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "PUT", { name: "Updated" });
    const response = await PUT!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("DELETE returns 401 when unauthenticated", async () => {
    const { DELETE } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "OPTIONS");
    const response = await OPTIONS!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
  });

  it("GET returns user's initiative sessions", async () => {
    const { GET } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([
      { id: 1, userId: 1, name: "Session 1", participants: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 2, userId: 1, name: "Session 2", participants: [], createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro");
    const response = await GET!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Session 1");
    expect(body[1].name).toBe("Session 2");
  });

  it("POST creates a new session", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", {
      name: "Boss Fight",
      participants: [{ id: "p1", name: "Goblin", initiative: 15 }],
    });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe("Boss Fight");
    expect(body.participants).toHaveLength(1);
    expect(body.userId).toBe(1);
    expect(body.id).toBeDefined();
  });

  it("POST rejects invalid body", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", { name: "" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("POST rejects missing name", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", { participants: [] });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("POST rejects invalid participant", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", {
      name: "Combat",
      participants: [{ id: "p1", name: "Goblin", hp: "not-a-number" }],
    });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("PUT updates a session", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([
      { id: 1, userId: 1, name: "Old Session", participants: [], createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "PUT", {
      name: "Updated Session",
      participants: [{ id: "p1", name: "Orc" }],
    });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("Updated Session");
    expect(body.participants).toHaveLength(1);
  });

  it("PUT returns 404 for non-existent session", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=999", "https://randify.pro", "PUT", { name: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("PUT returns 404 when accessing another user's session", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([
      { id: 1, userId: 2, name: "Other Session", participants: [], createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "PUT", { name: "Hacked" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("DELETE removes a session", async () => {
    const { DELETE } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([
      { id: 1, userId: 1, name: "To delete", participants: [], createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("DELETE returns 404 for non-existent session", async () => {
    const { DELETE } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=999", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("DELETE returns 404 when accessing another user's session", async () => {
    const { DELETE } = await import("../src/pages/api/dm/initiative");
    mockDb._setStore([
      { id: 1, userId: 2, name: "Other Session", participants: [], createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("PUT returns 400 for missing id", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "PUT", { name: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Missing id query parameter");
  });

  it("DELETE returns 400 for missing id", async () => {
    const { DELETE } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Missing id query parameter");
  });

  it("PUT returns 400 for invalid id", async () => {
    const { PUT } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative?id=abc", "https://randify.pro", "PUT", { name: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid id");
  });

  it("POST allows session without participants", async () => {
    const { POST } = await import("../src/pages/api/dm/initiative");
    const request = mockRequest("https://dm.randify.pro/api/dm/initiative", "https://randify.pro", "POST", { name: "Empty Session" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.name).toBe("Empty Session");
    expect(body.participants).toEqual([]);
  });
});
