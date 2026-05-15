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

const mockProUser = {
  ...mockUser,
  id: 2,
  tier: "pro" as const,
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

// vi.mock factories are hoisted, so refs they read must use var (not let/const)
// to be visible at hoist time without ReferenceError.
/* eslint-disable no-var */
var mockOpenRouterNPC = vi.fn();
var mockKimiNPC = vi.fn();
var mockSearchMonsters = vi.fn();
var mockCheckRateLimit = vi.fn();
var mockIncrementCounter = vi.fn();
/* eslint-enable no-var */

vi.mock("@/lib/ai/openrouter", () => ({
  generateNPC: (...args: unknown[]) => mockOpenRouterNPC(...args),
}));

vi.mock("@/lib/ai/kimi", () => ({
  generateNPC: (...args: unknown[]) => mockKimiNPC(...args),
}));

vi.mock("@/lib/open5e/client", () => ({
  searchMonsters: (...args: unknown[]) => mockSearchMonsters(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  incrementGenerationCounter: (...args: unknown[]) => mockIncrementCounter(...args),
  getRetryAfterSeconds: () => 3600,
  TIER_LIMITS: { free: 7, pro: 100 },
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 42 }])),
      })),
    })),
  },
}));

describe("AI Generate NPC API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenRouterNPC = vi.fn();
    mockKimiNPC = vi.fn();
    mockSearchMonsters = vi.fn();
    mockCheckRateLimit = vi.fn();
    mockIncrementCounter = vi.fn();
  });

  it("returns 401 when unauthenticated", async () => {
    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Human", role: "Merchant", level: 5, tone: "friendly" }
    );
    const response = await POST!({
      request,
      locals: { user: null },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 429 when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 3600000),
    });

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Human", role: "Merchant", level: 5, tone: "friendly" }
    );
    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Rate limit exceeded");
    expect(response.headers.get("Retry-After")).toBe("3600");
  });

  it("returns 400 for invalid JSON", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = {
      ...mockRequest(
        "https://dm.randify.pro/api/dm/ai/generate",
        "https://randify.pro",
        "POST"
      ),
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Request;

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid JSON");
  });

  it("returns 400 for validation failure", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Human", level: 5 }
    );

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
  });

  it("happy path for free user without Open5e reference", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    const generatedNPC = {
      name: "Gorath",
      race: "Orc",
      role: "Bandit",
      level: 3,
      hp: 45,
      ac: 14,
      cr: "1/2",
      speed: "30 ft.",
      appearance: "Scarred and muscular",
      trait: "Greedy",
      motivation: "Gold",
      secret: "Works for a dragon",
      history: "Former soldier",
    };

    mockOpenRouterNPC.mockResolvedValue(generatedNPC);

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Orc", role: "Bandit", level: 3, tone: "grim" }
    );

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.npc.name).toBe("Gorath");
    expect(body.npc.id).toBe(42);
    expect(body.reference).toBeUndefined();
    expect(mockOpenRouterNPC).toHaveBeenCalledWith(
      { race: "Orc", role: "Bandit", level: 3, tone: "grim" },
      undefined
    );
    expect(mockKimiNPC).not.toHaveBeenCalled();
  });

  it("happy path for pro user with Open5e reference", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 95,
      resetAt: new Date(Date.now() + 3600000),
    });

    const referenceMonster = {
      name: "Bandit",
      key: "bandit",
      challenge_rating_decimal: "0.125",
      type: "humanoid",
      hit_points: 11,
      armor_class: 12,
    };

    const generatedNPC = {
      name: "Slythe",
      race: "Human",
      role: "Rogue",
      level: 2,
      hp: 20,
      ac: 15,
      cr: "1/4",
      speed: "30 ft.",
      appearance: "Slim and quick",
      trait: "Cunning",
      motivation: "Revenge",
      secret: "Is a noble in disguise",
      history: "Street urchin turned thief",
    };

    mockSearchMonsters.mockResolvedValue([referenceMonster]);
    mockKimiNPC.mockResolvedValue(generatedNPC);

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Human", role: "Rogue", level: 2, tone: "dark", useOpen5eReference: true }
    );

    const response = await POST!({
      request,
      locals: { user: mockProUser },
      url: new URL(request.url),
      ...({} as any),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.npc.name).toBe("Slythe");
    expect(body.reference).toEqual(referenceMonster);
    expect(mockKimiNPC).toHaveBeenCalledWith(
      { race: "Human", role: "Rogue", level: 2, tone: "dark" },
      referenceMonster
    );
    expect(mockOpenRouterNPC).not.toHaveBeenCalled();
  });

  it("continues without reference when Open5e fetch fails", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    mockSearchMonsters.mockRejectedValue(new Error("Open5e API error"));

    const generatedNPC = {
      name: "Mira",
      race: "Elf",
      role: "Wizard",
      level: 5,
      hp: 30,
      ac: 12,
      cr: "2",
      speed: "30 ft.",
      appearance: "Elegant with silver hair",
      trait: "Curious",
      motivation: "Knowledge",
      secret: "Seeks immortality",
      history: "Apprentice to a lich",
    };

    mockOpenRouterNPC.mockResolvedValue(generatedNPC);

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Elf", role: "Wizard", level: 5, tone: "mysterious", useOpen5eReference: true }
    );

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.npc.name).toBe("Mira");
    expect(body.reference).toBeUndefined();
  });

  it("returns 502 when AI response is invalid", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    mockOpenRouterNPC.mockResolvedValue({
      name: "Bad",
      race: "Orc",
    });

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Orc", role: "Bandit", level: 3, tone: "grim" }
    );

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Invalid AI response");
  });

  it("returns 502 when AI generation throws", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: new Date(Date.now() + 3600000),
    });

    mockOpenRouterNPC.mockRejectedValue(new Error("OpenRouter API error"));

    const { POST } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
      "https://randify.pro",
      "POST",
      { race: "Orc", role: "Bandit", level: 3, tone: "grim" }
    );

    const response = await POST!({
      request,
      locals: { user: mockUser },
      url: new URL(request.url),
      ...({} as any),
    });

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("AI generation failed");
    expect(body.details).toBe("OpenRouter API error");
  });

  it("OPTIONS returns 204 with CORS headers", async () => {
    const { OPTIONS } = await import("../src/pages/api/dm/ai/generate");
    const request = mockRequest(
      "https://dm.randify.pro/api/dm/ai/generate",
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
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://randify.pro");
  });
});
