# DM Dashboard — AI-Powered NPC Generator & Infrastructure

## TL;DR

> **Quick Summary**: Build an AI-powered NPC generator for the DM Dashboard with tiered access (FREE/PRO), Open5e reference balancing, Open5e content translations, migrate notes/initiative to DB for PRO users, and fix existing auth anti-patterns.
>
> **Deliverables**:
> - NPC generator API (OpenRouter for FREE, Kimi for PRO) with Open5e reference balancing
> - Tier system with Boosty verification and rate limiting (7/hour FREE, 100/hour PRO)
> - Open5e content translation service with DB cache
> - Notes & initiative DB persistence for PRO users with localStorage fallback for FREE
> - Fixed auth anti-patterns (JWT validation, cookie SameSite, logout session cleanup, url.origin, env fallbacks)
> - UI: AI tab, generator form, result card, history panel, quota/tier badges
>
> **Estimated Effort**: Large (~25 tasks, 6 waves)
> **Parallel Execution**: YES — 6 waves with 3-5 tasks each
> **Critical Path**: Auth fixes → DB schema → Tier system → AI clients → NPC API → NPC UI → Final QA

---

## Context

### Original Request
Build AI-powered NPC generation for the DM Dashboard (dm.randify.pro) as part of randify.pro. Three access tiers: FREE no-account (no AI), FREE with account (7 gen/hour via OpenRouter), PRO (100 gen/hour via Kimi API + Boosty subscription). Include Open5e reference balancing, translations, and fix auth issues.

### Interview Summary
**Key Discussions**:
- **Scope**: MVP = NPC generator + infrastructure. Other generators (encounter, quest, spell, weapon, item) are future releases.
- **Theme**: Keep current orange theme (`#E87722`). Do NOT adopt purple from mockup.
- **Tests**: TDD for critical parts (API routes, rate limiting, auth, Boosty). UI tests-after.
- **Data**: Notes and initiative move to DB for PRO. FREE keeps localStorage/sessionStorage.
- **No hard deadlines** — quality over speed.

**Research Findings**:
- DM Dashboard UI fully built (dice, initiative, Open5e reference, notes, auth panel, design system).
- Auth works but has 6 anti-patterns: JWT_SECRET! assertion, sameSite strict, empty-string OAuth fallbacks, logout doesn't delete DB session, stale cookies not cleared, url.origin instead of PUBLIC_APP_URL.
- DB has only `users` and `sessions`. Missing: npcs, generation_counters, translations, notes, initiative_sessions, user tier.
- No AI/LLM code exists — greenfield implementation.
- Open5e already uses V2 but TypeScript interfaces (`Monster`, `Spell`) are dangerously incomplete (5 and 4 fields).
- `DmSidebar` accepts `user` prop but `index.astro` never passes it — auth propagation broken.
- Data migration keys confirmed: notes = `dm-notes` (localStorage), initiative = `dm-initiative` (sessionStorage) with `it-combatants` fallback.

### Metis Review
**Identified Gaps** (addressed):
- Auth fixes must include `url.origin` → `PUBLIC_APP_URL` (was missing from initial list).
- DmSidebar user prop fix must be explicitly scoped.
- Open5e V2 baseline clarified: current code already uses V2, needs interface expansion only.
- MCP Server is reference-only, not integration scope.
- MUST NOT build generic AI framework — hardcode NPC generator.
- Rate limiting must be AI-route-only, not global.
- AI API keys must never leave server-side.

---

## Work Objectives

### Core Objective
Build an AI-powered NPC generator for the DM Dashboard with tiered access (FREE/PRO), Open5e reference balancing, Open5e content translations, and migrate notes/initiative to DB for PRO users, while fixing existing auth anti-patterns.

### Concrete Deliverables
- `src/db/schema.ts` — extended schema with tier, npcs, generation_counters, translations, notes, initiative_sessions
- `src/lib/auth/` — fixed auth (JWT validation, cookie SameSite, logout cleanup, env fallbacks, url.origin)
- `src/lib/ai/` — OpenRouter client (FREE) and Kimi client (PRO)
- `src/lib/boosty.ts` — Boosty verification service with 5-min cache
- `src/lib/open5e/client.ts` — expanded Monster/Spell interfaces to full V2 schema
- `src/pages/api/dm/ai/generate.ts` — NPC generation API route
- `src/pages/api/dm/ai/history.ts` — Generation history API route
- `src/pages/api/dm/translate.ts` — Open5e content translation API route
- `src/components/dm/AiNpcForm.astro` — NPC generator form
- `src/components/dm/AiNpcResult.astro` — NPC result card
- `src/components/dm/GenerationHistory.astro` — History panel
- `src/components/dm/TierBadge.astro` + quota display
- `src/components/dm/NotesPanel.astro` — updated with DB persistence for PRO
- `src/components/dm/InitiativeTracker.astro` — updated with DB persistence for PRO

### Definition of Done
- [ ] All auth anti-patterns fixed and verified by tests
- [ ] DB migrations applied successfully
- [ ] NPC generation works end-to-end for both FREE (OpenRouter) and PRO (Kimi) tiers
- [ ] Rate limiting enforced: 7/hour FREE, 100/hour PRO
- [ ] Boosty verification correctly assigns PRO tier
- [ ] Translations cached in DB and served instantly on repeat requests
- [ ] Notes/initiative persist to DB for PRO, fall back to localStorage for FREE
- [ ] All new UI components render correctly in DmLayout
- [ ] Zero auth regressions on existing OAuth flow

### Must Have
- [ ] NPC generator with Open5e reference balancing
- [ ] Three-tier access system (FREE no-account, FREE with account, PRO)
- [ ] Rate limiting per tier with hourly reset
- [ ] Boosty subscription verification with cache
- [ ] Open5e content translation with DB cache
- [ ] Auth anti-pattern fixes (all 6 issues)
- [ ] DB schema migrations for all new tables
- [ ] Server-side AI API calls (keys never exposed client-side)
- [ ] DmSidebar user prop fix for tier badge rendering
- [ ] Open5e TypeScript interface expansion

### Must NOT Have (Guardrails)
- [ ] Generic AI generator framework — hardcode NPC only
- [ ] Client-side AI API key exposure
- [ ] Global rate limiting (only AI routes)
- [ ] Purple theme adoption from mockup
- [ ] Campaign management or session saving (future release)
- [ ] Other generator types (encounter, quest, spell, weapon, item)
- [ ] MCP Server integration (reference only)
- [ ] Server-side dice history storage
- [ ] Persisting InitiativeTracker activeIndex (keep in-memory)
- [ ] `innerHTML` with unsanitized AI output — always sanitize

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright configured)
- **Automated tests**: TDD for critical parts, tests-after for UI
- **Framework**: Vitest (unit), Playwright (E2E)
- **If TDD**: Each critical task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **Auth**: Playwright — Login flow, cookie inspection, logout verification
- **DB**: Bash (psql or drizzle query) — Verify schema, data insertion, constraints

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — 5 tasks):
├── Task 1: Fix auth anti-patterns (jwt.ts, oauth.ts, logout.ts, middleware, url.origin) [quick]
├── Task 2: Extend DB schema (tier, npcs, counters, translations, notes, initiative) [quick]
├── Task 4: Expand Open5e TypeScript interfaces (Monster, Spell) [quick]
├── Task 6: Build OpenRouter API client (FREE tier) [quick]
└── Task 7: Build Kimi API client (PRO tier) [quick]

Wave 2 (Migration + CORS + Sidebar — 3 tasks):
├── Task 3: Generate & apply Drizzle migration [quick]
├── Task 9: Fix DmSidebar user prop + add tier badge support [quick]
└── Task 13: Add CORS configuration for API routes [quick]

Wave 3 (Tier system + Data APIs — 2 tasks):
├── Task 5: Build Boosty verification service + tier assignment [unspecified-high]
└── Task 14: Build notes/initiative DB API routes [unspecified-high]

Wave 4 (Rate limiting + Translation API + Navigation — 3 tasks):
├── Task 8: Build rate limiting service/middleware + quota query [unspecified-high]
├── Task 12: Build translation API route (/api/dm/translate) [unspecified-high]
└── Task 15: Add AI tab to navigation (DmTabs + DmSidebar) [quick]

Wave 5 (Core generation + History + Badges + Translate button — 4 tasks):
├── Task 10: Build NPC generation API route (/api/dm/ai/generate) [deep]
├── Task 11: Build generation history API route (/api/dm/ai/history) [unspecified-high]
├── Task 19: Build quota/tier badge header components [visual-engineering]
└── Task 23: Add translate button to Open5e reference cards [visual-engineering]

Wave 6 (UI Components + Data Migration + Translation wiring — 6 tasks):
├── Task 16: Build NPC generator form component [visual-engineering]
├── Task 17: Build NPC result card component [visual-engineering]
├── Task 18: Build generation history panel component [visual-engineering]
├── Task 20: Migrate notes to DB for PRO + localStorage fallback [unspecified-high]
├── Task 21: Migrate initiative to DB for PRO + sessionStorage fallback [unspecified-high]
└── Task 24: Wire translation service to UI [quick]

Wave 7 (Import flow — 1 task, dependency-forced):
└── Task 22: Add FREE → PRO data import flow [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright skill)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T2 → T3 → T5 → T8 → T10 → T16 → T22 → F1-F4 → user okay
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 6 (Wave 6)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (Auth fixes) | — | 5, 9, F1-F4 |
| 2 (DB schema) | — | 3, 5, 10, 11, 12, 14, 20, 21 |
| 3 (Migration) | 2 | 5, 8, 10, 11, 12, 14, 20, 21 |
| 4 (Open5e interfaces) | — | 10 |
| 5 (Boosty + tier) | 1, 2, 3 | 8, 10, 19, 20, 21 |
| 6 (OpenRouter client) | — | 10, 12 |
| 7 (Kimi client) | — | 10 |
| 8 (Rate limiting) | 2, 3, 5 | 10, 19 |
| 9 (DmSidebar fix) | 1 | 15 |
| 10 (NPC generate API) | 4, 5, 6, 7, 8 | 16, 17 |
| 11 (History API) | 2, 3 | 18 |
| 12 (Translation API) | 2, 3, 6 | 23, 24 |
| 13 (CORS) | — | — |
| 14 (Notes/Initiative APIs) | 2, 3 | 20, 21 |
| 15 (AI tab nav) | 9 | 16 |
| 16 (NPC form) | 10, 15 | — |
| 17 (NPC result) | 10 | — |
| 18 (History panel) | 11 | — |
| 19 (Quota/tier badges) | 5, 8 | — |
| 20 (Notes DB) | 5, 14 | 22 |
| 21 (Initiative DB) | 5, 14 | 22 |
| 22 (Import flow) | 20, 21 | — |
| 23 (Translate button) | 12 | 24 |
| 24 (Translate wiring) | 12, 23 | — |
| F1-F4 | ALL above | — |

### Agent Dispatch Summary

- **Wave 1**: **5** — T1 → `quick`, T2 → `quick`, T4 → `quick`, T6 → `quick`, T7 → `quick`
- **Wave 2**: **3** — T3 → `quick`, T9 → `quick`, T13 → `quick`
- **Wave 3**: **2** — T5 → `unspecified-high`, T14 → `unspecified-high`
- **Wave 4**: **3** — T8 → `unspecified-high`, T12 → `unspecified-high`, T15 → `quick`
- **Wave 5**: **4** — T10 → `deep`, T11 → `unspecified-high`, T19 → `visual-engineering`, T23 → `visual-engineering`
- **Wave 6**: **6** — T16 → `visual-engineering`, T17 → `visual-engineering`, T18 → `visual-engineering`, T20 → `unspecified-high`, T21 → `unspecified-high`, T24 → `quick`
- **Wave 7**: **1** — T22 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] **1. Fix Auth Anti-Patterns**

  **What to do**:
  - Fix `src/lib/auth/jwt.ts:4`: Replace `process.env.JWT_SECRET!` with explicit validation (fail fast if missing).
  - Fix `src/lib/auth/jwt.ts:28`: Change `sameSite: 'strict'` to `sameSite: 'lax'` in `setAuthCookie`.
  - Fix `src/lib/auth/oauth.ts:3,33,34,41,42`: Remove all `|| ''` fallbacks. Create `requireEnv()` helper that throws descriptive errors.
  - Fix `src/pages/api/auth/logout.ts:6-14`: After clearing cookie, call `deleteSession(token)` to invalidate DB session.
  - Fix `src/middleware/index.ts:45-48`: In catch block for invalid tokens, delete the `auth_token` cookie (clear stale cookies).
  - Fix OAuth callbacks (`callback/vk.ts` and `callback/yandex.ts`): Replace `url.origin` with `process.env.PUBLIC_APP_URL` for redirect URIs.
  - Add startup env validation using zod schema for all required env vars.
  - Write tests for each fix: JWT secret validation, cookie attributes, logout session deletion, middleware stale cookie clearing.

  **Must NOT do**:
  - Remove `setAuthCookie`/`clearAuthCookie` without checking — mark `@deprecated` if unused.
  - Change JWT signing algorithm or token format (keep backward compatibility).
  - Modify OAuth provider URLs or scopes.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Targeted fixes in known files with exact line numbers from audit.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 5 (Boosty + tier), Task 9 (DmSidebar), F1-F4
  - **Blocked By**: None

  **References**:
  - `src/lib/auth/jwt.ts:4,28` — Current JWT cookie implementation
  - `src/lib/auth/oauth.ts:3,33,34,41,42` — OAuth config with fallbacks
  - `src/pages/api/auth/logout.ts:6-14` — Current logout (no DB cleanup)
  - `src/middleware/index.ts:45-48` — Middleware token validation
  - `src/pages/api/auth/callback/vk.ts` and `yandex.ts` — OAuth callbacks
  - AGENTS.md anti-patterns section — Reference for all fixes

  **Acceptance Criteria**:
  - [ ] `npm test src/lib/auth/jwt.test.ts` → PASS (secret validation, cookie attributes)
  - [ ] `npm test src/pages/api/auth/logout.test.ts` → PASS (session deletion)
  - [ ] `npm test src/middleware/index.test.ts` → PASS (stale cookie clearing)
  - [ ] `npm test src/lib/auth/oauth.test.ts` → PASS (env validation)
  - [ ] `tsc --noEmit` → zero errors

  **QA Scenarios**:
  ```
  Scenario: JWT secret missing at startup
    Tool: Bash (node)
    Preconditions: Remove JWT_SECRET from .env
    Steps:
      1. Run `npm run dev`
      2. Assert: App fails to start with descriptive error mentioning JWT_SECRET
    Expected Result: Process exits with non-zero code and clear error message
    Evidence: .sisyphus/evidence/task-1-jwt-secret-missing.log

  Scenario: Logout deletes DB session
    Tool: Playwright
    Preconditions: User is logged in (auth_token cookie set, DB session exists)
    Steps:
      1. Navigate to /dm/
      2. Click logout button
      3. Query DB: SELECT * FROM sessions WHERE token = '...'
      4. Assert: Query returns zero rows
      5. Assert: auth_token cookie is cleared
    Expected Result: DB session deleted AND cookie cleared
    Evidence: .sisyphus/evidence/task-1-logout-session.png

  Scenario: Stale cookie is cleared by middleware
    Tool: Bash (curl)
    Preconditions: Set invalid auth_token cookie
    Steps:
      1. curl -H "Cookie: auth_token=invalid_token" http://localhost:4321/dm/ -v
      2. Assert: Response headers include Set-Cookie clearing auth_token
    Expected Result: Stale cookie is removed by middleware
    Evidence: .sisyphus/evidence/task-1-stale-cookie.log
  ```

  **Commit**: YES
  - Message: `fix(auth): resolve all auth anti-patterns`
  - Files: `src/lib/auth/jwt.ts`, `src/lib/auth/oauth.ts`, `src/pages/api/auth/logout.ts`, `src/middleware/index.ts`, `src/pages/api/auth/callback/vk.ts`, `src/pages/api/auth/callback/yandex.ts`
  - Pre-commit: `npm test src/lib/auth/`

- [x] **2. Extend DB Schema**

  **What to do**:
  - Add `tier` column to `users` table: `varchar('tier', { length: 20 }).default('free')` with check constraint `'free' | 'pro'`.
  - Add `boostyVerifiedAt` timestamp column to `users` (nullable).
  - Create `npcs` table: `id`, `userId` (FK → users, ON DELETE CASCADE), `name`, `race`, `role`, `level`, `tone`, `content` (JSONB), `createdAt`.
  - Create `generationCounters` table: `id`, `userId` (FK → users, ON DELETE CASCADE), `hourWindow` (timestamp), `count` (integer), `model` ('openrouter' | 'kimi').
  - Create `translations` table: `id`, `slug` (unique), `type` ('creature' | 'spell' | 'item'), `language` (default 'ru'), `content` (JSONB), `createdAt`, `updatedAt`.
  - Create `notes` table: `id`, `userId` (FK → users, ON DELETE CASCADE), `title`, `content` (text), `createdAt`, `updatedAt`.
  - Create `initiativeSessions` table: `id`, `userId` (FK → users, ON DELETE CASCADE), `name`, `participants` (JSONB), `createdAt`, `updatedAt`.
  - Add composite unique index on `generationCounters(userId, hourWindow, model)`.
  - Add index on `translations(slug, type, language)`.
  - Write Drizzle schema tests verifying table creation and constraints.

  **Must NOT do**:
  - Add nullable columns to `users` without defaults (breaks existing rows).
  - Create separate `pro_users` table (use tier column).
  - Add `encounters` or `campaigns` tables (future release).

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema definition is declarative, well-understood scope.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 3 (migration), Task 5 (Boosty), Task 8 (rate limiting), Task 10+ (all DB-dependent tasks)
  - **Blocked By**: None

  **References**:
  - `src/db/schema.ts` — Current schema (users, sessions)
  - `src/db/client.ts` — Drizzle client setup
  - `drizzle/0000_short_warpath.sql` — Initial migration for reference

  **Acceptance Criteria**:
  - [ ] Schema file compiles: `tsc --noEmit` → zero errors
  - [ ] Test: `npm test src/db/schema.test.ts` → PASS (verifies all tables and constraints)
  - [ ] All FK constraints use ON DELETE CASCADE
  - [ ] `users.tier` has default 'free' and check constraint

  **QA Scenarios**:
  ```
  Scenario: Schema has all required tables
    Tool: Bash (psql)
    Preconditions: PostgreSQL running, DATABASE_URL set
    Steps:
      1. Run `npm run db:generate`
      2. Inspect generated SQL in drizzle/
      3. Assert: SQL contains CREATE TABLE for npcs, generation_counters, translations, notes, initiative_sessions
      4. Assert: SQL contains ALTER TABLE for users adding tier column
    Expected Result: All 6 new tables/columns present in migration
    Evidence: .sisyphus/evidence/task-2-schema-tables.log

  Scenario: users.tier defaults to 'free'
    Tool: Bash (psql)
    Preconditions: Migration applied
    Steps:
      1. INSERT INTO users (vk_id, email, name) VALUES ('123', 'test@test.com', 'Test')
      2. SELECT tier FROM users WHERE vk_id = '123'
      3. Assert: tier = 'free'
    Expected Result: New users default to free tier
    Evidence: .sisyphus/evidence/task-2-tier-default.log
  ```

  **Commit**: YES (grouped with Task 3)
  - Message: `feat(db): add AI and PRO tables`
  - Files: `src/db/schema.ts`

- [x] **3. Generate & Apply Drizzle Migration**

  **What to do**:
  - Run `npm run db:generate` to create migration from updated schema.
  - Review generated SQL for correctness (cascades, indexes, defaults).
  - Run `npm run db:migrate` locally to verify application.
  - Ensure migration is reversible (down migration generated).
  - Test migration against empty DB and DB with existing data.
  - Update `docker-compose.yml` if needed (no changes expected for this migration).

  **Must NOT do**:
  - Manually edit generated SQL unless absolutely necessary (prefer schema changes).
  - Apply migration to production DB during planning.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Drizzle workflow.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: All DB-dependent tasks (5, 8, 10, 11, 12, 14, 20, 21)
  - **Blocked By**: Task 2 (schema)

  **References**:
  - `package.json` scripts — db:generate, db:migrate
  - `drizzle/` directory — Existing migrations

  **Acceptance Criteria**:
  - [ ] `npm run db:generate` completes without errors
  - [ ] `npm run db:migrate` applies cleanly to local dev DB
  - [ ] `npm run db:migrate` applies cleanly to test DB with existing users/sessions
  - [ ] `drizzle-kit` down migration exists

  **QA Scenarios**:
  ```
  Scenario: Migration applies cleanly
    Tool: Bash
    Preconditions: PostgreSQL running with existing users/sessions data
    Steps:
      1. Run `npm run db:migrate`
      2. Assert: Exit code 0
      3. Query: SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tier'
      4. Assert: Query returns 1 row
    Expected Result: Migration applies without errors, new columns exist
    Evidence: .sisyphus/evidence/task-3-migration.log
  ```

  **Commit**: YES (grouped with Task 2)
  - Message: `feat(db): add AI and PRO tables with migration`
  - Files: `src/db/schema.ts`, `drizzle/`
  - Pre-commit: `npm run db:generate && npm run db:migrate`

- [x] **4. Expand Open5e TypeScript Interfaces**

  **What to do**:
  - Expand `Monster` interface in `src/lib/open5e/client.ts` to include ALL fields accessed in detail views and needed for AI prompts:
    - `speed` (object or string), `actions` (array), `special_abilities`, `legendary_actions`, `senses`, `languages`, `challenge_rating_decimal`, `hit_points`, `armor_class`, `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`, `size`, `type`, `subtype`, `alignment`, `damage_immunities`, `damage_resistances`, `damage_vulnerabilities`, `condition_immunities`.
  - Expand `Spell` interface to include all detail fields:
    - `casting_time`, `range`, `components`, `duration`, `desc` (array of strings), `higher_level`, `ritual`, `concentration`, `school`, `level`, `classes`.
  - Add cache schema versioning: prefix localStorage keys with `v2:` (e.g., `open5e:v2:monster:${key}`).
  - Ensure no `any` types remain in Open5e client.
  - Write type tests verifying interface completeness.

  **Must NOT do**:
  - Change existing `fields` parameter in search endpoints (keeps responses small).
  - Modify existing UI behavior of Open5e reference component.
  - Add new API endpoints — only expand types.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Type expansion with known field list from Metis audit.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 10 (NPC generate API needs full types for prompts)
  - **Blocked By**: None

  **References**:
  - `src/lib/open5e/client.ts` — Current Monster/Spell interfaces (5 and 4 fields)
  - `src/components/dm/Open5eReference.astro` — Detail view accessing un-typed fields
  - Open5e V2 API docs: https://api.open5e.com/v2/ — Field reference
  - `src/lib/open5e/cache.ts` — Cache key generation

  **Acceptance Criteria**:
  - [ ] `tsc --noEmit` → zero errors after interface expansion
  - [ ] `npm test src/lib/open5e/client.test.ts` → PASS (verifies all expected fields exist)
  - [ ] Cache keys include `v2:` prefix
  - [ ] No `any` types in Open5e client module

  **QA Scenarios**:
  ```
  Scenario: Monster interface has all required fields
    Tool: Bash (node REPL)
    Preconditions: TypeScript compiled
    Steps:
      1. Import Monster type
      2. Create object with all fields: speed, actions, hit_points, armor_class, challenge_rating_decimal, etc.
      3. Assert: TypeScript compiles without "Property does not exist" errors
    Expected Result: All fields are valid on Monster type
    Evidence: .sisyphus/evidence/task-4-monster-interface.log

  Scenario: Cache keys use v2 prefix
    Tool: Bash (node)
    Preconditions: Client code updated
    Steps:
      1. Call searchMonsters("goblin")
      2. Inspect localStorage keys
      3. Assert: Keys start with "open5e:v2:"
    Expected Result: New cache entries use v2 prefix
    Evidence: .sisyphus/evidence/task-4-cache-version.log
  ```

  **Commit**: YES
  - Message: `fix(open5e): expand Monster and Spell interfaces to full V2 schema`
  - Files: `src/lib/open5e/client.ts`, `src/lib/open5e/cache.ts`
  - Pre-commit: `tsc --noEmit`

- [x] **5. Build Boosty Verification Service + Tier Assignment**

  **What to do**:
  - Create `src/lib/boosty.ts`: Service that verifies Boosty subscription token via Boosty API.
  - **Evidence**: User requirement confirmed in interview: "Проверка Boosty токена для PRO, кэш 5 минут в памяти". Executor must research exact Boosty API endpoint for subscription verification before implementation.
  - Implement 5-minute in-memory cache (Map or simple object with TTL).
  - Cache structure: `{ tier: 'pro' | 'free', verifiedAt: Date, expiresAt: Date }`.
  - On cache miss: HTTP request to Boosty API with 5-second timeout.
  - On Boosty API failure: serve stale cache if available, otherwise assume unchanged tier.
  - Never log or expose Boosty tokens in errors.
  - Add tier assignment to OAuth callback flow: after user upsert, check Boosty token (if env var present), update `users.tier` to 'pro' or 'free'.
  - Add middleware extension: attach `tier` to `Astro.locals.user` (requires updating middleware types).
  - Write TDD tests: cache hit, cache miss, API timeout, stale fallback, token privacy.

  **Must NOT do**:
  - Store Boosty tokens in DB (only verification result + timestamp).
  - Build subscription management UI or webhook handling.
  - Check Boosty on every request — only on auth events and cache miss.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: External API integration with caching, timeout, and error handling logic.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 8 (rate limiting needs tier info), Task 10 (generate API needs tier), Task 19 (tier badges), Task 20/21 (PRO persistence)
  - **Blocked By**: Task 1 (auth fixes), Task 2/3 (DB schema + migration)

  **References**:
  - `src/db/schema.ts` — users table with tier column
  - `src/middleware/index.ts` — Where Astro.locals.user is populated
  - `src/pages/api/auth/callback/vk.ts` and `yandex.ts` — Where to add tier assignment
  - Boosty API docs (research via web if needed)

  **Acceptance Criteria**:
  - [ ] Boosty API endpoint for subscription verification is identified and documented in code comments
  - [ ] `npm test src/lib/boosty.test.ts` → PASS (cache hit, miss, timeout, stale)
  - [ ] OAuth callback sets correct tier on user upsert
  - [ ] Middleware attaches tier to Astro.locals.user
  - [ ] Boosty token never appears in logs or error messages

  **QA Scenarios**:
  ```
  Scenario: Boosty verification with cache hit
    Tool: Bash (curl)
    Preconditions: User logged in, Boosty cache warm
    Steps:
      1. Call /api/dm/ai/generate twice in rapid succession
      2. Assert: Second request does NOT trigger Boosty API call (check server logs or mock)
    Expected Result: Cache serves second request instantly
    Evidence: .sisyphus/evidence/task-5-boosty-cache.log

  Scenario: Boosty API timeout falls back to stale cache
    Tool: Bash (curl)
    Preconditions: Boosty API is unreachable (mock timeout)
    Steps:
      1. Warm cache with 'pro' tier
      2. Wait for cache expiry
      3. Call generate endpoint
      4. Assert: Request succeeds with 'pro' tier (stale cache served)
    Expected Result: Graceful degradation on Boosty API failure
    Evidence: .sisyphus/evidence/task-5-boosty-timeout.log
  ```

  **Commit**: YES
  - Message: `feat(auth): add Boosty verification and tier assignment`
  - Files: `src/lib/boosty.ts`, `src/middleware/index.ts`, `src/pages/api/auth/callback/vk.ts`, `src/pages/api/auth/callback/yandex.ts`
  - Pre-commit: `npm test src/lib/boosty.test.ts`

- [x] **6. Build OpenRouter API Client (FREE Tier)**

  **What to do**:
  - Create `src/lib/ai/openrouter.ts`: Client for OpenRouter API.
  - Model: `llama-3.3-70b:free` (default for FREE tier).
  - Function signature: `generateNPC(params: NPCParams, reference?: Open5eMonster): Promise<NPCResult>`.
  - Build structured prompt: system prompt "valid JSON only, no markdown", user prompt with params + reference stat block.
  - Include JSON schema in prompt to constrain output.
  - Handle API errors: timeout (10s), rate limit (429), invalid JSON response.
  - Validate AI response with zod schema before returning.
  - Write TDD tests: successful generation, invalid JSON handling, API error handling.

  **Must NOT do**:
  - Expose OpenRouter API key client-side.
  - Hardcode fallback models (handle via config if needed later).
  - Store raw prompts in DB.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-purpose API client with known endpoint and format.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 1, parallel with Task 7)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 10 (generate API), Task 12 (translation API)
  - **Blocked By**: None

  **References**:
  - OpenRouter docs: https://openrouter.ai/docs
  - `src/lib/open5e/client.ts` — For reference monster fetching
  - Existing random utilities: `src/lib/client/random.ts`

  **Acceptance Criteria**:
  - [ ] `npm test src/lib/ai/openrouter.test.ts` → PASS
  - [ ] Client validates AI response JSON with zod
  - [ ] API key read from `process.env.OPENROUTER_API_KEY`
  - [ ] Timeout set to 10 seconds

  **QA Scenarios**:
  ```
  Scenario: Generate NPC via OpenRouter
    Tool: Bash (node REPL)
    Preconditions: OPENROUTER_API_KEY set
    Steps:
      1. Import openrouter client
      2. Call generateNPC({race: 'elf', role: 'wizard', level: 5, tone: 'dark'})
      3. Assert: Returns object with name, race, role, hp, ac, cr, speed, appearance, trait, motivation, secret, history
    Expected Result: Valid NPC object with all required fields
    Evidence: .sisyphus/evidence/task-6-openrouter-npc.log

  Scenario: Handle invalid JSON from AI
    Tool: Bash (node REPL)
    Preconditions: Mock OpenRouter returning markdown instead of JSON
    Steps:
      1. Call generateNPC with mocked client
      2. Assert: Throws descriptive error about invalid JSON
    Expected Result: Graceful error, no crash
    Evidence: .sisyphus/evidence/task-6-invalid-json.log
  ```

  **Commit**: YES (grouped with Task 7)
  - Message: `feat(ai): add OpenRouter and Kimi API clients`
  - Files: `src/lib/ai/openrouter.ts`

- [x] **7. Build Kimi API Client (PRO Tier)**

  **What to do**:
  - Create `src/lib/ai/kimi.ts`: Client for Kimi API (api.moonshot.ai).
  - Model: default Kimi model (check docs for latest, e.g., `moonshot-v1-8k`).
  - Same interface as OpenRouter client: `generateNPC(params, reference?)`.
  - Same structured prompt approach (system + user + JSON schema).
  - Same error handling and zod validation.
  - Write TDD tests mirroring OpenRouter client tests.

  **Must NOT do**:
  - Expose Kimi API key client-side.
  - Use different response format than OpenRouter (keep interface uniform).

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Parallel implementation with Task 6, same pattern.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 1, parallel with Task 6)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 10 (generate API needs both clients)
  - **Blocked By**: None

  **References**:
  - Kimi API docs: https://platform.moonshot.ai/docs
  - `src/lib/ai/openrouter.ts` — Pattern to follow (parallel task)

  **Acceptance Criteria**:
  - [ ] `npm test src/lib/ai/kimi.test.ts` → PASS
  - [ ] Client validates AI response JSON with zod
  - [ ] API key read from `process.env.KIMI_API_KEY`
  - [ ] Same NPCResult interface as OpenRouter client

  **QA Scenarios**:
  ```
  Scenario: Generate NPC via Kimi
    Tool: Bash (node REPL)
    Preconditions: KIMI_API_KEY set
    Steps:
      1. Import kimi client
      2. Call generateNPC({race: 'dwarf', role: 'fighter', level: 3, tone: 'heroic'})
      3. Assert: Returns valid NPC object matching NPCResult interface
    Expected Result: Valid NPC with same schema as OpenRouter
    Evidence: .sisyphus/evidence/task-7-kimi-npc.log
  ```

  **Commit**: YES (grouped with Task 6)
  - Message: `feat(ai): add OpenRouter and Kimi API clients`
  - Files: `src/lib/ai/kimi.ts`
  - Pre-commit: `npm test src/lib/ai/`

- [x] **8. Build Rate Limiting Service/Middleware**

  **What to do**:
  - Create `src/lib/rate-limit.ts`: Service for per-user generation counters.
  - Counter resets at top of each hour (not rolling window): `hourWindow = date_trunc('hour', now())`.
  - FREE tier: 7 generations/hour. PRO tier: 100 generations/hour.
  - Check counter BEFORE AI API call (don't waste provider quota on blocked requests).
  - Increment counter AFTER successful AI response (don't charge for failures).
  - Add `getRemainingQuota(userId, tier)` function to query remaining generations for the current hour.
  - Expose quota via lightweight endpoint or middleware (consumed by Task 19 quota badge).
  - Unauthenticated users: return 401 (AI requires auth).
  - Rate limit response: HTTP 429 with `Retry-After` header (seconds until next hour).
  - Write TDD tests: within limit, at limit, over limit, counter reset, tier differentiation, quota query.

  **Must NOT do**:
  - Apply rate limiting to non-AI routes (dice, initiative, reference, notes).
  - Use rolling window (keep hourly reset for simplicity).
  - Hard-block PRO at exactly 100 (allow minor burst, advisory behavior).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Critical correctness requirement (affects revenue and user experience).
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 4)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 10 (generate API needs rate limiting), Task 19 (quota badge needs quota query)
  - **Blocked By**: Task 2/3 (DB schema + migration), Task 5 (tier system)

  **References**:
  - `src/db/schema.ts` — generationCounters table
  - `src/middleware/index.ts` — Where user auth is validated
  - `src/lib/boosty.ts` — Tier information source

  **Acceptance Criteria**:
  - [ ] `npm test src/lib/rate-limit.test.ts` → PASS (7 test cases)
  - [ ] FREE user gets 429 on 8th request within same hour
  - [ ] PRO user gets 429 on 101st request within same hour
  - [ ] 429 response includes Retry-After header
  - [ ] Counter resets at top of next hour
  - [ ] `getRemainingQuota()` returns correct remaining count for current hour

  **QA Scenarios**:
  ```
  Scenario: FREE user hits rate limit
    Tool: Bash (curl)
    Preconditions: FREE user authenticated
    Steps:
      1. Send 8 POST requests to /api/dm/ai/generate within 1 minute
      2. Assert: Requests 1-7 return 200
      3. Assert: Request 8 returns 429 with Retry-After header > 0
      4. Assert: Retry-After value <= 3600
    Expected Result: 7 successful, 8th blocked with proper headers
    Evidence: .sisyphus/evidence/task-8-rate-limit-free.log

  Scenario: Counter resets at new hour
    Tool: Bash (curl)
    Preconditions: FREE user exhausted 7/7 limit
    Steps:
      1. Wait until top of next hour (or mock time)
      2. Send POST to /api/dm/ai/generate
      3. Assert: Returns 200 (counter reset)
    Expected Result: Counter resets hourly
    Evidence: .sisyphus/evidence/task-8-rate-limit-reset.log
  ```

  **Commit**: YES
  - Message: `feat(api): add rate limiting service for AI generation`
  - Files: `src/lib/rate-limit.ts`
  - Pre-commit: `npm test src/lib/rate-limit.test.ts`

- [x] **9. Fix DmSidebar User Prop + Add Tier Badge Support**

  **What to do**:
  - Fix `src/pages/dm/index.astro`: Pass `user={Astro.locals.user}` to `<DmSidebar />`.
  - Update `src/components/dm/DmSidebar.astro`: Render user block when `user` prop is present.
  - Add tier badge to sidebar user block: "FREE" (outline) or "PRO" (solid orange).
  - Add quota display to sidebar or header (remaining generations this hour).
  - Ensure tier badge updates without page reload (fetch quota endpoint or use HTMX).
  - Add conditional rendering: AI generator list in sidebar only when user is authenticated.
  - Update `src/i18n/dm-translations.ts` with new strings for tier badges and quota.

  **Must NOT do**:
  - Modify existing dice/initiative/reference/notes sidebar items.
  - Add AI generator navigation for unauthenticated users.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: UI wiring and conditional rendering with existing components.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 15 (AI tab navigation)
  - **Blocked By**: Task 1 (auth fixes)

  **References**:
  - `src/pages/dm/index.astro` — Where DmSidebar is rendered without user prop
  - `src/components/dm/DmSidebar.astro` — Sidebar component accepting user prop
  - `src/components/dm/AuthPanel.astro` — Existing auth UI for reference
  - `src/i18n/dm-translations.ts` — Translation strings

  **Acceptance Criteria**:
  - [ ] Playwright test: sidebar shows user avatar/name when logged in
  - [ ] Playwright test: sidebar shows "FREE" or "PRO" tier badge
  - [ ] Playwright test: AI generator list hidden when logged out
  - [ ] `tsc --noEmit` → zero errors

  **QA Scenarios**:
  ```
  Scenario: Sidebar shows tier badge for logged-in user
    Tool: Playwright
    Preconditions: User logged in with FREE tier
    Steps:
      1. Navigate to /dm/
      2. Assert: Sidebar contains user name and avatar
      3. Assert: Sidebar contains "FREE" badge
      4. Login as PRO user
      5. Assert: Sidebar contains "PRO" badge
    Expected Result: Tier badge renders correctly for both tiers
    Evidence: .sisyphus/evidence/task-9-tier-badge.png
  ```

  **Commit**: YES
  - Message: `fix(ui): wire DmSidebar user prop and add tier badges`
  - Files: `src/pages/dm/index.astro`, `src/components/dm/DmSidebar.astro`, `src/i18n/dm-translations.ts`
  - Pre-commit: `npm run build`

- [ ] **10. Build NPC Generation API Route**

  **What to do**:
  - Create `src/pages/api/dm/ai/generate.ts`: POST endpoint for NPC generation.
  - Request body: `{ race, role, level, tone, useOpen5eReference?: boolean }`.
  - Flow:
    1. Validate auth (401 if unauthenticated).
    2. Check rate limit (429 if exceeded, with Retry-After).
    3. If `useOpen5eReference`, fetch matching monster from Open5e V2 API (by CR/role similarity).
    4. Select AI client: OpenRouter for FREE tier, Kimi for PRO tier.
    5. Call AI client with params + reference (if fetched).
    6. Validate AI response with zod schema.
    7. Save generated NPC to `npcs` table (for history).
    8. Increment generation counter.
    9. Return `{ npc: NPCResult, reference?: Open5eMonster }`.
  - Handle errors at each step with appropriate HTTP codes.
  - Write TDD tests: happy path, rate limited, invalid auth, Open5e fetch failure, invalid AI response.

  **Must NOT do**:
  - Expose AI API keys or raw prompts in response.
  - Call AI API before rate limit check.
  - Save failed generations to npcs table.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex multi-step API route with external dependencies, error handling, and data flow.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 16 (NPC form), Task 17 (NPC result)
  - **Blocked By**: Task 4 (Open5e interfaces), Task 5 (Boosty/tier), Task 6/7 (AI clients), Task 8 (rate limiting)

  **References**:
  - `src/lib/ai/openrouter.ts` — FREE tier AI client
  - `src/lib/ai/kimi.ts` — PRO tier AI client
  - `src/lib/open5e/client.ts` — Open5e reference fetching
  - `src/lib/rate-limit.ts` — Rate limiting service
  - `src/db/schema.ts` — npcs table, generationCounters table
  - `src/middleware/index.ts` — Auth validation pattern

  **Acceptance Criteria**:
  - [ ] `npm test src/pages/api/dm/ai/generate.test.ts` → PASS (5 test cases)
  - [ ] `curl` with valid auth + params → returns 200 with valid NPC JSON
  - [ ] `curl` without auth → returns 401
  - [ ] `curl` with FREE user after 7 requests → returns 429 with Retry-After
  - [ ] AI response validated by zod before returning

  **QA Scenarios**:
  ```
  Scenario: Generate NPC with Open5e reference (FREE tier)
    Tool: Bash (curl)
    Preconditions: FREE user authenticated, rate limit not exceeded
    Steps:
      1. curl -X POST http://localhost:4321/api/dm/ai/generate \
         -H "Cookie: auth_token=FREE_TOKEN" \
         -H "Content-Type: application/json" \
         -d '{"race":"elf","role":"wizard","level":5,"tone":"dark","useOpen5eReference":true}'
      2. Assert: Status 200
      3. Assert: JSON contains npc.name, npc.hp, npc.ac, npc.cr
      4. Assert: JSON contains reference object (Open5e monster stats)
      5. Assert: DB npcs table has new row for this user
    Expected Result: Valid NPC generated with reference, saved to history
    Evidence: .sisyphus/evidence/task-10-generate-npc.log

  Scenario: Rate limit blocks FREE user
    Tool: Bash (curl)
    Preconditions: FREE user has used 7/7 generations this hour
    Steps:
      1. curl -X POST ... (8th request)
      2. Assert: Status 429
      3. Assert: Header Retry-After present and > 0
    Expected Result: Request blocked with proper rate limit headers
    Evidence: .sisyphus/evidence/task-10-rate-limit-429.log

  Scenario: Unauthenticated user cannot generate
    Tool: Bash (curl)
    Preconditions: No auth_token cookie
    Steps:
      1. curl -X POST ... (no cookie)
      2. Assert: Status 401
    Expected Result: Auth required for AI generation
    Evidence: .sisyphus/evidence/task-10-unauthorized.log
  ```

  **Commit**: YES
  - Message: `feat(api): add NPC generation endpoint`
  - Files: `src/pages/api/dm/ai/generate.ts`
  - Pre-commit: `npm test src/pages/api/dm/ai/generate.test.ts`

- [ ] **11. Build Generation History API Route**

  **What to do**:
  - Create `src/pages/api/dm/ai/history.ts`: GET endpoint for user's generation history.
  - Query params: `?limit=20&offset=0`.
  - Returns: `{ items: NPCResult[], total: number }`.
  - For FREE users: return only session history (from `sessionStorage` or in-memory — decision needed). Actually, per requirements, FREE users see only session history. But history API is server-side. For MVP, simplify: return DB history for all authenticated users, but FREE users only see their own (no cross-device). The session-only requirement for FREE can be implemented client-side.
  - Actually, re-reading requirements: "History panel shows last 20 generated NPCs". For FREE: "История сохраняется только для PRO. Бесплатные генерации видны до конца сессии." So FREE history is client-side only. The history API should only return DB-stored history (which means PRO only). But we save NPCs to DB for all users... Let me think. The plan says "Save generated NPC to npcs table (for history)" — this could be for all users. But the requirement says PRO saves to DB. For MVP, let's save all NPCs to DB but only PRO users see cross-session history. FREE users see client-side session history.
  - Pagination with `limit` and `offset`.
  - Order by `createdAt DESC`.
  - Write TDD tests: list history, pagination, empty state.

  **Must NOT do**:
  - Return other users' NPCs (strict user_id filtering).
  - Allow unauthenticated access.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Standard CRUD API route with pagination.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 18 (history panel UI)
  - **Blocked By**: Task 2/3 (DB schema + migration)

  **References**:
  - `src/db/schema.ts` — npcs table
  - `src/pages/api/dm/ai/generate.ts` — Creates NPC data
  - `src/middleware/index.ts` — Auth pattern

  **Acceptance Criteria**:
  - [ ] `npm test src/pages/api/dm/ai/history.test.ts` → PASS
  - [ ] `curl` with auth → returns user's NPC history
  - [ ] `curl` without auth → returns 401
  - [ ] Pagination works (limit/offset)

  **QA Scenarios**:
  ```
  Scenario: Retrieve generation history
    Tool: Bash (curl)
    Preconditions: User has generated 3 NPCs
    Steps:
      1. curl "http://localhost:4321/api/dm/ai/history?limit=10" -H "Cookie: auth_token=TOKEN"
      2. Assert: Status 200
      3. Assert: JSON items array length = 3
      4. Assert: Each item has name, race, createdAt
    Expected Result: Returns user's NPC history
    Evidence: .sisyphus/evidence/task-11-history-list.log
  ```

  **Commit**: YES
  - Message: `feat(api): add generation history endpoint`
  - Files: `src/pages/api/dm/ai/history.ts`
  - Pre-commit: `npm test src/pages/api/dm/ai/history.test.ts`

- [x] **12. Build Translation API Route**

  **What to do**:
  - Create `src/pages/api/dm/translate.ts`: GET endpoint for Open5e content translation.
  - Query params: `?slug=monster-name&type=creature`.
  - Flow:
    1. Check `translations` table: if cache hit, return immediately.
    2. If cache miss, fetch original content from Open5e API.
    3. Call OpenRouter `llama-3.3-70b:free` to translate to Russian.
    4. Save translation to `translations` table.
    5. Return `{ translated: object, cached: boolean }`.
  - Available to ALL users including unauthenticated (no auth required).
  - Translation prompt: structured, preserve JSON format, translate text fields only.
  - Write TDD tests: cache hit, cache miss, Open5e fetch failure, translation API failure.

  **Must NOT do**:
  - Use Kimi API for translations (use OpenRouter free model for all).
  - Rate limit translation requests.
  - Return raw AI prompt or API key in response.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: External API integration with caching, available to unauthenticated users.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 4)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 23 (translate button), Task 24 (translation UI wiring)
  - **Blocked By**: Task 2/3 (DB schema), Task 6 (OpenRouter client)

  **References**:
  - `src/lib/ai/openrouter.ts` — Translation via OpenRouter
  - `src/lib/open5e/client.ts` — Fetch original content
  - `src/db/schema.ts` — translations table

  **Acceptance Criteria**:
  - [ ] `npm test src/pages/api/dm/translate.test.ts` → PASS
  - [ ] `curl` without auth → returns 200 with translation
  - [ ] First request hits OpenRouter, second request hits DB cache
  - [ ] Translation preserves original JSON structure

  **QA Scenarios**:
  ```
  Scenario: Translation cache miss then hit
    Tool: Bash (curl)
    Preconditions: Translation not in DB
    Steps:
      1. curl "/api/dm/translate?slug=goblin&type=creature"
      2. Assert: Status 200, cached=false
      3. curl "/api/dm/translate?slug=goblin&type=creature" (same request)
      4. Assert: Status 200, cached=true
      5. Assert: Response time < 100ms (cache hit)
    Expected Result: First request generates, second serves from cache
    Evidence: .sisyphus/evidence/task-12-translation-cache.log
  ```

  **Commit**: YES
  - Message: `feat(api): add Open5e translation endpoint`
  - Files: `src/pages/api/dm/translate.ts`
  - Pre-commit: `npm test src/pages/api/dm/translate.test.ts`

- [x] **13. Add CORS Configuration for API Routes**

  **What to do**:
  - Add CORS headers to all new DM API routes (`/api/dm/*`).
  - Allowed origins: `randify.pro`, `dm.randify.pro`, `localhost:4321`.
  - Allowed methods: `GET`, `POST`, `OPTIONS`.
  - Allowed headers: `Content-Type`, `Authorization` (if needed).
  - Credentials: `true` (for cookies).
  - Add `OPTIONS` preflight handler.
  - Write tests verifying CORS headers on all DM API routes.

  **Must NOT do**:
  - Allow wildcard `*` origin.
  - Apply CORS globally to non-DM routes.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard middleware configuration.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: None (all API routes can use it)
  - **Blocked By**: None

  **References**:
  - Astro API route docs for CORS handling
  - `src/pages/api/health.ts` — Existing API route for reference

  **Acceptance Criteria**:
  - [ ] `curl -I -X OPTIONS http://localhost:4321/api/dm/ai/generate` → returns 204 with CORS headers
  - [ ] `curl` with Origin header → response includes Access-Control-Allow-Origin matching origin
  - [ ] CORS headers present on all `/api/dm/*` routes

  **QA Scenarios**:
  ```
  Scenario: CORS preflight request
    Tool: Bash (curl)
    Preconditions: Server running
    Steps:
      1. curl -X OPTIONS -H "Origin: http://dm.randify.pro" http://localhost:4321/api/dm/ai/generate -v
      2. Assert: Status 204
      3. Assert: Header Access-Control-Allow-Origin contains dm.randify.pro
      4. Assert: Header Access-Control-Allow-Credentials: true
    Expected Result: Proper CORS preflight response
    Evidence: .sisyphus/evidence/task-13-cors-preflight.log
  ```

  **Commit**: YES (grouped with nearest API route commit)

- [x] **14. Build Notes/Initiative DB API Routes**

  **What to do**:
  - Create `src/pages/api/dm/notes.ts`: GET/POST/PUT/DELETE for notes.
    - GET: returns user's notes array.
    - POST: create new note.
    - PUT: update note by ID.
    - DELETE: delete note by ID.
  - Create `src/pages/api/dm/initiative.ts`: GET/POST/PUT/DELETE for initiative sessions.
    - GET: returns user's initiative sessions.
    - POST: create new session.
    - PUT: update session by ID.
    - DELETE: delete session by ID.
  - Both routes: 401 for unauthenticated.
  - Validate request body with zod.
  - Write TDD tests for all CRUD operations.

  **Must NOT do**:
  - Allow access to other users' notes/sessions.
  - Modify existing localStorage/sessionStorage logic (keep for FREE fallback).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Standard CRUD API routes with auth.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 3)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 20 (notes DB UI), Task 21 (initiative DB UI)
  - **Blocked By**: Task 2/3 (DB schema)

  **References**:
  - `src/db/schema.ts` — notes, initiativeSessions tables
  - `src/middleware/index.ts` — Auth pattern

  **Acceptance Criteria**:
  - [ ] `npm test src/pages/api/dm/notes.test.ts` → PASS
  - [ ] `npm test src/pages/api/dm/initiative.test.ts` → PASS
  - [ ] All CRUD operations work with proper auth
  - [ ] Cross-user access blocked (404 or 403)

  **QA Scenarios**:
  ```
  Scenario: Notes CRUD operations
    Tool: Bash (curl)
    Preconditions: Authenticated user
    Steps:
      1. POST /api/dm/notes -d '{"title":"Test","content":"Hello"}' → 201
      2. GET /api/dm/notes → 200, items[0].title = "Test"
      3. PUT /api/dm/notes/:id -d '{"title":"Updated"}' → 200
      4. DELETE /api/dm/notes/:id → 204
      5. GET /api/dm/notes → 200, items = []
    Expected Result: Full CRUD lifecycle works
    Evidence: .sisyphus/evidence/task-14-notes-crud.log
  ```

  **Commit**: YES
  - Message: `feat(api): add notes and initiative DB endpoints`
  - Files: `src/pages/api/dm/notes.ts`, `src/pages/api/dm/initiative.ts`
  - Pre-commit: `npm test src/pages/api/dm/notes.test.ts src/pages/api/dm/initiative.test.ts`

- [x] **15. Add AI Tab to Navigation**

  **What to do**:
  - Update `src/components/dm/DmTabs.astro`: Add "ИИ" tab with icon (✦) as 5th tab after dice, initiative, reference, notes.
  - Update `src/components/dm/DmSidebar.astro`: When AI tab is active, show AI generator list (NPC, placeholder for future generators).
  - Update hash-based routing: `#ai` routes to AI generator section.
  - For unauthenticated users: AI tab visible but shows "Sign in to use AI" CTA instead of generator form.
  - Update `src/i18n/dm-translations.ts` with new tab labels and CTA strings.
  - Update `src/pages/dm/index.astro` to render AI section conditionally.

  **Must NOT do**:
  - Remove existing dice/initiative/reference/notes tabs.
  - Show AI generator form to unauthenticated users.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Navigation updates using existing tab system.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 4)
  - **Parallel Group**: Wave 4
  - **Blocks**: Task 16 (NPC form needs tab to render in)
  - **Blocked By**: Task 9 (DmSidebar fix)

  **References**:
  - `src/components/dm/DmTabs.astro` — Hash-based tab navigation
  - `src/components/dm/DmSidebar.astro` — Sidebar with conditional rendering
  - `src/pages/dm/index.astro` — Main DM page layout
  - `src/i18n/dm-translations.ts` — Translation strings

  **Acceptance Criteria**:
  - [ ] Playwright: AI tab visible in navigation
  - [ ] Playwright: Clicking AI tab shows AI section
  - [ ] Playwright: Unauthenticated user sees "Sign in" CTA
  - [ ] Playwright: Authenticated user sees generator form

  **QA Scenarios**:
  ```
  Scenario: AI tab navigation
    Tool: Playwright
    Preconditions: User on /dm/
    Steps:
      1. Assert: Tab bar contains "ИИ" tab
      2. Click "ИИ" tab
      3. Assert: URL hash changes to #ai
      4. Assert: AI generator section is visible
    Expected Result: AI tab navigates to AI section
    Evidence: .sisyphus/evidence/task-15-ai-tab.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add AI tab to DM navigation`
  - Files: `src/components/dm/DmTabs.astro`, `src/components/dm/DmSidebar.astro`, `src/pages/dm/index.astro`, `src/i18n/dm-translations.ts`

- [ ] **16. Build NPC Generator Form Component**

  **What to do**:
  - Create `src/components/dm/AiNpcForm.astro`: Form for NPC generation parameters.
  - Fields:
    - Race: dropdown (Human, Elf, Dwarf, Halfling, Gnome, Half-Elf, Half-Orc, Tiefling, Dragonborn, Custom).
    - Role/Class: dropdown (Fighter, Wizard, Rogue, Cleric, Ranger, Paladin, Barbarian, Bard, Druid, Monk, Sorcerer, Warlock, Custom).
    - Party Level: number input (1-20, default 5).
    - Tone: dropdown (Heroic, Dark, Mysterious, Comic, Tragic, Noble, Sinister, Custom).
    - "Use Open5e Reference" checkbox (default checked).
  - Submit button: "✦ Сгенерировать персонажа" (disabled during generation).
  - Show loading state during generation (spinner + "Генерация...").
  - On success: emit event or call callback with NPC result.
  - On error: show error message (rate limit, auth error, generation failed).
  - Use existing `DmInput.astro` and `DmButton.astro` components.
  - Style with orange theme accents.

  **Must NOT do**:
  - Use purple color from mockup (keep orange theme).
  - Call AI API directly from client (always use server endpoint).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with forms, state, and interactions.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: None (standalone component)
  - **Blocked By**: Task 10 (generate API must exist), Task 15 (AI tab nav)

  **References**:
  - `src/components/dm/DmInput.astro` — Input component
  - `src/components/dm/DmButton.astro` — Button component
  - `src/components/dm/DmCard.astro` — Card container
  - `src/i18n/dm-translations.ts` — Form labels

  **Acceptance Criteria**:
  - [ ] Playwright: All form fields render and accept input
  - [ ] Playwright: Submit button disabled during generation
  - [ ] Playwright: Loading state visible during generation
  - [ ] Playwright: Error message shown on API failure

  **QA Scenarios**:
  ```
  Scenario: Generate NPC through form
    Tool: Playwright
    Preconditions: Authenticated FREE user on AI tab
    Steps:
      1. Select Race: "Elf"
      2. Select Role: "Wizard"
      3. Input Level: 5
      4. Select Tone: "Dark"
      5. Check "Use Open5e Reference"
      6. Click "Сгенерировать персонажа"
      7. Assert: Button disabled, spinner visible
      8. Assert: After ~5-10s, result card appears
    Expected Result: Form submits successfully and displays result
    Evidence: .sisyphus/evidence/task-16-form-submit.png

  Scenario: Rate limit error in form
    Tool: Playwright
    Preconditions: FREE user exhausted 7/7 limit
    Steps:
      1. Click "Сгенерировать персонажа"
      2. Assert: Error message "Лимит генераций исчерпан" visible
      3. Assert: Retry-after time displayed
    Expected Result: User-friendly rate limit error
    Evidence: .sisyphus/evidence/task-16-rate-limit-error.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add NPC generator form component`
  - Files: `src/components/dm/AiNpcForm.astro`

- [ ] **17. Build NPC Result Card Component**

  **What to do**:
  - Create `src/components/dm/AiNpcResult.astro`: Rich card displaying generated NPC.
  - Layout:
    - Header: Name + meta (race, class, level, CR) + action buttons (regenerate, copy JSON, favorite).
    - Stats row: HP, AC, Speed, CR (4-column grid).
    - Attributes: Appearance, Trait, Motivation, Secret (list with labels).
    - Story block: Backstory/history (italic, left orange border).
    - Tags: Skills, abilities, senses (pill chips).
  - Action buttons:
    - Regenerate: re-submit same params.
    - Copy JSON: copy raw NPC JSON to clipboard.
    - Favorite/Save: save to history (PRO only, shows upsell for FREE).
  - Sanitize all AI-generated text before rendering (use textContent or DOMPurify, NEVER innerHTML).
  - Responsive design: stack on mobile.
  - Style with orange theme.

  **Must NOT do**:
  - Use `innerHTML` for AI-generated content (XSS risk).
  - Use purple from mockup.
  - Show "favorite" button as functional for FREE users (show upsell instead).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component with multiple sections and interactions.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: None
  - **Blocked By**: Task 11 (history API)

  **References**:
  - `src/components/dm/DmCard.astro` — Card container
  - `src/components/dm/DmButton.astro` — Action buttons
  - Mockup reference: `/home/emil/Downloads/dm-dashboard-ai-mockup.html` — Layout inspiration

  **Acceptance Criteria**:
  - [ ] Playwright: Result card renders with all sections
  - [ ] Playwright: Copy JSON button copies valid JSON
  - [ ] Playwright: Regenerate button re-submits form
  - [ ] Playwright: No innerHTML used for AI content (inspect DOM)

  **QA Scenarios**:
  ```
  Scenario: NPC result card displays correctly
    Tool: Playwright
    Preconditions: NPC generated successfully
    Steps:
      1. Assert: Name visible in header
      2. Assert: Stats row shows HP, AC, Speed, CR
      3. Assert: Appearance, Trait, Motivation, Secret visible
      4. Assert: Story block has orange left border
      5. Assert: Tags rendered as pill chips
    Expected Result: Complete NPC card with all sections
    Evidence: .sisyphus/evidence/task-17-result-card.png

  Scenario: Copy NPC JSON to clipboard
    Tool: Playwright
    Preconditions: NPC result visible
    Steps:
      1. Click "Copy JSON" button
      2. Assert: Toast "Скопировано" appears
      3. Read clipboard content
      4. Assert: Content is valid JSON with npc fields
    Expected Result: JSON copied to clipboard
    Evidence: .sisyphus/evidence/task-17-copy-json.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add NPC result card component`
  - Files: `src/components/dm/AiNpcResult.astro`

- [ ] **18. Build Generation History Panel Component**

  **What to do**:
  - Create `src/components/dm/GenerationHistory.astro`: Right-panel list of generated NPCs.
  - For PRO users: fetch from `/api/dm/ai/history`, show last 20 items with name + timestamp.
  - For FREE users: show session-only history (from client-side array/sessionStorage).
  - FREE empty state: dashed border box with "История сохраняется только для PRO. Бесплатные генерации видны до конца сессии." + CTA to upgrade.
  - Clicking history item: loads that NPC into result card.
  - Active item highlighting.
  - Auto-update when new generation completes.
  - Style with orange theme.

  **Must NOT do**:
  - Fetch DB history for FREE users.
  - Show upgrade CTA to PRO users.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Panel with data fetching, conditional states, and interactions.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: None
  - **Blocked By**: Task 11 (history API)

  **References**:
  - `src/components/dm/DmCard.astro` — Panel container
  - `src/pages/api/dm/ai/history.ts` — History data source
  - Mockup reference: `/home/emil/Downloads/dm-dashboard-ai-mockup.html` — History panel layout

  **Acceptance Criteria**:
  - [ ] Playwright: PRO user sees DB history list
  - [ ] Playwright: FREE user sees session history or empty state with upsell
  - [ ] Playwright: Clicking history item loads NPC into result card
  - [ ] Playwright: New generation appends to history

  **QA Scenarios**:
  ```
  Scenario: PRO user sees persisted history
    Tool: Playwright
    Preconditions: PRO user with 3 generated NPCs in DB
    Steps:
      1. Navigate to AI tab
      2. Assert: History panel shows 3 items
      3. Assert: Each item shows name and timestamp
    Expected Result: PRO history loads from DB
    Evidence: .sisyphus/evidence/task-18-pro-history.png

  Scenario: FREE user sees upsell empty state
    Tool: Playwright
    Preconditions: FREE user, no session history
    Steps:
      1. Navigate to AI tab
      2. Assert: History panel shows dashed border upsell box
      3. Assert: Text contains "только для PRO"
    Expected Result: FREE user sees upgrade prompt
    Evidence: .sisyphus/evidence/task-18-free-upsell.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add generation history panel`
  - Files: `src/components/dm/GenerationHistory.astro`

- [ ] **19. Build Quota/Tier Badge Header Components**

  **What to do**:
  - Create `src/components/dm/QuotaBadge.astro`: Shows remaining generations this hour (e.g., "5 / 7").
  - Create `src/components/dm/TierBadge.astro`: Shows "FREE" or "PRO" with appropriate styling.
  - Add to `DmHeader.astro` or `AuthPanel.astro`: render badges next to user avatar.
  - Quota badge: query remaining quota from `src/lib/rate-limit.ts` (Task 8) via API endpoint or middleware injection.
  - Update quota after each generation (without page reload).
  - Color coding: FREE = gray outline, PRO = orange solid.
  - Update `src/i18n/dm-translations.ts` with badge labels.

  **Must NOT do**:
  - Show quota to unauthenticated users.
  - Show PRO badge to FREE users.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Small UI components with dynamic data.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: Task 5 (tier system), Task 8 (rate limiting)

  **References**:
  - `src/components/dm/AuthPanel.astro` — User avatar/name display
  - `src/components/dm/DmHeader.astro` — Header bar
  - Mockup reference: `/home/emil/Downloads/dm-dashboard-ai-mockup.html` — Badge styling

  **Acceptance Criteria**:
  - [ ] Playwright: FREE user sees "FREE" badge and "X / 7" quota
  - [ ] Playwright: PRO user sees "PRO" badge and "X / 100" quota
  - [ ] Playwright: Quota updates after generation without reload
  - [ ] Playwright: Unauthenticated user sees no badges

  **QA Scenarios**:
  ```
  Scenario: Quota badge updates after generation
    Tool: Playwright
    Preconditions: FREE user with 6/7 remaining
    Steps:
      1. Assert: Quota badge shows "6 / 7"
      2. Generate NPC
      3. Assert: Quota badge updates to "5 / 7" without page reload
    Expected Result: Quota decrements in real-time
    Evidence: .sisyphus/evidence/task-19-quota-update.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add quota and tier badge components`
  - Files: `src/components/dm/QuotaBadge.astro`, `src/components/dm/TierBadge.astro`, `src/components/dm/AuthPanel.astro`

- [ ] **20. Migrate Notes to DB for PRO + localStorage Fallback**

  **What to do**:
  - Update `src/components/dm/NotesPanel.astro`: Add tier-aware persistence.
  - For PRO users: load notes from `/api/dm/notes` on mount, save to API on change (debounced 500ms).
  - For FREE users: keep existing localStorage logic (`dm-notes` key).
  - Graceful handling: if API fails, fall back to localStorage with warning toast.
  - Add loading state while fetching from DB.
  - Update `src/lib/client/notes.ts`: Add server sync functions.
  - Write Playwright tests: PRO loads from DB, FREE uses localStorage, fallback on API error.

  **Must NOT do**:
  - Delete localStorage data when PRO user loads from DB (keep as backup).
  - Modify notes UI appearance (only persistence layer changes).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex dual-mode persistence with fallback and sync.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: Task 22 (import flow)
  - **Blocked By**: Task 5 (tier system), Task 14 (notes API)

  **References**:
  - `src/components/dm/NotesPanel.astro` — Current localStorage-only implementation
  - `src/lib/client/notes.ts` — Notes utilities
  - `src/pages/api/dm/notes.ts` — Notes API (Task 14)
  - Data migration key: `dm-notes` (localStorage)

  **Acceptance Criteria**:
  - [ ] Playwright: PRO user loads notes from DB on page open
  - [ ] Playwright: FREE user loads notes from localStorage
    - [ ] Playwright: Notes save to DB for PRO, localStorage for FREE
    - [ ] Playwright: API failure shows warning and falls back to localStorage

  **QA Scenarios**:
  ```
  Scenario: PRO user notes persist to DB
    Tool: Playwright
    Preconditions: PRO user logged in
    Steps:
      1. Type "Test note content" in notes textarea
      2. Wait 1 second (debounce)
      3. Reload page
      4. Assert: Notes textarea contains "Test note content"
      5. Query DB: SELECT content FROM notes WHERE user_id = ...
      6. Assert: DB contains "Test note content"
    Expected Result: PRO notes saved to and loaded from DB
    Evidence: .sisyphus/evidence/task-20-pro-notes-db.png

  Scenario: FREE user notes stay in localStorage
    Tool: Playwright
    Preconditions: FREE user logged in
    Steps:
      1. Type "Free note" in notes textarea
      2. Reload page
      3. Assert: Notes textarea contains "Free note"
      4. Query DB: SELECT * FROM notes WHERE user_id = ...
      5. Assert: Query returns zero rows
    Expected Result: FREE notes stay client-side only
    Evidence: .sisyphus/evidence/task-20-free-notes-local.png
  ```

  **Commit**: YES
  - Message: `feat(pro): add notes DB persistence for PRO users`
  - Files: `src/components/dm/NotesPanel.astro`, `src/lib/client/notes.ts`

- [ ] **21. Migrate Initiative to DB for PRO + sessionStorage Fallback**

  **What to do**:
  - Update `src/components/dm/InitiativeTracker.astro`: Add tier-aware persistence.
  - For PRO users: save/load initiative sessions from `/api/dm/initiative`.
  - For FREE users: keep existing sessionStorage logic (`dm-initiative` key with `it-combatants` fallback).
  - Do NOT persist `activeIndex` (keep in-memory as per decision).
  - Add "Save Session" button for PRO users (manual save, not auto-save like notes).
  - Add session list for PRO: load previous sessions, switch between them.
  - Graceful fallback: if API fails, keep using sessionStorage.
  - Write Playwright tests: PRO saves/loads sessions, FREE uses sessionStorage.

  **Must NOT do**:
  - Persist `activeIndex` to DB (product decision: keep current behavior).
  - Auto-save initiative (too frequent, manual save only for PRO).
  - Delete sessionStorage data on PRO save.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex stateful component with dual persistence modes.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: Task 22 (import flow)
  - **Blocked By**: Task 5 (tier system), Task 14 (initiative API)

  **References**:
  - `src/components/dm/InitiativeTracker.astro` — Current sessionStorage implementation
  - `src/lib/client/initiative.ts` — Initiative utilities
  - `src/pages/api/dm/initiative.ts` — Initiative API (Task 14)
  - Data migration keys: `dm-initiative`, `it-combatants` (legacy fallback)

  **Acceptance Criteria**:
  - [ ] Playwright: PRO user saves initiative session to DB
  - [ ] Playwright: PRO user loads previous session from list
  - [ ] Playwright: FREE user uses sessionStorage exclusively
  - [ ] Playwright: `activeIndex` resets on page reload (not persisted)

  **QA Scenarios**:
  ```
  Scenario: PRO user saves initiative session
    Tool: Playwright
    Preconditions: PRO user with 3 combatants in tracker
    Steps:
      1. Click "Save Session" button
      2. Enter session name: "Boss Fight"
      3. Click Save
      4. Reload page
      5. Assert: Session list shows "Boss Fight"
      6. Click "Boss Fight"
      7. Assert: 3 combatants loaded with correct initiative values
    Expected Result: PRO sessions persist to DB
    Evidence: .sisyphus/evidence/task-21-pro-initiative.png
  ```

  **Commit**: YES
  - Message: `feat(pro): add initiative DB persistence for PRO users`
  - Files: `src/components/dm/InitiativeTracker.astro`, `src/lib/client/initiative.ts`

- [ ] **22. Add FREE → PRO Data Import Flow**

  **What to do**:
  - Create import modal/dialog: when FREE user subscribes to PRO (tier changes to 'pro'), show "Import existing data?" prompt.
  - Read localStorage (`dm-notes`) and sessionStorage (`dm-initiative`) for current user.
  - Upload data to DB via existing API routes.
  - Show progress: "Importing notes... Done. Importing initiative sessions... Done."
  - Handle conflicts: if DB already has data, ask "Keep both / Replace / Skip".
  - Dismissible: user can skip import and keep localStorage data.
  - Write Playwright test: simulate tier upgrade, verify import flow.

  **Must NOT do**:
  - Delete localStorage/sessionStorage data during import (keep as backup).
  - Force import on every login (only on tier upgrade event).

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: User-facing flow with data migration and conflict handling.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 7)
  - **Parallel Group**: Wave 7
  - **Blocks**: None
  - **Blocked By**: Task 20 (notes DB), Task 21 (initiative DB)

  **References**:
  - `src/components/dm/NotesPanel.astro` — localStorage key: `dm-notes`
  - `src/components/dm/InitiativeTracker.astro` — sessionStorage keys: `dm-initiative`, `it-combatants`
  - `src/pages/api/dm/notes.ts`, `src/pages/api/dm/initiative.ts` — Import targets

  **Acceptance Criteria**:
  - [ ] Playwright: Import modal shows on tier upgrade
  - [ ] Playwright: Notes imported from localStorage to DB
  - [ ] Playwright: Initiative imported from sessionStorage to DB
  - [ ] Playwright: Skip import keeps data in localStorage

  **QA Scenarios**:
  ```
  Scenario: FREE user upgrades to PRO and imports data
    Tool: Playwright
    Preconditions: FREE user with localStorage notes and sessionStorage initiative
    Steps:
      1. Simulate tier upgrade (set user.tier = 'pro' in DB)
      2. Reload page
      3. Assert: Import modal visible
      4. Click "Import"
      5. Assert: Progress messages appear
      6. Assert: "Import complete" message
      7. Query DB: verify notes and initiative sessions exist
    Expected Result: Data migrated from client storage to DB
    Evidence: .sisyphus/evidence/task-22-import-flow.png
  ```

  **Commit**: YES
  - Message: `feat(pro): add FREE to PRO data import flow`
  - Files: `src/components/dm/ImportModal.astro` (new), related updates

- [ ] **23. Add Translate Button to Open5e Reference Cards**

  **What to do**:
  - Update `src/components/dm/Open5eReference.astro`: Add "Перевести" button to monster/spell/item detail cards.
  - Button state: "Перевести" → loading "Перевод..." → "Переведено" (after success).
  - Click: call `/api/dm/translate?slug={slug}&type={type}`.
  - On success: replace English text fields with Russian translation in the card.
  - On error: show toast "Ошибка перевода".
  - Available to ALL users including unauthenticated.
  - Cache translated content client-side (to avoid re-fetching on re-open).
  - Update `src/i18n/dm-translations.ts` with button labels.

  **Must NOT do**:
  - Require auth for translation.
  - Rate limit translation requests.
  - Auto-translate on card open (manual button only).

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI modification to existing component with API integration.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 5)
  - **Parallel Group**: Wave 5
  - **Blocks**: Task 24 (wiring)
  - **Blocked By**: Task 12 (translation API)

  **References**:
  - `src/components/dm/Open5eReference.astro` — Detail card component
  - `src/pages/api/dm/translate.ts` — Translation API (Task 12)
  - `src/i18n/dm-translations.ts` — Button labels

  **Acceptance Criteria**:
  - [ ] Playwright: "Перевести" button visible on detail card
    - [ ] Playwright: Clicking button shows loading state then "Переведено"
    - [ ] Playwright: Translated text appears in card
    - [ ] Playwright: Works without authentication

  **QA Scenarios**:
  ```
  Scenario: Translate monster card
    Tool: Playwright
    Preconditions: Open5e detail card open for "Goblin"
    Steps:
      1. Assert: "Перевести" button visible
      2. Click button
      3. Assert: Button text changes to "Перевод..."
      4. Wait 3-5 seconds
      5. Assert: Button text changes to "Переведено"
      6. Assert: Description text is in Russian
    Expected Result: Monster card translated to Russian
    Evidence: .sisyphus/evidence/task-23-translate-button.png

  Scenario: Translation cache works
    Tool: Playwright
    Preconditions: Goblin already translated
    Steps:
      1. Close and reopen Goblin detail card
      2. Click "Перевести"
      3. Assert: Translation appears instantly (< 500ms)
    Expected Result: Cached translation served quickly
    Evidence: .sisyphus/evidence/task-23-translation-cache.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add translate button to Open5e reference cards`
  - Files: `src/components/dm/Open5eReference.astro`

- [ ] **24. Wire Translation Service to UI**

  **What to do**:
  - Create `src/lib/client/translation.ts`: Client-side translation cache and API caller.
  - Cache structure: Map or object keyed by `slug:type`.
  - Functions: `translateEntity(slug, type)`, `getCachedTranslation(slug, type)`, `clearTranslationCache()`.
  - Integrate with `Open5eReference.astro` (called by Task 23).
  - Handle errors gracefully: network failure, API error, invalid response.
  - Add cross-tab sync: if translation is fetched in one tab, other tabs should know (BroadcastChannel or storage event).
  - Write unit tests for client cache.

  **Must NOT do**:
  - Call translation API directly from component (use service layer).
  - Store translations in localStorage (keep in memory only; DB is server cache).

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Thin client service with caching.
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (within Wave 6)
  - **Parallel Group**: Wave 6
  - **Blocks**: None
  - **Blocked By**: Task 12 (translation API), Task 23 (translate button)

  **References**:
  - `src/pages/api/dm/translate.ts` — Translation API
  - `src/lib/open5e/cache.ts` — Client caching pattern to follow
  - `src/components/dm/Open5eReference.astro` — Integration point

  **Acceptance Criteria**:
  - [ ] `npm test src/lib/client/translation.test.ts` → PASS
    - [ ] Client cache returns hit instantly
    - [ ] API call only on cache miss
    - [ ] Error handling works gracefully

  **QA Scenarios**:
  ```
  Scenario: Client translation cache hit
    Tool: Bash (node REPL)
    Preconditions: Cache warmed with goblin translation
    Steps:
      1. Call getCachedTranslation('goblin', 'creature')
      2. Assert: Returns cached object instantly
      3. Assert: No network request made
    Expected Result: Client cache serves without API call
    Evidence: .sisyphus/evidence/task-24-client-cache.log
  ```

  **Commit**: YES
  - Message: `feat(ui): wire translation service to Open5e reference`
  - Files: `src/lib/client/translation.ts`
  - Pre-commit: `npm test src/lib/client/translation.test.ts`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(auth): resolve all auth anti-patterns` — jwt.ts, oauth.ts, logout.ts, middleware/index.ts
- **Wave 2**: `feat(db): add AI and PRO tables with migration` — schema.ts, drizzle/
- **Wave 3**: `feat(ai): add OpenRouter and Kimi API clients` — src/lib/ai/
- **Wave 4**: `feat(api): add NPC generation, history, and translation routes` — src/pages/api/dm/
- **Wave 5**: `feat(ui): add AI generator components and navigation` — src/components/dm/
- **Wave 6**: `feat(pro): add notes and initiative DB persistence for PRO` — src/components/dm/, src/pages/api/dm/
- **Wave FINAL**: `chore(qa): final verification and fixes` — various

---

## Success Criteria

### Verification Commands
```bash
# Auth fixes
npm test src/lib/auth/          # Expected: all auth tests pass

# DB migration
npm run db:migrate               # Expected: applies cleanly, zero errors

# NPC generation API (FREE tier)
curl -X POST http://localhost:4321/api/dm/ai/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=..." \
  -d '{"race":"elf","role":"wizard","level":5,"tone":"dark"}' \
  | jq '.npc.name, .npc.hp, .npc.ac'  # Expected: valid JSON with name, hp, ac fields

# Rate limiting
curl -w "%{http_code}" http://localhost:4321/api/dm/ai/generate \
  -H "Cookie: auth_token=FREE_USER_TOKEN"  # Run 8 times. Expected: 429 on 8th

# Translation cache
curl "http://localhost:4321/api/dm/translate?slug=goblin&type=creature" \
  | jq '.translated'  # Expected: Russian text

# Type check
npm run build                    # Expected: zero TypeScript errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Auth regression tests pass (login/logout flow intact)
- [ ] No AI API keys in client bundles
- [ ] Rate limiting correctly enforces tier limits
- [ ] Boosty verification cache works (5 min TTL)
- [ ] DB migrations are reversible
- [ ] Evidence files exist for all QA scenarios
