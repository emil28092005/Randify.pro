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
