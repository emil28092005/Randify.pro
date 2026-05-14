import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '@/lib/auth/oauth';

export const prerender = false;

export const GET: APIRoute = async () => {
  const cookies = [
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/`,
  ];

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/dm/',
      'Set-Cookie': cookies.join(', '),
    },
  });
};
