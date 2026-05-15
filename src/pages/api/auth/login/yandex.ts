import type { APIRoute } from 'astro';
import { generateCodeVerifier, generateCodeChallenge, generateState, yandexOAuthConfig, VERIFIER_COOKIE_NAME } from '@/lib/auth/oauth';
import { authEnv } from '@/lib/auth/env';

export const prerender = false;

export const GET: APIRoute = async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  const redirectUri = `${authEnv.PUBLIC_APP_URL}/api/auth/callback/yandex`;

  const params = new URLSearchParams({
    client_id: yandexOAuthConfig.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: yandexOAuthConfig.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const redirectUrl = `${yandexOAuthConfig.authUrl}?${params.toString()}`;

  const headers = new Headers();
  headers.set('Location', redirectUrl);
  headers.append('Set-Cookie', `${VERIFIER_COOKIE_NAME}=${encodeURIComponent(verifier)}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);
  headers.append('Set-Cookie', `oauth_state=${encodeURIComponent(state)}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);

  return new Response(null, {
    status: 302,
    headers,
  });
};
