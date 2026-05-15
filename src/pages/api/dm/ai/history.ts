import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";
import { db } from "@/db/client";
import { npcs } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export const prerender = false;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function getOrigin(request: Request): string | null {
  return request.headers.get("origin");
}

function parsePagination(url: URL): { limit: number; offset: number } {
  const rawLimit = url.searchParams.get("limit");
  const rawOffset = url.searchParams.get("offset");

  const limit = Math.min(
    Math.max(parseInt(rawLimit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const offset = Math.max(parseInt(rawOffset ?? "0", 10) || 0, 0);

  return { limit, offset };
}

export const GET: APIRoute = async ({ request, locals, url }) => {
  const origin = getOrigin(request);

  if (!locals.user) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const { limit, offset } = parsePagination(url);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(npcs)
      .where(eq(npcs.userId, locals.user.id))
      .orderBy(desc(npcs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(npcs)
      .where(eq(npcs.userId, locals.user.id)),
  ]);

  const total = countResult[0]?.total ?? 0;

  return jsonResponse({ items, total }, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
