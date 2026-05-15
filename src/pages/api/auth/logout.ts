import type { APIRoute } from 'astro';
import { COOKIE_NAME, getCookieValue } from '@/lib/auth/oauth';
import { deleteSession } from '@/lib/auth/session';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie');
  const token = getCookieValue(cookieHeader, COOKIE_NAME);

  if (token) {
    await deleteSession(token);
  }

  const headers = new Headers();
  headers.set('Location', '/dm/');
  headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);

  return new Response(null, {
    status: 302,
    headers,
  });
};
