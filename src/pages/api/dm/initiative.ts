import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";
import { db } from "@/db/client";
import { initiativeSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const prerender = false;

const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  initiative: z.number().optional(),
  modifier: z.number().optional(),
  hp: z.number().optional(),
  maxHp: z.number().optional(),
  ac: z.number().optional(),
  isPlayer: z.boolean().optional(),
  active: z.boolean().optional(),
});

const createSessionSchema = z.object({
  name: z.string().min(1).max(255),
  participants: z.array(participantSchema).optional(),
});

const updateSessionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  participants: z.array(participantSchema).optional(),
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

export const GET: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);
  const authError = requireAuth(locals, origin);
  if (authError) return authError;

  const sessions = await db
    .select()
    .from(initiativeSessions)
    .where(eq(initiativeSessions.userId, locals.user!.id))
    .orderBy(initiativeSessions.updatedAt);

  return jsonResponse(sessions, 200, origin);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);
  const authError = requireAuth(locals, origin);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, origin);
  }

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", details: parsed.error.format() }, 400, origin);
  }

  const result = await db
    .insert(initiativeSessions)
    .values({
      userId: locals.user!.id,
      name: parsed.data.name,
      participants: parsed.data.participants ?? [],
    })
    .returning();

  return jsonResponse(result[0], 201, origin);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);
  const authError = requireAuth(locals, origin);
  if (authError) return authError;

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  if (!idParam) {
    return jsonResponse({ error: "Missing id query parameter" }, 400, origin);
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return jsonResponse({ error: "Invalid id" }, 400, origin);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, origin);
  }

  const parsed = updateSessionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", details: parsed.error.format() }, 400, origin);
  }

  const updateData: Partial<{ name: string; participants: unknown[] }> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.participants !== undefined) updateData.participants = parsed.data.participants;

  const result = await db
    .update(initiativeSessions)
    .set(updateData)
    .where(and(eq(initiativeSessions.id, id), eq(initiativeSessions.userId, locals.user!.id)))
    .returning();

  if (result.length === 0) {
    return jsonResponse({ error: "Not found" }, 404, origin);
  }

  return jsonResponse(result[0], 200, origin);
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);
  const authError = requireAuth(locals, origin);
  if (authError) return authError;

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");
  if (!idParam) {
    return jsonResponse({ error: "Missing id query parameter" }, 400, origin);
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return jsonResponse({ error: "Invalid id" }, 400, origin);
  }

  const result = await db
    .delete(initiativeSessions)
    .where(and(eq(initiativeSessions.id, id), eq(initiativeSessions.userId, locals.user!.id)))
    .returning();

  if (result.length === 0) {
    return jsonResponse({ error: "Not found" }, 404, origin);
  }

  return jsonResponse({ success: true }, 200, origin);
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
