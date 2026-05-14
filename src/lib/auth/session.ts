import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { sessions } from '@/db/schema';

export async function createSession(userId: number, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });
}

export async function getSession(token: string) {
  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  const session = result[0];
  if (!session) return null;
  if (new Date() > session.expiresAt) return null;

  return session;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}
