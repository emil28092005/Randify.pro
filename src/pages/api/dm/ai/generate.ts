import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight, createCorsResponse } from "@/lib/cors";
import { checkRateLimit, incrementGenerationCounter, getRetryAfterSeconds } from "@/lib/rate-limit";
import { generateNPC as generateOpenRouterNPC } from "@/lib/ai/openrouter";
import { generateNPC as generateKimiNPC } from "@/lib/ai/kimi";
import type { Open5eMonster } from "@/lib/ai/types";
import { searchMonsters } from "@/lib/open5e/client";
import { db } from "@/db/client";
import { npcs } from "@/db/schema";
import { npcParamsSchema, npcResultSchema, type NPCResult } from "@/lib/ai/types";
import { z } from "zod";

export const prerender = false;

const generateRequestSchema = npcParamsSchema.extend({
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

async function fetchOpen5eReference(role: string): Promise<Open5eMonster | null> {
  try {
    const monsters = await searchMonsters(role);
    if (monsters.length > 0) {
      return monsters[0] as unknown as Open5eMonster;
    }
  } catch {
    return null;
  }
  return null;
}

async function saveNPC(
  userId: number,
  npc: NPCResult,
  tone: string
): Promise<{ id: number }> {
  const result = await db
    .insert(npcs)
    .values({
      userId,
      name: npc.name,
      race: npc.race,
      role: npc.role,
      level: npc.level ?? null,
      tone,
      content: npc as unknown as Record<string, unknown>,
    })
    .returning({ id: npcs.id });

  return result[0];
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
      { "Content-Type": "application/json", "Retry-After": String(getRetryAfterSeconds()) }
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
      origin
    );
  }

  const { race, role, level, tone, useOpen5eReference } = parsed.data;

  let reference: Open5eMonster | null = null;
  if (useOpen5eReference) {
    reference = await fetchOpen5eReference(role);
  }

  const aiClient = tier === "pro" ? generateKimiNPC : generateOpenRouterNPC;
  const modelName = tier === "pro" ? "moonshot-v1-8k" : "llama-3.3-70b:free";

  let npc: NPCResult;
  try {
    npc = await aiClient({ race, role, level, tone }, reference ?? undefined);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "AI generation failed", details: message },
      502,
      origin
    );
  }

  const validation = npcResultSchema.safeParse(npc);
  if (!validation.success) {
    return jsonResponse(
      { error: "Invalid AI response", details: validation.error.message },
      502,
      origin
    );
  }

  let savedId: number;
  try {
    const saved = await saveNPC(user.id, npc, tone);
    savedId = saved.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse(
      { error: "Failed to save NPC", details: message },
      500,
      origin
    );
  }

  try {
    await incrementGenerationCounter(user.id, modelName);
  } catch {
    // best-effort: counter increment failures should not block the response
  }

  const response: { npc: NPCResult & { id: number }; reference?: Open5eMonster } = {
    npc: { ...npc, id: savedId },
  };
  if (reference) {
    response.reference = reference;
  }

  return jsonResponse(response, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
