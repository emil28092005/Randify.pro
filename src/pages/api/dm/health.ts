import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  return jsonResponse({ status: "ok", dm: true }, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  return handleCorsPreflight(origin);
};
