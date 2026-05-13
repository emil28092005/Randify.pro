# init-deep: Generate Hierarchical AGENTS.md

## TL;DR

> Generate hierarchical AGENTS.md knowledge base for Randify.pro codebase.
>
> **Deliverables**:
> - `./AGENTS.md` (root knowledge base)
> - `src/components/generators/AGENTS.md` (generators domain)
>
> **Estimated Effort**: Short
> **Parallel Execution**: YES - 2 files in parallel

---

## Context

Randify.pro is a bilingual (EN/RU) static site on Astro 4 + Tailwind CSS 4 with 30 random-value generators. The codebase has specific architectural constraints documented in `CLAUDE.md` and discovered through comprehensive audit.

### Research Findings (from explore agents)

**Project Structure:**
- 270 total files, depth 4, 5 large files (>500 lines)
- 30 generators (not 10 as stated in CLAUDE.md — documentation drift)
- 62 page files (EN + RU duplicates)
- Content collection defined but bypassed (import.meta.glob used instead)

**Entry Points:**
- `astro.config.mjs` — Astro 4, i18n routing, Tailwind v4 Vite plugin, sitemap
- `src/pages/index.astro` — homepage
- `src/layouts/BaseLayout.astro` — root layout with theme, analytics, SW registration
- `src/layouts/GeneratorLayout.astro` — generator wrapper (breadcrumb, ad, SEO, FAQ)

**Key Conventions:**
- ESM only, `@/*` → `src/*`
- i18n: `Astro.currentLocale` / `document.documentElement.lang` + `useT(lang)`
- Tailwind v4 theme in `BaseLayout.astro` global style (no tailwind.config)
- Dark theme: `bg-zinc-950`, accent `#534AB7`
- Generator JSON validated by strict Zod schema (`.strict()` — unknown fields fail build)
- Tests co-located: `src/**/*.test.ts` (only 1 test exists: `dice-engine.test.ts`)

**Anti-Patterns from CLAUDE.md:**
1. Never use shared dynamic `[slug].astro` for Russian pages (bundling issue)
2. Every generator must be created in EN + RU simultaneously
3. All UI strings in `translations.ts` — no hardcoding
4. No client-side router
5. No unknown fields in generator JSON

**Build/CI:**
- GitHub Actions + rsync to reg.ru
- No tests/lint in CI despite scripts existing
- Dockerfile for local preview only (not used in CI)
- nginx:alpine, no HEALTHCHECK

---

## Work Objectives

### Core Objective
Generate concise, telegraphic AGENTS.md files that capture project-specific knowledge without generic advice.

### Concrete Deliverables
- `./AGENTS.md` (root, 50-150 lines)
- `src/components/generators/AGENTS.md` (subdirectory, 30-80 lines)

### Must Have
- Project overview with stack
- Directory structure tree
- "WHERE TO LOOK" table mapping tasks to locations
- Conventions (deviations from standard only)
- Anti-patterns specific to this project
- Commands (dev/test/build)
- Notes with known issues

### Must NOT Have
- Generic advice applicable to all projects
- Redundancy between parent and child AGENTS.md
- Boilerplate that doesn't help navigate the codebase

---

## Verification Strategy

### QA Scenarios

**Scenario: Root AGENTS.md completeness**
Tool: Read
Steps:
  1. Read `./AGENTS.md`
  2. Verify it contains: OVERVIEW, STRUCTURE, WHERE TO LOOK, CONVENTIONS, ANTI-PATTERNS, COMMANDS, NOTES
  3. Verify length is 50-150 lines
  4. Verify no generic advice (e.g., "use version control", "write tests")
Expected Result: File exists with all required sections, telegraphic style, project-specific content only
Evidence: .sisyphus/evidence/init-deep-root-agents.md

**Scenario: Generators AGENTS.md completeness**
Tool: Read
Steps:
  1. Read `src/components/generators/AGENTS.md`
  2. Verify it contains: OVERVIEW, STRUCTURE, WHERE TO LOOK, CONVENTIONS, ANTI-PATTERNS, NOTES
  3. Verify length is 30-80 lines
  4. Verify no duplication of parent content (e.g., doesn't repeat stack overview)
Expected Result: File exists with generator-specific content, no parent redundancy
Evidence: .sisyphus/evidence/init-deep-generators-agents.md

**Scenario: No drift from actual codebase**
Tool: Bash (grep)
Steps:
  1. grep -c "generators" ./AGENTS.md → should reference 30 generators
  2. grep "Math.random" ./AGENTS.md → should note known discrepancy
  3. grep "dice-engine" src/components/generators/AGENTS.md → should mention import pattern
Expected Result: AGENTS.md reflects actual codebase state, not outdated docs
Evidence: .sisyphus/evidence/init-deep-drift-check.txt

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 2 tasks in parallel):
├── Task 1: Generate root AGENTS.md
└── Task 2: Generate generators/AGENTS.md
```

### Agent Dispatch Summary

- **T1**: `writing` category — Generate root AGENTS.md
- **T2**: `writing` category — Generate generators/AGENTS.md

---

## TODOs

- [ ] 1. Generate root AGENTS.md

  **What to do**:
  - Create `./AGENTS.md` with all required sections
  - Include project-specific knowledge from research findings
  - Maintain telegraphic style (50-150 lines)
  - Include known issues: 30 generators (not 10), Math.random discrepancy, dice engine duplication, CI doesn't run tests

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2)
  - **Blocks**: Task 3 (review)

  **Acceptance Criteria**:
  - [ ] File created: `./AGENTS.md`
  - [ ] Contains all sections: OVERVIEW, STRUCTURE, WHERE TO LOOK, CONVENTIONS, ANTI-PATTERNS, COMMANDS, NOTES
  - [ ] Length: 50-150 lines
  - [ ] No generic advice
  - [ ] References 30 generators (not outdated 10)
  - [ ] Notes Privacy Policy / Math.random discrepancy

  **QA Scenarios**:
  ```
  Scenario: Root AGENTS.md structure
    Tool: Read
    Steps:
      1. Read ./AGENTS.md
      2. Count lines (should be 50-150)
      3. Verify all required sections present
    Expected Result: Complete, concise, project-specific
    Evidence: .sisyphus/evidence/init-deep-root-check.txt
  ```

- [ ] 2. Generate generators/AGENTS.md

  **What to do**:
  - Create `src/components/generators/AGENTS.md` with generator-domain knowledge
  - Focus on: conventions for creating generators, anti-patterns specific to generator components
  - Maintain telegraphic style (30-80 lines)
  - Never repeat parent content (no stack overview, no global commands)

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1)
  - **Blocks**: Task 3 (review)

  **Acceptance Criteria**:
  - [ ] File created: `src/components/generators/AGENTS.md`
  - [ ] Contains: OVERVIEW, STRUCTURE, WHERE TO LOOK, CONVENTIONS, ANTI-PATTERNS, NOTES
  - [ ] Length: 30-80 lines
  - [ ] No duplication of parent AGENTS.md content
  - [ ] Mentions dice-engine import pattern
  - [ ] Mentions 4-artifact requirement for new generators

  **QA Scenarios**:
  ```
  Scenario: Generators AGENTS.md structure
    Tool: Read
    Steps:
      1. Read src/components/generators/AGENTS.md
      2. Count lines (should be 30-80)
      3. Verify no parent content duplication
    Expected Result: Domain-specific, concise
    Evidence: .sisyphus/evidence/init-deep-generators-check.txt
  ```

- [ ] 3. Review and validate both files

  **What to do**:
  - Read both AGENTS.md files
  - Check for redundancy between parent and child
  - Verify telegraphic style
  - Verify no generic advice
  - Trim if necessary

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 1, 2)

  **Acceptance Criteria**:
  - [ ] Both files pass review
  - [ ] No cross-file redundancy
  - [ ] Both within line limits

  **QA Scenarios**:
  ```
  Scenario: Cross-file redundancy check
    Tool: Bash (grep)
    Steps:
      1. grep "Astro 4" src/components/generators/AGENTS.md → should be empty (parent covers this)
      2. grep "npm run" src/components/generators/AGENTS.md → should be empty
    Expected Result: Child file doesn't repeat parent knowledge
    Evidence: .sisyphus/evidence/init-deep-redundancy-check.txt
  ```

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify both AGENTS.md files exist, contain required sections, and reflect actual codebase state. Check line limits. Verify no generic advice.
  Output: `Files [2/2] | Sections [PASS/FAIL] | Line Limits [PASS/FAIL] | VERDICT`

---

## Commit Strategy

- **1**: `docs: add AGENTS.md knowledge base`
  - Files: `AGENTS.md`, `src/components/generators/AGENTS.md`

---

## Success Criteria

- [ ] Root AGENTS.md exists (50-150 lines, all sections, no generic advice)
- [ ] Generators AGENTS.md exists (30-80 lines, no parent redundancy)
- [ ] Both files reflect actual codebase state (30 generators, known issues)
- [ ] No drift from discovered conventions and anti-patterns
