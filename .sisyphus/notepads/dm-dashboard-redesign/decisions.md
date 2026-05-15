# DM Dashboard Redesign — Scope Fidelity Decisions

## F4 (Scope Fidelity Check) — 2026-05-15

### Decision: Do NOT fix issues
- Task scope is "report only, do not modify files."
- All findings documented in `issues.md` for downstream remediation.

### Decision: T2 CSS hydration gap accepted as partial
- The DmTabs component uses `<a href="#tab">` for graceful degradation and server-renders `aria-selected`.
- A true CSS `:target` approach for visual active state would require significant restructuring (e.g., sibling selectors or hidden radios).
- Current implementation is functionally adequate; missing item logged for future polish.

### Decision: T8 sidebar active state accepted as partial
- DmSidebar is an optional enhancement per dependency matrix ("Blocks: None").
- Active highlighting would require JS to read URL hash and toggle classes; sidebar is static Astro component.
- Logged as gap, not blocker.

### Decision: T14-T16 test gaps accepted as partial
- Core user flows are covered. Missing edge-case tests (persistence, pagination, filters) do not block release.
- Data migration spec.ts covers persistence scenario for T18, partially backfilling T14-T16 gaps.

### Decision: T18 data migration flagged as high-priority fix
- Dice history incompatibility causes uncaught JS exception → empty history for users with old data.
- Initiative delete broken on old data → users cannot remove legacy combatants.
- Recommended fix: add defensive checks in `renderHistory()` and `deleteCombatant()` before accessing `rolls`/`id`.
- These are 2-line fixes; should be done before release.

### Decision: `src/lib/open5e/client.ts` change is justified
- Without the URL fix, API calls fail with double slashes.
- Change is purely mechanical (path string normalization); no API contract changes.
- Classified as minor contamination but functionally necessary.

### Decision: `debug-open5e.mjs` flagged for cleanup
- Unaccounted debug script should be removed before commit.
