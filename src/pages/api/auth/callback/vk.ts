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
  console.log('[OAuth VK] Full callback URL:', url.toString());
  console.log('[OAuth VK] All query params:', Object.fromEntries(url.searchParams.entries()));

  const payloadParam = url.searchParams.get('payload');
  let code: string | null = null;
  let state: string | null = null;
  let deviceId: string | null = null;

  if (payloadParam) {
    try {
      const payload = JSON.parse(payloadParam);
      console.log('[OAuth VK] Parsed payload:', payload);
      code = payload.code || null;
      state = payload.state || null;
      deviceId = payload.device_id || null;
    } catch {
      console.error('[OAuth VK] Failed to parse payload:', payloadParam);
    }
  }

  if (!code) code = url.searchParams.get('code');
  if (!state) state = url.searchParams.get('state');
  if (!deviceId) deviceId = url.searchParams.get('device_id');

  const cookieHeader = request.headers.get('cookie');
  const verifier = getCookieValue(cookieHeader, VERIFIER_COOKIE_NAME);
  const storedState = getCookieValue(cookieHeader, 'oauth_state');

  console.log('[OAuth VK] Callback received:', { hasCode: !!code, hasState: !!state, hasDeviceId: !!deviceId, hasVerifier: !!verifier, stateMatch: state === storedState });

  if (!code || !state || !verifier || state !== storedState) {
    console.error('[OAuth VK] Validation failed:', { hasCode: !!code, hasState: !!state, hasVerifier: !!verifier, stateMatch: state === storedState });
    return new Response(JSON.stringify({ error: 'Invalid or missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${process.env.PUBLIC_APP_URL || url.origin}/api/auth/callback/vk`;

  const tokenBody = new URLSearchParams({
    client_id: vkOAuthConfig.clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  if (deviceId) {
    tokenBody.append('device_id', deviceId);
  }

  const tokenRes = await fetch(vkOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody,
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

  if (!accessToken) {
    console.error('[OAuth VK] No access_token in response:', tokenData);
    return new Response(JSON.stringify({ error: 'Invalid token response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userInfoRes = await fetch('https://id.vk.ru/oauth2/user_info', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    const errorText = await userInfoRes.text();
    console.error('[OAuth VK] User info failed:', userInfoRes.status, errorText);
    return new Response(JSON.stringify({ error: 'Failed to fetch user info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userInfoData = await userInfoRes.json();
  const vkUser = userInfoData.user;

  if (!vkUser) {
    console.error('[OAuth VK] No user in user_info response:', userInfoData);
    return new Response(JSON.stringify({ error: 'Failed to fetch user info' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userIdStr = String(vkUser.user_id || vkUser.id);
  const email = vkUser.email || tokenData.email || null;
  const name = `${vkUser.first_name || ''} ${vkUser.last_name || ''}`.trim() || vkUser.email || 'VK User';
  const avatar = vkUser.avatar || null;

  console.log('[OAuth VK] User info:', { id: userIdStr, email, name });

  const existingUsers = await db.select().from(users).where(eq(users.vkId, userIdStr));
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
      .values({ vkId: userIdStr, email, name, avatar })
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
  headers.append('Set-Cookie', `${COOKIE_NAME}=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/`);
  headers.append('Set-Cookie', `${VERIFIER_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);
  headers.append('Set-Cookie', `oauth_state=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);

  return new Response(null, {
    status: 302,
    headers,
  });
};
