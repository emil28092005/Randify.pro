import { describe, it, expect, vi, afterEach } from "vitest";
import { randomInt, randomFloat, randomBytes, shuffleArray } from "./random";

describe("randomInt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an integer within [min, max]", () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("handles min === max", () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it("handles negative ranges", () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-10, -5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-5);
    }
  });

  it("handles range crossing zero", () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  it("throws when min > max", () => {
    expect(() => randomInt(5, 1)).toThrow();
  });

  it("uses rejection sampling for uniform distribution", () => {
    const spy = vi
      .spyOn(globalThis.crypto, "getRandomValues")
      .mockImplementation((buffer) => {
        const arr = buffer as Uint32Array;
        arr[0] = 0;
        return buffer;
      });

    expect(randomInt(0, 10)).toBe(0);
    spy.mockRestore();
  });
});

describe("randomFloat", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a value in [0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const result = randomFloat();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    }
  });

  it("maps 0xFFFFFFFF to just under 1", () => {
    const spy = vi
      .spyOn(globalThis.crypto, "getRandomValues")
      .mockImplementation((buffer) => {
        const arr = buffer as Uint32Array;
        arr[0] = 0xffffffff;
        return buffer;
      });

    const result = randomFloat();
    expect(result).toBeGreaterThan(0.999);
    expect(result).toBeLessThan(1);
    spy.mockRestore();
  });

  it("maps 0 to 0", () => {
    const spy = vi
      .spyOn(globalThis.crypto, "getRandomValues")
      .mockImplementation((buffer) => {
        const arr = buffer as Uint32Array;
        arr[0] = 0;
        return buffer;
      });

    expect(randomFloat()).toBe(0);
    spy.mockRestore();
  });
});

describe("randomBytes", () => {
  it("returns a Uint8Array of the requested length", () => {
    const result = randomBytes(16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  it("returns empty array for length 0", () => {
    const result = randomBytes(0);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });
});

describe("shuffleArray", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a new array with the same elements", () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
    expect(shuffled).not.toBe(original);
  });

  it("does not mutate the original array", () => {
    const original = [1, 2, 3];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it("handles empty arrays", () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it("handles single-element arrays", () => {
    const result = shuffleArray([42]);
    expect(result).toEqual([42]);
  });

  it("produces deterministic shuffle with mocked randomness", () => {
    const spy = vi
      .spyOn(globalThis.crypto, "getRandomValues")
      .mockImplementation((buffer) => {
        const arr = buffer as Uint32Array;
        arr[0] = 0;
        return buffer;
      });

  const original = [1, 2, 3];
  const shuffled = shuffleArray(original);
  expect(shuffled).toEqual([2, 3, 1]);
    spy.mockRestore();
  });
});
