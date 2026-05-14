import { describe, it, expect } from "vitest";

describe("Infrastructure", () => {
  it("vitest works", () => {
    expect(true).toBe(true);
  });

  it("can resolve @/* aliases in tests", async () => {
    const schema = await import("@/lib/generator-schema");
    expect(schema).toBeDefined();
    expect(schema.generatorSchema).toBeDefined();
  });

  it("happy-dom provides a DOM environment", () => {
    expect(typeof document).toBe("object");
    expect(typeof window).toBe("object");
  });

  it("crypto.getRandomValues is available", () => {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    expect(arr.length).toBe(4);
  });
});

describe("Test Utils", () => {
  it("mock helpers are importable", async () => {
    const utils = await import("./utils");
    expect(typeof utils.mockAstroLocals).toBe("function");
    expect(typeof utils.setupMockFetch).toBe("function");
    expect(typeof utils.createMockStorage).toBe("function");
    expect(typeof utils.mockJwtToken).toBe("function");
    expect(typeof utils.waitFor).toBe("function");
  });
});
