import { db } from "@/db/client";
import { generationCounters } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const TIER_LIMITS = {
  free: 7,
  pro: 100,
} as const;

export type Tier = "free" | "pro";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface QuotaResult {
  remaining: number;
  resetAt: Date;
}

function getNextHourResetAt(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() + 1,
    0,
    0,
    0
  );
}

async function getCurrentTotalCount(userId: number): Promise<number> {
  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${generationCounters.count}), 0)`,
    })
    .from(generationCounters)
    .where(
      and(
        eq(generationCounters.userId, userId),
        eq(generationCounters.hourWindow, sql`date_trunc('hour', now())`)
      )
    );

  return row?.total ?? 0;
}

export async function checkRateLimit(
  userId: number,
  tier: Tier
): Promise<RateLimitResult> {
  const limit = TIER_LIMITS[tier];
  const count = await getCurrentTotalCount(userId);
  const remaining = limit - count;

  const allowed = tier === "pro" ? true : count < limit;

  return { allowed, remaining, resetAt: getNextHourResetAt() };
}

export async function getRemainingQuota(
  userId: number,
  tier: Tier
): Promise<QuotaResult> {
  const limit = TIER_LIMITS[tier];
  const count = await getCurrentTotalCount(userId);
  const remaining = limit - count;

  return { remaining, resetAt: getNextHourResetAt() };
}

export async function incrementGenerationCounter(
  userId: number,
  model: string
): Promise<void> {
  await db
    .insert(generationCounters)
    .values({
      userId,
      hourWindow: sql`date_trunc('hour', now())`,
      count: 1,
      model,
    })
    .onConflictDoUpdate({
      target: [
        generationCounters.userId,
        generationCounters.hourWindow,
        generationCounters.model,
      ],
      set: { count: sql`${generationCounters.count} + 1` },
    });
}

export function getRetryAfterSeconds(): number {
  const resetAt = getNextHourResetAt();
  return Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
}
