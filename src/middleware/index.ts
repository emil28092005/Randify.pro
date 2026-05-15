import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from '@/lib/auth/jwt';
import { getSession } from '@/lib/auth/session';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  const token = context.cookies.get('auth_token')?.value;
  if (!token) return next();

  try {
    await verifyToken(token);
    const session = await getSession(token);
    if (!session) {
      context.cookies.delete('auth_token', { path: '/' });
      return next();
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResult[0];
    if (user) {
      context.locals.user = {
        ...user,
        tier: (user.tier ?? 'free') as 'free' | 'pro',
      };
    } else {
      context.cookies.delete('auth_token', { path: '/' });
    }
  } catch {
    context.cookies.delete('auth_token', { path: '/' });
  }

  return next();
});
