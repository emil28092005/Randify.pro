# Critical Fixes + Quality Refactoring

## TL;DR

> **Quick Summary**: Replace all `Math.random()` calls with a shared cryptographically secure `crypto.getRandomValues()` wrapper, deduplicate the dice engine by importing `src/lib/dice-engine.ts`, extract reusable Astro components for result/copy UI, and refactor all 28 generators to consume the new shared patterns. Fix CI to gate deployment on passing tests and lint.
>
> **Deliverables**:
> - `src/lib/client/random.ts` + test (crypto wrapper)
> - `src/lib/client/i18n.ts` + test (client locale helper)
> - `src/components/ResultBox.astro` (reusable result container)
> - `src/components/CopyButton.astro` (reusable copy button using existing `CopyFeedback`)
> - 28 refactored generators using new utilities
> - `DiceGenerator.astro` importing from `dice-engine.ts`
> - Updated `dice-engine.ts` using crypto wrapper
> - Updated Privacy Policy translations
> - Fixed `.github/workflows/deploy.yml`
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5-7 tasks per wave
> **Critical Path**: Wave 1 (utilities) → Wave 2 (components) → Waves 3-6 (generator batches) → Wave 7 (dice + policy) → Wave 8 (CI) → F1-F4

---

## Context

### Original Request
User wants to fix critical issues and quality-refactor all generators into an easily extensible structure. No push to main without permission.

### Interview Summary
**Key Decisions**:
- Critical scope: Dice engine + honesty (Web Crypto API migration)
- Tests: YES - TDD for new utilities, tests-after + agent QA for generators
- Refactor scope: ALL 28 generators
- CI/CD: Fix deploy.yml to run tests and lint
- Quality over speed

### Research Findings
- **28 generators** exist (not 10 as stated in outdated CLAUDE.md)
- **29 files use `Math.random()`** despite aboutHowItWorks claiming Web Crypto API
- **Dice engine duplicated**: `DiceGenerator.astro:274-958` inlines `src/lib/dice-engine.ts`
- **Copy-paste UI**: Every generator recreates result + copy button DOM
- **Hardcoded i18n**: Strings in generator frontmatter/scripts instead of `translations.ts`
- **Missing `zod`**: Not in `package.json` despite direct import
- **CI gap**: Tests and lint exist but deploy.yml skips them

### Metis Review
**Identified Gaps** (addressed):
- Core objective tightened to single sentence
- Scope IN/OUT explicitly defined
- Test strategy recorded (TDD for utilities)
- Existing utilities inventoried (`clipboard.ts`, `validation.ts`, `animations.ts`)

---

## Work Objectives

### Core Objective
Replace every `Math.random()` call across all 28 generators with a shared cryptographically secure wrapper, deduplicate the dice engine by importing `src/lib/dice-engine.ts`, and refactor all generators to consume the new shared utilities.

### Concrete Deliverables
- `src/lib/client/random.ts` + `random.test.ts`
- `src/lib/client/i18n.ts` + `i18n.test.ts`
- `src/components/ResultBox.astro`
- `src/components/CopyButton.astro`
- All 28 `*Generator.astro` files refactored
- `DiceGenerator.astro` importing from `dice-engine.ts`
- `src/lib/dice-engine.ts` updated to use `random.ts`
- Updated Privacy Policy in `src/i18n/translations.ts`
- Fixed `.github/workflows/deploy.yml`

### Definition of Done
- [ ] `npm run test` passes (new + existing tests)
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No `Math.random()` calls remain in generator scripts
- [ ] Dice engine is imported, not inlined
- [ ] CI runs tests and lint before deploy

### Must Have
- Cryptographically secure random for all generators
- Deduplicated dice engine
- Shared utilities for random + i18n
- Shared Astro components for result/copy UI
- All 28 generators refactored
- CI quality gates

### Must NOT Have (Guardrails)
- **NO shared dynamic `[slug].astro`** for Russian pages (breaks script bundling)
- **NO changes to generator JSON schema** (strict Zod — unknown fields fail build)
- **NO client-side router introduced**
- **NO push to main** without explicit user approval
- **NO removal of existing EN/RU page files** — keep separate files
- **NO over-abstraction** — keep utilities simple and focused

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (vitest v4.1.5 configured)
- **Automated tests**: TDD for utilities, tests-after for generators
- **Framework**: vitest (node environment)
- **TDD workflow**: RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output
- **API/Config**: Use Bash (grep) — Search patterns, verify absence

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - utilities + deps + CI draft, 5 tasks):
├── Task 1: Add zod + typescript to package.json
├── Task 2: Create crypto random utility (TDD)
├── Task 3: Create client i18n helper (TDD)
├── Task 35: Update Privacy Policy translations
└── Task 36: Fix deploy.yml quality gates

Wave 2 (Shared components + dice crypto + CI verify, 4 tasks):
├── Task 4: Create ResultBox.astro
├── Task 5: Create CopyButton.astro
├── Task 34: Update dice-engine.ts to use crypto random
└── Task 37: Verify CI blocks deploy on failure

Wave 3 (Generators batch 1 + dice refactor, 8 tasks):
├── Task 6:  Refactor CardGenerator
├── Task 7:  Refactor CoinGenerator
├── Task 8:  Refactor ColorGenerator
├── Task 9:  Refactor CountryGenerator
├── Task 10: Refactor DateGenerator
├── Task 11: Refactor EmojiGenerator
├── Task 12: Refactor FontPairGenerator
└── Task 33: Refactor DiceGenerator to import dice-engine

Wave 4 (Generators batch 2, 7 tasks):
├── Task 13: Refactor GradientGenerator
├── Task 14: Refactor HashGenerator
├── Task 15: Refactor LetterGenerator
├── Task 16: Refactor ListGenerator
├── Task 17: Refactor LoremGenerator
├── Task 18: Refactor LotteryGenerator
└── Task 19: Refactor Magic8BallGenerator

Wave 5 (Generators batch 3, 7 tasks):
├── Task 20: Refactor MealGenerator
├── Task 21: Refactor NamesGenerator
├── Task 22: Refactor NumberGenerator
├── Task 23: Refactor PaletteGenerator
├── Task 24: Refactor PasswordGenerator
├── Task 25: Refactor RpsGenerator
└── Task 26: Refactor ShufflerGenerator

Wave 6 (Generators batch 4, 6 tasks):
├── Task 27: Refactor TeamsGenerator
├── Task 28: Refactor TimeGenerator
├── Task 29: Refactor UuidGenerator
├── Task 30: Refactor WeightedGenerator
├── Task 31: Refactor WheelSpinner
└── Task 32: Refactor YesNoGenerator

Wave FINAL (After ALL tasks - 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Wave 1 → Wave 2 → Waves 3-6 → F1-F4
Parallel Speedup: ~70% faster than sequential
Max Concurrent: 8 (Wave 3)
```

### Dependency Matrix

- **1**: - - 2, 3
- **2**: - - 4, 5, 34
- **3**: - - 4, 5, 6-32
- **4**: 2, 3 - 6-33
- **5**: 2, 3 - 6-33
- **6-32**: 4, 5 - F1-F4
- **33**: 4, 5, 34 - F1-F4
- **34**: 2 - 33, F1-F4
- **35**: - - F1-F4
- **36**: - - 37, F1-F4
- **37**: 36 - F1-F4

### Agent Dispatch Summary

- **Wave 1**: Tasks 1-3, 35, 36 → `quick` (deps + TDD utilities + CI draft + policy)
- **Wave 2**: Tasks 4-5, 34, 37 → `visual-engineering` + `deep` + `quick`
- **Waves 3-6**: Tasks 6-33 → `unspecified-high` × 28 (generator refactoring + dice)
- **FINAL**: F1-F4 → `oracle`, `unspecified-high`, `deep`

---

## TODOs

- [x] 1. Add missing dependencies to package.json

  **What to do**:
  - Add `zod` to `dependencies` (imported but missing)
  - Add `typescript` to `devDependencies` (Astro projects need it)
  - Run `npm install` to update lockfile

  **Must NOT do**:
  - Change existing dependency versions
  - Remove existing packages

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3)
  - **Blocked By**: None
  - **Blocks**: Tasks 2, 3 (npm install should complete)

  **References**:
  - `package.json` — current dependency manifest
  - `src/lib/generator-schema.ts:1` — `import { z } from "zod"`

  **Acceptance Criteria**:
  - [ ] `zod` listed in `dependencies`
  - [ ] `typescript` listed in `devDependencies`
  - [ ] `npm install` succeeds

  **QA Scenarios**:
  ```
  Scenario: Verify deps installed
    Tool: Bash
    Steps:
      1. grep '"zod"' package.json
      2. grep '"typescript"' package.json
      3. npm install
    Expected Result: Both found, npm install exits 0
    Evidence: .sisyphus/evidence/task-1-deps.txt
  ```

  **Commit**: YES
  - Message: `fix(deps): add zod and typescript to package.json`
  - Files: `package.json`, `package-lock.json`

- [x] 2. Create crypto random utility with TDD

  **What to do**:
  - Create `src/lib/client/random.ts` with:
    - `randomInt(min: number, max: number): number`
    - `randomFloat(): number`
    - `randomBytes(length: number): Uint8Array`
    - `shuffleArray<T>(array: T[]): T[]`
  - Create `src/lib/client/random.test.ts` with TDD tests

  **Must NOT do**:
  - Use `Math.random()` anywhere

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 3)
  - **Blocked By**: None
  - **Blocks**: Tasks 4, 5, 6+ (all generators)

  **References**:
  - `src/components/generators/NumberGenerator.astro` — uses Math.random
  - `src/components/generators/PasswordGenerator.astro` — uses Math.random

  **Acceptance Criteria**:
  - [ ] `src/lib/client/random.ts` exists with all 4 functions
  - [ ] `src/lib/client/random.test.ts` passes
  - [ ] No `Math.random()` in module

  **QA Scenarios**:
  ```
  Scenario: TDD cycle passes
    Tool: Bash
    Steps:
      1. npm run test -- src/lib/client/random.test.ts
      2. grep "Math.random" src/lib/client/random.ts || true
    Expected Result: Tests pass, no Math.random
    Evidence: .sisyphus/evidence/task-2-random.txt
  ```

  **Commit**: YES
  - Message: `feat(lib): add cryptographically secure random utility with tests`
  - Files: `src/lib/client/random.ts`, `src/lib/client/random.test.ts`
  - Pre-commit: `npm run test -- src/lib/client/random.test.ts`

- [x] 3. Create client i18n helper with TDD

  **What to do**:
  - Create `src/lib/client/i18n.ts` with:
    - `getClientLang(): 'en' | 'ru'`
    - `getClientT(): T`
  - Create `src/lib/client/i18n.test.ts`

  **Must NOT do**:
  - Change `translations.ts` structure

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2)
  - **Blocked By**: None
  - **Blocks**: Tasks 4, 5, 6+

  **References**:
  - `src/i18n/translations.ts` — translation objects
  - `src/components/generators/NumberGenerator.astro` — shows current `document.documentElement.lang` pattern

  **Acceptance Criteria**:
  - [ ] `src/lib/client/i18n.ts` exists
  - [ ] `src/lib/client/i18n.test.ts` passes

  **QA Scenarios**:
  ```
  Scenario: i18n helper tests pass
    Tool: Bash
    Steps:
      1. npm run test -- src/lib/client/i18n.test.ts
    Expected Result: Tests pass
    Evidence: .sisyphus/evidence/task-3-i18n.txt
  ```

  **Commit**: YES
  - Message: `feat(lib): add client i18n helper with tests`
  - Files: `src/lib/client/i18n.ts`, `src/lib/client/i18n.test.ts`

- [x] 4. Create ResultBox.astro shared component

  **What to do**:
  - Create `src/components/ResultBox.astro` with:
    - `result: string` prop
    - Optional `label?: string` prop
    - Copy button using existing `CopyFeedback`
    - i18n via `useT(Astro.currentLocale)` in frontmatter

  **Must NOT do**:
  - Reimplement clipboard logic
  - Hardcode English strings

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3, 5)
  - **Blocked By**: Tasks 2, 3
  - **Blocks**: Tasks 6+

  **References**:
  - `src/lib/client/clipboard.ts` — `CopyFeedback` class
  - `src/components/generators/NumberGenerator.astro` — result + copy DOM pattern

  **Acceptance Criteria**:
  - [ ] `src/components/ResultBox.astro` exists
  - [ ] Uses `CopyFeedback`
  - [ ] `npm run build` succeeds

  **QA Scenarios**:
  ```
  Scenario: ResultBox renders and copies
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Create test page with ResultBox result="test123"
      2. Navigate to page
      3. Click copy button
      4. Assert "Copied" appears
    Expected Result: Copy works, i18n labels correct
    Evidence: .sisyphus/evidence/task-4-resultbox.png
  ```

  **Commit**: YES (groups with Task 5)

- [x] 5. Create CopyButton.astro shared component

  **What to do**:
  - Create `src/components/CopyButton.astro` with:
    - `text: string` prop
    - `label?: string` prop
    - Uses `CopyFeedback`
    - i18n via `useT(Astro.currentLocale)`

  **Must NOT do**:
  - Include result display logic (that's ResultBox)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3, 4)
  - **Blocked By**: Tasks 2, 3
  - **Blocks**: Tasks 6+

  **References**:
  - `src/lib/client/clipboard.ts`
  - `src/components/generators/PasswordGenerator.astro`

  **Acceptance Criteria**:
  - [ ] `src/components/CopyButton.astro` exists
  - [ ] Uses `CopyFeedback`
  - [ ] `npm run build` succeeds

  **QA Scenarios**:
  ```
  Scenario: CopyButton works standalone
    Tool: Playwright
    Steps:
      1. Create test page with CopyButton text="hello"
      2. Click button
      3. Assert "Copied" appears
    Expected Result: Button copies, shows feedback
    Evidence: .sisyphus/evidence/task-5-copybutton.png
  ```

  **Commit**: YES
  - Message: `feat(components): add ResultBox and CopyButton shared components`
  - Files: `src/components/ResultBox.astro`, `src/components/CopyButton.astro`

- [x] 6. Refactor CardGenerator.astro

  **What to do**:
  - Replace `Math.random()` with `random.ts` functions
  - Replace `document.documentElement.lang === "ru"` with `getClientLang()` / `getClientT()`
  - Use `<CopyButton />` or `<ResultBox />` where applicable

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 7-12, 13-19, 20-26, 27-32)
  - **Blocked By**: Tasks 4, 5

  **Acceptance Criteria**:
  - [ ] No `Math.random()` in file
  - [ ] Uses `random.ts` and `i18n.ts`

  **QA Scenarios**:
  ```
  Scenario: No Math.random in CardGenerator
    Tool: Bash
    Steps:
      1. grep "Math.random" src/components/generators/CardGenerator.astro || true
    Expected Result: Empty output
    Evidence: .sisyphus/evidence/task-6-card.txt
  ```

  **Commit**: NO (groups with batch)

- [x] 7. Refactor CoinGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6, 8-12)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: NO

- [x] 8. Refactor ColorGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6-7, 9-12)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: NO

- [x] 9. Refactor CountryGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6-8, 10-12)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: NO

- [x] 10. Refactor DateGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6-9, 11-12)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: NO

- [x] 11. Refactor EmojiGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6-10, 12)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: NO

- [x] 12. Refactor FontPairGenerator.astro

  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 6-11)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **QA Scenarios**: grep Math.random → empty
  **Commit**: YES
  - Message: `refactor(generators): migrate batch 1 to crypto random (Card, Coin, Color, Country, Date, Emoji, FontPair)`
  - Files: `src/components/generators/{Card,Coin,Color,Country,Date,Emoji,FontPair}Generator.astro`

- [x] 13. Refactor GradientGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 14-19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 14. Refactor HashGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13, 15-19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 15. Refactor LetterGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-14, 16-19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 16. Refactor ListGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-15, 17-19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 17. Refactor LoremGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-16, 18-19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 18. Refactor LotteryGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-17, 19, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 19. Refactor Magic8BallGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-18, 20-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: YES
  - Message: `refactor(generators): migrate batch 2 to crypto random (Gradient, Hash, Letter, List, Lorem, Lottery, Magic8Ball)`
  - Files: `src/components/generators/{Gradient,Hash,Letter,List,Lorem,Lottery,Magic8Ball}Generator.astro`

- [x] 20. Refactor MealGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 21-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 21. Refactor NamesGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20, 22-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 22. Refactor NumberGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-21, 23-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 23. Refactor PaletteGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-22, 24-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 24. Refactor PasswordGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-23, 25-26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 25. Refactor RpsGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-24, 26, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 26. Refactor ShufflerGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-25, 27-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: YES
  - Message: `refactor(generators): migrate batch 3 to crypto random (Meal, Names, Number, Palette, Password, Rps, Shuffler)`
  - Files: `src/components/generators/{Meal,Names,Number,Palette,Password,Rps,Shuffler}Generator.astro`

- [x] 27. Refactor TeamsGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 28-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 28. Refactor TimeGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 27, 29-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 29. Refactor UuidGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 27-28, 30-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 30. Refactor WeightedGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 27-29, 31-32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 31. Refactor WheelSpinner.astro
  **What to do**: Same pattern as Task 6. Note: file is `WheelSpinner.astro`, not `WheelGenerator.astro`.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 27-30, 32)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: NO

- [x] 32. Refactor YesNoGenerator.astro
  **What to do**: Same pattern as Task 6.
  **Recommended Agent Profile**: `unspecified-high`
  **Parallelization**: YES (with Tasks 13-19, 20-26, 27-31)
  **Blocked By**: Tasks 4, 5
  **Acceptance Criteria**: No Math.random, uses random.ts and i18n.ts
  **Commit**: YES
  - Message: `refactor(generators): migrate batch 4 to crypto random (Teams, Time, Uuid, Weighted, WheelSpinner, YesNo)`
  - Files: `src/components/generators/{Teams,Time,Uuid,Weighted,YesNo}Generator.astro`, `src/components/generators/WheelSpinner.astro`

- [x] 33. Refactor DiceGenerator to import dice-engine.ts

  **What to do**:
  - Replace inline dice engine code in `DiceGenerator.astro:274-958` with imports from `src/lib/dice-engine.ts`
  - Keep same UI and user-facing behavior
  - Use `getClientLang()` / `getClientT()` for i18n
  - Use `<ResultBox />` / `<CopyButton />` for result display

  **Must NOT do**:
  - Modify `src/lib/dice-engine.ts` in this task (Task 34 does that)
  - Change dice notation syntax or features

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6-32)
  - **Blocked By**: Tasks 4, 5, 34 (needs dice-engine.ts with crypto)

  **References**:
  - `src/components/generators/DiceGenerator.astro` — inline dice engine (lines 274-958)
  - `src/lib/dice-engine.ts` — canonical dice engine

  **Acceptance Criteria**:
  - [ ] `DiceGenerator.astro` imports from `dice-engine.ts`
  - [ ] File significantly shorter (<300 lines)
  - [ ] `npm run build` succeeds

  **QA Scenarios**:
  ```
  Scenario: Dice engine imported
    Tool: Bash
    Steps:
      1. grep "import.*dice-engine" src/components/generators/DiceGenerator.astro
      2. wc -l src/components/generators/DiceGenerator.astro
    Expected Result: Import found, file <300 lines
    Evidence: .sisyphus/evidence/task-33-dice-import.txt
  ```

  **Commit**: YES
  - Message: `refactor(dice): deduplicate dice engine by importing from lib`
  - Files: `src/components/generators/DiceGenerator.astro`

- [x] 34. Update dice-engine.ts to use crypto random

  **What to do**:
  - Replace all `Math.random()` in `src/lib/dice-engine.ts` with `random.ts` functions
  - Update `dice-engine.test.ts` to mock `random.ts` instead of `Math.random`
  - Ensure all tests pass

  **Must NOT do**:
  - Change dice notation syntax or parsing

  **Recommended Agent Profile**:
  - **Category**: `deep`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 37)
  - **Blocked By**: Task 2
  - **Blocks**: Task 33

  **References**:
  - `src/lib/dice-engine.ts`
  - `src/lib/dice-engine.test.ts`
  - `src/lib/client/random.ts`

  **Acceptance Criteria**:
  - [ ] No `Math.random()` in `dice-engine.ts`
  - [ ] Tests pass

  **QA Scenarios**:
  ```
  Scenario: Dice engine uses crypto
    Tool: Bash
    Steps:
      1. grep "Math.random" src/lib/dice-engine.ts || true
      2. npm run test -- src/lib/dice-engine.test.ts
    Expected Result: No Math.random, tests pass
    Evidence: .sisyphus/evidence/task-34-dice-crypto.txt
  ```

  **Commit**: YES
  - Message: `refactor(dice): migrate dice engine to cryptographically secure random`
  - Files: `src/lib/dice-engine.ts`, `src/lib/dice-engine.test.ts`
  - Pre-commit: `npm run test -- src/lib/dice-engine.test.ts`

- [x] 35. Update Privacy Policy translations

  **What to do**:
  - Update EN and RU `aboutHowItWorks` text in `src/i18n/translations.ts` to accurately describe random generation
  - Current RU text (line ~172) claims "Web Crypto API" but must reflect actual usage
  - Also update EN equivalent (line ~78)

  **Must NOT do**:
  - Change other Privacy Policy sections

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 3, 36)
  - **Blocked By**: None

  **References**:
  - `src/i18n/translations.ts` — EN aboutHowItWorks (~line 78), RU aboutHowItWorks (~line 172)

  **Acceptance Criteria**:
  - [ ] EN aboutHowItWorks accurate
  - [ ] RU aboutHowItWorks accurate and consistent

  **QA Scenarios**:
  ```
  Scenario: Privacy text updated
    Tool: Read
    Steps:
      1. Read src/i18n/translations.ts lines 72-82 and 166-176
    Expected Result: Text describes crypto.getRandomValues usage
    Evidence: .sisyphus/evidence/task-35-privacy.txt
  ```

  **Commit**: YES
  - Message: `fix(i18n): update about page for crypto accuracy`
  - Files: `src/i18n/translations.ts`

- [x] 36. Fix deploy.yml quality gates

  **What to do**:
  - Add `npm run lint` before `npm run build`
  - Add `npm run test` before `npm run build`
  - Remove `-o StrictHostKeyChecking=no` from rsync SSH options

  **Must NOT do**:
  - Change deploy target or SSH keys

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 3, 35)
  - **Blocked By**: None
  - **Blocks**: Task 37

  **References**:
  - `.github/workflows/deploy.yml`
  - `package.json` — test and lint scripts

  **Acceptance Criteria**:
  - [ ] `npm run lint` runs before build
  - [ ] `npm run test` runs before build
  - [ ] No `StrictHostKeyChecking=no`

  **QA Scenarios**:
  ```
  Scenario: CI updated
    Tool: Read
    Steps:
      1. grep "npm run lint" .github/workflows/deploy.yml
      2. grep "npm run test" .github/workflows/deploy.yml
      3. grep "StrictHostKeyChecking" .github/workflows/deploy.yml || true
    Expected Result: lint and test found, StrictHostKeyChecking absent
    Evidence: .sisyphus/evidence/task-36-ci.txt
  ```

  **Commit**: YES
  - Message: `ci(deploy): add test and lint gates, fix SSH security`
  - Files: `.github/workflows/deploy.yml`

- [x] 37. Verify CI blocks deploy on failure

  **What to do**:
  - Verify updated `deploy.yml` workflow syntax
  - Confirm deploy does not run if test/lint fails

  **Must NOT do**:
  - Trigger actual deploy

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 4, 5, 34)
  - **Blocked By**: Task 36

  **References**:
  - `.github/workflows/deploy.yml`

  **Acceptance Criteria**:
  - [ ] Workflow syntax valid
  - [ ] Build step after test/lint

  **QA Scenarios**:
  ```
  Scenario: CI dependencies verified
    Tool: Bash
    Steps:
      1. grep -A5 "npm run test" .github/workflows/deploy.yml
    Expected Result: Build comes after test
    Evidence: .sisyphus/evidence/task-37-ci-verify.txt
  ```

  **Commit**: NO (groups with Task 36)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `eslint .` + `vitest run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration. Test edge cases: empty state, invalid input. Verify no Math.random() remains (`grep -r "Math.random" src/components/generators/`). Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Math.random [CLEAN/N found] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(deps): add zod and typescript to package.json` + `feat(lib): add crypto random utility with tests` + `feat(lib): add client i18n helper with tests` + `fix(i18n): update privacy policy for crypto accuracy` + `ci(deploy): add test and lint gates to deploy workflow`
- **Wave 2**: `feat(components): add ResultBox and CopyButton shared components` + `refactor(dice): migrate dice engine to cryptographically secure random`
- **Waves 3-6**: `refactor(generators): migrate batch N to crypto random and shared components`

---

## Success Criteria

### Verification Commands
```bash
npm run test        # Expected: all pass (utilities + existing dice tests)
npm run lint        # Expected: no errors
npm run build       # Expected: static build succeeds
grep -r "Math.random" src/components/generators/  # Expected: no matches
grep -r "dice-engine" src/components/generators/DiceGenerator.astro  # Expected: import statement
grep "zod" package.json  # Expected: found in dependencies
grep "test" .github/workflows/deploy.yml  # Expected: found
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] No `Math.random()` in generators
- [ ] Dice engine imported, not inlined
- [ ] CI runs tests and lint before deploy
- [ ] User explicitly approved (no auto-push to main)
