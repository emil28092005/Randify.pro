import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";
import { db } from "@/db/client";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const prerender = false;

const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
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

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, locals.user!.id))
    .orderBy(notes.updatedAt);

  return jsonResponse(userNotes, 200, origin);
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

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", details: parsed.error.format() }, 400, origin);
  }

  const result = await db
    .insert(notes)
    .values({
      userId: locals.user!.id,
      title: parsed.data.title,
      content: parsed.data.content ?? null,
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

  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", details: parsed.error.format() }, 400, origin);
  }

  const updateData: Partial<{ title: string; content: string | null }> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content;

  const result = await db
    .update(notes)
    .set(updateData)
    .where(and(eq(notes.id, id), eq(notes.userId, locals.user!.id)))
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
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, locals.user!.id)))
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
