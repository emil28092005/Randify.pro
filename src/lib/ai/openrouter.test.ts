import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateNPC } from "./openrouter";
import { type NPCParams, type NPCResult, type Open5eMonster } from "@/lib/ai/types";

describe("generateNPC", () => {
  const validNPCResponse: NPCResult = {
    name: "Gorath the Grim",
    race: "Half-Orc",
    role: "Mercenary Captain",
    level: 5,
    hp: 45,
    ac: 16,
    cr: "2",
    speed: "30 ft.",
    appearance: "Scarred face, heavy armor, carries a battleaxe.",
    trait: "Suspicious of everyone but fiercely loyal to allies.",
    motivation: "Amassing gold to buy land and retire.",
    secret: "He betrayed his previous company for a bag of gold.",
    history: "Born in the slums, fought his way up through underground pits.",
  };

  beforeEach(() => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns parsed NPC on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(validNPCResponse),
                },
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;

    const params: NPCParams = { theme: "dark fantasy", role: "villain", level: 5, race: "human", tone: "dark" };
    const result = await generateNPC(params);

    expect(result).toEqual(validNPCResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(callArgs[0]).toBe(
      "https://openrouter.ai/api/v1/chat/completions"
    );
    expect(callArgs[1].method).toBe("POST");
    expect(callArgs[1].headers.Authorization).toBe(
      "Bearer test-api-key"
    );

    const body = JSON.parse(callArgs[1].body);
    expect(body.model).toBe("llama-3.3-70b:free");
    expect(body.messages[0].content).toContain("valid JSON only");
    expect(body.messages[1].content).toContain("dark fantasy");
    expect(body.messages[1].content).toContain("villain");
  });

  it("includes reference monster in prompt", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(validNPCResponse),
                },
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;

    const reference: Open5eMonster = {
      name: "Goblin",
      challenge_rating_decimal: 0.25,
      hit_points: 7,
      armor_class: 15,
    };

    await generateNPC({ role: "minion" } as NPCParams, reference);

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(body.messages[1].content).toContain("Goblin");
    expect(body.messages[1].content).toContain("HP: 7");
    expect(body.messages[1].content).toContain("AC: 15");
    expect(body.messages[1].content).toContain("CR: 0.25");
  });

  it("throws on missing API key", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("OPENROUTER_API_KEY", "");

    await expect(generateNPC({} as NPCParams)).rejects.toThrow(
      "OPENROUTER_API_KEY is not set"
    );
  });

  it("throws on rate limit (429)", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        text: () => Promise.resolve("Rate limited"),
      })
    ) as unknown as typeof fetch;

    await expect(generateNPC({} as NPCParams)).rejects.toThrow(
      "Rate limited by OpenRouter (429)"
    );
  });

  it("throws on API error", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.resolve("Server error"),
      })
    ) as unknown as typeof fetch;

    await expect(generateNPC({} as NPCParams)).rejects.toThrow(
      "OpenRouter API error 500"
    );
  });

  it("throws on invalid JSON response", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: "This is not JSON",
                },
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;

    await expect(generateNPC({} as NPCParams)).rejects.toThrow(
      "Invalid JSON in OpenRouter response"
    );
  });

  it("throws on schema validation failure", async () => {
    const invalidNPC = { name: "Only Name", race: "Human" };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(invalidNPC),
                },
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;

    await expect(generateNPC({} as NPCParams)).rejects.toThrow(
      "NPC schema validation failed"
    );
  });

  it("throws on timeout", async () => {
    vi.useFakeTimers();

    global.fetch = vi.fn((_url, options) => {
      return new Promise((_resolve, reject) => {
        const onAbort = () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        };
        if (options.signal) {
          if (options.signal.aborted) {
            onAbort();
          } else {
            options.signal.addEventListener("abort", onAbort, { once: true });
          }
        }
      });
    }) as unknown as typeof fetch;

    const promise = generateNPC({} as NPCParams);
    vi.advanceTimersByTime(11_000);

    await expect(promise).rejects.toThrow(
      "OpenRouter request timed out after 10s"
    );
    vi.useRealTimers();
  });

  it("allows custom model override", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify(validNPCResponse),
                },
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;

    await generateNPC({} as NPCParams, undefined, "custom-model:free");

    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(body.model).toBe("custom-model:free");
  });
});
