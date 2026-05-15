# Generators — Knowledge Base

**Location:** `src/components/generators/`

## Overview

10 interactive random-value generator components. Each is an Astro `.astro` file with client-side `<script>` for interactivity. Shared patterns for i18n, history persistence, and copy-to-clipboard.

## Structure

```
src/components/generators/
├── DiceGenerator.astro         # Dice notation parser + roller
├── MealGenerator.astro         # Random meal picker
├── EmojiGenerator.astro        # Random emoji with categories
├── HashGenerator.astro         # Hash generators (MD5, SHA, etc.)
├── FontPairGenerator.astro     # Google Font pairings
├── Magic8BallGenerator.astro   # Magic 8-ball
├── TimeGenerator.astro         # Random time generator
├── WheelSpinner.astro          # Weighted wheel spinner
├── WeightedGenerator.astro     # Weighted random picker
├── PaletteGenerator.astro      # Color palette generator
└── (shared utilities in src/lib/client/)
```

## Conventions

- **Language detection (frontmatter):**
  ```astro
  const isRu = Astro.url.pathname.startsWith('/ru');
  const T = useT(isRu ? 'ru' : 'en');
  ```
- **Language detection (client script):**
  ```js
  const isRu = document.documentElement.lang === 'ru';
  ```
- **History persistence:** Use `sessionStorage` (not `localStorage`) with prefixed keys
- **Copy feedback:** Show "Copied!" toast using `T.copyFeedback` / `T.copied`
- **Secure random:** Import from `@/lib/client/random` (uses `crypto.getRandomValues`)

## Anti-Patterns

- **Using `Math.random()` directly:** Always use `@/lib/client/random` for cryptographic quality
- **Hardcoding strings:** All user-visible text must go through `T.*` keys
- **Skipping RU version:** Every generator MUST have both EN and RU pages

## Where to Look

| Task | File | Notes |
|------|------|-------|
| Add new generator | Copy `DiceGenerator.astro` as template | Follow i18n + history + copy patterns |
| Fix dice logic | `src/lib/dice-engine.ts` | Parser + roller, shared across generators |
| Fix randomness | `src/lib/client/random.ts` | `crypto.getRandomValues` wrapper |
| Generator metadata | `src/content/generators/<slug>.json` | Zod-validated, `.strict()` — unknown fields fail build |
