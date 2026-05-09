# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Randify is a bilingual (EN/RU) static site (Astro 4 + Tailwind CSS 4) hosting random-value generators. All 10 generators are live. Deployed to randify.pro on reg.ru via GitHub Actions + rsync on push to `main`.

## Commands

```bash
npm run dev       # Dev server (localhost:4321)
npm run build     # Static build → dist/
npm run preview   # Serve the built dist/ locally
```

**Docker (production):** multi-stage build with Node 20, served via `nginx:alpine` with pretty URLs.

```bash
docker build -t randify .
docker run -p 8080:80 randify
```

No test runner or linter is configured.

## Adding a new generator

Every new generator must be created in **both English and Russian simultaneously**.

1. **`src/data/generators.ts`** — add an entry with all fields: `slug`, `title`, `description`, `icon`, `status: 'live'`, `seoTitle`, `seoDescription`, `ruTitle`, `ruDescription`, `ruSeoTitle`, `ruSeoDescription`.

2. **`src/components/generators/<Name>Generator.astro`** — the interactive component. Language detection pattern:
   - Frontmatter: `const isRu = Astro.url.pathname.startsWith('/ru'); const T = useT(isRu ? 'ru' : 'en');`
   - Client script: `const isRu = document.documentElement.lang === 'ru';`
   - Use `T.*` keys for all user-visible strings in the template; use `isRu` ternaries in the `<script>` block.

3. **`src/pages/generators/<slug>.astro`** — English page with `<BaseLayout lang="en">`.

4. **`src/pages/ru/generators/<slug>.astro`** — Russian page with `<BaseLayout lang="ru">`, `ruSeoTitle`/`ruSeoDescription`, breadcrumb back to `/ru/`, Russian `<SeoBlock>` content.

**Critical:** Never use a shared dynamic `[slug].astro` for Russian pages. Astro bundles scripts from all imported components — using a single file that imports all 10 generators causes every Russian page to run all 10 scripts, breaking them. Each page must be its own file importing only its generator.

## i18n system

- **`src/i18n/translations.ts`** — central `en`/`ru` translation objects. All UI strings (labels, buttons, errors, copy/copied feedback) live here. `useT(lang)` returns the typed translation object.
- **`src/components/LanguageSwitcher.astro`** — fixed top-right EN/RU toggle; persists choice in `localStorage('lang-pref')`.
- **`src/layouts/BaseLayout.astro`** — accepts `lang` prop (`'en' | 'ru'`), sets `<html lang>`, injects `hreflang` alternates, and includes auto-redirect script (first visit, Russian browser → `/ru/`).
- English pages: `/generators/<slug>/` — Russian pages: `/ru/generators/<slug>/`

## Key conventions

- Accent color: `#534AB7` (CSS var `--accent` in BaseLayout).
- All SVG icons are inlined strings in the `icons` map inside `GeneratorCard.astro`; add new ones there.
- `GeneratorCard.astro` accepts `lang` prop — pass `lang="ru"` on Russian pages to get `ruTitle`/`ruDescription` and `/ru/` links.
- `SeoBlock.astro` accepts `lang` prop for translated "How to use" / "When to use" headers.
- `AdBanner.astro` randomises between two Yandex referral links; three size variants: `leaderboard`, `rectangle`, `tile`.
- Yandex Metrika counter (ID 109130319) is in `BaseLayout.astro`.
- No client-side router — each generator is a separate static HTML page.
