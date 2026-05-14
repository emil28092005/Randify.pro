import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from '@/lib/auth/jwt';
import { getSession } from '@/lib/auth/session';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.user = null;

  const token = context.cookies.get('auth_token')?.value;
  if (!token) {
    return next();
  }

  try {
    await verifyToken(token);
    const session = await getSession(token);
    if (!session) {
      return next();
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const user = userResult[0];
    if (user) {
      context.locals.user = user;
    }
  } catch {
    /* ignore invalid tokens */
  }

  return next();
});
