import { SignJWT, jwtVerify } from 'jose';
import type { APIContext } from 'astro';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, SECRET, {
    clockTolerance: 60,
  });
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { sub: payload.sub };
}

export function setAuthCookie(token: string, context: APIContext): void {
  context.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function clearAuthCookie(context: APIContext): void {
  context.cookies.delete('auth_token', {
    path: '/',
  });
}
