import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const baseEnv = {
  JWT_SECRET: 'test-secret-that-is-long-enough-for-hs256-algorithm',
  VK_CLIENT_ID: 'vk-test-id',
  VK_CLIENT_SECRET: 'vk-test-secret',
  YANDEX_CLIENT_ID: 'ya-test-id',
  YANDEX_CLIENT_SECRET: 'ya-test-secret',
  PUBLIC_APP_URL: 'https://test.example.com',
};

describe('Auth Environment Validation', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate required env vars and expose authEnv', async () => {
    const { authEnv, requireEnv } = await import('./env');
    expect(authEnv.JWT_SECRET).toBe(baseEnv.JWT_SECRET);
    expect(authEnv.VK_CLIENT_ID).toBe(baseEnv.VK_CLIENT_ID);
    expect(authEnv.PUBLIC_APP_URL).toBe(baseEnv.PUBLIC_APP_URL);
    expect(requireEnv('PUBLIC_APP_URL')).toBe(baseEnv.PUBLIC_APP_URL);
  });

  it('should throw at module load if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    await expect(import('./env')).rejects.toThrow('JWT_SECRET');
  });

  it('should throw at module load if PUBLIC_APP_URL is invalid', async () => {
    process.env.PUBLIC_APP_URL = 'not-a-url';
    await expect(import('./env')).rejects.toThrow('PUBLIC_APP_URL');
  });

  it('should throw at module load if VK_CLIENT_ID is missing', async () => {
    delete process.env.VK_CLIENT_ID;
    await expect(import('./env')).rejects.toThrow('VK_CLIENT_ID');
  });
});

describe('JWT Token Operations', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and verify a token', async () => {
    const { createToken, verifyToken } = await import('./jwt');
    const token = await createToken('user123');
    const payload = await verifyToken(token);
    expect(payload.sub).toBe('user123');
  });

  it('should reject an invalid token', async () => {
    const { verifyToken } = await import('./jwt');
    await expect(verifyToken('invalid.token.here')).rejects.toThrow();
  });

  it('should set auth cookie with sameSite=lax', async () => {
    const { setAuthCookie } = await import('./jwt');
    const setMock = vi.fn();
    const mockContext = { cookies: { set: setMock } } as unknown as import('astro').APIContext;
    setAuthCookie('test-token', mockContext);
    expect(setMock).toHaveBeenCalledWith('auth_token', 'test-token', expect.objectContaining({
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    }));
  });

  it('should clear auth cookie', async () => {
    const { clearAuthCookie } = await import('./jwt');
    const deleteMock = vi.fn();
    const mockContext = { cookies: { delete: deleteMock } } as unknown as import('astro').APIContext;
    clearAuthCookie(mockContext);
    expect(deleteMock).toHaveBeenCalledWith('auth_token', { path: '/' });
  });
});

describe('OAuth Helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate code verifier and challenge', async () => {
    const { generateCodeVerifier, generateCodeChallenge } = await import('./oauth');
    const verifier = generateCodeVerifier();
    expect(verifier).toBeTruthy();
    expect(verifier.length).toBeGreaterThan(0);
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).toBeTruthy();
    expect(challenge.length).toBeGreaterThan(0);
  });

  it('should generate state', async () => {
    const { generateState } = await import('./oauth');
    const state = generateState();
    expect(state).toBeTruthy();
    expect(state.length).toBeGreaterThan(0);
  });

  it('should parse cookie value', async () => {
    const { getCookieValue } = await import('./oauth');
    expect(getCookieValue('auth_token=abc123; other=xyz', 'auth_token')).toBe('abc123');
    expect(getCookieValue(null, 'auth_token')).toBeNull();
    expect(getCookieValue('other=xyz', 'auth_token')).toBeNull();
  });

  it('should create and verify session token', async () => {
    const { createSessionToken, verifySessionToken } = await import('./oauth');
    const token = await createSessionToken(42);
    const result = await verifySessionToken(token);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(42);
  });

  it('should return null for invalid session token', async () => {
    const { verifySessionToken } = await import('./oauth');
    const result = await verifySessionToken('totally.invalid.token');
    expect(result).toBeNull();
  });

  it('should use validated env values without empty fallbacks', async () => {
    const { vkOAuthConfig, yandexOAuthConfig } = await import('./oauth');
    expect(vkOAuthConfig.clientId).toBe(baseEnv.VK_CLIENT_ID);
    expect(vkOAuthConfig.clientSecret).toBe(baseEnv.VK_CLIENT_SECRET);
    expect(yandexOAuthConfig.clientId).toBe(baseEnv.YANDEX_CLIENT_ID);
    expect(yandexOAuthConfig.clientSecret).toBe(baseEnv.YANDEX_CLIENT_SECRET);
    expect(vkOAuthConfig.clientId).not.toBe('');
    expect(yandexOAuthConfig.clientId).not.toBe('');
  });
});

describe('Logout Route', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redirect on logout with token present', async () => {
    const { GET } = await import('@/pages/api/auth/logout');
    const request = new Request('http://test', {
      headers: { cookie: 'auth_token=abc123' },
    });
    const response = await GET({ request } as unknown as import('astro').APIContext);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/dm/');
  });

  it('should redirect on logout without token', async () => {
    const { GET } = await import('@/pages/api/auth/logout');
    const request = new Request('http://test');
    const response = await GET({ request } as unknown as import('astro').APIContext);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/dm/');
  });
});

describe('Middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, baseEnv);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should clear stale auth_token cookie when token is invalid', async () => {
    const { onRequest } = await import('@/middleware/index');
    const deleteMock = vi.fn();
    const nextMock = vi.fn(() => Promise.resolve(new Response('ok')));

    const mockContext = {
      locals: { user: null },
      request: { headers: { get: () => 'auth_token=badtoken' } },
      cookies: {
        get: (name: string) => name === 'auth_token' ? { value: 'badtoken' } : undefined,
        delete: deleteMock,
      },
    } as unknown as Parameters<typeof onRequest>[0];

    await onRequest(mockContext, nextMock);
    expect(deleteMock).toHaveBeenCalledWith('auth_token', { path: '/' });
  });

  it('should clear auth_token cookie when session is missing in DB', async () => {
    const { createToken } = await import('./jwt');
    const { onRequest } = await import('@/middleware/index');

    const token = await createToken('123');
    const deleteMock = vi.fn();
    const nextMock = vi.fn(() => Promise.resolve(new Response('ok')));

    const mockContext = {
      locals: { user: null },
      request: { headers: { get: () => `auth_token=${token}` } },
      cookies: {
        get: (name: string) => name === 'auth_token' ? { value: token } : undefined,
        delete: deleteMock,
      },
    } as unknown as Parameters<typeof onRequest>[0];

    await onRequest(mockContext, nextMock);
    expect(deleteMock).toHaveBeenCalledWith('auth_token', { path: '/' });
  });
});
