import { describe, it, expect, vi, beforeEach } from "vitest";

let mockSelectTotal = 0;
let mockInsertedValues: unknown[] = [];

const mockDb = {
  reset() {
    mockSelectTotal = 0;
    mockInsertedValues = [];
  },
  setTotal(n: number) {
    mockSelectTotal = n;
  },
  getInsertedValues() {
    return mockInsertedValues;
  },
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([{ total: mockSelectTotal }])),
    })),
  })),
  insert: vi.fn(() => ({
    values: vi.fn((vals: unknown) => ({
      onConflictDoUpdate: vi.fn(() => {
        mockInsertedValues.push(vals);
        return Promise.resolve();
      }),
    })),
  })),
};

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (column: { name: string }, value: unknown) => ({
      type: "eq",
      column: column.name,
      value,
    }),
    and: (...conditions: unknown[]) => ({
      type: "and",
      conditions,
    }),
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => {
      return {
        type: "sql",
        raw: strings,
        values,
      } as unknown as ReturnType<typeof actual.sql>;
    },
    getTableColumns: actual.getTableColumns,
  };
});

vi.mock("@/db/client", () => ({
  db: mockDb,
}));

describe("Rate Limit Service", () => {
  beforeEach(() => {
    mockDb.reset();
    vi.clearAllMocks();
  });

  async function importRateLimit() {
    const mod = await import("@/lib/rate-limit");
    return mod;
  }

  describe("checkRateLimit", () => {
    it("allows request when under limit (free tier)", async () => {
      const { checkRateLimit } = await importRateLimit();
      mockDb.setTotal(3);

      const result = await checkRateLimit(1, "free");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("blocks request when at limit (free tier)", async () => {
      const { checkRateLimit } = await importRateLimit();
      mockDb.setTotal(7);

      const result = await checkRateLimit(1, "free");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("blocks request when over limit (free tier)", async () => {
      const { checkRateLimit } = await importRateLimit();
      mockDb.setTotal(10);

      const result = await checkRateLimit(1, "free");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(-3);
    });

    it("allows request for pro tier even when over 100", async () => {
      const { checkRateLimit } = await importRateLimit();
      mockDb.setTotal(150);

      const result = await checkRateLimit(1, "pro");

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(-50);
    });

    it("resetAt is top of next hour", async () => {
      const { checkRateLimit } = await importRateLimit();
      mockDb.setTotal(0);

      const result = await checkRateLimit(1, "free");
      const now = new Date();
      const expectedReset = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        0,
        0,
        0
      );

      expect(result.resetAt.getTime()).toBe(expectedReset.getTime());
    });
  });

  describe("getRemainingQuota", () => {
    it("returns remaining quota for free tier", async () => {
      const { getRemainingQuota } = await importRateLimit();
      mockDb.setTotal(2);

      const result = await getRemainingQuota(1, "free");

      expect(result.remaining).toBe(5);
    });

    it("returns remaining quota for pro tier", async () => {
      const { getRemainingQuota } = await importRateLimit();
      mockDb.setTotal(50);

      const result = await getRemainingQuota(1, "pro");

      expect(result.remaining).toBe(50);
    });

    it("resetAt is top of next hour", async () => {
      const { getRemainingQuota } = await importRateLimit();
      mockDb.setTotal(0);

      const result = await getRemainingQuota(1, "free");
      const now = new Date();
      const expectedReset = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1,
        0,
        0,
        0
      );

      expect(result.resetAt.getTime()).toBe(expectedReset.getTime());
    });
  });

  describe("incrementGenerationCounter", () => {
    it("inserts counter values with model", async () => {
      const { incrementGenerationCounter } = await importRateLimit();
      await incrementGenerationCounter(1, "moonshot-v1-8k");

      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      const valuesCall = (mockDb.insert.mock.results[0].value as ReturnType<typeof mockDb.insert>).values;
      expect(valuesCall).toHaveBeenCalledTimes(1);
      const inserted = valuesCall.mock.calls[0][0] as {
        userId: number;
        model: string;
        count: number;
      };
      expect(inserted.userId).toBe(1);
      expect(inserted.model).toBe("moonshot-v1-8k");
      expect(inserted.count).toBe(1);
    });

    it("calls onConflictDoUpdate for upsert", async () => {
      const { incrementGenerationCounter } = await importRateLimit();
      await incrementGenerationCounter(2, "llama-3.3-70b:free");

      const valuesResult = (mockDb.insert.mock.results[0].value as ReturnType<typeof mockDb.insert>).values;
      const onConflictCall = (valuesResult.mock.results[0].value as { onConflictDoUpdate: ReturnType<typeof vi.fn> }).onConflictDoUpdate;
      expect(onConflictCall).toHaveBeenCalledTimes(1);
    });
  });

  describe("getRetryAfterSeconds", () => {
    it("returns positive seconds until next hour", async () => {
      const { getRetryAfterSeconds } = await importRateLimit();
      const seconds = getRetryAfterSeconds();
      expect(seconds).toBeGreaterThan(0);
      expect(seconds).toBeLessThanOrEqual(3600);
    });

    it("returns 3600 at exact hour boundary", async () => {
      const { getRetryAfterSeconds } = await importRateLimit();
      const now = new Date();
      const msToNextHour =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours() + 1,
          0,
          0,
          0
        ).getTime() - now.getTime();

      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.now() + msToNextHour));
      expect(getRetryAfterSeconds()).toBe(3600);
      vi.useRealTimers();
    });
  });

  describe("tier differentiation", () => {
    it("free limit is 7", async () => {
      const { checkRateLimit, TIER_LIMITS } = await importRateLimit();
      expect(TIER_LIMITS.free).toBe(7);
      mockDb.setTotal(6);
      const result = await checkRateLimit(1, "free");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it("pro limit is 100", async () => {
      const { checkRateLimit, TIER_LIMITS } = await importRateLimit();
      expect(TIER_LIMITS.pro).toBe(100);
      mockDb.setTotal(99);
      const result = await checkRateLimit(1, "pro");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });
});
