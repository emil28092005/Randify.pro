import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from '@/lib/auth/jwt';
import { getSession } from '@/lib/auth/session';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  const cookieHeader = context.request.headers.get('cookie');
  console.log('[Middleware] Cookie header:', cookieHeader ? cookieHeader.slice(0, 50) + '...' : 'none');

  const token = context.cookies.get('auth_token')?.value;
  if (!token) {
    console.log('[Middleware] No auth_token cookie found');
    return next();
  }

  console.log('[Middleware] auth_token cookie found');

  try {
    await verifyToken(token);
    const session = await getSession(token);
    if (!session) {
      console.log('[Middleware] Session validation failed: no session in DB');
      return next();
    }

    console.log('[Middleware] Session validation succeeded');

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResult[0];
    if (user) {
      context.locals.user = user;
      console.log('[Middleware] User attached to locals:', { userId: user.id, name: user.name });
    } else {
      console.log('[Middleware] No user found for session');
    }
  } catch {
    console.log('[Middleware] Session validation failed: invalid token');
    /* ignore invalid tokens */
  }

  return next();
});
