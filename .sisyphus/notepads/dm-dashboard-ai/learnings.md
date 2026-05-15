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
