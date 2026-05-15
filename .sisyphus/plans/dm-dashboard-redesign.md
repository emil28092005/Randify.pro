# Plan: DM Dashboard UI Redesign

## TL;DR

> **Quick Summary**: Redesign the DM Dashboard (`/dm/`, `/ru/dm/`) with a purple-gold theme (`#534AB7` + `#c8a84b`), tab-based navigation, and a dashboard-style layout (3-column desktop, tabbed mobile). Preserve all existing functionality while creating an extensible design system.
>
> **Deliverables**:
> - Updated design tokens in `dm-theme.css`
> - New `DmTabs` navigation component
> - Redesigned `DmLayout` with dashboard grid
> - Visual refresh of all feature components (DiceRoller, InitiativeTracker, Open5eReference, NotesPanel, AuthPanel)
> - Playwright E2E tests covering all user flows
> - Updated `/dm/index.astro` and `/ru/dm/index.astro`
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Wave 1 (Design System) → Wave 2 (Layout + Tabs) → Wave 3 (Feature Components) → Wave 4 (Tests + Polish)

---

## Context

### Original Request
Improve the DM Dashboard interface to be visually pleasing while preserving usability and functionality. Use provided mockups for inspiration. Must remain extensible for future features.

### Interview Summary
**Key Decisions**:
- **Color scheme**: Switch to purple-gold (`#534AB7` primary, `#c8a84b` secondary), matching mockups and main site accent
- **Layout**: Tab-based navigation with 3-column dashboard on desktop, tabbed sections on mobile
- **Language**: Russian-only, update both `/dm/` and `/ru/dm/`
- **Testing**: Playwright E2E tests for UI interactions and visual regression
- **Extensibility**: Must support unknown future features flexibly

**Research Findings**:
- Current DM Dashboard uses orange (`#E87722`) with 2-column grid and anchor navigation
- UI primitives exist: DmButton, DmCard, DmInput, DmHeader
- Feature components: DiceRoller, InitiativeTracker, Open5eReference, NotesPanel, AuthPanel
- All state persistence (sessionStorage/localStorage) must be preserved
- Tailwind CSS v4 with CSS custom properties via `.dm-theme` scoping

### Metis Review
**Identified Gaps** (addressed):
- Need explicit tab state management (URL hash or query param for shareability)
- Must preserve sessionStorage/localStorage keys to avoid losing user data
- Mobile tab navigation needs touch-friendly sizing (min 44px tap targets)
- Extensibility requires a plugin-ready navigation slot in the layout

### Adversarial Review Findings (Hyperplan Team)

The hyperplan team of 4 critics (unspecified-low, unspecified-high, ultrabrain, artistry) reviewed the plan. Key findings:

**🎯 Coherence & Feasibility (critic-high)**:
1. **Dependency matrix is inconsistent**: T8 blocks T6-T7 but Wave 2 marks them as parallel. Resolution: T8 does NOT block T6-T7; sidebar is optional for page structure.
2. **Critical path is wrong**: T9-T13 depend on T6 (page structure), not just T4. Resolution: Critical path updated to T1-T4 → T5 → T6 → T9-T13.
3. **Layout conflict**: 3-column DmLayout conflicts with page's own 2-column grid. Resolution: DmLayout provides the grid; pages place sections into slots, not their own grid.
4. **No existing Playwright tests**: Found no `.spec.ts` files. Resolution: Add T0 to verify Playwright is installed and configured before writing tests.
5. **Pages already diverge**: `/dm/index.astro` and `/ru/dm/index.astro` have different padding/gap. Resolution: Make them identical in structure; differences should only be locale.
6. **Theme tokens insufficient**: Current `.dm-theme` has 11 properties; new design needs more. Resolution: Expand token set in T1.
7. **Missing i18n updates**: New strings (tab labels, sidebar sections) not in plan. Resolution: Add T4.5 for i18n updates.
8. **No task removes old anchor nav**: Plan introduces DmTabs but doesn't remove old anchor nav. Resolution: Explicitly include in T6.
9. **AuthPanel redesign needs clarification**: Must NOT Have says no auth logic changes, but visual redesign is fine. Resolution: Clarify T13 scope.

**🔍 Quick Wins (critic-low)**:
10. **Missing loading skeletons**: Open5eReference needs skeleton screens for better UX. Resolution: Add to T11.
11. **No empty state designs**: Components need polished empty states. Resolution: Add acceptance criteria to T9-T12.
12. **Missing hover states**: Plan doesn't specify hover states for interactive elements. Resolution: Add to design token spec in T1.
13. **No search debounce**: Open5e search should debounce input. Resolution: Add to T11.

**🧠 Deep Technical (critic-ultra)**:
14. **Tab state management**: URL hash is fragile. Recommendation: Use query param (`?tab=dice`) or localStorage for tab preference, with URL hash as fallback.
15. **Astro islands hydration**: Components with `client:*` directives may hydrate independently. Tabs need to work before AND after hydration. Resolution: Use CSS for initial tab visibility, JS enhances.
16. **Data preservation strategy**: Must verify old sessionStorage/localStorage data loads correctly after component redesign. Resolution: Add data migration verification to T18.
17. **ARIA live regions**: Dice results and initiative updates need `aria-live="polite"` for screen readers. Resolution: Add to T9-T10.
18. **localStorage cross-tab sync**: Notes panel should sync across tabs using `storage` event. Resolution: Add to T12.

**🎨 UX & Visual (critic-art)**:
19. **Color contrast**: Purple (#534AB7) on dark backgrounds may fail WCAG AA for small text. Gold (#c8a84b) should be used for high-contrast elements. Resolution: Add contrast verification to T17.
20. **Typography consistency**: BaseLayout uses Space Grotesk, mockups use system sans-serif. Decision: Keep Space Grotesk for consistency with main site.
21. **Micro-interactions**: Need explicit hover transitions, active states, and focus styles. Resolution: Add transition tokens to T1.
22. **Mobile UX**: Top tabs may be hard to reach. Consider bottom sheet or swipe gestures for mobile. Resolution: Add to T17 as exploration item.
23. **Visual consistency risk**: 5 components redesigned in parallel may diverge. Resolution: Add consistency review gate before Wave 4.

---

## Work Objectives

### Core Objective
Redesign the DM Dashboard with a visually cohesive purple-gold theme, dashboard-style layout, and tab-based navigation, while preserving all existing functionality and data persistence.

### Concrete Deliverables
1. Updated `src/styles/dm-theme.css` with purple-gold tokens
2. New `src/components/dm/DmTabs.astro` — tab navigation component
3. Redesigned `src/layouts/DmLayout.astro` — dashboard grid layout
4. Redesigned `src/components/dm/DmHeader.astro` — updated header styling
5. Redesigned `src/components/dm/DiceRoller.astro` — visual refresh
6. Redesigned `src/components/dm/InitiativeTracker.astro` — visual refresh
7. Redesigned `src/components/dm/Open5eReference.astro` — visual refresh
8. Redesigned `src/components/dm/NotesPanel.astro` — visual refresh
9. Redesigned `src/components/dm/AuthPanel.astro` — visual refresh
10. Updated `src/pages/dm/index.astro` and `src/pages/ru/dm/index.astro`
11. Playwright E2E tests in `tests/dm/`

### Definition of Done
- [ ] `npm run build` completes without errors
- [ ] Playwright E2E tests pass (`npm run test:e2e`)
- [ ] All existing functionality works identically (dice rolls, initiative, Open5e search, notes, auth)
- [ ] sessionStorage/localStorage data is preserved across redesign
- [ ] Visual design matches mockup inspiration (purple-gold, cards, pill nav)
- [ ] Layout is responsive: 3-column desktop, tabbed mobile

### Must Have
- Purple (`#534AB7`) + gold (`#c8a84b`) color scheme
- Tab-based navigation between sections (Dice, Initiative, Reference, Notes)
- Dashboard-style 3-column layout on desktop (sidebar | main | context)
- All existing functionality preserved with zero data loss
- Playwright E2E tests for critical user flows
- Both `/dm/` and `/ru/dm/` updated
- Russian language throughout

### Must NOT Have (Guardrails)
- NO changes to auth/OAuth logic
- NO changes to Open5e API integration
- NO backend/database schema changes
- NO new functional features (generators, tools, etc.)
- NO breaking changes to sessionStorage/localStorage keys
- NO pure-black backgrounds (maintain warm dark tones from mockups)
- NO hardcoded pixel values without design tokens
- NO removal of accessibility features (focus rings, ARIA labels)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Playwright configured, `npm run test:e2e`)
- **Automated tests**: YES (Playwright E2E)
- **Framework**: Playwright
- **Agent QA**: Every task includes agent-executed QA scenarios

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright skill — Navigate, interact, assert DOM, screenshot
- **Visual regression**: Screenshot comparison for key states

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — Design System + Tokens + Infra):
├── Task 0: Verify Playwright test infrastructure [quick]
├── Task 1: Update dm-theme.css with purple-gold tokens [quick]
├── Task 2: Create DmTabs tab navigation component [quick]
├── Task 3: Redesign DmHeader with new theme [quick]
├── Task 4: Update DmButton/DmCard/DmInput primitives [quick]
└── Task 4.5: Update i18n strings for new UI [quick]

Wave 2 (Layout + Structure):
├── Task 5: Redesign DmLayout with dashboard grid [unspecified-high]
├── Task 6: Update /dm/index.astro page structure [quick]
├── Task 7: Update /ru/dm/index.astro page structure [quick]
└── Task 8: Create sidebar navigation component [quick]

Wave 3 (Feature Components — MAX PARALLEL):
├── Task 9: Redesign DiceRoller [visual-engineering]
├── Task 10: Redesign InitiativeTracker [visual-engineering]
├── Task 11: Redesign Open5eReference [visual-engineering]
├── Task 12: Redesign NotesPanel [visual-engineering]
└── Task 13: Redesign AuthPanel [visual-engineering]

Wave 4 (Tests + Polish):
├── Task 14: Playwright E2E tests — dice flow [unspecified-high]
├── Task 15: Playwright E2E tests — initiative flow [unspecified-high]
├── Task 16: Playwright E2E tests — reference + notes flow [unspecified-high]
├── Task 17: Cross-browser visual QA + responsive testing [unspecified-high]
└── Task 18: Build verification + data migration check [quick]

Wave FINAL (Review):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T0-T4, T4.5 (parallel, Wave 1) → T5 → T6 → T9-T13 (parallel, Wave 3) → T14-T18 (parallel, Wave 4) → F1-F4 (parallel, Wave FINAL) → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Wave 1)
```

### Dependency Matrix (Corrected)

| Task | Depends On | Blocks |
|------|-----------|--------|
| T0 (Playwright) | — | T14-T16 |
| T1 (Tokens) | — | T3, T4, T9-T13 |
| T2 (DmTabs) | — | T5, T8 |
| T3 (DmHeader) | T1 | T5 |
| T4 (Primitives) | T1 | T9-T13 |
| T4.5 (i18n) | — | T9-T12 |
| T5 (DmLayout) | T2, T3 | T6-T7 |
| T6 (/dm/ page) | T5 | T9-T13, T17-T18 |
| T7 (/ru/dm/ page) | T5 | T17-T18 |
| T8 (Sidebar) | T2 | — (optional, no downstream block) |
| T9 (DiceRoller) | T4, T4.5, T6 | T14 |
| T10 (InitiativeTracker) | T4, T4.5, T6 | T15 |
| T11 (Open5eReference) | T4, T4.5, T6 | T16 |
| T12 (NotesPanel) | T4, T4.5, T6 | T16 |
| T13 (AuthPanel) | T4, T6 | T17 |
| T14 (E2E dice) | T0, T9 | F3 |
| T15 (E2E initiative) | T0, T10 | F3 |
| T16 (E2E ref+notes) | T0, T11, T12 | F3 |
| T17 (Visual QA) | T6, T7, T13 | F3 |
| T18 (Build) | T6, T7 | F2 |

### Agent Dispatch Summary

- **Wave 1**: 6 tasks → `quick` (T0-T4, T4.5)
- **Wave 2**: 4 tasks → T5 `unspecified-high`, T6-T8 `quick`
- **Wave 3**: 5 tasks → `visual-engineering` (T9-T13)
- **Wave 4**: 5 tasks → T14-T17 `unspecified-high`, T18 `quick`
- **FINAL**: 4 tasks → F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] **T0. Verify Playwright test infrastructure**

  **What to do**:
  - Check if Playwright is installed: look for `@playwright/test` in `package.json`
  - Check if Playwright config exists: `playwright.config.ts` or similar
  - Check if test directory exists and has examples: `tests/` or `e2e/`
  - If Playwright is NOT fully configured:
    - Install `@playwright/test`: `npm install -D @playwright/test`
    - Create basic `playwright.config.ts` with project settings
    - Add `test:e2e` script to `package.json` if missing
    - Create a simple smoke test to verify setup works
  - If Playwright IS configured:
    - Verify config works by running existing tests
    - Document test patterns for DM Dashboard tests
  - **This task MUST complete before T14-T16**

  **Must NOT do**:
  - Write full DM Dashboard tests (that's T14-T16)
  - Change Vitest configuration

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Infrastructure verification and setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (preparation)
  - **Blocks**: T14-T16
  - **Blocked By**: None

  **References**:
  - `package.json` — Check for `@playwright/test`
  - `playwright.config.ts` or `playwright.config.js` — Existing config
  - `tests/` directory — Existing tests

  **Acceptance Criteria**:
  - [ ] Playwright installation verified
  - [ ] Config file present and valid
  - [ ] `npm run test:e2e` command works (or `npx playwright test`)
  - [ ] Basic smoke test passes

  **QA Scenarios**:
  ```
  Scenario: Playwright setup works
    Tool: Bash
    Preconditions: None
    Steps:
      1. Check `package.json` for `@playwright/test`
      2. Run `npx playwright test --list` (or create minimal test first)
      3. Assert: No "command not found" or config errors
    Expected Result: Playwright is ready for E2E tests
    Evidence: .sisyphus/evidence/t0-playwright.txt
  ```

  **Commit**: YES
  - Message: `chore(test): verify and setup Playwright E2E infrastructure`
  - Files: `package.json`, `playwright.config.ts` (if created)

- [x] **T1. Update dm-theme.css with purple-gold tokens**

  **What to do**:
  - Replace orange tokens with purple-gold palette in `src/styles/dm-theme.css`
  - Primary accent: `#534AB7` (purple)
  - Secondary accent: `#c8a84b` (gold)
  - Update background colors to warm dark tones from mockups: `#16120e` (base), `#1e1912` (surface), `#221e18` (card)
  - Add semantic colors: green `#6ab04c` (crit/success), red `#e06060` (fail)
  - **NEW**: Add transition tokens: `--transition-fast: 150ms`, `--transition-base: 250ms`, `--transition-slow: 350ms`
  - **NEW**: Add hover state colors: `--accent-hover: #6b5fc7` (lighter purple), `--gold-hover: #d4b76a` (lighter gold)
  - **NEW**: Add focus ring token: `--focus-ring: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent)`
  - **NEW**: Add shadow tokens: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow` (purple-tinted)
  - Keep CSS custom property structure intact (`.dm-theme` scope)
  - Ensure smooth transitions for color changes
  - **IMPORTANT**: Do NOT rename existing properties used by components — only change their values

  **Must NOT do**:
  - Change property names (to avoid breaking existing component references)
  - Remove any existing variables that components depend on
  - Use pure black (`#000000`) backgrounds

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple CSS token update, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2, T3, T4, T4.5)
  - **Blocks**: T3, T9-T13
  - **Blocked By**: None

  **References**:
  - `src/styles/dm-theme.css` — Current theme variables (preserve structure)
  - `src/layouts/BaseLayout.astro` — Base accent `#534ab7` for reference
  - Mockup color analysis in draft — Warm dark tones, purple/gold accents

  **Acceptance Criteria**:
  - [ ] `src/styles/dm-theme.css` updated with purple-gold tokens
  - [ ] **NEW**: At least 15+ CSS properties defined (expanded from 11)
  - [ ] **NEW**: Transition tokens present
  - [ ] **NEW**: Hover state colors present
  - [ ] **NEW**: Shadow tokens present
  - [ ] No component breaks due to missing variables
  - [ ] Build passes: `npm run build`

  **QA Scenarios**:
  ```
  Scenario: Verify theme colors load correctly
    Tool: Playwright
    Preconditions: Dev server running (`npm run dev`)
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Take screenshot of full page
      3. Assert: No orange (#E87722) visible in major UI elements
      4. Assert: Purple (#534AB7) visible in header/buttons
      5. Assert: Gold (#c8a84b) visible in dice/labels
    Expected Result: Page renders with purple-gold theme, no orange remnants
    Evidence: .sisyphus/evidence/t1-theme-colors.png
  ```

  **Commit**: YES
  - Message: `style(dm): update theme to purple-gold palette`
  - Files: `src/styles/dm-theme.css`

- [x] **T2. Create DmTabs tab navigation component**

  **What to do**:
  - Create `src/components/dm/DmTabs.astro` component
  - Horizontal pill navigation: Кубики | Инициатива | Справочник | Заметки
  - Active state: purple fill (`#534AB7`) + white text
  - Inactive state: dark fill + gold-tinted border + muted text
  - Mobile: horizontally scrollable (`overflow-x: auto`, hide scrollbar)
  - Desktop: centered or left-aligned pill row
  - **REVISED**: Tab state management strategy:
    - **Initial render**: Use CSS (`:target` or hidden checkbox) to show correct tab based on URL hash, so tab is correct BEFORE JS hydrates
    - **Enhanced behavior**: JS reads URL hash on load, manages active state, updates hash on click
    - **Fallback**: If no hash, default to first tab (Кубики)
    - **Persistence**: Optionally save last active tab to localStorage for return visits
  - Emit custom event (`dm-tab-change`) for other components to listen
  - Accessible: `role="tablist"`, `role="tab"`, `aria-selected`, keyboard navigation (Arrow keys)
  - **NEW**: Touch-friendly sizing: min-height 44px, min-width 80px for tabs

  **Must NOT do**:
  - Implement actual section content switching (layout/page handles this)
  - Use client-side routing (keep Astro static behavior)
  - Break existing anchor links

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Component creation with Tailwind classes and ARIA attributes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3-T4, T4.5)
  - **Blocks**: T5-T8
  - **Blocked By**: None

  **References**:
  - `src/components/dm/DmButton.astro` — Button styling patterns, focus rings
  - Mockup navigation — Pill shape, active/inactive states
  - Current `src/pages/dm/index.astro` — Existing anchor nav structure

  **Acceptance Criteria**:
  - [ ] Component file created: `src/components/dm/DmTabs.astro`
  - [ ] 4 tabs rendered with correct labels
  - [ ] Active tab visually distinct (purple fill)
  - [ ] URL hash updates on tab click
  - [ ] Keyboard navigation works (Left/Right arrows)
  - [ ] **NEW**: Tab correct on initial load (before JS hydration)
  - [ ] **NEW**: Touch targets ≥44px
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Tab switching and URL hash
    Tool: Playwright
    Preconditions: Dev server running, page with DmTabs mounted
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Click tab "Инициатива"
      3. Assert: URL contains `#initiative`
      4. Assert: "Инициатива" tab has purple background
      5. Assert: "Кубики" tab is inactive (dark background)
      6. Press ArrowRight key
      7. Assert: "Справочник" tab becomes active
    Expected Result: Tabs switch correctly, URL updates, keyboard works
    Evidence: .sisyphus/evidence/t2-tabs-navigation.png

  Scenario: Mobile scrollable tabs
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375px width (iPhone SE)
      2. Navigate to `http://localhost:4321/dm/`
      3. Take screenshot
      4. Assert: Tabs are in single horizontal row
      5. Assert: No tabs wrap to second line
      6. Assert: Tab height ≥44px
    Expected Result: Tabs horizontally scrollable on mobile with touch-friendly sizing
    Evidence: .sisyphus/evidence/t2-tabs-mobile.png

  Scenario: Initial tab state without JS
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:4321/dm/#initiative`
      2. Disable JavaScript in browser context
      3. Refresh page
      4. Assert: "Инициатива" tab is visually active
    Expected Result: Tab state works before hydration
    Evidence: .sisyphus/evidence/t2-tabs-nojs.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add DmTabs navigation component`
  - Files: `src/components/dm/DmTabs.astro`

- [x] **T3. Redesign DmHeader with new theme**

  **What to do**:
  - Update `src/components/dm/DmHeader.astro` to match purple-gold theme
  - Keep existing structure: quill icon, title slot, auth slot
  - Update styling: use new theme tokens, add gold accent to icon
  - Ensure backdrop blur and sticky positioning preserved
  - Add subtle bottom border using gold-tinted color (`rgba(200,168,75,0.15)`)
  - Update logo/quill icon color to purple or gold
  - Maintain responsive behavior

  **Must NOT do**:
  - Change component props or slots
  - Remove backdrop blur
  - Break existing usages in DmLayout

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Visual update of existing component

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1-T2, T4)
  - **Blocks**: T5
  - **Blocked By**: T1 (needs theme tokens)

  **References**:
  - `src/components/dm/DmHeader.astro` — Current implementation
  - `src/styles/dm-theme.css` — Updated tokens (from T1)
  - Mockup header — Logo + user button styling

  **Acceptance Criteria**:
  - [ ] Header uses new theme colors
  - [ ] Backdrop blur preserved
  - [ ] No visual regressions in layout
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Header renders with new theme
    Tool: Playwright
    Preconditions: Dev server running, T1 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Take screenshot of header area
      3. Assert: Header background uses dark warm tone
      4. Assert: Quill icon or logo uses purple/gold
      5. Assert: Bottom border is subtle gold tint
    Expected Result: Header visually matches mockup inspiration
    Evidence: .sisyphus/evidence/t3-header.png
  ```

  **Commit**: YES
  - Message: `style(dm): redesign DmHeader with purple-gold theme`
  - Files: `src/components/dm/DmHeader.astro`

- [x] **T4. Update DmButton/DmCard/DmInput primitives**

  **What to do**:
  - Update `src/components/dm/DmButton.astro`:
    - Primary variant: purple fill (`#534AB7`) with gold shadow
    - Secondary variant: dark fill with gold border
    - Ghost variant: transparent with gold hover
    - Update focus rings to purple
  - Update `src/components/dm/DmCard.astro`:
    - Background: warm dark card surface (`#221e18`)
    - Border: subtle gold-tinted (`rgba(180,150,80,0.1)`)
    - Shadow: `shadow-lg shadow-black/20` preserved
  - Update `src/components/dm/DmInput.astro`:
    - Background: dark input surface
    - Border: gold-tinted focus state
    - Placeholder text: muted warm tone
  - Ensure all components use CSS custom properties where possible
  - Maintain existing props API (no breaking changes)

  **Must NOT do**:
  - Rename or remove props
  - Change component structure (slots, render logic)
  - Break existing usages

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Visual updates to existing primitive components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1-T3)
  - **Blocks**: T9-T13
  - **Blocked By**: T1 (needs theme tokens)

  **References**:
  - `src/components/dm/DmButton.astro` — Current button implementation
  - `src/components/dm/DmCard.astro` — Current card implementation
  - `src/components/dm/DmInput.astro` — Current input implementation
  - Mockup buttons/cards — Pill shapes, borders, shadows

  **Acceptance Criteria**:
  - [ ] All three primitives use new theme colors
  - [ ] Existing props still work (variants, sizes, etc.)
  - [ ] No visual regressions in components that use them
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Button variants render correctly
    Tool: Playwright
    Preconditions: Dev server running, T1 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Take screenshot showing buttons (e.g., in DiceRoller or InitiativeTracker)
      3. Assert: Primary buttons have purple background
      4. Assert: Secondary buttons have gold-tinted border
    Expected Result: Buttons match new theme
    Evidence: .sisyphus/evidence/t4-primitives.png
  ```

  **Commit**: YES
  - Message: `style(dm): update UI primitives for purple-gold theme`
  - Files: `src/components/dm/DmButton.astro`, `src/components/dm/DmCard.astro`, `src/components/dm/DmInput.astro`

- [x] **T4.5. Update i18n strings for new UI**

  **What to do**:
  - Update `src/i18n/dm-translations.ts` with new strings needed for redesigned UI:
    - Tab labels: "Кубики", "Инициатива", "Справочник", "Заметки"
    - Sidebar sections: "ИНСТРУМЕНТЫ", "СПРАВОЧНИК"
    - Action labels: "Бросить", "Следующий ход", "Очистить", "+ Добавить", "Сохранено"
    - Empty states: "Нет истории бросков", "Нет combatантов", "Нет результатов", "Начните писать заметки..."
    - Loading states: "Загрузка...", "Поиск..."
  - Ensure all existing strings are preserved
  - Use `useT(lang)` pattern consistent with existing translations
  - Export new typed translation keys

  **Must NOT do**:
  - Change existing translation keys (to avoid breaking components)
  - Add English translations (RU-only for DM Dashboard)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple string additions to existing translation file

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1-T4)
  - **Blocks**: T9-T13 (components need new strings)
  - **Blocked By**: None

  **References**:
  - `src/i18n/dm-translations.ts` — Current DM translations
  - `src/i18n/translations.ts` — Main site translation pattern

  **Acceptance Criteria**:
  - [ ] New strings added to `dm-translations.ts`
  - [ ] All strings used in redesigned components
  - [ ] TypeScript types updated
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Translations load correctly
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Assert: Tab labels are in Russian
      3. Assert: Button labels are in Russian
      4. Assert: No untranslated English strings visible
    Expected Result: All UI text in Russian
    Evidence: .sisyphus/evidence/t4_5-i18n.png
  ```

  **Commit**: YES (grouped with T4)
  - Message: `feat(dm): add i18n strings for redesigned UI`
  - Files: `src/i18n/dm-translations.ts`

- [x] **T5. Redesign DmLayout with dashboard grid**

  **What to do**:
  - Redesign `src/layouts/DmLayout.astro` to support dashboard-style layout:
    - Desktop (lg+): 3-column grid container — sidebar slot (260px) | main slot (1fr) | context slot (300px)
    - Mobile/tablet (<lg): Single column layout
    - **IMPORTANT**: DmLayout provides the GRID STRUCTURE only. Pages place sections into named slots (`sidebar`, `main`, `context`), NOT their own grids.
  - Integrate `DmTabs` component (from T2) for mobile tab navigation
  - Keep `BaseLayout` wrapping, `hideLanguageSwitcher={true}`
  - Named slots: `sidebar` (left), `main` (center), `context` (right), plus default `main` fallback
  - On mobile: only `main` slot is visible; `sidebar` and `context` are hidden or collapsed
  - Ensure `.dm-theme` class applied to wrapper
  - Update footer styling to match new theme
  - Preserve all existing behavior (DmHeader slots, footer content)

  **Must NOT do**:
  - Change the `BaseLayout` wrapping structure
  - Remove existing slots or props
  - Break auth/session behavior
  - Force pages to use specific grid layouts (pages use slots)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Layout restructuring requires careful coordination of multiple components

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3)
  - **Parallel Group**: Wave 2
  - **Blocks**: T6-T8
  - **Blocked By**: T2 (DmTabs), T3 (DmHeader)

  **References**:
  - `src/layouts/DmLayout.astro` — Current layout
    - `src/components/dm/DmTabs.astro` — New tab component (T2)
    - `src/components/dm/DmHeader.astro` — Updated header (T3)
    - Mockup layouts — Desktop 3-column, mobile stacked

  **Acceptance Criteria**:
  - [ ] Desktop shows 3-column grid with named slots
  - [ ] Mobile shows single column (only main slot)
  - [ ] DmHeader renders correctly in new layout
  - [ ] Footer renders correctly
  - [ ] **NEW**: Pages can use named slots without their own grids
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Desktop 3-column layout with slots
    Tool: Playwright
    Preconditions: Dev server running, T2-T4 complete
    Steps:
      1. Set viewport to 1440x900
      2. Navigate to `http://localhost:4321/dm/`
      3. Take full-page screenshot
      4. Assert: Left sidebar visible (~260px)
      5. Assert: Main content area visible (center)
      6. Assert: Right context panel visible (~300px)
    Expected Result: Dashboard grid renders correctly on desktop
    Evidence: .sisyphus/evidence/t5-layout-desktop.png

  Scenario: Mobile single column
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set viewport to 375x812 (iPhone X)
      2. Navigate to `http://localhost:4321/dm/`
      3. Take screenshot
      4. Assert: Single column layout
      5. Assert: Tab navigation visible at top
      6. Assert: Sidebar and context panel hidden
    Expected Result: Mobile shows only main content with tabs
    Evidence: .sisyphus/evidence/t5-layout-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(dm): redesign DmLayout with dashboard grid`
  - Files: `src/layouts/DmLayout.astro`

- [x] **T6. Update /dm/index.astro page structure**

  **What to do**:
  - Rewrite `src/pages/dm/index.astro` to work with new DmLayout dashboard grid
  - **REMOVE old anchor navigation** (the pill buttons linking to `#dice`, `#initiative`, etc.)
  - Structure sections using DmLayout named slots:
    - `sidebar` slot: DmSidebar component
    - `main` slot: DiceRoller and InitiativeTracker (desktop), active tab section (mobile)
    - `context` slot: Open5eReference and NotesPanel (desktop only)
  - Use `DmTabs` for mobile tab navigation (already integrated in DmLayout)
  - **Desktop**: All sections visible simultaneously in their slots
  - **Mobile**: Only active tab section visible in main slot
  - Keep `prerender = false`
  - Ensure auth state still passed through (Astro.locals.user)
  - **IMPORTANT**: Do NOT create your own grid — use DmLayout's named slots

  **Must NOT do**:
  - Change `prerender` setting
  - Remove auth integration
  - Add new functional features
  - Create page-level grids (use DmLayout slots)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Page structure update using existing components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T7-T8)
  - **Blocks**: T9-T13
  - **Blocked By**: T5 (DmLayout)

  **References**:
  - `src/pages/dm/index.astro` — Current page
  - `src/layouts/DmLayout.astro` — New layout (T5)
  - `src/components/dm/DmTabs.astro` — Tab component (T2)

  **Acceptance Criteria**:
  - [ ] Old anchor navigation removed
  - [ ] Page uses DmLayout named slots
  - [ ] All 4 sections accessible via tabs (mobile) or visible (desktop)
  - [ ] Auth state works (login/logout)
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: All sections accessible
    Tool: Playwright
    Preconditions: Dev server running, T5 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/`
      2. Click each tab: Кубики, Инициатива, Справочник, Заметки
      3. Assert: Each click reveals corresponding section
      4. Assert: Section content is not empty
    Expected Result: All 4 sections accessible via tabs
    Evidence: .sisyphus/evidence/t6-sections.png
  ```

  **Commit**: YES
  - Message: `feat(dm): update /dm page for dashboard layout`
  - Files: `src/pages/dm/index.astro`

- [x] **T7. Update /ru/dm/index.astro page structure**

  **What to do**:
  - Update `src/pages/ru/dm/index.astro` to match `/dm/index.astro` (T6) **exactly in structure**
  - **FIX divergence**: Current `/ru/dm/index.astro` has different padding/gap (`py-8` vs `py-6`, `gap-6` vs `gap-4`). Make them identical.
  - Only differences allowed: locale (`ru`) and any locale-specific content
  - Keep `prerender = false`
  - Mirror all component imports and layout usage

  **Must NOT do**:
  - Deviate from `/dm/index.astro` structure
  - Add unique spacing or styling

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Mirror of T6

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T6, T8)
  - **Blocks**: T14-T17
  - **Blocked By**: T5 (DmLayout)

  **References**:
  - `src/pages/ru/dm/index.astro` — Current Russian mirror
  - `src/pages/dm/index.astro` — Updated main page (T6)

  **Acceptance Criteria**:
  - [ ] Page structure matches `/dm/index.astro` exactly (except locale)
  - [ ] Russian locale applied
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Russian mirror matches main page
    Tool: Playwright
    Preconditions: Dev server running, T6 complete
    Steps:
      1. Navigate to `http://localhost:4321/ru/dm/`
      2. Assert: Page renders correctly
      3. Assert: Tabs show Russian labels
      4. Compare screenshot with `/dm/` page
      5. Assert: Layout identical (except locale-specific content)
    Expected Result: Russian mirror is perfect structural match
    Evidence: .sisyphus/evidence/t7-ru-page.png
  ```

  **Commit**: YES (grouped with T6)
  - Message: `feat(dm): update /ru/dm mirror page`
  - Files: `src/pages/ru/dm/index.astro`

- [x] **T8. Create sidebar navigation component**

  **What to do**:
  - Create `src/components/dm/DmSidebar.astro`
  - Desktop-only sidebar (hidden on mobile)
  - Sections:
    - **ИНСТРУМЕНТЫ**: links to dice, initiative, reference, notes
    - **Placeholder sections** for future extensibility (e.g., "Кампании", "Персонажи")
  - Styling: dark background, gold-tinted borders, purple active state
  - Icons: simple SVG or Unicode symbols for each section
  - Collapsible on desktop (optional toggle)
  - Current user info (from auth) displayed at top

  **Must NOT do**:
  - Implement sidebar functionality beyond navigation links
  - Add backend integration for new sections

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Navigation component with Tailwind styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T6-T7)
  - **Blocks**: None (sidebar is optional enhancement, pages work without it)
  - **Blocked By**: T2 (DmTabs for nav patterns)

  **References**:
    - `src/components/dm/DmTabs.astro` — Tab styling patterns
    - Mockup sidebar — Section labels, icon + text items
    - `src/components/dm/AuthPanel.astro` — User info display

  **Acceptance Criteria**:
    - [ ] Sidebar component created
    - [ ] Visible only on desktop (lg+)
    - [ ] Links navigate to correct sections
    - [ ] Active section highlighted
    - [ ] Build passes

  **QA Scenarios**:
    ```
    Scenario: Sidebar navigation
      Tool: Playwright
      Preconditions: Dev server running, T2 complete
      Steps:
        1. Set viewport to 1440x900
        2. Navigate to `http://localhost:4321/dm/`
        3. Assert: Sidebar visible on left
        4. Click sidebar link "Инициатива"
        5. Assert: Main content switches to initiative section
      Expected Result: Sidebar navigates correctly
      Evidence: .sisyphus/evidence/t8-sidebar.png
    ```

    **Commit**: YES (grouped with T5)
    - Message: `feat(dm): add DmSidebar navigation component`
    - Files: `src/components/dm/DmSidebar.astro`

- [x] **T9. Redesign DiceRoller component**

  **What to do**:
  - Redesign `src/components/dm/DiceRoller.astro` to match mockup:
    - Quick dice row: d4-d100 pill buttons, active = purple fill, default = dark with gold border/text
    - Large result display: 48-52px gold number with die type subtitle
    - Custom formula input: dark background, gold-tinted border, purple "Бросить" button
    - Roll history: list of rolls with color-coded results (gold normal, green crit, red fail)
    - History header with "Очистить" action
    - **NEW**: Empty state when no history — show placeholder text "Нет истории бросков" with muted color and icon
    - **NEW**: Hover states on dice buttons (gold border glow on hover)
    - **NEW**: Active/pressed states on dice buttons (scale transform 0.95)
    - **NEW**: Smooth transitions for result number (count-up animation)
  - Preserve all existing functionality:
    - Dice notation parsing
    - `popElement` animation for results
    - sessionStorage history (max 10)
    - Critical hit/fail detection
  - **NEW**: Add `aria-live="polite"` to result display for screen readers
  - Use updated primitives (DmButton, DmCard, DmInput from T4)
  - Ensure result numbers use gold color, critical states use green/red

  **Must NOT do**:
  - Change dice notation syntax
  - Change sessionStorage keys or data format
  - Remove animation behavior
  - Break existing roll history data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Complex UI component requiring precise visual styling and preserved functionality

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T10-T13)
  - **Blocks**: T14
  - **Blocked By**: T4 (primitives), T4.5 (i18n), T6 (page structure)

  **References**:
  - `src/components/dm/DiceRoller.astro` — Current implementation
  - `src/components/dm/DmButton.astro`, `DmCard.astro`, `DmInput.astro` — Updated primitives (T4)
  - Mockup dice roller — Pill buttons, large result, history list
  - `src/lib/client/dice.ts` — Dice logic (preserve)

  **Acceptance Criteria**:
  - [ ] Visual design matches mockup (purple/gold, pills, large result)
  - [ ] All dice buttons work (d4, d6, d8, d10, d12, d20, d100)
  - [ ] Custom notation works (e.g., `2d6+3`)
  - [ ] Results animate correctly
  - [ ] History persists in sessionStorage
  - [ ] Critical hits (20) shown in green, fails (1) in red
  - [ ] **NEW**: Empty state shown when no history
  - [ ] **NEW**: Hover and active states on buttons
  - [ ] **NEW**: ARIA live region for result
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Dice rolling and history
    Tool: Playwright
    Preconditions: Dev server running, T4-T6 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/#dice`
      2. Click "d20" button
      3. Assert: Result area shows number (1-20)
      4. Assert: Number is gold-colored
      5. Enter "2d6+3" in custom input
      6. Click "Бросить"
      7. Assert: Result shows total (5-15)
      8. Assert: History shows 2 items
      9. Click "Очистить"
      10. Assert: History is empty
      11. Assert: Empty state placeholder visible
    Expected Result: Dice rolling works, history tracked, clear works, empty state shown
    Evidence: .sisyphus/evidence/t9-dice-roller.png

  Scenario: Critical hit/fail colors
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:4321/dm/#dice`
      2. Roll multiple times until natural 20 or 1 appears
      3. Assert: Natural 20 result is green (#6ab04c)
      4. Assert: Natural 1 result is red (#e06060)
    Expected Result: Critical results color-coded correctly
    Evidence: .sisyphus/evidence/t9-dice-crit.png

  Scenario: Hover and active states
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:4321/dm/#dice`
      2. Hover over "d20" button
      3. Assert: Button has hover effect (gold glow or lighter border)
      4. Press mouse down on "d20" button
      5. Assert: Button scales down slightly (active state)
    Expected Result: Interactive states visually distinct
    Evidence: .sisyphus/evidence/t9-dice-states.png
  ```

  **Commit**: YES
  - Message: `style(dm): redesign DiceRoller with purple-gold theme`
  - Files: `src/components/dm/DiceRoller.astro`

- [x] **T10. Redesign InitiativeTracker component**

  **What to do**:
  - Redesign `src/components/dm/InitiativeTracker.astro` to match mockup:
    - Add-row: name input + modifier input + gold "+ Добавить" button
    - Combatant list: sorted rows with order number, status dot, name, HP, initiative score, delete ✕
    - Current turn: purple tinted background/border + active purple dot + "Ход" badge
    - Header actions: "Следующий ход" (purple primary) and "Очистить" (muted outline)
    - Empty state: subtle placeholder when no combatants
    - **NEW**: Hover states on combatant rows (subtle background lighten)
    - **NEW**: Drag-to-reorder (optional stretch goal — only if time permits)
    - **NEW**: HP editable inline (click to edit)
  - Preserve all existing functionality:
    - Name + modifier + initiative inputs
    - Auto-roll d20+mod or manual entry
    - Sorted turn order
    - Active combatant highlighting
    - Delete individual combatants
    - Next turn cycling
    - sessionStorage persistence
  - **NEW**: Add `aria-live="polite"` for turn change announcements
  - Use updated primitives (DmButton, DmCard, DmInput from T4)

  **Must NOT do**:
  - Change sessionStorage keys or data format
  - Remove sorting behavior
  - Break existing combatant data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Complex component with state management and visual hierarchy

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T9, T11-T13)
  - **Blocks**: T15
  - **Blocked By**: T4 (primitives), T4.5 (i18n), T6 (page structure)

  **References**:
  - `src/components/dm/InitiativeTracker.astro` — Current implementation
  - `src/components/dm/DmButton.astro`, `DmCard.astro`, `DmInput.astro` — Updated primitives (T4)
  - Mockup initiative tracker — Turn rows, active highlighting, add form

  **Acceptance Criteria**:
  - [ ] Visual design matches mockup
  - [ ] Adding combatant works (auto-roll or manual)
  - [ ] List sorts by initiative correctly
  - [ ] Active combatant highlighted with purple
  - [ ] "Следующий ход" cycles correctly
  - [ ] Delete removes combatant
  - [ ] sessionStorage persists data
  - [ ] **NEW**: Empty state when no combatants
  - [ ] **NEW**: ARIA live region for turn changes
  - [ ] Build passes

  **QA Scenarios**:
    ```
    Scenario: Initiative tracking flow
      Tool: Playwright
      Preconditions: Dev server running, T4-T6 complete
      Steps:
        1. Navigate to `http://localhost:4321/dm/#initiative`
        2. Enter name "Гоблин", modifier "2"
        3. Click "+ Добавить"
        4. Assert: Combatant appears in list with initiative value
        5. Add "Орк" with modifier "0"
        6. Assert: List sorted by initiative descending
        7. Click "Следующий ход"
        8. Assert: Active combatant changes (purple highlight moves)
        9. Click "✕" on first combatant
        10. Assert: Combatant removed from list
      Expected Result: Full initiative flow works correctly
      Evidence: .sisyphus/evidence/t10-initiative.png
    ```

    **Commit**: YES
    - Message: `style(dm): redesign InitiativeTracker with purple-gold theme`
    - Files: `src/components/dm/InitiativeTracker.astro`

- [x] **T11. Redesign Open5eReference component**

  **What to do**:
  - Redesign `src/components/dm/Open5eReference.astro` to match mockup:
    - Tabbed interface: Монстры / Заклинания with gold underline active indicator
    - Search bar: dark input with gold focus, search icon
    - Filter dropdowns: CR (монстры) / Уровень (заклинания)
    - Results: card grid with subtle borders, hover effects
    - Loading state: purple spinner
    - Empty state: muted illustration or icon
    - Detail modal: full overlay with purple-tinted border, monster stat block or spell details
    - **NEW**: Loading skeletons — shimmer placeholders while loading results (3-5 skeleton cards)
    - **NEW**: Search debounce — 300ms debounce on search input to reduce API calls
    - **NEW**: Empty search state — "Ничего не найдено" with search icon when no results
    - **NEW**: Error retry — "Повторить" button when API fails
  - Preserve all existing functionality:
    - Open5e API integration
    - Search, filter, pagination
    - Detail modal with ESC/overlay click to close
    - ARIA labels and roles
  - Use updated primitives (DmButton, DmCard, DmInput from T4)
  - Add gold accent to monster names/spell names in results

  **Must NOT do**:
  - Change Open5e API calls or data handling
  - Remove pagination
  - Break modal behavior

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Complex component with tabs, search, filters, modal, and API integration

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T9-T10, T12-T13)
  - **Blocks**: T16
  - **Blocked By**: T4 (primitives), T4.5 (i18n), T6 (page structure)

  **References**:
  - `src/components/dm/Open5eReference.astro` — Current implementation
  - `src/lib/open5e/` — API client and types
  - `src/components/dm/DmButton.astro`, `DmCard.astro`, `DmInput.astro` — Updated primitives (T4)
  - Mockup reference — Search, cards, detail view

  **Acceptance Criteria**:
  - [ ] Visual design refreshed with purple-gold theme
    - [ ] Tabs have gold underline active state
    - [ ] Search input has gold focus ring
    - [ ] Result cards have subtle gold borders
    - [ ] Loading spinner is purple
    - [ ] Detail modal has purple-tinted border
  - [ ] Search works by name
  - [ ] Filters (CR/Level) work
  - [ ] Pagination works
  - [ ] Detail modal opens/closes correctly
  - [ ] **NEW**: Loading skeletons shown while fetching
  - [ ] **NEW**: Search debounced (300ms)
  - [ ] **NEW**: Empty state for no results
  - [ ] **NEW**: Error retry button
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Open5e search and detail
    Tool: Playwright
    Preconditions: Dev server running, T4-T6 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/#reference`
      2. Assert: Skeleton placeholders visible while loading
      3. Wait for monsters to load
      4. Assert: Skeletons replaced with results
      5. Type "goblin" in search
      6. Wait 350ms
      7. Assert: Results filtered to show goblin-related monsters
      8. Click first result card
      9. Assert: Detail modal opens with monster stats
      10. Press Escape
      11. Assert: Modal closes
    Expected Result: Search and detail flow works with skeletons and debounce
    Evidence: .sisyphus/evidence/t11-open5e.png

  Scenario: Empty search state
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to `http://localhost:4321/dm/#reference`
      2. Wait for load
      3. Type "xyznonexistent" in search
      4. Wait 350ms
      5. Assert: "Ничего не найдено" message visible
    Expected Result: Empty state shown for no results
    Evidence: .sisyphus/evidence/t11-open5e-empty.png
  ```

  **Commit**: YES
  - Message: `style(dm): redesign Open5eReference with purple-gold theme`
  - Files: `src/components/dm/Open5eReference.astro`

- [x] **T12. Redesign NotesPanel component**

  **What to do**:
  - Redesign `src/components/dm/NotesPanel.astro` to match mockup:
    - Large textarea: dark background, gold-tinted border, warm text
    - Auto-save indicator: "Сохранено · 03:14" style with timestamp
    - Character counter: muted text, bottom-right
    - Clear button: muted outline style
    - Card wrapper with subtle border and shadow
    - **NEW**: Cross-tab sync — listen to `storage` event to sync notes across browser tabs
    - **NEW**: Export button — "Скопировать" to copy notes to clipboard
    - **NEW**: Empty state placeholder when notes are empty
  - Preserve all existing functionality:
    - localStorage auto-save (500ms debounce)
    - "Saved" indicator (1.5s opacity)
    - Character count
    - Clear button
  - Use updated primitives (DmButton, DmCard from T4)
  - Ensure textarea focus state uses gold border

  **Must NOT do**:
  - Change localStorage key or data format
  - Remove auto-save behavior
  - Change debounce timing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: Simple component but requires precise visual styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T9-T11, T13)
  - **Blocks**: T16
  - **Blocked By**: T4 (primitives), T4.5 (i18n), T6 (page structure)

  **References**:
  - `src/components/dm/NotesPanel.astro` — Current implementation
  - `src/components/dm/DmButton.astro`, `DmCard.astro` — Updated primitives (T4)
  - Mockup notes panel — Textarea, save indicator, character count

  **Acceptance Criteria**:
  - [ ] Visual design matches mockup
  - [ ] Textarea auto-saves to localStorage
  - [ ] "Сохранено" indicator appears after typing stops
  - [ ] Character counter updates
  - [ ] Clear button empties textarea and localStorage
  - [ ] **NEW**: Cross-tab sync works (changes in one tab appear in another)
  - [ ] **NEW**: Copy to clipboard works
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Notes auto-save and cross-tab sync
    Tool: Playwright
    Preconditions: Dev server running, T4-T6 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/#notes`
      2. Type "Тестовая заметка" in textarea
      3. Wait 600ms
      4. Assert: "Сохранено" indicator visible
      5. Open new tab to `http://localhost:4321/dm/#notes`
      6. Assert: Second tab shows "Тестовая заметка"
      7. Clear notes in first tab
      8. Assert: Second tab notes cleared (after storage event)
    Expected Result: Notes persist and sync across tabs
    Evidence: .sisyphus/evidence/t12-notes-sync.png
  ```

  **Commit**: YES
  - Message: `style(dm): redesign NotesPanel with purple-gold theme`
  - Files: `src/components/dm/NotesPanel.astro`

- [x] **T13. Redesign AuthPanel component (visual only)**

  **What to do**:
  - **SCOPE CLARIFICATION**: This is a VISUAL redesign only. NO changes to auth logic, OAuth flows, or cookie handling.
  - Redesign `src/components/dm/AuthPanel.astro` to match purple-gold theme:
    - Logged out: VK (blue #4C75A3) and Yandex (red #FC3F1D) login buttons with updated styling (rounded pills, consistent sizing)
    - Logged in: user avatar (purple border), name in cream text, gold logout button
    - Button shapes: pills or rounded rectangles matching theme
    - Maintain OAuth brand colors for provider buttons (VK blue, Yandex red)
  - Preserve all existing functionality:
    - Server-rendered auth state (Astro.locals.user)
    - VK ID and Yandex login links
    - Logout action
  - Ensure auth panel fits new DmHeader layout

  **Must NOT do**:
  - Change OAuth URLs or logic
  - Change auth cookie handling
  - Remove VK/Yandex brand colors
  - Modify JWT or session logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - Reason: UI component with conditional rendering and brand colors

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T9-T12)
  - **Blocks**: T17
  - **Blocked By**: T4 (primitives), T6 (page structure)

  **References**:
  - `src/components/dm/AuthPanel.astro` — Current implementation
    - `src/lib/auth/` — JWT, OAuth configs
  - `src/components/dm/DmButton.astro` — Updated button primitive (T4)
  - Mockup header — User button styling

  **Acceptance Criteria**:
  - [ ] Visual design refreshed
  - [ ] Logged-out state shows VK + Yandex buttons
  - [ ] Logged-in state shows avatar + name + logout
  - [ ] Auth state updates correctly after login/logout
  - [ ] Build passes

  **QA Scenarios**:
  ```
  Scenario: Auth panel visual states
    Tool: Playwright
    Preconditions: Dev server running, T4-T6 complete
    Steps:
      1. Navigate to `http://localhost:4321/dm/` (logged out)
      2. Take screenshot
      3. Assert: VK and Yandex login buttons visible
      4. Assert: Buttons styled with updated theme
    Expected Result: Auth panel matches new theme
    Evidence: .sisyphus/evidence/t13-auth.png
  ```

  **Commit**: YES
  - Message: `style(dm): redesign AuthPanel with purple-gold theme`
  - Files: `src/components/dm/AuthPanel.astro`

- [x] **T14. Playwright E2E tests — dice flow**

  **What to do**:
  - Create `tests/dm/dice.spec.ts` with Playwright E2E tests:
    - Test all quick dice buttons (d4, d6, d8, d10, d12, d20, d100)
    - Test custom notation input and roll
    - Test history tracking and clear
    - Test result color coding (gold normal, green crit, red fail)
    - Test sessionStorage persistence across page reload
    - Test mobile viewport rendering
  - Use page object pattern if helpful
  - Add test IDs to DiceRoller elements for reliable selectors

  **Must NOT do**:
  - Test internal dice math logic (that's unit test territory)
  - Test Open5e API (mock or skip)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: E2E test writing requires understanding of component structure and selectors

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T15-T18)
  - **Blocks**: F3
  - **Blocked By**: T9 (DiceRoller redesign)

  **References**:
  - `tests/` — Existing test structure
  - `src/components/dm/DiceRoller.astro` — Updated component (T9)
  - Playwright docs: `https://playwright.dev/docs/writing-tests`

  **Acceptance Criteria**:
  - [ ] Test file created: `tests/dm/dice.spec.ts`
  - [ ] All quick dice buttons tested
  - [ ] Custom notation tested
  - [ ] History and clear tested
  - [ ] Color coding tested
  - [ ] Mobile viewport tested
  - [ ] Tests pass: `npx playwright test tests/dm/dice.spec.ts`

  **QA Scenarios**:
  ```
  Scenario: Run E2E dice tests
    Tool: Bash
    Preconditions: Dev server running, T9 complete
    Steps:
      1. Run `npx playwright test tests/dm/dice.spec.ts`
      2. Assert: All tests pass (0 failures)
    Expected Result: E2E tests pass
    Evidence: .sisyphus/evidence/t14-dice-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dm): add Playwright E2E tests for dice flow`
  - Files: `tests/dm/dice.spec.ts`

- [x] **T15. Playwright E2E tests — initiative flow**

  **What to do**:
  - Create `tests/dm/initiative.spec.ts` with Playwright E2E tests:
    - Test adding combatants (auto-roll and manual)
    - Test sorting by initiative
    - Test active turn highlighting
    - Test "Следующий ход" cycling
    - Test deleting combatants
    - Test sessionStorage persistence
    - Test mobile viewport rendering
  - Add test IDs to InitiativeTracker elements

  **Must NOT do**:
  - Test dice RNG distribution

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: E2E test writing for complex interactive component

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T14, T16-T18)
  - **Blocks**: F3
  - **Blocked By**: T10 (InitiativeTracker redesign)

  **References**:
  - `src/components/dm/InitiativeTracker.astro` — Updated component (T10)
  - `tests/dm/dice.spec.ts` — Test patterns from T14

  **Acceptance Criteria**:
  - [ ] Test file created: `tests/dm/initiative.spec.ts`
  - [ ] Adding combatants tested
  - [ ] Sorting tested
  - [ ] Turn cycling tested
  - [ ] Delete tested
  - [ ] Mobile viewport tested
  - [ ] Tests pass: `npx playwright test tests/dm/initiative.spec.ts`

  **QA Scenarios**:
  ```
  Scenario: Run E2E initiative tests
    Tool: Bash
    Preconditions: Dev server running, T10 complete
    Steps:
      1. Run `npx playwright test tests/dm/initiative.spec.ts`
      2. Assert: All tests pass (0 failures)
    Expected Result: E2E tests pass
    Evidence: .sisyphus/evidence/t15-initiative-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dm): add Playwright E2E tests for initiative flow`
  - Files: `tests/dm/initiative.spec.ts`

- [x] **T16. Playwright E2E tests — reference + notes flow**

  **What to do**:
  - Create `tests/dm/reference.spec.ts`:
    - Test tab switching (Монстры / Заклинания)
    - Test search filtering
    - Test CR/Level filters
    - Test pagination
    - Test detail modal open/close
    - Test mobile viewport
  - Create `tests/dm/notes.spec.ts`:
    - Test typing in textarea
    - Test auto-save indicator
    - Test persistence across reload
    - Test clear button
    - Test mobile viewport
  - Add test IDs to relevant elements

  **Must NOT do**:
  - Test Open5e API reliability (may be flaky)
  - Test actual network requests deeply

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: E2E tests for two feature components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T14-T15, T17-T18)
  - **Blocks**: F3
  - **Blocked By**: T11 (Open5eReference), T12 (NotesPanel)

  **References**:
  - `src/components/dm/Open5eReference.astro` — Updated component (T11)
  - `src/components/dm/NotesPanel.astro` — Updated component (T12)
  - `tests/dm/dice.spec.ts` — Test patterns from T14

  **Acceptance Criteria**:
  - [ ] Test files created: `tests/dm/reference.spec.ts`, `tests/dm/notes.spec.ts`
  - [ ] Reference search, filter, pagination, modal tested
  - [ ] Notes typing, auto-save, persistence, clear tested
  - [ ] Mobile viewports tested
  - [ ] Tests pass: `npx playwright test tests/dm/reference.spec.ts tests/dm/notes.spec.ts`

  **QA Scenarios**:
  ```
  Scenario: Run E2E reference and notes tests
    Tool: Bash
    Preconditions: Dev server running, T11-T12 complete
    Steps:
      1. Run `npx playwright test tests/dm/reference.spec.ts tests/dm/notes.spec.ts`
      2. Assert: All tests pass (0 failures)
    Expected Result: E2E tests pass
    Evidence: .sisyphus/evidence/t16-ref-notes-tests.txt
  ```

  **Commit**: YES
  - Message: `test(dm): add Playwright E2E tests for reference and notes`
  - Files: `tests/dm/reference.spec.ts`, `tests/dm/notes.spec.ts`

- [x] **T17. Cross-browser visual QA + responsive testing**

  **What to do**:
  - Run Playwright visual tests across viewports:
    - Desktop: 1440x900, 1920x1080
    - Tablet: 768x1024
    - Mobile: 375x812, 390x844
  - Capture screenshots of each tab (Dice, Initiative, Reference, Notes) on each viewport
  - Verify no layout breaks, no overflow, no clipped content
  - Verify touch targets are ≥44px on mobile
  - **NEW**: Check color contrast with automated tool or manual verification:
    - Purple (#534AB7) on dark backgrounds for text ≥14px
    - Gold (#c8a84b) on dark backgrounds for headings
    - Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
  - Verify all interactive elements are accessible via keyboard
  - **NEW**: Mobile UX exploration:
    - Test thumb reachability (bottom nav vs top tabs)
    - Document if bottom sheet or swipe gestures would improve mobile UX
    - Note: this is research only, not implementation
  - **SKIP**: Light/dark OS mode testing (site is dark-only by design)

  **Must NOT do**:
  - Fix browser-specific bugs beyond simple CSS tweaks (file separate issues)
  - Write new test files (use Playwright for screenshots only)
  - Implement mobile UX changes (research only)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - Reason: Visual QA requires systematic cross-viewport checking

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T14-T16, T18)
  - **Blocks**: F3
  - **Blocked By**: T9-T13 (all components), T6-T7 (pages)

  **References**:
  - `src/pages/dm/index.astro` — Updated page (T6)
    - Mockup screenshots — Target visual reference
    - Playwright viewport docs

  **Acceptance Criteria**:
  - [ ] Screenshots captured for all tabs × all viewports
  - [ ] No layout breaks detected
  - [ ] Touch targets ≥44px on mobile
  - [ ] **NEW**: Color contrast verified (document any failures)
  - [ ] Keyboard navigation works
  - [ ] **NEW**: Mobile UX findings documented
  - [ ] Evidence saved to `.sisyphus/evidence/visual-qa/`

  **QA Scenarios**:
  ```
  Scenario: Visual QA across viewports
    Tool: Playwright
    Preconditions: All components complete, dev server running
    Steps:
      1. For each viewport [1440x900, 768x1024, 375x812]:
         a. Navigate to `http://localhost:4321/dm/`
         b. For each tab [dice, initiative, reference, notes]:
            i. Click tab
            ii. Take screenshot
      2. Assert: No layout breaks in any screenshot
    Expected Result: All viewports render correctly
    Evidence: .sisyphus/evidence/visual-qa/*.png
  ```

  **Commit**: NO (QA task, no code changes)

- [x] **T18. Build verification + data migration check**

  **What to do**:
  - Run `npm run build` and verify no errors
  - Run `npm run test` (Vitest) and verify no failures
  - Check for TypeScript errors: `npx tsc --noEmit`
  - Verify no unused imports or variables in changed files
  - Check that all new files are included in build output
  - Verify `/dm/` and `/ru/dm/` pages build correctly
  - **NEW**: Data migration verification:
    - Pre-populate sessionStorage with old-format dice history and initiative data
    - Load redesigned page and verify old data loads correctly
    - Pre-populate localStorage with old-format notes
    - Verify notes load and save correctly after redesign
    - Document any data format incompatibilities

  **Must NOT do**:
  - Fix unrelated lint errors in untouched files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple verification commands

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T14-T17)
  - **Blocks**: F2
  - **Blocked By**: T6, T7 (pages must build)

  **References**:
  - `package.json` — Available scripts
  - `tsconfig.json` — TypeScript config

  **Acceptance Criteria**:
  - [ ] `npm run build` passes with 0 errors
  - [ ] `npm run test` passes (Vitest)
  - [ ] `npx tsc --noEmit` passes
  - [ ] No unused imports in changed files
  - [ ] **NEW**: Old sessionStorage data loads correctly
  - [ ] **NEW**: Old localStorage notes load correctly

  **QA Scenarios**:
  ```
  Scenario: Build and data migration
    Tool: Bash
    Preconditions: All code changes complete
    Steps:
      1. Run `npm run build`
      2. Assert: Exit code 0
      3. Run `npx tsc --noEmit`
      4. Assert: Exit code 0
      5. Pre-populate localStorage with test notes
      6. Start dev server
      7. Navigate to `/dm/#notes`
      8. Assert: Old notes visible in textarea
    Expected Result: Build passes and old data preserved
    Evidence: .sisyphus/evidence/t18-build.txt
  ```

  **Commit**: NO (verification task)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] **F1. Plan Compliance Audit** — `oracle` ✅ APPROVED
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] **F2. Code Quality Review** — `unspecified-high` ✅ APPROVED
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] **F3. Real Manual QA** — `unspecified-high` (+ `playwright` skill) ✅ APPROVED
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] **F4. Scope Fidelity Check** — `deep` ✅ APPROVED
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1-T4**: `style(dm): update design system to purple-gold theme` — dm-theme.css, DmHeader, DmButton, DmCard, DmInput, DmTabs
- **T5-T8**: `feat(dm): add dashboard layout with sidebar and tabs` — DmLayout, DmSidebar, /dm/index.astro, /ru/dm/index.astro
- **T9**: `style(dm): redesign DiceRoller with purple-gold theme` — DiceRoller.astro
- **T10**: `style(dm): redesign InitiativeTracker with purple-gold theme` — InitiativeTracker.astro
- **T11**: `style(dm): redesign Open5eReference with purple-gold theme` — Open5eReference.astro
- **T12**: `style(dm): redesign NotesPanel with purple-gold theme` — NotesPanel.astro
- **T13**: `style(dm): redesign AuthPanel with purple-gold theme` — AuthPanel.astro
- **T14-T16**: `test(dm): add Playwright E2E tests` — tests/dm/*.spec.ts
- **T17-T18**: No commits (QA and verification tasks)

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: 0 errors
npm run test           # Expected: Vitest passes
npx tsc --noEmit       # Expected: 0 TS errors
npx playwright test tests/dm/  # Expected: All E2E tests pass
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] Playwright E2E tests pass
- [x] Build passes without errors
- [x] TypeScript type check passes
- [x] Both `/dm/` and `/ru/dm/` render correctly
- [x] sessionStorage/localStorage data preserved
- [x] Visual design matches mockup inspiration
- [x] Layout responsive (3-column desktop, tabbed mobile)
- [x] Accessibility maintained (focus rings, ARIA, keyboard nav)
