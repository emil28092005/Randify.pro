/**
 * Boosty Subscription Verification Service
 *
 * Verifies Boosty subscription status via the unofficial Boosty API.
 * Uses a 5-minute in-memory cache to avoid repeated API calls.
 *
 * Boosty API endpoint (reverse-engineered from unofficial clients):
 * GET https://api.boosty.to/v1/blog/{blogName}/subscriber
 *
 * References:
 * - boostylib (Python): client.subscriptions.verify_subscription(blog, user_id)
 * - boosty_api_rs (Rust): get_user_subscriptions(), subscription verification
 * - Base URL confirmed via logs: https://api.boosty.to
 */

const BOOSTY_API_BASE = 'https://api.boosty.to';
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

interface CacheEntry {
  tier: 'pro' | 'free';
  verifiedAt: Date;
  expiresAt: Date;
}

/** In-memory cache keyed by Boosty token (never persisted or logged) */
const cache = new Map<string, CacheEntry>();

/** Clears the in-memory cache. Exposed for testing only. */
export function _clearBoostyCache(): void {
  cache.clear();
}

/**
 * Verifies a Boosty subscription token.
 *
 * On cache hit: returns cached tier instantly.
 * On cache miss: calls Boosty API with 5-second timeout.
 * On API failure: serves stale cache if available, otherwise returns 'free'.
 *
 * The Boosty token is never logged or included in error messages.
 *
 * @param token - Boosty access token (Bearer token)
 * @returns 'pro' if active paid subscription, 'free' otherwise
 */
export async function verifyBoostySubscription(token: string): Promise<'pro' | 'free'> {
  const now = new Date();
  const cached = cache.get(token);

  if (cached && cached.expiresAt > now) {
    return cached.tier;
  }

  const blogName = process.env.BOOSTY_BLOG_NAME;
  if (!blogName) {
    return cached?.tier ?? 'free';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(
      `${BOOSTY_API_BASE}/v1/blog/${encodeURIComponent(blogName)}/subscriber`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      return cached?.tier ?? 'free';
    }

    const data = (await res.json()) as Record<string, unknown>;
    const isPro = Boolean(data?.isSubscribed) && Boolean(data?.isPaid);
    const tier = isPro ? 'pro' : 'free';

    cache.set(token, {
      tier,
      verifiedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    });

    return tier;
  } catch {
    // Never log the token or raw error details
    return cached?.tier ?? 'free';
  }
}

export async function updateUserTier(userId: number, tier: 'free' | 'pro'): Promise<void> {
  const { db } = await import('@/db/client');
  const { users } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  await db
    .update(users)
    .set({
      tier,
      boostyVerifiedAt: tier === 'pro' ? new Date() : null,
    })
    .where(eq(users.id, userId));
}

/**
 * Attempts server-side Boosty verification using a configured server token.
 *
 * This is a best-effort check that fetches the blog's subscriber list
 * and matches by email. If no match is found or the API is unreachable,
 * the user's tier is left unchanged.
 *
 * @param userId - Local user ID
 * @param email - User's email address for matching
 */
export async function assignTierFromBoosty(userId: number, email: string | null): Promise<void> {
  const serverToken = process.env.BOOSTY_API_TOKEN;
  const blogName = process.env.BOOSTY_BLOG_NAME;

  if (!serverToken || !blogName || !email) {
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(
      `${BOOSTY_API_BASE}/v1/blog/${encodeURIComponent(blogName)}/subscribers?limit=200`,
      {
        headers: {
          Authorization: `Bearer ${serverToken}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      return;
    }

    const data = (await res.json()) as {
      subscribers?: Array<{ email?: string; isPaid?: boolean }>;
    };
    const subscriber = data.subscribers?.find(
      (s) => s.email?.toLowerCase() === email.toLowerCase()
    );
    const tier = subscriber?.isPaid ? 'pro' : 'free';

    await updateUserTier(userId, tier);
  } catch {
    // Silent fail — keep existing tier on any error
  }
}
