import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '@/lib/auth/oauth';

export const prerender = false;

export const GET: APIRoute = async () => {
  const headers = new Headers();
  headers.set('Location', '/dm/');
  headers.append('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`);

  return new Response(null, {
    status: 302,
    headers,
  });
};
