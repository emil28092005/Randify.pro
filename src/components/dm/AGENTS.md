# DM Dashboard — Knowledge Base

**Location:** `src/components/dm/`, `src/pages/dm/`, `src/pages/ru/dm/`

## Overview

Dungeon Master Dashboard — standalone RPG tool module within Randify. Server-rendered (hybrid Astro), RU-only, orange theme (`#E87722`). OAuth-authenticated via VK ID and Yandex.

## Components

| Component | Purpose |
|-----------|---------|
| `DiceRoller.astro` | Dice notation parser + roller with history |
| `InitiativeTracker.astro` | Combat initiative list with sorting |
| `Open5eReference.astro` | Open5e monster search + detail view |
| `NotesPanel.astro` | `localStorage`-backed notes editor |
| `AuthPanel.astro` | Login/logout UI, reads `Astro.locals.user` |
| `DmHeader.astro` | Header with back link to Randify |
| `DmCard.astro` | Styled container card |
| `DmButton.astro` | Reusable button with variants |
| `DmInput.astro` | Styled form input |

## Key Files

- **`src/layouts/DmLayout.astro`** — Wraps DM pages, imports `dm-theme.css`, hides `LanguageSwitcher`
- **`src/styles/dm-theme.css`** — CSS vars scoped to `.dm-theme` class (overrides BaseLayout purple)
- **`src/i18n/dm-translations.ts`** — RU-only strings for DM Dashboard

## Conventions

- **Theme override:** `.dm-theme` class on wrapper div sets `--accent: #E87722`
- **Server-rendered:** All DM pages have `export const prerender = false` (middleware sets `Astro.locals.user`)
- **Auth state:** Check `Astro.locals.user` in components; middleware validates `auth_token` cookie + JWT + DB session
- **History:** Dice roller uses `sessionStorage`, notes use `localStorage`

## Anti-Patterns

- **Using `:root` for DM CSS vars:** BaseLayout sets `--accent: #534AB7` on `:root`. DM theme MUST use `.dm-theme` selector for higher specificity
- **Static DM pages:** Will break auth. Always `prerender = false`
- **Forgetting `hideLanguageSwitcher` on `DmLayout`:** DM should feel like standalone product
