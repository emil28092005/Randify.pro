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
  let notesStore: Array<{
    id: number;
    userId: number;
    title: string;
    content: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  let nextNoteId = 1;

  function evaluateCondition(item: typeof notesStore[0], condition: unknown): boolean {
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
      notesStore = [];
      nextNoteId = 1;
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn((condition: unknown) => ({
          orderBy: vi.fn(() => {
            const filtered = notesStore.filter((item) => evaluateCondition(item, condition));
            return Promise.resolve(filtered.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()));
          }),
        })),
        orderBy: vi.fn(() => Promise.resolve(notesStore)),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn((vals: { userId: number; title: string; content: string | null }) => ({
        returning: vi.fn(() => {
          const note = {
            id: nextNoteId++,
            ...vals,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          notesStore.push(note);
          return Promise.resolve([note]);
        }),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((vals: Partial<{ title: string; content: string | null }>) => ({
        where: vi.fn((condition: unknown) => ({
          returning: vi.fn(() => {
            const idx = notesStore.findIndex((item) => evaluateCondition(item, condition));
            if (idx !== -1) {
              Object.assign(notesStore[idx], vals, { updatedAt: new Date() });
              return Promise.resolve([{ ...notesStore[idx] }]);
            }
            return Promise.resolve([]);
          }),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn((condition: unknown) => ({
        returning: vi.fn(() => {
          const idx = notesStore.findIndex((item) => evaluateCondition(item, condition));
          if (idx !== -1) {
            const removed = notesStore.splice(idx, 1);
            return Promise.resolve(removed);
          }
          return Promise.resolve([]);
        }),
      })),
    })),
    _store: notesStore,
    _setStore(store: typeof notesStore) {
      notesStore = store;
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

describe("Notes API", () => {
  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    const { GET } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro");
    const response = await GET!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("POST returns 401 when unauthenticated", async () => {
    const { POST } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "POST", { title: "Test" });
    const response = await POST!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("PUT returns 401 when unauthenticated", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "PUT", { title: "Updated" });
    const response = await PUT!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("DELETE returns 401 when unauthenticated", async () => {
    const { DELETE } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(401);
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "OPTIONS");
    const response = await OPTIONS!({ request, locals: { user: null }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
  });

  it("GET returns user's notes", async () => {
    const { GET } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([
      { id: 1, userId: 1, title: "Note 1", content: "Content 1", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, userId: 1, title: "Note 2", content: "Content 2", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro");
    const response = await GET!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(2);
    expect(body[0].title).toBe("Note 1");
    expect(body[1].title).toBe("Note 2");
  });

  it("POST creates a new note", async () => {
    const { POST } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "POST", { title: "New Note", content: "Body" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.title).toBe("New Note");
    expect(body.content).toBe("Body");
    expect(body.userId).toBe(1);
    expect(body.id).toBeDefined();
  });

  it("POST rejects invalid body", async () => {
    const { POST } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "POST", { title: "" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("POST rejects missing title", async () => {
    const { POST } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "POST", { content: "Body only" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("PUT updates a note", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([
      { id: 1, userId: 1, title: "Old", content: "Old content", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "PUT", { title: "Updated", content: "New content" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.title).toBe("Updated");
  });

  it("PUT returns 404 for non-existent note", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=999", "https://randify.pro", "PUT", { title: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("PUT returns 404 when accessing another user's note", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([
      { id: 1, userId: 2, title: "Other", content: "Other content", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "PUT", { title: "Hacked" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("DELETE removes a note", async () => {
    const { DELETE } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([
      { id: 1, userId: 1, title: "To delete", content: "Content", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("DELETE returns 404 for non-existent note", async () => {
    const { DELETE } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=999", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("DELETE returns 404 when accessing another user's note", async () => {
    const { DELETE } = await import("../src/pages/api/dm/notes");
    mockDb._setStore([
      { id: 1, userId: 2, title: "Other", content: "Other content", createdAt: new Date(), updatedAt: new Date() },
    ]);
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=1", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Not found");
  });

  it("PUT returns 400 for missing id", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "PUT", { title: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Missing id query parameter");
  });

  it("DELETE returns 400 for missing id", async () => {
    const { DELETE } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "DELETE");
    const response = await DELETE!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Missing id query parameter");
  });

  it("PUT returns 400 for invalid id", async () => {
    const { PUT } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes?id=abc", "https://randify.pro", "PUT", { title: "Updated" });
    const response = await PUT!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid id");
  });

  it("POST allows note without content", async () => {
    const { POST } = await import("../src/pages/api/dm/notes");
    const request = mockRequest("https://dm.randify.pro/api/dm/notes", "https://randify.pro", "POST", { title: "Title Only" });
    const response = await POST!({ request, locals: { user: mockUser }, url: new URL(request.url), ...({} as any) });
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.title).toBe("Title Only");
    expect(body.content).toBeNull();
  });
});
