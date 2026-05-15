import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateNPC, KimiClientError } from "./kimi";
import type { NPCParams, Open5eMonster } from "./types";

const validNPCResponse = {
  name: "Tharok Stonehelm",
  race: "dwarf",
  role: "fighter",
  level: 3,
  hp: 45,
  ac: 18,
  cr: "2",
  speed: "25 ft.",
  appearance: "A stout dwarf with a braided red beard and burn scars across his forearms.",
  trait: "Never breaks a promise, no matter the cost.",
  motivation: "Seeking to reclaim his ancestral forge from a fire giant.",
  secret: "He forged the weapon that killed his own brother by accident.",
  history: "Once a royal smith, exiled after a catastrophic forging accident.",
};

function mockFetchResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 429 ? "Too Many Requests" : "Error",
    text: () => Promise.resolve(JSON.stringify(body)),
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchTextResponse(text: string, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: "OK",
    text: () => Promise.resolve(text),
    json: () => Promise.resolve(text).then((t) => JSON.parse(t)),
  } as Response);
}

describe("generateNPC", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv, KIMI_API_KEY: "test-api-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("generates an NPC successfully", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({
        choices: [
          {
            message: {
              content: JSON.stringify(validNPCResponse),
            },
          },
        ],
      })
    );

    const params: NPCParams = {
      race: "dwarf",
      role: "fighter",
      level: 3,
      tone: "heroic",
    };

    const result = await generateNPC(params);

    expect(result).toEqual(validNPCResponse);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0];
    const requestInit = callArgs[1] as RequestInit;
    const body = JSON.parse(requestInit.body as string);

    expect(body.model).toBe("moonshot-v1-8k");
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(body.response_format.type).toBe("json_schema");
    expect(body.temperature).toBe(0.7);
    expect(requestInit.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer test-api-key",
    });
  });

  it("includes Open5e reference in the prompt when provided", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({
        choices: [
          {
            message: {
              content: JSON.stringify(validNPCResponse),
            },
          },
        ],
      })
    );

    const reference: Open5eMonster = {
      name: "Dwarf Warrior",
      size: "Medium",
      type: "humanoid",
      armor_class: 16,
      hit_points: 30,
      challenge_rating_decimal: 1,
      speed: { walk: "25 ft." },
      actions: [{ name: "War Pick", desc: "Melee Weapon Attack: +4 to hit" }],
    };

    const params: NPCParams = {
      race: "dwarf",
      role: "fighter",
      level: 3,
      tone: "heroic",
    };

    await generateNPC(params, reference);

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0];
    const body = JSON.parse((callArgs[1] as RequestInit).body as string);
    const userContent = body.messages[1].content as string;

    expect(userContent).toContain("Dwarf Warrior");
    expect(userContent).toContain("AC: 16");
    expect(userContent).toContain("HP: 30");
    expect(userContent).toContain("War Pick");
  });

  it("throws KimiClientError when KIMI_API_KEY is missing", async () => {
    delete process.env.KIMI_API_KEY;

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow(KimiClientError);

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("KIMI_API_KEY is not configured");

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("throws KimiClientError on API error (500)", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({ error: { message: "Internal server error" } }, 500)
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow(KimiClientError);

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Kimi API error: 500 Error");
  });

  it("throws KimiClientError on rate limit (429)", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({ error: { message: "Rate limit exceeded" } }, 429)
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow(KimiClientError);

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Kimi API rate limit exceeded");
  });

  it("throws KimiClientError when API returns invalid JSON", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchTextResponse("This is not json")
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Kimi API returned invalid JSON");
  });

  it("throws KimiClientError when response fails zod validation", async () => {
    const invalidResponse = { ...validNPCResponse, name: 123 };

    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidResponse),
            },
          },
        ],
      })
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow(KimiClientError);

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("validation failed");
  });

  it("throws KimiClientError when API returns empty content", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      })
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Kimi API returned empty content");
  });

  it("throws KimiClientError on request timeout", async () => {
    vi.mocked(globalThis.fetch).mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("AbortError")), 50);
        })
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow(KimiClientError);
  });

  it("throws KimiClientError when API returns error in response body", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({
        error: { message: "Invalid API key" },
      })
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Invalid API key");
  });

  it("validates params with zod before making request", async () => {
    await expect(
      generateNPC({
        race: "elf",
        role: "wizard",
        level: 25,
        tone: "dark",
      } as NPCParams)
    ).rejects.toThrow();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("handles markdown-wrapped JSON gracefully", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchTextResponse(
        '```json\n' + JSON.stringify(validNPCResponse) + '\n```'
      )
    );

    await expect(
      generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" })
    ).rejects.toThrow("Kimi API returned invalid JSON");
  });

  it("preserves statusCode on API errors", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(
      mockFetchResponse({ error: { message: "Bad request" } }, 400)
    );

    try {
      await generateNPC({ race: "elf", role: "wizard", level: 5, tone: "dark" });
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(KimiClientError);
      expect((error as KimiClientError).statusCode).toBe(400);
    }
  });
});
