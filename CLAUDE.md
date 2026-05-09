# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Randify is a static site (Astro 4 + Tailwind CSS 4) that hosts random-value generators. Only the number generator is live; the rest are catalogued in `src/data/generators.ts` with `status: 'coming-soon'`.

## Commands

```bash
npm run dev       # Dev server (localhost:4321)
npm run build     # Static build → dist/
npm run preview   # Serve the built dist/ locally
```

**Docker (production):** multi-stage build compiles with Node 20 then serves via `nginx:alpine`. The nginx config handles pretty URLs via `try_files $uri $uri/index.html`.

```bash
docker build -t randify .
docker run -p 8080:80 randify
```

## Architecture

**Adding a new generator** involves three steps:

1. Add an entry to `src/data/generators.ts` (set `status: 'live'` when ready).
2. Create `src/components/generators/<Name>Generator.astro` — interactive logic goes in an inline `<script>` tag (no framework, plain TypeScript compiled by Vite).
3. Create `src/pages/generators/<slug>.astro` — follows the same layout pattern as `numbers.astro`.

**Key conventions:**
- Accent color is `#534AB7` (also exposed as `--accent` CSS custom property in `BaseLayout.astro`).
- All SVG icons are inlined strings inside `GeneratorCard.astro`; add new ones to the `icons` map there.
- `AdBanner.astro` is a placeholder component with three size variants (`leaderboard`, `rectangle`, `tile`) — not wired to any ad network yet.
- No client-side router — each generator is a separate static HTML page.
- No test runner or linter is configured.
