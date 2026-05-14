# SEO + Blog + Categories for Randify.pro

## TL;DR

> **Quick Summary**: Improve Randify.pro's SEO and content depth to pass Yandex Partner Network (РСЯ) moderation and attract organic search traffic. Fix critical SEO gaps (Open Graph, hreflang, thin content signals), add a bilingual blog with Astro Content Collections, categorize all 28 generators, and enrich page structure with breadcrumbs and related content.
>
> **Deliverables**:
> - Fixed SEO metadata (OG tags, Twitter Cards, x-default hreflang, sitemap i18n)
> - Blog infrastructure (content collections, layouts, pages, RSS feeds for EN + RU)
> - 8 blog post templates with correct frontmatter (EN + RU)
> - 5 category pages for generators (EN + RU)
> - Visual breadcrumbs component
> - Related generators + related posts components
> - Custom 404 page
> - Fixed data integrity issues (duplicate JSON keys)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 6 waves
> **Critical Path**: Wave 1 (fixes) → Wave 2 (schema) → Wave 3 (blog) → Wave 4 (categories) → Wave 5 (content) → Wave FINAL

---

## Context

### Original Request
User was rejected by Yandex Partner Network (РСЯ) without reason specified. Wants organic search traffic instead of paid ads. Needs SEO improvements + blog + generator categorization.

### Interview Summary
**Key Discussions**:
- Rejection reason unknown; SEO audit identified thin content as primary suspect
- Blog articles about randomness topics; user will generate content via neural networks
- 5 categories confirmed: Gaming, Security, Decision Making, Creative, Utility
- Initial batch: 8 blog post templates with placeholder content

**Research Findings**:
- SEO audit (explore agent): 8 CRITICAL issues including missing OG tags, thin content, duplicate JSON keys, missing `<main>` landmarks
- Blog best practices (librarian): Astro Content Collections with Zod, `/blog/[slug]` routing, `@astrojs/rss`, `BlogPosting` schema

### Metis Review
- No gaps identified after user confirmation of categories and content workflow

---

## Work Objectives

### Core Objective
Improve Randify.pro's SEO and content depth to pass Yandex Partner Network (РСЯ) moderation and attract organic search traffic.

### Concrete Deliverables
- `src/layouts/BaseLayout.astro` — updated with OG tags, Twitter Cards, x-default hreflang
- `astro.config.mjs` — sitemap with i18n hreflang annotations
- `src/content/config.ts` — content collections with blog + generator schemas
- `src/lib/generator-schema.ts` — updated with `category` field
- 28 updated `src/content/generators/*.json` files with category assignments
- Fixed `dice.json`, `list.json`, `colors.json` (duplicate keys merged)
- `src/pages/blog/[slug].astro` + `src/pages/ru/blog/[slug].astro` — blog post pages
- `src/pages/blog/index.astro` + `src/pages/ru/blog/index.astro` — blog index pages
- `src/pages/rss.xml.ts` + `src/pages/ru/rss.xml.ts` — RSS feeds
- `src/layouts/BlogLayout.astro` — blog-specific layout with `BlogPosting` schema
- `src/components/Breadcrumbs.astro` — visual breadcrumb navigation
- `src/components/RelatedGenerators.astro` — cross-link box for generator pages
- `src/components/RelatedPosts.astro` — tag-based related posts for blog
- 5 category pages: `src/pages/generators/category/[category].astro` + RU mirror
- `src/pages/404.astro` + `src/pages/ru/404.astro` — custom 404 pages
- 8 blog post templates in `src/content/blog/en/` and `src/content/blog/ru/`

### Definition of Done
- [ ] `npm run build` → 70+ pages (62 existing + blog + categories + 404)
- [ ] `npm run lint` → 0 errors
- [ ] OG tags present on all page types (verified via grep on build output)
- [ ] RSS feeds accessible at `/rss.xml` and `/ru/rss.xml`
- [ ] All 28 generators have category assigned
- [ ] No duplicate keys in any generator JSON
- [ ] Blog index and post pages render correctly
- [ ] Category pages filter generators correctly

### Must Have
- Open Graph and Twitter Card meta tags on every page
- x-default hreflang annotation
- Sitemap with hreflang alternates
- Blog content collections with Zod schema
- RSS feeds for both EN and RU
- 5 category pages with generator filtering
- Visual breadcrumbs on generator and blog pages
- Related generators on each generator page
- Custom 404 page with navigation
- Fixed duplicate JSON keys in dice.json, list.json, colors.json
- `<main>` landmarks on about/privacy pages
- Blog post templates with correct frontmatter structure

### Must NOT Have (Guardrails)
- Do NOT remove YandexRTB or AdBanner components
- Do NOT change generator interactive behavior
- Do NOT break existing build (must maintain all existing pages)
- Do NOT add external SEO tools or services
- Do NOT write full blog article content (user generates via neural networks)
- Do NOT use dynamic `[slug].astro` for generator pages (maintain separate EN/RU files)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest, eslint)
- **Automated tests**: NO (infrastructure work, no new utilities requiring TDD)
- **Agent QA**: YES — every task includes agent-executed verification scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios.
- **Build verification**: `npm run build` → count pages, check for errors
- **Lint verification**: `npm run lint` → 0 errors
- **HTML inspection**: grep build output for OG tags, schema markup, hreflang
- **Functional verification**: curl or playwright to verify blog/category pages render

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation fixes — can start immediately):
├── Task 1: Fix duplicate JSON keys in 3 generator files [quick]
├── Task 2: Fix <main> landmarks on about/privacy pages [quick]
├── Task 3: Fix ad placement on homepage [quick]
├── Task 4: Add x-default hreflang to BaseLayout [quick]
├── Task 5: Fix sitemap i18n config in astro.config.mjs [quick]
└── Task 6: Add Open Graph + Twitter Card meta tags [quick]

Wave 2 (Schema + data — after Wave 1):
├── Task 7: Update generatorSchema.ts with category field [quick]
├── Task 8: Update all 28 generator JSON files with categories [quick]
├── Task 9: Add Organization schema to BaseLayout [quick]
└── Task 10: Create custom 404 page [visual-engineering]

Wave 3 (Blog infrastructure — after Wave 2):
├── Task 11: Install @astrojs/rss, set up content collections config [quick]
├── Task 12: Create BlogLayout.astro with BlogPosting schema [visual-engineering]
├── Task 13: Create blog post page EN ([slug].astro) [unspecified-high]
├── Task 14: Create blog post page RU ([slug].astro) [unspecified-high]
├── Task 15: Create blog index pages (EN + RU) [unspecified-high]
└── Task 16: Create RSS feeds (EN + RU) [quick]

Wave 4 (Categories + content + related components — after Wave 2 + 3):
├── Task 17: Create category pages for generators (EN + RU) [unspecified-high]
├── Task 18: Add category navigation to homepage [visual-engineering]
├── Task 19: Create Breadcrumbs component [visual-engineering]
├── Task 20: Create RelatedGenerators component [unspecified-high]
├── Task 21: Create RelatedPosts component [unspecified-high]
├── Task 22: Create 8 blog post templates EN [writing]
├── Task 23: Create 8 blog post templates RU [writing]
└── Task 24: Add blog link to navigation [quick]

Wave 5 (Integration — after Wave 4):
├── Task 25: Add related generators to generator pages [unspecified-high]
└── Task 26: Add breadcrumbs to generator and blog layouts [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Wave 1 → Wave 2 → Wave 3 + Wave 4 (parallel) → Wave 5 → F1-F4 → user okay
Parallel Speedup: Waves 3 and 4 run in parallel after Wave 2. Wave 4 absorbs blog content tasks.
Max Concurrent: 6 (Wave 1), 4 (Wave 2), 6 (Wave 3), 8 (Wave 4), 2 (Wave 5)
```

### Dependency Matrix

- **1-6**: None → 7-10
- **7-10**: 1-6 → 11-24
- **11-16**: 7-10 → 22-24, 25-26
- **17-21**: 7-10, 11-16 → 25-26
- **22-24**: 11-16 → 25-26 (content ready for integration)
- **25-26**: 17-21, 22-24 → F1-F4
- **F1-F4**: 25-26 → user okay

---

## TODOs

- [x] 1. Fix duplicate JSON keys in 3 generator files

  **What to do**:
  - Read `src/content/generators/dice.json`, `list.json`, `colors.json`
  - Each file has duplicate `faq` and `ruFaq` keys (second pair overwrites first)
  - Merge both FAQ blocks into single `faq` and single `ruFaq` arrays
  - Verify with `npm run build` that no Zod `.strict()` errors occur

  **Must NOT do**:
  - Do NOT delete any FAQ content — merge both blocks
  - Do NOT change other generator JSON files

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/content/generators/dice.json` — duplicate keys at lines 29-37 and 53-57
  - `src/content/generators/list.json` — duplicate keys at lines 27-31 and 48-52
  - `src/content/generators/colors.json` — duplicate keys at lines 26-35 and 46-55
  - `src/lib/generator-schema.ts` — `.strict()` will throw on unknown fields

  **Acceptance Criteria**:
  - [ ] `dice.json`, `list.json`, `colors.json` have single `faq` and single `ruFaq` keys
  - [ ] All original FAQ items preserved (merged, not deleted)
  - [ ] `npm run build` → PASS (0 Zod errors)

  **QA Scenarios**:
  ```
  Scenario: Build passes after JSON fix
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Assert: no Zod validation errors for dice/list/colors
    Expected Result: 62 pages built successfully
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 2. Fix `<main>` landmarks on about/privacy pages

  **What to do**:
  - Update `src/pages/about.astro` and `src/pages/ru/about.astro`: wrap primary content in `<main>`
  - Update `src/pages/privacy.astro` and `src/pages/ru/privacy.astro`: wrap primary content in `<main>`
  - Ensure `<main>` contains the actual content, not the breadcrumb nav

  **Must NOT do**:
  - Do NOT change content or styling
  - Do NOT affect generator pages (they already have `<main>`)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/pages/about.astro` — lines 21-94, no `<main>` tag
  - `src/pages/privacy.astro` — lines 11-84, no `<main>` tag
  - `src/layouts/GeneratorLayout.astro` — lines 113-116, correct `<main>` usage

  **Acceptance Criteria**:
  - [ ] About page (EN + RU) has `<main>` landmark
  - [ ] Privacy page (EN + RU) has `<main>` landmark
  - [ ] `npm run lint` → PASS

  **QA Scenarios**:
  ```
  Scenario: HTML validation shows main landmarks
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Grep dist/about/index.html for '<main>'
      3. Grep dist/privacy/index.html for '<main>'
      4. Grep dist/ru/about/index.html for '<main>'
    Expected Result: Each file contains exactly one <main> tag
    Evidence: .sisyphus/evidence/task-2-main.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 3. Fix ad placement on homepage

  **What to do**:
  - In `src/pages/index.astro`, move `<YandexRTB />` from line 50 (before `<main>`) to after the `<main>` catalog content
  - Ensure ad appears below the generator grid, not above it

  **Must NOT do**:
  - Do NOT remove YandexRTB component
  - Do NOT change YandexRTB component itself

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/pages/index.astro` — line 50: `<YandexRTB />` before `<main>`
  - `src/components/YandexRTB.astro` — ad block component

  **Acceptance Criteria**:
  - [ ] YandexRTB renders after `<main>` content on homepage
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Ad placement is after main content
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Read dist/index.html
      3. Assert: <main> appears before YandexRTB ad block div
    Expected Result: Ad block is after the generator catalog grid
    Evidence: .sisyphus/evidence/task-3-ad.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 4. Add x-default hreflang to BaseLayout

  **What to do**:
  - In `src/layouts/BaseLayout.astro`, add `<link rel="alternate" hreflang="x-default" href={enUrl} />` after the existing en/ru hreflang links
  - The x-default should point to the English version as the fallback

  **Must NOT do**:
  - Do NOT remove existing en/ru hreflang links
  - Do NOT change canonical URL logic

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/layouts/BaseLayout.astro` — lines 48-50: canonical + hreflang
  - Google hreflang guidelines: x-default points to fallback page

  **Acceptance Criteria**:
  - [ ] x-default hreflang link present in all page `<head>` elements
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: x-default hreflang present in output
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Grep dist/index.html for 'hreflang="x-default"'
      3. Grep dist/generators/dice/index.html for 'hreflang="x-default"'
    Expected Result: Both files contain x-default hreflang link
    Evidence: .sisyphus/evidence/task-4-hreflang.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 5. Fix sitemap i18n config

  **What to do**:
  - Update `astro.config.mjs`: pass `i18n` option to `sitemap()` integration
  - Configuration: `sitemap({ i18n: { defaultLocale: "en", locales: { en: "en-US", ru: "ru-RU" } } })`
  - Verify build output includes `<xhtml:link rel="alternate" hreflang="...">` in sitemap

  **Must NOT do**:
  - Do NOT change other sitemap options
  - Do NOT remove `@astrojs/sitemap`

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `astro.config.mjs` — line 7: `sitemap()` with no options
  - `@astrojs/sitemap` i18n docs: https://docs.astro.build/en/guides/integrations-guide/sitemap/#i18n

  **Acceptance Criteria**:
  - [ ] `dist/sitemap-0.xml` contains `<xhtml:link rel="alternate" hreflang="...">` entries
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Sitemap contains hreflang alternates
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Read dist/sitemap-0.xml
      3. Assert: contains '<xhtml:link rel="alternate"' for both en and ru
    Expected Result: hreflang annotations present in sitemap XML
    Evidence: .sisyphus/evidence/task-5-sitemap.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 6. Add Open Graph + Twitter Card meta tags

  **What to do**:
  - Extend `src/layouts/BaseLayout.astro` to accept optional `ogImage` and `article` props
  - Add OG tags: `og:site_name`, `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
  - Add Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  - Create default OG image (1200x630) and store in `public/og-default.jpg`
  - For generator pages, pass `ogImage` from GeneratorLayout

  **Must NOT do**:
  - Do NOT remove existing meta tags (description, canonical, etc.)
  - Do NOT change existing `<head>` structure beyond adding new meta tags

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/layouts/BaseLayout.astro` — lines 36-64: current `<head>` content
  - astro-paper Layout.astro: https://github.com/satnaing/astro-paper/blob/f3005328e548805226aba54414122c7174645e83/src/layouts/Layout.astro#L71-L106
  - AstroWind Metadata.astro: https://github.com/arthelokyo/astrowind/blob/32a3bb96a000c2f5416ea1f795d18666c75ec713/src/components/common/Metadata.astro

  **Acceptance Criteria**:
  - [ ] OG tags present in all built HTML pages
  - [ ] Twitter Card tags present in all built HTML pages
  - [ ] Default OG image exists at `public/og-default.jpg`
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: OG tags present on homepage
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Grep dist/index.html for 'property="og:title"'
      3. Grep dist/index.html for 'property="og:description"'
      4. Grep dist/index.html for 'property="og:image"'
      5. Grep dist/index.html for 'property="twitter:card"'
    Expected Result: All OG and Twitter tags present
    Evidence: .sisyphus/evidence/task-6-og.txt

  Scenario: OG tags present on generator page
    Tool: Bash
    Preconditions: None
    Steps:
      1. Grep dist/generators/dice/index.html for 'property="og:title"'
      2. Assert: og:title contains "Dice Roller"
    Expected Result: OG tags populated with generator-specific data
    Evidence: .sisyphus/evidence/task-6-og-gen.txt
  ```

  **Commit**: YES (Wave 1)

- [x] 7. Update generatorSchema.ts with category field

  **What to do**:
  - Add `category` field to `generatorSchema` in `src/lib/generator-schema.ts`
  - Type: `z.enum(["gaming", "security", "decision-making", "creative", "utility"])`
  - Add `category` to the TypeScript `Generator` type inference
  - Ensure `.strict()` still works (category must be in all JSON files before build)

  **Must NOT do**:
  - Do NOT remove `.strict()` from schema
  - Do NOT add other new fields

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 8
  - **Blocked By**: 1-6

  **References**:
  - `src/lib/generator-schema.ts` — current schema with `.strict()`
  - `src/data/generators.ts` — imports and uses `generatorSchema.parse()`

  **Acceptance Criteria**:
  - [ ] `category` field added to schema
  - [ ] TypeScript `Generator` type includes `category`
  - [ ] `npm run lint` → PASS

  **QA Scenarios**:
  ```
  Scenario: Schema compiles without errors
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run lint
      2. Assert: 0 errors
    Expected Result: lint passes
    Evidence: .sisyphus/evidence/task-7-schema.txt
  ```

  **Commit**: YES (Wave 2)

- [x] 8. Update all 28 generator JSON files with categories

  **What to do**:
  - Add `"category"` field to ALL 28 files in `src/content/generators/*.json`
  - Categories per generator (confirmed by user):
    - **gaming**: dice, cards, lottery, wheel, magic8ball, rps
    - **security**: password, hash, uuid
    - **decision-making**: coin, yesno, weighted, teams
    - **creative**: colors, gradient, palette, fontpair, lorem
    - **utility**: numbers, date, time, shuffler, letter, names, meal, emoji, country, list
  - Verify `npm run build` passes after all updates

  **Must NOT do**:
  - Do NOT change any other fields in JSON files
  - Do NOT skip any generator file

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: 17-18
  - **Blocked By**: 7

  **References**:
  - `src/content/generators/*.json` — all 28 files
  - `src/lib/generator-schema.ts` — updated schema with category field

  **Acceptance Criteria**:
  - [ ] All 28 JSON files have `"category"` field
  - [ ] `npm run build` → PASS (62 pages, 0 Zod errors)

  **QA Scenarios**:
  ```
  Scenario: Build passes with all categories
    Tool: Bash
    Preconditions: Task 7 completed
    Steps:
      1. Run: npm run build
      2. Assert: 62 pages built, no Zod validation errors
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-8-build.txt
  ```

  **Commit**: YES (Wave 2)

- [x] 9. Add Organization schema to BaseLayout

  **What to do**:
  - Add `Organization` JSON-LD schema to `src/layouts/BaseLayout.astro`
  - Include: `@type: "Organization"`, `name: "Randify"`, `url`, `logo`
  - Inject via `<script type="application/ld+json">` in `<head>`

  **Must NOT do**:
  - Do NOT remove existing WebPage schema
  - Do NOT hardcode sensitive data

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: 1-6

  **References**:
  - `src/layouts/BaseLayout.astro` — existing WebPage schema (lines 24-31)
  - Schema.org Organization docs: https://schema.org/Organization

  **Acceptance Criteria**:
  - [ ] Organization schema present on all pages
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Organization schema in output
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Grep dist/index.html for '"@type":"Organization"'
    Expected Result: Organization schema found
    Evidence: .sisyphus/evidence/task-9-org.txt
  ```

  **Commit**: YES (Wave 2)

- [x] 10. Create custom 404 page

  **What to do**:
  - Create `src/pages/404.astro` with BaseLayout, friendly message, link to homepage, link to blog
  - Create `src/pages/ru/404.astro` — copy EN file (identical content due to `@/` aliases and locale detection)
  - Use `T.notFoundTitle`, `T.notFoundMessage`, `T.backToHome` from translations

  **Must NOT do**:
  - Do NOT add complex logic
  - Do NOT break existing routing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: 1-6

  **References**:
  - `src/layouts/BaseLayout.astro` — layout with i18n
  - `src/i18n/translations.ts` — add not-found translation keys
  - Existing about.astro pattern for page structure

  **Acceptance Criteria**:
  - [ ] `src/pages/404.astro` exists and renders
  - [ ] `src/pages/ru/404.astro` exists and renders
  - [ ] `npm run build` → PASS (64 pages: 62 + 2x 404)

  **QA Scenarios**:
  ```
  Scenario: 404 page builds correctly
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Assert: dist/404/index.html exists
      3. Assert: dist/ru/404/index.html exists
      4. Grep dist/404/index.html for 'not found' or equivalent
    Expected Result: Both 404 pages built with friendly message
    Evidence: .sisyphus/evidence/task-10-404.txt
  ```

  **Commit**: YES (Wave 2)

- [x] 11. Install @astrojs/rss, set up content collections config

  **What to do**:
  - Run `npm install @astrojs/rss`
  - Create `src/content/config.ts` with blog collection schema:
    ```typescript
    import { defineCollection, z } from "astro:content";
    import { generatorSchema } from "@/lib/generator-schema";

    const generators = defineCollection({ type: "data", schema: generatorSchema });
    const blog = defineCollection({
      type: "content",
      schema: ({ image }) => z.object({
        title: z.string().max(120),
        description: z.string().max(160),
        pubDate: z.date(),
        modDate: z.date().optional(),
        draft: z.boolean().default(false),
        lang: z.enum(["en", "ru"]),
        category: z.enum(["tutorial", "guide", "news", "tips"]),
        tags: z.array(z.string()).default([]),
        ogImage: image().optional(),
        relatedGenerators: z.array(z.string()).optional(),
        relatedPosts: z.array(z.string()).optional(),
      }),
    });
    export const collections = { generators, blog };
    ```
  - Create `src/content/blog/en/` and `src/content/blog/ru/` directories

  **Must NOT do**:
  - Do NOT change existing generator collection definition
  - Do NOT remove `src/data/generators.ts` (keep existing loader)

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 12-16, 22-23
  - **Blocked By**: 7-10

  **References**:
  - `src/lib/generator-schema.ts` — existing schema
  - Astro v4 Content Collections docs
  - `package.json` — add `@astrojs/rss` to dependencies

  **Acceptance Criteria**:
  - [ ] `@astrojs/rss` installed
  - [ ] `src/content/config.ts` created with blog + generator collections
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Content collections compile
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Assert: no TypeScript or Zod errors
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-11-collections.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 12. Create BlogLayout.astro with BlogPosting schema

  **What to do**:
  - Create `src/layouts/BlogLayout.astro`
  - Wraps BaseLayout with blog-specific SEO:
    - `BlogPosting` JSON-LD schema with `headline`, `author`, `publisher`, `datePublished`, `dateModified`
    - OG type: `article` (not `website`)
    - Article-specific meta: `article:published_time`, `article:modified_time`
  - Accept props: `title`, `description`, `pubDate`, `modDate`, `ogImage`, `lang`

  **Must NOT do**:
  - Do NOT duplicate BaseLayout head elements
  - Do NOT remove existing OG tags from BaseLayout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 13-15
  - **Blocked By**: 11

  **References**:
  - `src/layouts/BaseLayout.astro` — existing layout
  - `src/layouts/GeneratorLayout.astro` — example of wrapping BaseLayout
  - astro-paper Layout.astro: https://github.com/satnaing/astro-paper/blob/f3005328e548805226aba54414122c7174645e83/src/layouts/Layout.astro

  **Acceptance Criteria**:
  - [ ] BlogLayout.astro exists and compiles
  - [ ] BlogPosting schema present in output HTML
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: BlogPosting schema present
    Tool: Bash
    Preconditions: Task 11 completed
    Steps:
      1. Run: npm run build (after creating a test blog post)
      2. Grep dist/blog/test-post/index.html for '"@type":"BlogPosting"'
    Expected Result: BlogPosting schema found
    Evidence: .sisyphus/evidence/task-12-schema.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 13. Create blog post page EN ([slug].astro)

  **What to do**:
  - Create `src/pages/blog/[slug].astro`
  - Use `getStaticPaths` to query `getCollection("blog")` filtered by `lang === "en"`
  - Render post using `BlogLayout` with post data
  - Include prev/next navigation (previous and next posts by date)
  - Include RelatedPosts component (Task 21)

  **Must NOT do**:
  - Do NOT import generator components (safe for dynamic routes)
  - Do NOT hardcode post slugs

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 22-23
  - **Blocked By**: 11-12

  **References**:
  - astro-paper `[...slug]/index.astro`: https://github.com/satnaing/astro-paper/blob/f3005328e548805226aba54414122c7174645e83/src/pages/posts/%5B...slug%5D/index.astro
  - `src/layouts/BlogLayout.astro` — created in Task 12
  - `src/content/config.ts` — blog collection schema

  **Acceptance Criteria**:
  - [ ] EN blog post page renders markdown content correctly
  - [ ] Prev/next navigation works
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Blog post renders
    Tool: Bash
    Preconditions: Task 12 completed, at least one EN blog post exists
    Steps:
      1. Run: npm run build
      2. Assert: dist/blog/[post-slug]/index.html exists
      3. Grep output for post title
    Expected Result: Post page built with content
    Evidence: .sisyphus/evidence/task-13-post.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 14. Create blog post page RU ([slug].astro)

  **What to do**:
  - Create `src/pages/ru/blog/[slug].astro`
  - Same structure as EN but filter by `lang === "ru"`
  - Use identical template (BaseLayout derives locale from `Astro.currentLocale`)

  **Must NOT do**:
  - Do NOT duplicate template logic — copy EN file exactly
  - Do NOT hardcode Russian text in template

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 22-23
  - **Blocked By**: 11-12

  **References**:
  - `src/pages/blog/[slug].astro` — EN version (Task 13)
  - Existing RU generator page pattern: `src/pages/ru/generators/*.astro`

  **Acceptance Criteria**:
  - [ ] RU blog post page renders correctly
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: RU blog post renders
    Tool: Bash
    Preconditions: Task 13 completed, at least one RU blog post exists
    Steps:
      1. Run: npm run build
      2. Assert: dist/ru/blog/[post-slug]/index.html exists
      3. Grep output for Russian post title
    Expected Result: RU post page built
    Evidence: .sisyphus/evidence/task-14-ru-post.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 15. Create blog index pages (EN + RU)

  **What to do**:
  - Create `src/pages/blog/index.astro` — list all EN blog posts sorted by date (newest first)
  - Create `src/pages/ru/blog/index.astro` — list all RU blog posts
  - Include pagination if needed (start simple: show all)
  - Each post card shows: title, description, date, category, tags

  **Must NOT do**:
  - Do NOT show draft posts
  - Do NOT mix EN and RU posts on same index

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 24
  - **Blocked By**: 11-14

  **References**:
  - `src/pages/index.astro` — existing generator grid pattern
  - astro-paper index page: https://github.com/satnaing/astro-paper/blob/f3005328e548805226aba54414122c7174645e83/src/pages/index.astro

  **Acceptance Criteria**:
  - [ ] EN blog index lists all non-draft EN posts
  - [ ] RU blog index lists all non-draft RU posts
  - [ ] Posts sorted by pubDate descending
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Blog index renders
    Tool: Bash
    Preconditions: Tasks 13-14 completed
    Steps:
      1. Run: npm run build
      2. Assert: dist/blog/index.html exists
      3. Assert: dist/ru/blog/index.html exists
      4. Grep dist/blog/index.html for post titles
    Expected Result: Both indices built with post listings
    Evidence: .sisyphus/evidence/task-15-index.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 16. Create RSS feeds (EN + RU)

  **What to do**:
  - Create `src/pages/rss.xml.ts` — English RSS feed
  - Create `src/pages/ru/rss.xml.ts` — Russian RSS feed
  - Each feed queries blog collection filtered by language
  - Include: title, description, pubDate, link
  - Add `<language>en</language>` / `<language>ru</language>` customData
  - Add RSS auto-discovery links to BaseLayout:
    `<link rel="alternate" type="application/rss+xml" title="Randify Blog (EN)" href="/rss.xml" />`

  **Must NOT do**:
  - Do NOT include draft posts
  - Do NOT mix languages in same feed

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: 11, 13-15

  **References**:
  - Astro RSS docs: https://docs.astro.build/en/guides/rss/
  - `src/layouts/BaseLayout.astro` — add RSS links in `<head>`
  - `package.json` — `@astrojs/rss` dependency (Task 11)

  **Acceptance Criteria**:
  - [ ] `/rss.xml` serves valid RSS 2.0 with EN posts
  - [ ] `/ru/rss.xml` serves valid RSS 2.0 with RU posts
  - [ ] RSS auto-discovery links present in all pages
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: RSS feeds generated
    Tool: Bash
    Preconditions: Task 11 completed, blog posts exist
    Steps:
      1. Run: npm run build
      2. Assert: dist/rss.xml exists
      3. Assert: dist/ru/rss.xml exists
      4. Grep dist/rss.xml for '<language>en</language>'
      5. Grep dist/ru/rss.xml for '<language>ru</language>'
    Expected Result: Both feeds built with correct language tags
    Evidence: .sisyphus/evidence/task-16-rss.txt
  ```

  **Commit**: YES (Wave 3)

- [x] 17. Create category pages for generators (EN + RU)

  **What to do**:
  - Create `src/pages/generators/category/[category].astro`
  - Create `src/pages/ru/generators/category/[category].astro`
  - Use `getStaticPaths` with 5 categories: gaming, security, decision-making, creative, utility
  - Filter generators by `data.category === category`
  - Display category name, description, and matching generators in a grid
  - Add category description text (e.g., "Gaming generators for tabletop RPGs, card games, and lotteries")

  **Must NOT do**:
  - Do NOT hardcode generator lists — filter dynamically from collection
  - Do NOT skip any category

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 18, 24
  - **Blocked By**: 8

  **References**:
  - `src/pages/index.astro` — generator grid rendering pattern
  - `src/components/GeneratorCard.astro` — card component
  - `src/data/generators.ts` — generator data access

  **Acceptance Criteria**:
  - [ ] 5 EN category pages built: `/generators/category/gaming/`, etc.
  - [ ] 5 RU category pages built: `/ru/generators/category/gaming/`, etc.
  - [ ] Each page shows correct generators for that category
  - [ ] `npm run build` → PASS (74 pages cumulative: 62 existing + 2x 404 + 10 categories)

  **QA Scenarios**:
  ```
  Scenario: Category page shows correct generators
    Tool: Bash
    Preconditions: Task 8 completed
    Steps:
      1. Run: npm run build
      2. Read dist/generators/category/gaming/index.html
      3. Assert: contains "Dice Roller" or "Кубик"
      4. Assert: does NOT contain "Password Generator"
    Expected Result: Only gaming generators shown
    Evidence: .sisyphus/evidence/task-17-category.txt
  ```

  **Commit**: YES (Wave 4)

- [x] 18. Add category navigation to homepage

  **What to do**:
  - Update `src/pages/index.astro` to show category pills/links above or below the generator grid
  - Each pill links to `/generators/category/[category]/`
  - Show category count (e.g., "Gaming (6)")
  - Style with Tailwind to match existing design

  **Must NOT do**:
  - Do NOT remove the existing generator grid
  - Do NOT break mobile layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 17

  **References**:
  - `src/pages/index.astro` — current homepage layout
  - `src/components/GeneratorCard.astro` — existing card styling

  **Acceptance Criteria**:
  - [ ] Category navigation visible on homepage
  - [ ] Each category links to correct category page
  - [ ] Mobile-responsive
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Category navigation renders
    Tool: Bash
    Preconditions: Task 17 completed
    Steps:
      1. Run: npm run build
      2. Read dist/index.html
      3. Assert: contains link to /generators/category/gaming/
    Expected Result: Category links present
    Evidence: .sisyphus/evidence/task-18-nav.txt
  ```

  **Commit**: YES (Wave 4)

- [x] 19. Create Breadcrumbs component

  **What to do**:
  - Create `src/components/Breadcrumbs.astro`
  - Accept props: `items: Array<{ label: string, href?: string }>`
  - Render as `<nav aria-label="Breadcrumb">` with `<ol>` list
  - Style with Tailwind: small text, separators between items
  - Use on generator pages and blog pages
  - For generators: Home > [Category] > [Generator Name]

  **Must NOT do**:
  - Do NOT add breadcrumbs to homepage or about/privacy (not needed)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 26
  - **Blocked By**: None

  **References**:
  - `src/layouts/GeneratorLayout.astro` — existing breadcrumb schema (lines 37-54)
  - `src/pages/index.astro` — backToAll link pattern

  **Acceptance Criteria**:
  - [ ] Breadcrumbs component renders correctly
  - [ ] Accessible (aria-label, nav landmark)
  - [ ] Matches existing design system
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Breadcrumbs accessible
    Tool: Bash
    Preconditions: None
    Steps:
      1. Create test page with Breadcrumbs
      2. Run: npm run build
      3. Grep output for 'aria-label="Breadcrumb"'
    Expected Result: Breadcrumb nav found with correct ARIA
    Evidence: .sisyphus/evidence/task-19-breadcrumbs.txt
  ```

  **Commit**: YES (Wave 4)

- [x] 20. Create RelatedGenerators component

  **What to do**:
  - Create `src/components/RelatedGenerators.astro`
  - Accept prop: `currentSlug: string` or `category: string`
  - Show 3-4 generators from the same category (excluding current)
  - Render as small cards or list with icon + title + link
  - Add to GeneratorLayout.astro at bottom of page

  **Must NOT do**:
  - Do NOT show current generator in related list
  - Do NOT show generators from other categories

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 25
  - **Blocked By**: 8

  **References**:
  - `src/components/GeneratorCard.astro` — card pattern
  - `src/layouts/GeneratorLayout.astro` — where to place component
  - `src/data/generators.ts` — generator data access

  **Acceptance Criteria**:
  - [ ] Related generators shown on every generator page
  - [ ] Same-category generators only
  - [ ] Current generator excluded
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Related generators on dice page
    Tool: Bash
    Preconditions: Task 8 completed
    Steps:
      1. Run: npm run build
      2. Read dist/generators/dice/index.html
      3. Assert: contains links to other gaming generators (cards, lottery, etc.)
      4. Assert: does NOT contain link to dice page itself
    Expected Result: Related gaming generators shown
    Evidence: .sisyphus/evidence/task-20-related.txt
  ```

  **Commit**: YES (Wave 4)

- [x] 21. Create RelatedPosts component

  **What to do**:
  - Create `src/components/RelatedPosts.astro`
  - Accept prop: `post: CollectionEntry<"blog">`
  - Find related posts by tag overlap scoring:
    ```typescript
    const related = allPosts
      .filter(p => p.id !== post.id && p.data.lang === post.data.lang)
      .map(p => ({ post: p, score: p.data.tags.filter(t => post.data.tags.includes(t)).length }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ post }) => post);
    ```
  - Render as small cards with title, date, description
  - Add to BlogLayout.astro at bottom of post

  **Must NOT do**:
  - Do NOT show current post
  - Do NOT mix EN and RU posts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 11

  **References**:
  - astro-paper PostDetails.astro: https://github.com/satnaing/astro-paper/blob/f3005328e548805226aba54414122c7174645e83/src/layouts/PostDetails.astro#L70-L83
  - `src/layouts/BlogLayout.astro` — where to place component

  **Acceptance Criteria**:
  - [ ] Related posts shown on blog post pages
  - [ ] Tag overlap scoring works
  - [ ] Same language only
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Related posts by tag
    Tool: Bash
    Preconditions: Task 11 completed, multiple posts with shared tags
    Steps:
      1. Create test posts with shared tags
      2. Run: npm run build
      3. Read dist/blog/test-post/index.html
      4. Assert: contains links to posts with matching tags
    Expected Result: Related posts displayed
    Evidence: .sisyphus/evidence/task-21-related-posts.txt
  ```

  **Commit**: YES (Wave 4)

- [x] 22. Create 8 blog post templates EN

  **What to do**:
  - Create 8 markdown files in `src/content/blog/en/` with correct frontmatter:
    ```yaml
    ---
    title: "What is Cryptographically Secure Randomness and Why It Matters"
    description: "Learn why cryptographically secure random number generators are essential for passwords, gaming, and security."
    pubDate: 2025-01-15
    modDate: 2025-01-15
    draft: false
    lang: en
    category: guide
    tags: ["randomness", "security", "crypto"]
    relatedGenerators: ["password", "hash", "uuid"]
    ---
    ```
  - Fill body with placeholder content (Lorem ipsum style paragraphs)
  - Topics:
    1. Cryptographically secure randomness
    2. Strong password creation guide
    3. Dice notation explained
    4. Psychology of randomness
    5. RNG in gaming
    6. Random team picker guide
    7. Color theory and palettes
    8. UUID vs sequential IDs

  **Must NOT do**:
  - Do NOT write full article content (user generates via neural networks)
  - Do NOT set draft: true

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 11-16

  **References**:
  - `src/content/config.ts` — blog collection schema
  - `src/content/generators/*.json` — existing content file pattern

  **Acceptance Criteria**:
  - [ ] 8 EN blog posts exist in `src/content/blog/en/`
  - [ ] All have valid frontmatter matching schema
  - [ ] `npm run build` → PASS (84 pages cumulative: 62 existing + 2x 404 + 10 categories + 2x blog index + 8 EN posts)

  **QA Scenarios**:
  ```
  Scenario: Blog posts build correctly
    Tool: Bash
    Preconditions: Tasks 11-16 completed
    Steps:
      1. Run: npm run build
      2. Assert: dist/blog/ contains 8 post directories
      3. Grep dist/blog/[first-post]/index.html for post title
    Expected Result: All posts built successfully
    Evidence: .sisyphus/evidence/task-22-posts.txt
  ```

  **Commit**: YES (Wave 5)

- [x] 23. Create 8 blog post templates RU

  **What to do**:
  - Create 8 markdown files in `src/content/blog/ru/` with Russian titles/descriptions
  - Same structure as EN but with `lang: ru`
  - Topics mirror EN:
    1. "Что такое криптографически стойкая случайность и почему это важно"
    2. "Как создавать надёжные пароли: полное руководство"
    3. "Нотация кубиков: от d4 до взрывающихся кубиков"
    4. "Психология случайности: почему люди плохо справляются со случайностью"
    5. "Генераторы случайных чисел в играх: честность и алгоритмы"
    6. "Как использовать случайный выбор команд для спорта и мероприятий"
    7. "Теория цвета: как создавать гармоничные палитры"
    8. "UUID против последовательных ID: когда что использовать"

  **Must NOT do**:
  - Do NOT write full article content
  - Do NOT set draft: true

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 11-16

  **References**:
  - `src/content/blog/en/` — EN templates (Task 22)
  - `src/i18n/translations.ts` — existing i18n pattern

  **Acceptance Criteria**:
  - [ ] 8 RU blog posts exist in `src/content/blog/ru/`
  - [ ] All have valid frontmatter with `lang: ru`
  - [ ] `npm run build` → PASS (92 pages cumulative: 84 + 8 RU posts)

  **QA Scenarios**:
  ```
  Scenario: RU blog posts build correctly
    Tool: Bash
    Preconditions: Task 22 completed
    Steps:
      1. Run: npm run build
      2. Assert: dist/ru/blog/ contains 8 post directories
      3. Grep dist/ru/blog/[first-post]/index.html for Russian title
    Expected Result: All RU posts built
    Evidence: .sisyphus/evidence/task-23-ru-posts.txt
  ```

  **Commit**: YES (Wave 5)

- [x] 24. Add blog link to navigation

  **What to do**:
  - Update `src/components/LanguageSwitcher.astro` or add a new nav component
  - Add "Blog" / "Блог" link pointing to `/blog/` and `/ru/blog/`
  - Style to match existing design (accent color, hover states)
  - Position logically (e.g., next to language switcher or in header)

  **Must NOT do**:
  - Do NOT break existing LanguageSwitcher functionality
  - Do NOT add heavy client-side logic

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: 15

  **References**:
  - `src/components/LanguageSwitcher.astro` — existing nav component
  - `src/i18n/translations.ts` — add "blog" translation key
  - `src/layouts/BaseLayout.astro` — where nav is rendered

  **Acceptance Criteria**:
  - [ ] Blog link visible on all pages
  - [ ] Link switches language correctly with locale
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Blog link present on homepage
    Tool: Bash
    Preconditions: Task 15 completed
    Steps:
      1. Run: npm run build
      2. Read dist/index.html
      3. Assert: contains link to /blog/
      4. Read dist/ru/index.html
      5. Assert: contains link to /ru/blog/
    Expected Result: Blog links present on both EN and RU pages
    Evidence: .sisyphus/evidence/task-24-nav.txt
  ```

  **Commit**: YES (Wave 5)

- [x] 25. Add related generators to generator pages

  **What to do**:
  - Update `src/layouts/GeneratorLayout.astro` to import and render `<RelatedGenerators />`
  - Pass current generator's category to component
  - Place after SeoBlock and before FAQ (or after FAQ)

  **Must NOT do**:
  - Do NOT duplicate RelatedGenerators logic
  - Do NOT show on pages without generators

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: 20

  **References**:
  - `src/components/RelatedGenerators.astro` — created in Task 20
  - `src/layouts/GeneratorLayout.astro` — where to place component

  **Acceptance Criteria**:
  - [ ] RelatedGenerators rendered on all 56 generator pages (EN + RU)
  - [ ] Correct category filtering
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Related generators on every generator page
    Tool: Bash
    Preconditions: Task 20 completed
    Steps:
      1. Run: npm run build
      2. Read dist/generators/password/index.html
      3. Assert: contains links to hash and uuid generators
      4. Read dist/generators/coin/index.html
      5. Assert: contains links to yesno and teams generators
    Expected Result: Related generators shown with correct filtering
    Evidence: .sisyphus/evidence/task-25-related.txt
  ```

  **Commit**: YES (Wave 5)

- [x] 26. Add breadcrumbs to generator and blog layouts

  **What to do**:
  - Update `src/layouts/GeneratorLayout.astro` to include `<Breadcrumbs />`
  - Breadcrumbs: Home > [Category] > [Generator Title]
  - Update `src/layouts/BlogLayout.astro` to include `<Breadcrumbs />`
  - Breadcrumbs: Home > Blog > [Post Title]
  - Ensure breadcrumbs don't break existing layout

  **Must NOT do**:
  - Do NOT add breadcrumbs to BaseLayout (not all pages need them)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5
  - **Blocks**: None
  - **Blocked By**: 19

  **References**:
  - `src/components/Breadcrumbs.astro` — created in Task 19
  - `src/layouts/GeneratorLayout.astro` — generator page wrapper
  - `src/layouts/BlogLayout.astro` — blog page wrapper

  **Acceptance Criteria**:
  - [ ] Breadcrumbs visible on all generator pages
  - [ ] Breadcrumbs visible on all blog post pages
  - [ ] Correct breadcrumb items per page type
  - [ ] `npm run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: Breadcrumbs on generator page
    Tool: Bash
    Preconditions: Task 19 completed
    Steps:
      1. Run: npm run build
      2. Read dist/generators/dice/index.html
      3. Assert: contains breadcrumb with "Home", "Gaming", "Dice"
    Expected Result: Breadcrumbs rendered correctly
    Evidence: .sisyphus/evidence/task-26-breadcrumbs.txt
  ```

  **Commit**: YES (Wave 5)

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run lint` + `npm run test` + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (blog + categories + generators). Test edge cases: empty blog, category with no generators, 404 page. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(seo): fix critical SEO gaps — duplicate keys, landmarks, OG tags, hreflang`
- **Wave 2**: `feat(schema): add generator categories and Organization schema`
- **Wave 3**: `feat(blog): add blog infrastructure with RSS feeds`
- **Wave 4**: `feat(categories): add generator category pages and breadcrumbs`
- **Wave 5**: `feat(content): add blog templates and navigation links`
- **Wave FINAL**: `chore(review): final verification and fixes`

## Success Criteria

### Verification Commands
```bash
npm run lint          # Expected: 0 errors
npm run build         # Expected: 70+ pages
npm run test          # Expected: 51/51 pass (existing tests unchanged)
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Build passes with 70+ pages
- [ ] Lint passes with 0 errors
- [ ] OG tags present on all page types
- [ ] RSS feeds accessible
- [ ] All 28 generators categorized
- [ ] No duplicate JSON keys
- [ ] Blog index and post pages render
- [ ] Category pages filter correctly
