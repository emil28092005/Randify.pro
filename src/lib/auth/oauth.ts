import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export const vkOAuthConfig = {
  clientId: process.env.VK_CLIENT_ID || '',
  clientSecret: process.env.VK_CLIENT_SECRET || '',
  authUrl: 'https://id.vk.com/oauth2/auth',
  tokenUrl: 'https://id.vk.ru/oauth2/auth',
  scope: 'email phone',
};

export const yandexOAuthConfig = {
  clientId: process.env.YANDEX_CLIENT_ID || '',
  clientSecret: process.env.YANDEX_CLIENT_SECRET || '',
  authUrl: 'https://oauth.yandex.com/authorize',
  tokenUrl: 'https://oauth.yandex.com/token',
  scope: 'login:email login:info login:avatar',
};

export async function createSessionToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (!payload.sub) return null;
    return { userId: Number(payload.sub) };
  } catch {
    return null;
  }
}

export const COOKIE_NAME = 'session';
export const VERIFIER_COOKIE_NAME = 'oauth_verifier';

export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
