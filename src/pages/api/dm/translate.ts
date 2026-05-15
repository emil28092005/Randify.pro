import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";
import { db } from "@/db/client";
import { translations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getMonster,
  getSpell,
  getEquipmentItem,
  getMagicItem,
} from "@/lib/open5e/client";
import {
  translateOpen5eContent,
  type Open5eContentType,
} from "@/lib/ai/openrouter";

export const prerender = false;

const ALLOWED_TYPES = new Set(["creature", "spell", "equipment", "magicitem"]);

function getOrigin(request: Request): string | null {
  return request.headers.get("origin");
}

export const GET: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const type = url.searchParams.get("type");

  if (!slug || !type) {
    return jsonResponse(
      { error: "Missing required query parameters: slug and type" },
      400,
      origin
    );
  }

  if (!ALLOWED_TYPES.has(type)) {
    return jsonResponse(
      { error: `Invalid type. Allowed: creature, spell, equipment, magicitem` },
      400,
      origin
    );
  }

  const cached = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.slug, slug),
        eq(translations.type, type),
        eq(translations.language, "ru")
      )
    )
    .orderBy(translations.updatedAt);

  if (cached.length > 0 && cached[0].content) {
    return jsonResponse(
      { translated: cached[0].content, cached: true },
      200,
      origin
    );
  }

  let original: Record<string, unknown>;
  try {
    if (type === "creature") {
      original = (await getMonster(slug)) as unknown as Record<string, unknown>;
    } else if (type === "spell") {
      original = (await getSpell(slug)) as unknown as Record<string, unknown>;
    } else if (type === "equipment") {
      original = (await getEquipmentItem(slug)) as unknown as Record<string, unknown>;
    } else {
      original = (await getMagicItem(slug)) as unknown as Record<string, unknown>;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "Failed to fetch original content from Open5e", details: message },
      502,
      origin
    );
  }

  let translated: Record<string, unknown>;
  try {
    translated = await translateOpen5eContent(original, type as Open5eContentType);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "Translation failed", details: message },
      502,
      origin
    );
  }

  try {
    await db.insert(translations).values({
      slug,
      type,
      language: "ru",
      content: translated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "Failed to cache translation", details: message },
      500,
      origin
    );
  }

  return jsonResponse({ translated, cached: false }, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
