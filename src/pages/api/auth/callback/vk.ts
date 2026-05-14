import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, sessions } from '@/db/schema';
import {
  vkOAuthConfig,
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
    console.error('[OAuth VK] Validation failed:', { hasCode: !!code, hasState: !!state, hasVerifier: !!verifier, stateMatch: state === storedState });
    return new Response(JSON.stringify({ error: 'Invalid or missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${process.env.PUBLIC_APP_URL || url.origin}/api/auth/callback/vk`;

  const tokenRes = await fetch(vkOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: vkOAuthConfig.clientId,
      client_secret: vkOAuthConfig.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error('[OAuth VK] Token exchange failed:', tokenRes.status, errorText);
    return new Response(JSON.stringify({ error: 'Token exchange failed', details: errorText }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  const userIdStr = tokenData.user_id || tokenData.user?.user_id;

  if (!accessToken || !userIdStr) {
    return new Response(JSON.stringify({ error: 'Invalid token response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userInfoRes = await fetch(
    `https://api.vk.com/method/users.get?user_ids=${userIdStr}&fields=photo_200,email&access_token=${accessToken}&v=5.199`
  );
  const userInfoData = await userInfoRes.json();
  const vkUser = userInfoData.response?.[0];

  if (!vkUser) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = tokenData.email || null;
  const name = `${vkUser.first_name || ''} ${vkUser.last_name || ''}`.trim();
  const avatar = vkUser.photo_200 || null;

  const existingUsers = await db.select().from(users).where(eq(users.vkId, String(userIdStr)));
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
      .values({ vkId: String(userIdStr), email, name, avatar })
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

  const headers = new Headers();
  headers.set('Location', '/dm/');
  headers.append('Set-Cookie', `${COOKIE_NAME}=${sessionToken}; HttpOnly; SameSite=Strict; Max-Age=604800; Path=/`);
  headers.append('Set-Cookie', `${VERIFIER_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`);
  headers.append('Set-Cookie', `oauth_state=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`);

  return new Response(null, {
    status: 302,
    headers,
  });
};
