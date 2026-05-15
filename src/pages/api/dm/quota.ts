import type { APIRoute } from "astro";
import { jsonResponse, handleCorsPreflight } from "@/lib/cors";
import { getRemainingQuota, TIER_LIMITS } from "@/lib/rate-limit";

export const prerender = false;

function getOrigin(request: Request): string | null {
  return request.headers.get("origin");
}

export const GET: APIRoute = async ({ request, locals }) => {
  const origin = getOrigin(request);

  if (!locals.user) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin);
  }

  const tier = locals.user.tier as "free" | "pro";
  const quota = await getRemainingQuota(locals.user.id, tier);
  const limit = TIER_LIMITS[tier];

  return jsonResponse(
    {
      remaining: quota.remaining,
      resetAt: quota.resetAt.toISOString(),
      limit,
      tier,
    },
    200,
    origin
  );
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = getOrigin(request);
  return handleCorsPreflight(origin);
};
