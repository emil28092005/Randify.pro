import type { APIRoute } from "astro";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    return new Response(
      JSON.stringify({ status: "ok", db: "connected" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Health] DB connection failed:", err);
    return new Response(
      JSON.stringify({ status: "error", db: "disconnected", error: String(err) }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
