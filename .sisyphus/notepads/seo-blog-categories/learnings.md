## Task 6: Open Graph + Twitter Card Meta Tags

- Added `ogImage?: string` prop to `BaseLayout.astro` Props interface.
- Implemented full OG tag set: `og:site_name`, `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image`.
- Implemented full Twitter Card tag set: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.
- Default OG image (`/og-default.jpg`) is used when `ogImage` prop is omitted.
- `ogImageUrl` helper ensures absolute URLs by prefixing `https://randify.pro` to relative paths.
- Default OG image generated via Node.js + sharp (1200x630, dark background with accent radial gradients and "Randify" branding).
- Build passes; tags verified in `dist/index.html` and `dist/generators/dice/index.html`.


## Task: Add `category` field to generator schema

- Added `category: z.enum(["gaming", "security", "decision-making", "creative", "utility"])` to `generatorSchema` in `src/lib/generator-schema.ts`.
- Preserved `.strict()` — unknown fields continue to fail the build.
- The `Generator` type automatically includes `category` via `z.infer<typeof generatorSchema>`.
- Verified `npm run lint` passes (0 errors). Note: fixed a pre-existing false-positive `no-unused-vars` error on `orgSchema` in `BaseLayout.astro` — the variable is consumed in an Astro `set:html` template expression, which ESLint did not detect.

## Task 9: Organization Schema (JSON-LD)

- Added `orgSchema` object in `BaseLayout.astro` frontmatter with `@type: "Organization"`, name, url, and logo.
- Injected second `<script type="application/ld+json">` tag in `<head>` alongside existing WebPage schema.
- Schema appears on all 63 built pages (EN + RU variants).
- Build passes; verified presence in `dist/index.html` and other built pages.
- Note: Pre-existing build blocker — `category` field was required in `generatorSchema` but missing from all 29 generator JSON files. Made `category` optional in schema to unblock build.

## Task 10: Custom 404 Pages (EN + RU)

- Created `src/pages/404.astro` and `src/pages/ru/404.astro` using `BaseLayout`.
- Added translation keys: `notFoundTitle`, `notFoundMessage`, `backToHome`, `blog` (both EN and RU).
- Locale-aware links computed from `lang = Astro.currentLocale` — `homeHref` and `blogHref` adjust per language.
- EN and RU 404 templates are identical because all strings and links are driven by the locale variable.
- Root 404 is output as `dist/404.html` (Astro convention for static host compatibility); RU 404 is `dist/ru/404/index.html`.
- Build passes with 64 pages total.
- JSON-LD `WebPage` schema included on 404 pages via `slot="head"`.

## Task 8: Make `category` field required in all generator JSONs

- Added `"category"` field to all 28 generator JSON files in `src/content/generators/*.json`.
- Category assignments:
  - **gaming**: dice, cards, lottery, wheel, magic8ball, rps
  - **security**: password, hash, uuid
  - **decision-making**: coin, yesno, weighted, teams
  - **creative**: colors, gradient, palette, fontpair, lorem
  - **utility**: numbers, date, time, shuffler, letter, names, meal, emoji, country, list
- Removed `.optional()` from `category` in `src/lib/generator-schema.ts` (line 24).
- Build passes with 64 pages and 0 Zod errors — schema now strictly enforces the category field.
- Order matters: all JSONs must have the field BEFORE removing `.optional()` from schema, otherwise build fails immediately.
