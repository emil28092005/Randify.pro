import type { APIRoute } from 'astro';
import { generateCodeVerifier, generateCodeChallenge, generateState, vkOAuthConfig, VERIFIER_COOKIE_NAME } from '@/lib/auth/oauth';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  const redirectUri = `${process.env.PUBLIC_APP_URL || url.origin}/api/auth/callback/vk`;

  const params = new URLSearchParams({
    client_id: vkOAuthConfig.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: vkOAuthConfig.scope,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const redirectUrl = `${vkOAuthConfig.authUrl}?${params.toString()}`;

  const cookies = [
    `${VERIFIER_COOKIE_NAME}=${encodeURIComponent(verifier)}; HttpOnly; SameSite=Strict; Max-Age=600; Path=/`,
    `oauth_state=${encodeURIComponent(state)}; HttpOnly; SameSite=Strict; Max-Age=600; Path=/`,
  ];

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': cookies.join(', '),
    },
  });
};
