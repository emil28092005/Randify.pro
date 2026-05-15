# Auth Anti-Pattern Fixes — Learnings

## Date: 2026-05-15

### Patterns Applied

1. **Fail-fast env validation with Zod**
   - Created `src/lib/auth/env.ts` with a `z.object()` schema that validates `JWT_SECRET`, `VK_CLIENT_ID`, `VK_CLIENT_SECRET`, `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, and `PUBLIC_APP_URL` at module load time.
   - `process.env.JWT_SECRET!` non-null assertion replaced with `authEnv.JWT_SECRET` which throws a descriptive error if the env var is missing.
   - `requireEnv()` helper provides typed access to validated env values.

2. **SameSite cookie fix**
   - Changed `sameSite: 'strict'` to `sameSite: 'lax'` in `setAuthCookie()` (`src/lib/auth/jwt.ts`).
   - `SameSite=Strict` breaks cross-site OAuth redirects because the browser doesn't send the cookie on the redirect back from the identity provider. `Lax` + `Secure` is the correct combination for OAuth session cookies.

3. **Removed all `|| ''` fallbacks**
   - `src/lib/auth/oauth.ts` had 5 instances of `process.env.XXX || ''`.
   - Replaced with `authEnv.XXX` references. Empty-string fallbacks silently produce invalid OAuth requests (e.g., `client_id: ''` causes 400 errors from VK/Yandex).

4. **Logout session cleanup**
   - `src/pages/api/auth/logout.ts` now reads the `auth_token` cookie and calls `deleteSession(token)` before clearing the cookie.
   - Previously the session row remained in the DB indefinitely.

5. **Middleware stale cookie cleanup**
   - `src/middleware/index.ts` now calls `context.cookies.delete('auth_token', { path: '/' })` in two places:
     - When `verifyToken()` throws (invalid/expired JWT)
     - When `getSession()` returns `null` (session expired or deleted from DB)
   - Previously the stale cookie stayed in the browser, causing repeated failed auth attempts on every request.

6. **PUBLIC_APP_URL exclusivity**
   - `src/pages/api/auth/callback/vk.ts`, `yandex.ts`, and the login handlers (`login/vk.ts`, `login/yandex.ts`) all used `process.env.PUBLIC_APP_URL || url.origin`.
   - Replaced with `authEnv.PUBLIC_APP_URL` exclusively.
   - `url.origin` breaks behind nginx reverse proxy because it returns `http://localhost:4321` instead of the public HTTPS URL.

### Testing Notes

- happy-dom strips `Set-Cookie` headers from `Response` objects (both via `Headers` instance and array entries). This is a known limitation — cookie clearing behavior must be tested via integration/Playwright instead of unit tests.
- `vi.mock` with alias paths (`@/...`) does not reliably match dynamically imported modules after `vi.resetModules()` in vitest. Using `__mocks__` directories or avoiding deep DB mocking in unit tests is more stable.
- `crypto.subtle` needs Node.js `webcrypto` for `jose` to work in vitest. Added `node:crypto` webcrypto to `tests/setup.ts`.
- `astro:middleware` is a virtual module that doesn't resolve in vitest. Added an alias in `vitest.config.ts` pointing to `tests/mocks/astro-middleware.ts`.

### Verification

- `npx tsc --noEmit`: 0 errors
- `npx vitest run src/lib/auth/`: 18/18 tests passed

---

# CORS Configuration for DM API Routes — Learnings

## Date: 2026-05-15

### Patterns Applied

1. **Reusable CORS utility (`src/lib/cors.ts`)**
   - Created `getCorsHeaders()`, `createCorsResponse()`, `handleCorsPreflight()`, and `jsonResponse()` helpers.
   - Allowed origins are validated by hostname using `URL` parsing: `randify.pro`, `dm.randify.pro`, `localhost:4321`.
   - Disallowed origins receive an empty `Access-Control-Allow-Origin` header (no wildcard).
   - `Vary: Origin` header is included to prevent CDN caching issues with CORS.

2. **DM API route pattern (`src/pages/api/dm/health.ts`)**
   - New DM API routes should import helpers from `@/lib/cors`.
   - Every route must export an `OPTIONS` handler that calls `handleCorsPreflight(origin)`.
   - Every response should be created via `jsonResponse()` or `createCorsResponse()` to ensure CORS headers are present.
   - `export const prerender = false` is required for API routes.

3. **Allowed origins**
   - `https://randify.pro`
   - `https://dm.randify.pro`
   - `http://localhost:4321`
   - Any protocol is accepted as long as the hostname matches.

4. **happy-dom `Request` limitation**
   - `new Request(url, { headers: { origin: '...' } })` strips the `origin` header in happy-dom (vitest environment).
   - Tests that call Astro API routes must construct a mock request object with a custom `headers.get()` method instead of relying on the global `Request` class for origin propagation.
   - Example pattern in `tests/cors.test.ts` (`mockRequest` helper).

### Verification

- `npx vitest run tests/cors.test.ts`: 12/12 passed
- `npx vitest run` (full suite): 218/218 passed

---

# Drizzle Migration Generation — Learnings

## Date: 2026-05-15

### Context

Task: Generate and apply Drizzle migration for updated DB schema (Task 2 completed).

### What Was Done

1. **Generated migration via `drizzle-kit generate`**
   - Command: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/randify npx drizzle-kit generate`
   - Generated file: `drizzle/0001_curved_black_panther.sql`
   - Journal updated: `drizzle/meta/_journal.json`

2. **Reviewed generated SQL for correctness**
   - New tables created: `npcs`, `generation_counters`, `translations`, `notes`, `initiative_sessions`
   - Existing table altered: `users` — added `tier` (varchar(20), default 'free') and `boosty_verified_at` (timestamp)
   - All FK constraints use `ON DELETE cascade` as specified in schema
   - Indexes match schema definitions:
     - `generation_counters_user_window_model_idx` (unique)
     - `translations_slug_type_language_idx`
   - CHECK constraint added: `users_tier_check` enforcing `('free', 'pro')`
   - `translations.slug` correctly marked as `UNIQUE`

3. **Verified migration applies cleanly**
   - Command: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/randify npm run db:migrate`
   - Result: Migrations completed successfully (exit 0)
   - Verified tables in DB: 7 tables present (`users`, `sessions`, `npcs`, `generation_counters`, `translations`, `notes`, `initiative_sessions`)

4. **Created down migration for reversibility**
   - File: `drizzle/0001_curved_black_panther.down.sql`
   - Operations: drop new tables, remove added columns/constraints from `users`
   - Tested down migration against local DB: executed cleanly
   - Re-applied up migration after test to restore expected state

### Key Findings

- **`.env` DATABASE_URL mismatch**: `.env` points to `dmuser:dmpass@localhost:5432/dmdashboard`, but the docker-compose PostgreSQL uses `postgres:postgres@localhost:5432/randify`. For DB commands to work locally, `DATABASE_URL` must be overridden inline or `.env` must be updated.
- **Drizzle-kit does not auto-generate `.down.sql` files**. Reversibility must be handled manually. The down migration should drop tables in reverse dependency order and remove columns after dropping their constraints.
- **Testing down migrations**: After testing a down migration, reset `drizzle.__drizzle_migrations` and re-run the official `db:migrate` script rather than applying raw SQL, to keep Drizzle's internal tracking consistent.

### Verification

- `npm run db:migrate` with correct `DATABASE_URL`: exit 0
- `\dt` in `randify` DB: 7 tables confirmed
- Down migration tested manually: all statements executed without error

---

# Notes and Initiative DB API Routes — Learnings

## Date: 2026-05-15

### Patterns Applied

1. **DM API route pattern (`src/pages/api/dm/notes.ts`, `src/pages/api/dm/initiative.ts`)**
   - Both routes import `APIRoute` from `astro`, CORS helpers from `@/lib/cors`, and use `prerender = false`.
   - Auth check is centralized in a `requireAuth()` helper that returns a `Response | null`. If `locals.user` is null, returns `jsonResponse({ error: "Unauthorized" }, 401, origin)`.
   - All mutable methods (POST, PUT, DELETE) validate request body with Zod schemas before touching the DB.
   - `PUT` and `DELETE` read the resource ID from `url.searchParams.get("id")`, not from the request body. This keeps the REST semantic clean.

2. **Zod validation per route**
   - `notes.ts`: `createNoteSchema` requires `title` (string, 1-255 chars), `content` is optional. `updateNoteSchema` makes both fields optional.
   - `initiative.ts`: `createSessionSchema` requires `name` (string, 1-255 chars), `participants` is optional array of `participantSchema` objects.
   - On validation failure, return `400` with `jsonResponse({ error: "Validation failed", details: parsed.error.format() }, 400, origin)`.

3. **Cross-user access blocking**
   - Every DB query that targets a single resource uses `and(eq(table.id, id), eq(table.userId, locals.user!.id))`.
   - If `returning()` yields an empty array, the route returns `404` (not `403`). A 404 leaks less information about whether a resource exists at all.
   - This was verified with explicit test cases for PUT and DELETE accessing another user's resource.

4. **CORS consistency**
   - Both routes export `OPTIONS` handler calling `handleCorsPreflight(origin)`.
   - Every response uses `jsonResponse()` or `createCorsResponse()` to ensure CORS headers are present.
   - Origin is read from `request.headers.get("origin")` at the start of each handler.

5. **Mocking Drizzle ORM in unit tests**
   - Mocking the entire `db` chain (`select().from().where().orderBy()`, `insert().values().returning()`, etc.) is fragile because `where` conditions are complex SQL objects.
   - **Solution**: Mock `drizzle-orm`'s `eq` and `and` functions to return plain objects:
     ```ts
     vi.mock("drizzle-orm", async (importOriginal) => {
       const actual = await importOriginal<typeof import("drizzle-orm")>();
       return {
         ...actual,
         eq: (column: { name: string }, value: unknown) => ({ type: "eq", column: column.name, value }),
         and: (...conditions: unknown[]) => ({ type: "and", conditions }),
       };
     });
     ```
   - The mock DB then implements a simple `evaluateCondition()` recursive evaluator that checks `type === "eq"` against item properties (converting snake_case column names to camelCase).
   - This allows the mock to correctly filter by `userId` and `id`, making cross-user access tests reliable.

6. **Test coverage**
   - `tests/notes-api.test.ts`: 19 tests covering auth 401s, CORS OPTIONS, GET list, POST create, POST validation errors, PUT update, PUT 404 (missing + cross-user), DELETE remove, DELETE 404 (missing + cross-user), missing/invalid id params.
   - `tests/initiative-api.test.ts`: 20 tests covering the same patterns plus participant validation (rejecting non-numeric `hp`, etc.).

### Key Findings

- **Do not import from `.d.ts` files in tests**: `import type { User } from "../src/env.d.ts"` fails with "File is not a module". Define mock objects inline with `as const` assertions instead.
- **Ensure mock user objects match the full `User` interface**: `env.d.ts` includes `boostyVerifiedAt: Date | null`. Missing it causes `TS2741` errors even in tests.
- **Avoid duplicate variable declarations after edits**: A partial `edit` replacement can leave behind duplicate `const` declarations (e.g., `mockUser2` defined twice), which TypeScript flags as redeclaration errors and vitest fails to transform. Always verify the file after edits.

### Verification

- `npx tsc --noEmit`: 0 errors
- `npx vitest run`: 271/271 tests passed (19 test files)
- `npx vitest run tests/notes-api.test.ts`: 19/19 passed
- `npx vitest run tests/initiative-api.test.ts`: 20/20 passed

---

# Rate Limiting Service for AI Generation — Learnings

## Date: 2026-05-15

### What Was Done

1. **Created `src/lib/rate-limit.ts`**
   - `checkRateLimit(userId, tier)` — aggregates `sum(count)` across ALL models for the user's current hour window (`date_trunc('hour', now())`). Returns `{ allowed, remaining, resetAt }`.
   - `getRemainingQuota(userId, tier)` — same aggregation logic, lightweight query for UI badges.
   - `incrementGenerationCounter(userId, model)` — upserts per-model counter row using `onConflictDoUpdate` with composite unique target `(userId, hourWindow, model)`.
   - `getRetryAfterSeconds()` — computes seconds until next hour boundary for 429 `Retry-After` header.
   - FREE tier hard limit: 7/hour. PRO tier: 100/hour advisory (not hard-blocked, allows minor burst).

2. **Created `src/pages/api/dm/quota.ts`**
   - `GET` returns `{ remaining, resetAt, limit, tier }` for authenticated user.
   - `OPTIONS` handler for CORS preflight.
   - `prerender = false` required for middleware auth to populate `locals.user`.

3. **CORS fix (`src/lib/cors.ts`)**
   - Added `PUT` and `DELETE` to `Access-Control-Allow-Methods`. Already verified in existing `tests/cors.test.ts`.

4. **Tests (`tests/rate-limit.test.ts`)**
   - 14 tests covering: within limit, at limit, over limit, pro advisory behavior, resetAt correctness, tier differentiation, increment upsert, Retry-After logic.
   - Mock DB pattern: mock `@/db/client` with `select` returning configurable total, `insert` capturing values and resolving `onConflictDoUpdate`.
   - `vi.mock("drizzle-orm", ...)` needed to mock `eq`, `and`, and `sql` template tag so Drizzle query chains don't crash in vitest.

### Key Findings

- **Aggregating vs per-model limits**: The `generationCounters` schema has a composite unique index on `(userId, hourWindow, model)`, so counters are stored per-model. The rate limit check must `sum(count)` across all models to enforce a per-user total limit, while `incrementGenerationCounter` still tracks per-model for analytics.
- **`sql` template tag mocking**: In vitest, `` sql`expr` `` is a template tag function. The mock must accept `(strings: TemplateStringsArray, ...values)` and return a serializable object, otherwise Drizzle's internal SQL object breaks mocked query chains.
- **File write stability**: The `write` tool occasionally fails or reverts for existing files in this workspace. Using `bash` with `cat > file << 'EOF'` is more reliable for overwriting.
- **`getRetryAfterSeconds` at hour boundary**: At exactly 00:00 of an hour, the "next hour" is 3600 seconds away, not 0. This is correct behavior for `Retry-After` since the new hour window just started.

### Verification

- `npx tsc --noEmit`: 0 errors
- `npx vitest run tests/rate-limit.test.ts`: 14/14 passed
- `npx vitest run` (full suite): 285/285 passed (20 test files)

---

# Rate Limiting Service for AI Generation Routes — Learnings

## Date: 2026-05-15

### Patterns Applied

1. **Rate limiting service (`src/lib/rate-limit.ts`)**
   - `checkRateLimit(userId, tier)` queries the current hour's generation count BEFORE the AI API call to avoid wasting provider quota.
   - `incrementGenerationCounter(userId, model)` upserts the counter AFTER a successful AI response using PostgreSQL `ON CONFLICT DO UPDATE`.
   - `getRemainingQuota(userId, tier)` provides a lightweight query for UI badges.
   - `getRetryAfterSeconds()` computes seconds until the next hour for 429 `Retry-After` headers.
   - Tier limits are exported as `TIER_LIMITS` (`free: 7`, `pro: 100`).

2. **Hourly reset via `date_trunc('hour', now())`**
   - The `hourWindow` column uses `sql`date_trunc('hour', now())`` in both SELECT and INSERT/UPSERT queries.
   - This ensures counters reset at the top of each hour, not on a rolling window.

3. **FREE hard-block vs PRO advisory**
   - FREE tier: `allowed = count < limit` — hard-blocked at the limit.
   - PRO tier: `allowed = true` always — advisory only, allows minor burst over 100/hour.
   - The `remaining` value can go negative for PRO to signal advisory overage.

4. **Race-safe upsert with Drizzle `onConflictDoUpdate`**
   - Instead of read-then-write (race-prone), the insert uses `onConflictDoUpdate` with the unique index columns as target.
   - The `set` clause increments `count` atomically: `sql`${generationCounters.count} + 1``.

5. **Quota API route (`src/pages/api/dm/quota.ts`)**
   - Exposes `GET /api/dm/quota` returning `{ remaining, resetAt, limit, tier }`.
   - Requires auth (`locals.user`).
   - Follows DM API route pattern: CORS headers, `prerender = false`, `OPTIONS` preflight handler.

6. **CORS methods fix**
   - Added `PUT` and `DELETE` to `Access-Control-Allow-Methods` in `src/lib/cors.ts`.
   - Updated `tests/cors.test.ts` assertions to match.
   - Required for notes/initiative API routes that use PUT/DELETE.

### Testing Notes

- Mocking `drizzle-orm` in vitest: mocking `eq`, `and`, and `sql` to return plain objects allows the mock DB to evaluate `where` conditions without complex SQL parsing.
- Dynamic imports inside tests (`await import("@/lib/rate-limit")`) avoid vitest module caching issues when combined with `vi.mock`.
- The `getRetryAfterSeconds` test uses `vi.useFakeTimers()` to verify exact hour-boundary behavior.

### Verification

- `npx vitest run tests/rate-limit.test.ts`: 14/14 passed
- `npx vitest run tests/cors.test.ts`: 12/12 passed
- `npx vitest run` (full suite): 285/285 passed (20 test files)
- `npx tsc --noEmit`: 0 errors
- `npm run build`: fails due to pre-existing auth env validation (`JWT_SECRET` etc. missing in build env) — not related to rate-limiting changes

### Key Findings

- **Concurrent agent modification**: During implementation, `src/lib/rate-limit.ts` and `tests/rate-limit.test.ts` were repeatedly overwritten by another concurrent agent. The final accepted implementation aggregates counts across all models per user/hour (using `coalesce(sum(count), 0)`) rather than per-model. This aligns with the task requirement `checkRateLimit(userId, tier)` which does not accept a model parameter.
- **Do not use `vi.mock` factory with top-level variables**: The factory is hoisted before variable initialization, causing `ReferenceError` for `const`/`let` bindings. Use dynamic imports for the module under test, or define mock objects inside the factory.

---

# DM Dashboard AI Tab Navigation — Learnings

## Date: 2026-05-15

### What Was Done

1. **Added AI ("ИИ") tab to DM Dashboard navigation**
   - Updated `src/i18n/dm-translations.ts` with new keys:
     - `ai`, `anchorAi`, `tabAi` — tab/anchor labels
     - `aiSignInCta: "Войдите, чтобы использовать ИИ"` — unauthenticated CTA message
     - `aiPlaceholder: "Генератор контента с помощью ИИ"` — authenticated placeholder
   - Updated `src/components/dm/DmTabs.astro` — added `{ id: "ai", label: T.ai, hash: "#ai" }` as 5th tab in both server-rendered array and client-side script array.
   - Updated `src/components/dm/DmSidebar.astro` — added `{ id: "ai", label: T.ai, icon: "✦" }` to the tools navigation list.
   - Updated `src/layouts/DmLayout.astro` — extended `tabIds` array in mobile visibility script from `["dice", "initiative", "reference", "notes"]` to include `"ai"`.

2. **Added AI section to DM index pages**
   - `src/pages/dm/index.astro` — added `<section id="ai" class="dm-tab-section">` inside the `main` slot, after initiative.
   - `src/pages/ru/dm/index.astro` — mirrored the same section.
   - Section uses `Astro.locals.user` to conditionally render:
     - Authenticated: placeholder text inside `DmCard`
     - Unauthenticated: sign-in CTA text inside `DmCard`
   - Section follows the exact same heading pattern (orange `bg-[var(--accent)]` bar + `<h2>`) as dice and initiative.

### Key Findings

- **DmTabs client-side array must stay in sync with server-side array.** The `<script>` block in `DmTabs.astro` has a hardcoded `tabs` array that drives hash validation, keyboard navigation, and event dispatching. Adding the server tab without updating the client array breaks mobile tab switching.
- **DmLayout mobile visibility script must include the new tab ID.** The `tabIds` array in `DmLayout.astro` controls which sections are shown/hidden on mobile via `updateMobileSections()`. Missing `"ai"` here would cause the section to never appear on mobile, even when the tab is active.
- **Both EN and RU DM index pages must be updated.** `src/pages/dm/index.astro` and `src/pages/ru/dm/index.astro` are separate files with identical structure. Changes must be mirrored.
- **RU page pre-existing inconsistency:** `ru/dm/index.astro` passes no `user` prop to `DmSidebar` (pre-existing). I left it untouched per scope discipline, but `Astro.locals.user` is still available for the AI section conditional.

### Verification

- `npx tsc --noEmit`: 0 errors
