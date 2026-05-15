# T18 — Data Migration Verification

## Test Setup
- Pre-populated `sessionStorage` with old-format dice history and initiative data.
- Pre-populated `localStorage` with old-format notes.
- Ran Playwright tests against `/dm/#dice`, `/dm/#initiative`, `/dm/#notes` on both desktop and mobile viewports.

## Results

### Dice History (`dm-dice-history`)
**Status:** INCOMPATIBLE
- Old format uses `result` instead of `total` and omits `rolls`.
- `renderHistory()` calls `entry.rolls.includes(20)`, which throws when `rolls` is undefined.
- The uncaught exception aborts rendering, leaving the history list empty.
- **Evidence:** Playwright test confirms empty state is visible and 0 history items rendered.

### Initiative Tracker (`dm-initiative`)
**Status:** PARTIALLY COMPATIBLE
- Old format stores `name`, `modifier`, `initiative`, `active` but lacks `id` and `hp`.
- The list renders correctly (name and initiative score display).
- **Broken:** Delete button does nothing because `deleteCombatant()` cannot match a missing `id`.
- **Evidence:** Playwright test confirms the combatant renders and survives a delete click.

### Notes (`dm-notes`)
**Status:** FULLY COMPATIBLE
- Old format stores a plain string; new `loadNotes()` reads the same key unchanged.
- Textarea populates correctly from `localStorage`.
- **Evidence:** Playwright test confirms textarea value matches old data.

## Summary
| Feature | Compatibility |
|---------|---------------|
| Dice history | Broken — missing `total`/`rolls` fields cause JS error |
| Initiative | Loads but delete is broken due to missing `id` |
| Notes | Fully compatible |

## Commands Run
```bash
npx playwright test tests/dm/data-migration.spec.ts
```
All 6 tests passed (3 scenarios × 2 viewports).
