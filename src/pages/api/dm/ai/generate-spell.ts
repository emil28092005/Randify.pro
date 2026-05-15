import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight, createCorsResponse } from "@/lib/cors";
import { checkRateLimit, incrementGenerationCounter, getRetryAfterSeconds } from "@/lib/rate-limit";
import { generateSpell as generateOpenRouterSpell } from "@/lib/ai/openrouter";
import { generateSpell as generateKimiSpell } from "@/lib/ai/kimi";
import type { Open5eSpell } from "@/lib/ai/types";
import { searchSpells } from "@/lib/open5e/client";
import { spellParamsSchema, spellResultSchema, type SpellResult } from "@/lib/ai/types";
import { z } from "zod";

export const prerender = false;

const generateRequestSchema = spellParamsSchema.extend({
  useOpen5eReference: z.boolean().optional(),
});

function getOrigin(request: Request): string | null {
  return request.headers.get("origin");
}

function requireAuth(locals: App.Locals, origin: string | null): Response | null {
  if (!locals.user) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }
  return null;
}

async function fetchOpen5eReference(level: number, school: string): Promise<Open5eSpell | null> {
  try {
    const spells = await searchSpells(school, { level: String(level) });
    if (spells.length > 0) {
      return spells[0] as unknown as Open5eSpell;
    }
    const fallback = await searchSpells("", { level: String(level) });
    if (fallback.length > 0) {
      return fallback[0] as unknown as Open5eSpell;
    }
  } catch {
    return null;
  }
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);

  const authError = requireAuth(locals, origin);
  if (authError) return authError;

  const user = locals.user!;
  const tier = user.tier;

  const rateLimit = await checkRateLimit(user.id, tier);
  if (!rateLimit.allowed) {
    return createCorsResponse(
      JSON.stringify({ error: "Rate limit exceeded" }),
      429,
      origin,
      { "Content-Type": "application/json", "Retry-After": String(getRetryAfterSeconds()) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, origin);
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: "Validation failed", details: parsed.error.format() },
      400,
      origin,
    );
  }

  const { name, level, school, classes, tone, useOpen5eReference } = parsed.data;

  let reference: Open5eSpell | null = null;
  if (useOpen5eReference) {
    reference = await fetchOpen5eReference(level, school);
  }

  const aiClient = tier === "pro" ? generateKimiSpell : generateOpenRouterSpell;
  const modelName = tier === "pro" ? "moonshot-v1-8k" : "llama-3.3-70b:free";

  let spell: SpellResult;
  try {
    spell = await aiClient({ name, level, school, classes, tone }, reference ?? undefined);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "AI generation failed", details: message },
      502,
      origin,
    );
  }

  const validation = spellResultSchema.safeParse(spell);
  if (!validation.success) {
    return jsonResponse(
      { error: "Invalid AI response", details: validation.error.message },
      502,
      origin,
    );
  }

  try {
    await incrementGenerationCounter(user.id, modelName);
  } catch {
    // best-effort: counter increment failures should not block the response
  }

  const response: { spell: SpellResult; reference?: Open5eSpell } = { spell };
  if (reference) response.reference = reference;
  return jsonResponse(response, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
