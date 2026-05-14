import { vi } from "vitest";

export function mockAstroLocals(user?: { id: string; name: string; avatar?: string }) {
  return {
    user: user ?? null,
  };
}

export function mockFetchResponse(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

export function setupMockFetch(responseData: unknown, status = 200) {
  const mockFetch = vi.fn(() => mockFetchResponse(responseData, status));
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  return mockFetch;
}

export function createMockStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
    getStore: () => ({ ...store }),
  };
}

export function mockJwtToken(payload: Record<string, unknown> = {}) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ sub: "user123", iat: Date.now(), ...payload }));
  const signature = btoa("mock-signature");
  return `${header}.${body}.${signature}`;
}

export function waitFor(ms = 0) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
