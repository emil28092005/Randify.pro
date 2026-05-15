# DM Dashboard Redesign — Work Notes

## Theme Tokens (Target)
- Primary: `#534AB7`
- Secondary: `#c8a84b`
- Background base: `#16120e`
- Surface: `#1e1912`
- Card: `#221e18`
- Green (crit): `#6ab04c`
- Red (fail): `#e06060`
- Accent hover: `#6b5fc7`
- Gold hover: `#d4b76a`

## Current State (2026-05-15)
- dm-theme.css: 11 properties, orange theme
- DmHeader: simple header with quill icon
- DmButton: 3 variants (primary/secondary/ghost)
- DmCard: padding variants, shadow
- DmInput: label + input with focus ring
- dm-translations.ts: 14 strings only
- Playwright: installed (@playwright/test v1.60.0), script is `test:ui`

## Decisions
- Keep CSS property names, only change values
- Russian-only, no EN translations needed
- Preserve all sessionStorage/localStorage keys

## Learnings (2026-05-15)
- DmTabs.astro created: pill-style tab navigation with 4 tabs (Кубики, Инициатива, Справочник, Заметки)
- Uses CSS custom properties exclusively (no hardcoded colors)
- Server-side renders initial `aria-selected` based on `Astro.url.hash`
- Client script enhances with: click → pushState hash, `dm-tab-change` custom event, keyboard nav (ArrowLeft/Right, Home, End), localStorage persistence (`dm-last-tab`)
- Uses `<a href="#tab">` for graceful degradation (JS prevents default)
- Touch-friendly sizing: `min-h-[44px] min-w-[80px]`
- Build passes cleanly
- DmSidebar.astro created: desktop-only sidebar navigation component with user info placeholder, tools section, reference section, and campaigns placeholder
- Sidebar uses emoji icons for tools, gold dot for reference items
- All translations validated against dm-translations.ts keys
- No mobile visibility toggle needed — DmLayout handles `hidden lg:block` for sidebar column
- Component takes optional `user` prop with `name` and `avatar` fields

## InitiativeTracker Redesign (2026-05-15)
- Wrapped form, list, and empty state in DmCard for consistent card styling
- Changed sessionStorage key from `it-combatants` to `dm-initiative` per spec
- Added inline HP editing: click HP span → input, blur/Enter to save, Escape to cancel
- Added `aria-live="polite"` announcer for turn change announcements
- Used `dmTranslations` (T) for all static template strings; hardcoded Russian in client script
- Active row: `bg-[var(--accent)]/10` + purple dot + "Ход" pill badge
- Initiative score rendered in `text-[var(--gold)]` for emphasis
- Delete button: plain `<button>` with ghost-like styling and ✕ SVG (DmButton doesn't forward aria-label)
- Build passes cleanly

## Open5eReference Redesign (2026-05-15)

### What changed
- Tabs redesigned from pill buttons to gold-underline style (`border-b-2 border-[var(--gold)]`)
- Search input wrapped with magnifying-glass SVG icon (absolute positioned, `pointer-events-none`)
- Filter select styled to match DmInput focus ring (gold instead of accent)
- Results layout changed from vertical list to responsive grid (`grid-cols-1 sm:grid-cols-2`)
- Result cards use DmCard-like classes (`bg-[var(--bg-card)]`, `border-[var(--border-gold-strong)]`, shadow) with hover lift (`hover:-translate-y-0.5`)
- Card titles switched to `text-[var(--gold)]` with `group-hover:text-[var(--gold-hover)]`
- Loading skeletons added: 4 shimmer placeholders in Astro template, toggled via `o5-skeletons` container
- Custom `@keyframes shimmer` + `.o5-shimmer` class for gold-tinted skeleton animation
- Empty state enhanced with search icon (SVG) and two-line message
- Error state now includes retry button (`DmButton` secondary variant) wired to `manager.search()`
- Detail modal card gets `border-2 border-[var(--accent)]` for purple-tinted border

### Preservation
- All Open5e API calls untouched (`Open5eUIManager` imported from `@/lib/client/open5e-ui`)
- Debounce already implemented in manager (`setQueryDebounced` uses `setTimeout` 300ms); component continues calling it
- Pagination, modal ESC/overlay-click close, ARIA attributes all preserved
- All event listeners and state management logic kept verbatim

### Verification
- Build passes cleanly (`npm run build` completes with no errors)

## InitiativeTracker E2E Tests (2026-05-15)

### What was done
- Created `tests/dm/initiative.spec.ts` with 5 test cases covering:
  - Adding a combatant with auto-roll
  - Sorting by initiative descending (deterministic via manual initiative input)
  - Next turn cycling active combatant
  - Deleting a combatant
  - Mobile viewport rendering
- Added `data-testid` attributes to `InitiativeTracker.astro` for all test selectors
- Added `dataTestid` prop forwarding to `DmInput.astro` and `DmButton.astro`
- Added `active` class to active combatant row in client script for `.active` selector

### Bug found and fixed
- `DmButton.astro` did NOT forward the `id` prop. InitiativeTracker's client script relies on `document.getElementById('it-add-btn')`, `it-roll-btn`, `it-next-btn`, `it-clear-btn`. Because `id` was swallowed by DmButton, all button event listeners were `null` and the tracker was completely non-functional.
- Fix: added `id?: string` to DmButton Props and forwarded `id={id}` to both `<a>` and `<button>` rendered elements.

### Test determinism
- The "sort by initiative descending" test in the spec used auto-roll for both combatants, making it non-deterministic (could flake). Fixed by filling the manual initiative input with deterministic values (25 and 10) before adding each combatant.
- Similarly, "next turn" and "delete" tests now use deterministic initiative values to avoid any RNG-related flakiness.

### Verification
- `npm run build` passes cleanly
- `npx playwright test tests/dm/initiative.spec.ts` passes all 10 tests (5 tests × 2 projects: chromium + mobile-chromium)

## Verification (T18)
- Build passes cleanly (`npm run build` exit 0).
- Tests pass: 148/148 Vitest, 6/6 Playwright data-migration.
- `npx tsc --noEmit --project tsconfig.json` produces no errors (clean).
- Data migration findings:
  - Dice history: INCOMPATIBLE — old `result` field (no `total`/`rolls`) causes `renderHistory` to throw.
  - Initiative: PARTIAL — old data renders but delete is broken due to missing `id`.
  - Notes: FULLY COMPATIBLE — plain string loads correctly.

## Playwright E2E Testing (2026-05-15)

### Discoveries
- DmLayout renders `slot name="context"` twice (mobile in `<main>` + desktop in `<aside>`), causing duplicate component instances in DOM.
- Astro deduplicates `<script>` tags per page, so component scripts run once even when component appears twice. This breaks `document.getElementById`-based scripts.
- Fix: refactor scripts to use `querySelectorAll` within `[data-testid]` containers and initialize each instance independently.
- Playwright `:visible` pseudo-class is essential for selecting the correct instance when DOM has duplicates.
- `new URL("/path", "https://api.example.com/v2")` drops the `/v2` base path because leading `/` replaces entire path. Must use relative paths or trailing slash on base.
- Open5e API `challenge_rating_decimal` field does not exist in v2; returned `type` is an object `{name, key}`, not a string.

### Test Implementation
- Created `tests/dm/reference.spec.ts` covering tab switching, search filtering, detail modal, mobile viewport.
- Created `tests/dm/notes.spec.ts` covering textarea typing, auto-save indicator, clear button, character counter, mobile viewport.
- Added `data-testid` attributes to `Open5eReference.astro`, `NotesPanel.astro`, and `DmCard.astro`.
- Fixed `src/lib/open5e/client.ts` API URL construction bug (missing `/v2` due to leading slash in endpoint paths).
