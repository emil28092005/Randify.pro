import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';
import {
  yandexOAuthConfig,
  VERIFIER_COOKIE_NAME,
  getCookieValue,
  createSessionToken,
  COOKIE_NAME,
} from '@/lib/auth/oauth';

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieHeader = request.headers.get('cookie');
  const verifier = getCookieValue(cookieHeader, VERIFIER_COOKIE_NAME);
  const storedState = getCookieValue(cookieHeader, 'oauth_state');

  if (!code || !state || !verifier || state !== storedState) {
    return new Response(JSON.stringify({ error: 'Invalid or missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${url.origin}/api/auth/callback/yandex`;

  const tokenRes = await fetch(yandexOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${yandexOAuthConfig.clientId}:${yandexOAuthConfig.clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Invalid token response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userInfoRes = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { Authorization: `OAuth ${accessToken}` },
  });
  const yandexUser = await userInfoRes.json();

  if (!yandexUser || !yandexUser.id) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = yandexUser.default_email || yandexUser.emails?.[0] || null;
  const name = [yandexUser.first_name, yandexUser.last_name].filter(Boolean).join(' ').trim() || yandexUser.login || yandexUser.display_name || 'Yandex User';
  const avatar = yandexUser.default_avatar_id
    ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200`
    : null;

  const existingUsers = await db.select().from(users).where(eq(users.yandexId, String(yandexUser.id)));
  let user;

  if (existingUsers.length > 0) {
    user = existingUsers[0];
    await db
      .update(users)
      .set({ name, email: email || user.email, avatar: avatar || user.avatar })
      .where(eq(users.id, user.id));
  } else {
    const inserted = await db
      .insert(users)
      .values({ yandexId: String(yandexUser.id), email, name, avatar })
      .returning();
    user = inserted[0];
  }

  const sessionToken = await createSessionToken(user.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    userId: user.id,
    token: sessionToken,
    expiresAt,
  });

  const cookies = [
    `${COOKIE_NAME}=${sessionToken}; HttpOnly; SameSite=Strict; Max-Age=604800; Path=/`,
    `${VERIFIER_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`,
    `oauth_state=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`,
  ];

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/dm/',
      'Set-Cookie': cookies.join(', '),
    },
  });
};
