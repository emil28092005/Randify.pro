# Randify.pro — Knowledge Base

**Stack:** Astro 4 + Tailwind CSS 4 + TypeScript + PostgreSQL (Drizzle ORM)
**Deploy:** Docker Compose (app + postgres) on VPS, nginx reverse proxy, Let's Encrypt SSL

## Overview

Bilingual (EN/RU) static/hybrid site hosting random-value generators (10 live). Recently expanded with **DM Dashboard** — a server-rendered OAuth-authenticated subdomain (`/dm/`) with dice roller, initiative tracker, Open5e reference, and notes.

## Structure

```
/
├── src/
│   ├── pages/           # Astro pages (EN + RU mirrors)
│   │   ├── api/auth/    # OAuth 2.1 + PKCE (VK ID + Yandex)
│   │   ├── generators/  # Static generator pages
│   │   ├── dm/          # DM Dashboard (server-rendered, prerender=false)
│   │   └── ru/          # Russian mirror pages
│   ├── components/
│   │   ├── generators/  # Interactive generator components (see sub-AGENTS)
│   │   └── dm/          # DM Dashboard UI (see sub-AGENTS)
│   ├── layouts/         # BaseLayout, GeneratorLayout, DmLayout
│   ├── lib/
│   │   ├── auth/        # JWT, OAuth configs, session utils
│   │   ├── client/      # Browser utilities (dice, animations, random)
│   │   └── open5e/      # Open5e API client + cache
│   ├── db/              # Drizzle schema, migrations, client
│   ├── i18n/            # Translations (en/ru) + DM translations
│   ├── content/         # Astro Content Collections (generators, blog)
│   └── data/            # Static data (generator list, config)
├── tests/               # Vitest + Playwright tests
├── drizzle/             # SQL migrations
├── docker-compose.yml   # App + PostgreSQL production setup
└── .github/workflows/   # CI/CD deploy via rsync
```

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add new generator | `src/content/generators/`, `src/components/generators/`, `src/pages/generators/` | Must create EN + RU simultaneously |
| Fix OAuth | `src/pages/api/auth/`, `src/lib/auth/`, `src/middleware/index.ts` | VK ID uses `id.vk.ru`, Yandex uses `oauth.yandex.com` |
| DB schema change | `src/db/schema.ts` → `drizzle/` | Run `npm run db:generate` then migrate |
| DM Dashboard UI | `src/components/dm/`, `src/pages/dm/` | Orange theme `#E87722`, RU-only |
| i18n strings | `src/i18n/translations.ts`, `src/i18n/dm-translations.ts` | `useT(lang)` returns typed object |
| Production deploy | `.github/workflows/deploy.yml`, `docker-compose.yml` | GitHub Actions → rsync → Docker Compose restart |

## Conventions

- **Path aliases:** `@/*` → `src/*` used everywhere
- **i18n routing:** Astro built-in. `Astro.currentLocale` drives locale. EN pages at root, RU under `/ru/`
- **Generator pages:** Each generator has its own `.astro` page file (never dynamic `[slug].astro` for generators — Astro bundles all imported scripts)
- **Color system:** `var(--accent)` in BaseLayout = `#534AB7` (purple). DM Dashboard overrides to `#E87722` (orange) via `.dm-theme` CSS class
- **Auth cookie name:** `auth_token` (unified across OAuth callback, middleware, logout)
- **DB connection:** `process.env.DATABASE_URL` — must match docker-compose `postgres` service hostname inside containers

## Anti-Patterns

- **Dynamic `[slug].astro` for generators:** Forbidden. Each generator must have its own page file to avoid script bundling issues
- **Using `url.origin` in OAuth callbacks:** Broken behind nginx proxy. Always use `process.env.PUBLIC_APP_URL || url.origin`
- **Joining multiple `Set-Cookie` with comma:** Browsers reject this. Use `Headers.append()` for each cookie
- **`SameSite=Strict` on session cookie:** Breaks cross-site OAuth redirects. Use `SameSite=Lax` + `Secure`
- **Static `prerender` for DM pages:** Middleware won't run, `Astro.locals.user` stays `null`. DM pages MUST have `export const prerender = false`
- **`Math.random()` for cryptographic purposes:** Generators should use `crypto.getRandomValues()` via `src/lib/client/random.ts`
- **Importing `import.meta.env` in server code:** Use `process.env` for server-side secrets (OAuth, JWT, DB)
- **Unknown fields in generator JSON:** `src/lib/generator-schema.ts` uses Zod `.strict()`. Any unknown field breaks the build
- **Unescaped `innerHTML` with user input:** Generators use `innerHTML` extensively. Always escape user input via `escapeHtml()` (currently duplicated in 3 files — consolidate to `src/lib/client/`)
- **OAuth empty-string fallbacks:** `process.env.VK_CLIENT_ID || ''` silently produces invalid requests. Validate env vars explicitly or fail fast
- **JWT secret non-null assertion:** `process.env.JWT_SECRET!` in `src/lib/auth/jwt.ts` crashes at runtime if env var is missing

## Commands

```bash
npm run dev          # Dev server (localhost:4321)
npm run build        # Static + server build → dist/
npm run preview      # Preview built dist/
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Run migrations
```

## Notes

- **No test runner or linter** configured in CI (per CLAUDE.md)
- **Health endpoint** (`/api/health`) checks DB connectivity via `SELECT 1`
- **Analytics:** Yandex Metrika + Top.Mail.Ru counters, IDs in `src/data/config.ts`
- **Service Worker** registered in BaseLayout for PWA support
- **Blog** uses Astro Content Collections with MDX/Markdown
- **Dockerfile** is single-stage Node 20 Alpine (not multi-stage as CLAUDE.md claims)
- **ESLint override:** `public/sw.js` has `@typescript-eslint/no-unused-vars` disabled for service worker globals
- **Zero TODO/FIXME/HACK markers** in source code — codebase is clean
- **Explicit prerender required:** Hybrid output mode means every `.astro` page MUST declare `export const prerender = true/false`
