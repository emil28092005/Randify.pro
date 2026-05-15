import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const dbUpdateMock = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) }));

vi.mock('@/db/client', () => ({
  db: { update: dbUpdateMock },
}));

vi.mock('@/db/schema', () => ({
  users: { id: { name: 'id' } },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(() => true),
}));

describe('Boosty Verification Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    dbUpdateMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function importBoosty() {
    const mod = await import('@/lib/boosty');
    return mod;
  }

  it('returns free tier when BOOSTY_BLOG_NAME is not set', async () => {
    const { verifyBoostySubscription } = await importBoosty();
    const tier = await verifyBoostySubscription('test-token');
    expect(tier).toBe('free');
  });

  it('cache hit returns cached tier without API call', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ isSubscribed: true, isPaid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();

    const tier1 = await verifyBoostySubscription('token-a');
    expect(tier1).toBe('pro');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const tier2 = await verifyBoostySubscription('token-a');
    expect(tier2).toBe('pro');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cache miss fetches from API and returns pro for paid subscriber', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ isSubscribed: true, isPaid: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();
    const tier = await verifyBoostySubscription('token-b');

    expect(tier).toBe('pro');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.boosty.to/v1/blog/randify/subscriber',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-b',
        }),
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('returns free for non-paid subscriber', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ isSubscribed: true, isPaid: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();
    const tier = await verifyBoostySubscription('token-c');

    expect(tier).toBe('free');
  });

  it('returns free on API 404 without cached value', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
    );
    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();
    const tier = await verifyBoostySubscription('token-d');

    expect(tier).toBe('free');
  });

  it('serves stale cache when API fails after expiry', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ isSubscribed: true, isPaid: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockRejectedValueOnce(new Error('Network error'));

    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();

    const tier1 = await verifyBoostySubscription('token-e');
    expect(tier1).toBe('pro');

    vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

    const tier2 = await verifyBoostySubscription('token-e');
    expect(tier2).toBe('pro');
  });

  it('handles API timeout by returning free when no cache exists', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const fetchMock = vi.fn().mockImplementation((_url, options) => {
      return new Promise<Response>((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(
            new Response(JSON.stringify({ isSubscribed: true, isPaid: true }), {
              status: 200,
            })
          );
        }, 30000);

        options?.signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted'));
        });
      });
    });

    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();

    const promise = verifyBoostySubscription('token-f');
    vi.advanceTimersByTime(6000);
    const tier = await promise;

    expect(tier).toBe('free');
  });

  it('never logs or exposes the Boosty token', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const fetchMock = vi.fn().mockRejectedValue(new Error('secret-token-leak-check'));
    globalThis.fetch = fetchMock;

    const { verifyBoostySubscription } = await importBoosty();
    await verifyBoostySubscription('super-secret-boosty-token-xyz');

    const allCalls = [
      ...consoleErrorSpy.mock.calls,
      ...consoleLogSpy.mock.calls,
      ...consoleWarnSpy.mock.calls,
    ];

    for (const call of allCalls) {
      const message = call.join(' ');
      expect(message).not.toContain('super-secret-boosty-token-xyz');
    }

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('updateUserTier updates tier and boostyVerifiedAt in DB', async () => {
    const { updateUserTier } = await importBoosty();
    await updateUserTier(42, 'pro');

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);
    const setCall = dbUpdateMock.mock.results[0].value.set;
    expect(setCall).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: 'pro',
        boostyVerifiedAt: expect.any(Date),
      })
    );
  });

  it('updateUserTier sets boostyVerifiedAt to null for free tier', async () => {
    const { updateUserTier } = await importBoosty();
    await updateUserTier(42, 'free');

    const setCall = dbUpdateMock.mock.results[0].value.set;
    expect(setCall).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: 'free',
        boostyVerifiedAt: null,
      })
    );
  });

  it('assignTierFromBoosty does nothing when env vars are missing', async () => {
    const { assignTierFromBoosty } = await importBoosty();
    await assignTierFromBoosty(1, 'test@example.com');

    expect(dbUpdateMock).not.toHaveBeenCalled();
  });

  it('assignTierFromBoosty updates tier when subscriber is found and paid', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');
    vi.stubEnv('BOOSTY_API_TOKEN', 'server-token');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          subscribers: [
            { email: 'other@example.com', isPaid: false },
            { email: 'test@example.com', isPaid: true },
          ],
        }),
        { status: 200 }
      )
    );
    globalThis.fetch = fetchMock;

    const { assignTierFromBoosty } = await importBoosty();
    await assignTierFromBoosty(1, 'test@example.com');

    expect(dbUpdateMock).toHaveBeenCalledTimes(1);
  });

  it('assignTierFromBoosty updates tier to free when subscriber is not paid', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');
    vi.stubEnv('BOOSTY_API_TOKEN', 'server-token');

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          subscribers: [{ email: 'test@example.com', isPaid: false }],
        }),
        { status: 200 }
      )
    );
    globalThis.fetch = fetchMock;

    const { assignTierFromBoosty } = await importBoosty();
    await assignTierFromBoosty(1, 'test@example.com');

    const setCall = dbUpdateMock.mock.results[0].value.set;
    expect(setCall).toHaveBeenCalledWith(
      expect.objectContaining({ tier: 'free' })
    );
  });

  it('assignTierFromBoosty silently fails on API error', async () => {
    vi.stubEnv('BOOSTY_BLOG_NAME', 'randify');
    vi.stubEnv('BOOSTY_API_TOKEN', 'server-token');

    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
    globalThis.fetch = fetchMock;

    const { assignTierFromBoosty } = await importBoosty();
    await expect(assignTierFromBoosty(1, 'test@example.com')).resolves.toBeUndefined();

    expect(dbUpdateMock).not.toHaveBeenCalled();
  });
});
