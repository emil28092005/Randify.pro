/**
 * CORS utility for DM API routes.
 * Allowed origins: randify.pro, dm.randify.pro, localhost:4321
 */

const ALLOWED_HOSTS = new Set([
  "randify.pro",
  "dm.randify.pro",
  "localhost:4321",
]);

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ALLOWED_HOSTS.has(url.host);
  } catch {
    return false;
  }
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function createCorsResponse(
  body: BodyInit | null,
  status: number,
  origin: string | null,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({
    ...getCorsHeaders(origin),
    ...extraHeaders,
  });
  return new Response(body, { status, headers });
}

export function handleCorsPreflight(origin: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export function jsonResponse(data: unknown, status: number, origin: string | null): Response {
  return createCorsResponse(
    JSON.stringify(data),
    status,
    origin,
    { "Content-Type": "application/json" }
  );
}
