# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Randify is a bilingual (EN/RU) static site (Astro 4 + Tailwind CSS 4) hosting random-value generators. All 10 generators are live. Deployed to randify.pro on reg.ru via GitHub Actions + rsync on push to `main`.

**i18n is handled via Astro's built-in i18n routing.** English pages live at `src/pages/`, Russian pages at `src/pages/ru/`. Both share identical templates because `BaseLayout`, `GeneratorLayout`, and components derive the active locale from `Astro.currentLocale`.

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

1. **`src/content/generators/<slug>.json`** — create a JSON file with all fields: `slug`, `title`, `description`, `icon`, `status`, `seoTitle`, `seoDescription`, `ruTitle`, `ruDescription`, `ruSeoTitle`, `ruSeoDescription`, `pageTitle`, `ruPageTitle`, `howTo`, `whenTo`, `ruHowTo`, `ruWhenTo`. The schema is defined in `src/lib/generator-schema.ts` and validated automatically at build time via Zod (`.strict()` — unknown fields will fail the build).

2. **`src/components/generators/<Name>Generator.astro`** — the interactive component. Language detection pattern:
   - Frontmatter: `const isRu = Astro.url.pathname.startsWith('/ru'); const T = useT(isRu ? 'ru' : 'en');`
   - Client script: `const isRu = document.documentElement.lang === 'ru';`
   - Use `T.*` keys for all user-visible strings in the template; use `isRu` ternaries in the `<script>` block.

3. **`src/pages/generators/<slug>.astro`** — create the page using `GeneratorLayout`:
   ```astro
   ---
   import GeneratorLayout from '@/layouts/GeneratorLayout.astro';
   import <Name>Generator from '@/components/generators/<Name>Generator.astro';
   import { generators } from '@/data/generators';

   const generator = generators.find((g) => g.slug === '<slug>')!;
   ---

   <GeneratorLayout generator={generator}>
     <<Name>Generator />
   </GeneratorLayout>
   ```

4. **`src/pages/ru/generators/<slug>.astro`** — **copy the English file exactly**. Because both files use `@/` path aliases and `GeneratorLayout` derives the locale from `Astro.currentLocale`, the file content is identical for both languages.

**Critical:** Never use a shared dynamic `[slug].astro` for Russian pages. Astro bundles scripts from all imported components — using a single file that imports all 10 generators causes every Russian page to run all 10 scripts, breaking them. Each page must be its own file importing only its generator.

## i18n system

- **`src/i18n/translations.ts`** — central `en`/`ru` translation objects. All UI strings (labels, buttons, errors, copy/copied feedback) live here. `useT(lang)` returns the typed translation object.
- **`src/components/LanguageSwitcher.astro`** — fixed top-right EN/RU toggle; persists choice in `localStorage('lang-pref')`.
- **`src/layouts/BaseLayout.astro`** — accepts `lang` prop (`'en' | 'ru'`), sets `<html lang>`, injects `hreflang` alternates, and includes auto-redirect script (first visit, Russian browser → `/ru/`).
- English pages: `/generators/<slug>/` — Russian pages: `/ru/generators/<slug>/`
- Path aliases `@/*` resolve to `src/*` and are used in all page files so EN and RU templates can be identical.
- `GeneratorLayout.astro` wraps every generator page: breadcrumb, header, AdBanner, SeoBlock, and slot for the interactive component.

## Key conventions

- Accent color: `#534AB7` (CSS var `--accent` in BaseLayout).
- All SVG icons are inlined strings in the `icons` map inside `GeneratorCard.astro`; add new ones there.
- `GeneratorCard.astro` auto-detects locale from `Astro.currentLocale` when no `lang` prop is passed.
- `SeoBlock.astro` accepts `lang` prop for translated "How to use" / "When to use" headers.
- `AdBanner.astro` randomises between two Yandex referral links; three size variants: `leaderboard`, `rectangle`, `tile`.
- Yandex Metrika counter (ID `109130319`) and Top.Mail.Ru counter (ID `3765043`) live in `src/components/Analytics.astro`. IDs are configured in `src/data/config.ts` and injected via `define:vars`.
- No client-side router — each generator is a separate static HTML page.
