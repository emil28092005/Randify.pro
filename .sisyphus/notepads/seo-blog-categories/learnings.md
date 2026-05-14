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

## Task 11: Install @astrojs/rss and set up content collections config

- Installed `@astrojs/rss` package (9 packages added, 511 total).
- Updated `src/content/config.ts`:
  - Added `z` import from `astro:content`.
  - Defined `blog` collection with `type: "content"` and full schema: title (max 120), description (max 160), pubDate, modDate (optional), draft (default false), lang (en|ru), category (tutorial|guide|news|tips), tags (default []), ogImage (image().optional()), relatedGenerators (optional), relatedPosts (optional).
  - Exported `collections = { generators, blog }` — preserved existing generators collection untouched.
- Created empty directories: `src/content/blog/en/` and `src/content/blog/ru/`.
- Build passes with 64 pages and 0 errors.
- Note: `src/data/generators.ts` remains the runtime loader for generators; the content collection config is for build-time validation only.

## Task 19: Reusable Breadcrumb Component

- Created `src/components/Breadcrumbs.astro` as a standalone, reusable component.
- Props: `items: Array<{ label: string, href?: string }>`.
- Accessibility: `<nav aria-label="Breadcrumb">` with `<ol>` list semantics; last item gets `aria-current="page"`.
- Separators are plain-text `/` wrapped in `<span aria-hidden="true">` to avoid screen-reader noise.
- Styling matches existing dark theme: `text-sm`, `text-zinc-500` for links, `text-zinc-400` for current page, `hover:text-accent` on links, plus `focus-visible:ring-accent` for keyboard navigation.
- Intentionally NOT added to `BaseLayout` — breadcrumbs are opt-in per page (e.g., category landing pages, blog posts).
- Build passes with 64 pages and 0 errors.

## Task 12: BlogLayout.astro

- Created `src/layouts/BlogLayout.astro` wrapping `BaseLayout`.
- Injected `BlogPosting` JSON-LD schema with Organization author/publisher, headline, dates, and canonical URL.
- Set OG type to `article` and added `article:published_time` / `article:modified_time` meta tags via `slot="head"`.
- Styled container follows `GeneratorLayout` pattern (`max-w-2xl mx-auto px-4 py-12 sm:py-20`).
- Prev/next navigation supports bilingual labels, arrow icons, and keyboard-focus rings.
- Exposed named slot `related` for a `RelatedPosts` component.
- Props: `title`, `description`, `pubDate`, `modDate`, `ogImage`, `lang`, `prevPost?`, `nextPost?`.
- `PostLink` interface: `{ slug: string; title: string }`.
- Build passes (64 pages, 0 errors).


## Task 16: RSS Feeds (2026-05-14)

- Astro RSS endpoint pattern: `src/pages/rss.xml.ts` exports `GET(context)` and returns `rss({...})` from `@astrojs/rss`.
- `context.site` is automatically populated from `astro.config.mjs` `site` field.
- Use `getCollection("blog")` then filter by `post.data.lang` and `post.data.draft` to keep languages separate and exclude drafts.
- Empty collections produce a valid but item-less RSS feed; build succeeds with a warning.
- RSS auto-discovery links should be `<link rel="alternate" type="application/rss+xml" title="..." href="..." />` inside `<head>`.

## Task 15: Blog Index Pages (EN + RU)

- Created `src/pages/blog/index.astro` and `src/pages/ru/blog/index.astro` using `getCollection("blog")`.
- Filter pattern: `post.data.lang === "en"/"ru" && post.data.draft !== true` — ensures no cross-language mixing and no draft posts leak.
- Sort: `b.data.pubDate.getTime() - a.data.pubDate.getTime()` for newest-first.
- Each post card displays: title, description, formatted date (locale-aware), category badge, tag badges.
- Links: `/blog/${post.slug}/` for EN, `/ru/blog/${post.slug}/` for RU.
- Added translation keys `blogDesc`, `readMore`, `noPosts` to both EN and RU objects.
- JSON-LD `Blog` schema injected via `slot="head"` with nested `BlogPosting` array for each post.
- Empty collection gracefully handled with localized "No posts yet" message.
- Build passes with 76 pages; warnings about empty blog collection are expected and harmless.
- Reused styling patterns from `src/pages/index.astro` (max-w-4xl, blur accent orb, card hover states).

## Task 17: Category Pages for Generators

- Created `src/pages/generators/category/[category].astro` and `src/pages/ru/generators/category/[category].astro`.
- Both pages use `getStaticPaths` with 5 hardcoded categories: gaming, security, decision-making, creative, utility.
- Generators are filtered dynamically via `generators.filter((g) => g.category === category)` — no hardcoded generator lists.
- Each page displays a breadcrumb (Home > Categories > [Category Name] / Главная > Категории > [Name]), category-specific title/description, and a grid of `GeneratorCard` components matching the `index.astro` layout.
- JSON-LD BreadcrumbList schema is injected via `<Fragment slot="head">` for SEO.
- Category names are formatted for display: EN uses hyphen-split capitalization ("Decision Making"), RU uses a translation map ("Принятие решений").
- Build passes with 76 pages (up from 64), confirming all 10 category variants (EN + RU × 5 categories) are statically generated.
- Verified `dist/generators/category/gaming/index.html` exists and contains correct content.

## Task 20: RelatedGenerators.astro

- Created `src/components/RelatedGenerators.astro` with props `currentSlug`, `category`, and optional `lang`.
- Filter logic: `generators.filter(g => g.category === category && g.slug !== currentSlug).slice(0, 4)`.
- Edge case handled: returns `null` (renders nothing) when no related generators exist.
- Locale-aware: titles and hrefs switch between EN (`/generators/{slug}/`) and RU (`/ru/generators/{slug}/`) based on `Astro.currentLocale`.
- Compact card design: icon (from inline `icons` map matching `GeneratorCard`) + title in a responsive 2-column grid (`grid-cols-1 sm:grid-cols-2`).
- Styling uses existing Tailwind tokens: `border-zinc-800`, `hover:border-accent`, `bg-accent/10`, `focus-visible:ring-accent`.
- Integrated into `GeneratorLayout.astro` at the bottom of the content area (after FAQ block).
- Added `relatedGenerators` translation key to both EN ("Related generators") and RU ("Похожие генераторы").
- Build passes with 76 pages and 0 errors.

## Task 13: EN Blog Post Page ([slug].astro)

- Created `src/pages/blog/[slug].astro` with `getStaticPaths` querying `getCollection("blog")`.
- Filtered posts by `lang === "en"` and excluded drafts.
- Sorted posts by `pubDate` ascending to calculate prev/next navigation chronologically.
- Derived clean slugs by stripping `en/` prefix and `.md` extension from `post.id` (Astro content collection `id` includes file extension).
- Rendered markdown via `post.render()` -> `<Content />`.
- Passed prev/next data to `BlogLayout` using `prevPost` / `nextPost` props (matching existing BlogLayout interface from Task 12).
- Build passes with 77 pages; verified output at `dist/blog/test-post/index.html`.

## Task 14: RU Blog Post Page ([slug].astro)

- Created `src/pages/ru/blog/[slug].astro` as an exact structural copy of the EN file, with two language-specific changes:
  1. Filter: `post.data.lang === "ru"` (instead of `"en"`).
  2. Slug normalization: stripped `ru/` prefix from `post.id` (instead of `en/`).
- Prev/next navigation uses `BlogLayout` props (`prevPost`, `nextPost`) just like EN.
- Rendered markdown via `post.render()` -> `<Content />` inside `<article>`.
- Passed `lang="ru"` prop to `BlogLayout` for explicit locale context.
- **Bug fix in `BlogLayout.astro`:** prev/next links were hardcoded to `/blog/${slug}/`, breaking RU navigation. Added `const blogBase = lang === "ru" ? "/ru/blog/" : "/blog/";` and updated both prev/next `href` attributes to use `${blogBase}${slug}/`. This makes BlogLayout fully locale-aware without duplicating layout logic.
- Build passes with 77 pages; RU `[slug].astro` compiles correctly. No RU blog posts exist yet, so no static RU post pages are generated (expected — will populate in Tasks 22-23).
- Evidence saved to `.sisyphus/evidence/task-14-ru-post.txt`.

## Task 21: RelatedPosts Component

- Created `src/components/RelatedPosts.astro` accepting `post: CollectionEntry<"blog">`.
- Tag overlap scoring: `p.data.tags.filter(t => post.data.tags.includes(t)).length`.
- Filters out current post, requires `score > 0`, sorts descending, slices top 3.
- Edge case: returns `null` (renders nothing) when no related posts — section is completely hidden.
- Language isolation: `getCollection("blog", ({ data }) => !data.draft && data.lang === post.data.lang)` ensures EN and RU posts never mix.
- Slug derivation: `post.id.replace(/^(en|ru)\//, "").replace(/\.md$/, "")` — Astro content collection `id` includes subdirectory prefix and file extension.
- Blog base path computed from `post.data.lang`: `/blog/` for EN, `/ru/blog/` for RU.
- Styled with Tailwind matching existing dark theme: `border-zinc-800`, `hover:border-accent`, `line-clamp-2` for description snippets.
- Wired into both `src/pages/blog/[slug].astro` and `src/pages/ru/blog/[slug].astro` via `<RelatedPosts post={post} slot="related" />`.
- Added `relatedPosts` translation key: EN "Related posts", RU "Похожие статьи".
- Build passes with 83 pages and 0 errors.

## Task 23: Russian Blog Post Templates (8 posts)

- Created 8 Russian blog post templates in `src/content/blog/ru/`.
- All posts include valid frontmatter with `lang: ru`, matching the EN schema.
- Frontmatter fields: title, description, pubDate, modDate, draft: false, lang: ru, category: guide, tags, relatedGenerators.
- `relatedGenerators` uses English slugs (same convention as EN posts).
- Staggered dates used: 2025-01-16 through 2025-01-23.
- Body content: 3 paragraphs of Russian placeholder text per post.
- Build passes with 93 pages (up from 77), confirming all 8 RU blog posts are statically generated.
- RU blog index (`/ru/blog/index.html`) and individual post pages (`/ru/blog/<slug>/index.html`) render correctly.
- Note: First build attempt hit a transient Astro module resolution bug on `src/pages/ru/generators/list.astro`; retry succeeded without changes.

## Task 26: Add Breadcrumbs to GeneratorLayout and BlogLayout

- Imported `Breadcrumbs` into `src/layouts/GeneratorLayout.astro` and `src/layouts/BlogLayout.astro`.
- **GeneratorLayout:** Added `<Breadcrumbs items={...} />` between the existing back-link nav and the `<header>`.
  - Items: Home → Category → Generator Title.
  - Category label is locale-aware: maps `generator.category` to translation keys (`catGaming`, `catSecurity`, etc.) for both EN and RU.
  - Category href is prefixed with `/ru` when `isRu` is true.
- **BlogLayout:** Added `<Breadcrumbs items={...} />` inside `<article>`, before the `<header>`.
  - Items: Home → Blog → Post Title.
  - Labels and hrefs switch based on `lang === "ru"`.
- `npm run build` passes with 93 pages.
- Verified breadcrumb text presence in built HTML:
  - `dist/generators/dice/index.html` contains "Home", "Gaming", "Dice".
  - `dist/blog/test-post/index.html` contains "Home", "Blog", "Test Post".
- Evidence saved to `.sisyphus/evidence/task-26-breadcrumbs.txt`.

## Task 22: Create 8 English Blog Post Templates

- Created 8 markdown files in `src/content/blog/en/` with valid frontmatter matching the blog schema.
- All posts use `category: guide`, `draft: false`, `lang: en`, and include `relatedGenerators`.
- Dates are staggered from 2025-01-15 (newest) down to 2025-01-08 (oldest) for correct newest-first sorting.
- Body content is 3 paragraphs of placeholder text ("This article will explore... Stay tuned for the full guide.") per instructions.
- Build passes with 85 pages (up from 77), confirming 8 new static blog post pages were generated.
- Existing `test-post.md` remains untouched; total EN blog collection now has 9 posts.
