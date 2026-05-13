# Create AGENTS.md

## TL;DR

> Create `AGENTS.md` at repo root with compact, high-signal instructions for future OpenCode sessions. Replace stale `CLAUDE.md` claims. Verify all facts from executable sources.
> 
> **Deliverables**: `AGENTS.md` (new file), committed and pushed to `main`
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — single task
> **Critical Path**: Task 1 only

---

## Context

### Original Request
User: "обнови Agents.md" (Create or update `AGENTS.md` for this repository).

### Key Facts Discovered
- **Project**: Astro 4 + Tailwind CSS 4 static site, 28 random-value generators (bilingual EN/RU)
- **Deploy**: GitHub Actions + rsync to reg.ru on push to `main`
- **CI gate order**: `npm ci` → `npm run lint` → `npm run test` → `npm run build` → `rsync`
- **i18n**: Astro built-in routing, `defaultLocale: "en"`, `prefixDefaultLocale: false`. EN at `src/pages/`, RU at `src/pages/ru/`. Locale derived from `Astro.currentLocale`.
- **CRITICAL quirk**: Never use shared dynamic `[slug].astro` for RU pages — Astro bundles all imported component scripts, causing every RU page to run all 28 generator scripts.
- **Generators**: 28 live. Each requires 4 files: content JSON (EN+RU fields), component, EN page, RU page.
- **Content schema**: Zod `.strict()` in `src/lib/generator-schema.ts` — unknown fields fail build.
- **Shared utilities**: `src/lib/client/random.ts` (crypto `getRandomValues`), `src/lib/client/i18n.ts` (client locale helpers). All 28 generators refactored to use these (zero `Math.random`).
- **Dice engine**: deduplicated into `src/lib/dice-engine.ts`, imported by `DiceGenerator.astro`.
- **Test runner**: Vitest v4, `environment: "node"`, `include: ["src/**/*.test.ts"]`.
- **Lint**: ESLint via `eslint.config.mjs`, ignores `dist/`, `.astro/`, `node_modules/`, `src/env.d.ts`.
- **CLAUDE.md is stale**: claims "10 generators" and "No test runner or linter is configured" — both false.
- **No existing agent instruction files**: no `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`, `opencode.json`.

### Metis Review
- No gaps identified — repo answers all important questions.

---

## Work Objectives

### Core Objective
Write a compact `AGENTS.md` at repo root containing only high-signal, repo-specific guidance that future OpenCode agents would likely miss.

### Concrete Deliverables
- `AGENTS.md` file at repo root

### Definition of Done
- [ ] `AGENTS.md` exists at repo root
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` passes (62 pages)

### Must Have
- Exact developer commands
- CI gate order
- i18n routing quirks and the `[slug].astro` prohibition
- Generator addition workflow (4 steps)
- Zod strict schema warning
- Shared utilities architecture (random.ts, i18n.ts, dice-engine.ts)
- Stale CLAUDE.md warnings

### Must NOT Have
- Generic software advice
- Long tutorials or exhaustive file trees
- Obvious language conventions
- Speculative claims

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: NO (not needed for doc file)
- **Agent-Executed QA**: YES — verify lint and build pass after file creation

### QA Policy
Every task MUST include agent-executed QA scenarios.

---

## Execution Strategy

### Wave 1 (Single Task)

- **Task 1**: Write `AGENTS.md`

---

## TODOs

- [ ] 1. Write AGENTS.md

  **What to do**:
  - Create `/home/emil/Desktop/Coding/AI/Randify.pro/AGENTS.md` with the following verified content:
    - Project overview (28 generators, Astro 4 + Tailwind 4)
    - Developer commands (exact npm scripts)
    - CI gate order
    - i18n routing architecture and `[slug].astro` prohibition
    - Path alias `@/* → src/*`
    - Shared utilities table (random.ts, i18n.ts, dice-engine.ts)
    - Shared components (ResultBox.astro, CopyButton.astro)
    - Adding a generator: 4-step workflow
    - Key conventions (accent color, icons, analytics IDs)
    - Stale CLAUDE.md warnings
    - Testing, lint & format notes
    - Build artifacts and operational gotchas
  - Use compact bullets, not prose paragraphs.
  - Verify no generic advice included.

  **Must NOT do**:
  - Do NOT include generic software advice
  - Do NOT write long tutorials
  - Do NOT include obvious conventions
  - Do NOT make speculative claims
  - Do NOT touch `CLAUDE.md` (leave it as-is; AGENTS.md is the new source of truth)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `CLAUDE.md` — existing guidance (partially stale, use for comparison only)
  - `package.json` — exact npm scripts
  - `astro.config.mjs` — i18n routing config
  - `vitest.config.ts` — test config
  - `eslint.config.mjs` — lint rules and ignores
  - `.github/workflows/deploy.yml` — CI gate order
  - `src/lib/generator-schema.ts` — Zod strict schema
  - `src/lib/client/random.ts` — crypto random utility
  - `src/lib/client/i18n.ts` — client i18n helper
  - `src/lib/dice-engine.ts` — canonical dice engine

  **Acceptance Criteria**:
  - [ ] `AGENTS.md` exists at `/home/emil/Desktop/Coding/AI/Randify.pro/AGENTS.md`
  - [ ] `npm run lint` → PASS (0 errors)
  - [ ] `npm run build` → PASS (62 pages generated)

  **QA Scenarios**:

  ```
  Scenario: File created and lint passes
    Tool: Bash
    Preconditions: None
    Steps:
      1. Read AGENTS.md and verify it contains: "28 random-value generators", "CI gate order", "[slug].astro" warning, "Zod .strict()" warning, shared utilities table
      2. Run: npm run lint
      3. Assert: 0 errors
    Expected Result: lint exits 0, no errors
    Evidence: .sisyphus/evidence/agents-lint.txt

  Scenario: Build passes after file creation
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: npm run build
      2. Assert: "62 pages" in output, exit code 0
    Expected Result: 62 pages generated, exit code 0
    Evidence: .sisyphus/evidence/agents-build.txt
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/agents-lint.txt`
  - [ ] `.sisyphus/evidence/agents-build.txt`

  **Commit**: YES
  - Message: `docs: add AGENTS.md with high-signal repo guidance`
  - Files: `AGENTS.md`
  - Pre-commit: `npm run lint && npm run build`

---

## Commit Strategy

- **1**: `docs: add AGENTS.md with high-signal repo guidance` — AGENTS.md, npm run lint && npm run build

---

## Success Criteria

### Verification Commands
```bash
npm run lint   # Expected: 0 errors
npm run build  # Expected: 62 pages
```

### Final Checklist
- [ ] AGENTS.md exists at repo root
- [ ] Contains 28 generators count (not 10)
- [ ] Contains exact CI gate order
- [ ] Contains [slug].astro prohibition
- [ ] Contains Zod strict warning
- [ ] Lint passes
- [ ] Build passes
