# Plan: Add Typography Styles to Blog Posts

## TL;DR

> The `@tailwindcss/typography` plugin is installed but not registered in the CSS. Add `@plugin "@tailwindcss/typography";` to `BaseLayout.astro`, rebuild, verify that blog posts render with proper typography, and commit.
>
> **Deliverables**: 1 modified file (`BaseLayout.astro`), build passes, prettier blog rendering
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — single task

---

## Context

### Problem Discovered
After filling all 16 blog posts with real content, the user noticed that posts render as plain text without formatting. Investigation revealed:

- `BlogLayout.astro` already applies `prose prose-invert prose-zinc` to the content container
- The `@tailwindcss/typography` plugin was **not installed** (hence `prose` did nothing)
- Plugin was installed via `npm install -D @tailwindcss/typography` during diagnosis
- The plugin still needs to be **registered in the CSS** with `@plugin "@tailwindcss/typography";`

### Root Cause
In Tailwind CSS v4, plugins must be explicitly loaded in the CSS file. The `@import "tailwindcss";` in `BaseLayout.astro` is not enough — the typography plugin requires `@plugin "@tailwindcss/typography";`.

---

## Work Objectives

### Core Objective
Register the typography plugin so that the `prose` class in `BlogLayout.astro` actually styles rendered Markdown.

### Concrete Deliverables
- `src/layouts/BaseLayout.astro` — add `@plugin "@tailwindcss/typography";`
- Build passes with 0 errors
- Blog posts display styled headings, lists, code blocks, and other Markdown elements

### Definition of Done
- [ ] `npm run build` produces 92+ pages with 0 errors
- [ ] A rendered blog post shows styled `h2`, `ul`, `code`, and `strong` elements (not plain browser defaults)

### Must Have
- Plugin registered correctly for Tailwind v4 syntax (`@plugin`)
- No visual regressions on non-blog pages

### Must NOT Have
- Do NOT install additional unrelated packages
- Do NOT change existing prose classes in `BlogLayout.astro`

---

## Execution Strategy

### Task 1: Register Typography Plugin

- [x] 1. Register `@tailwindcss/typography` plugin

  **What to do**:
  - Edit `src/layouts/BaseLayout.astro`
  - Find the `<style is:global>` block with `@import "tailwindcss";`
  - Add `@plugin "@tailwindcss/typography";` immediately after the `@import` line
  - The result should look like:
    ```css
    @import "tailwindcss";
    @plugin "@tailwindcss/typography";
    ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `BaseLayout.astro` contains `@plugin "@tailwindcss/typography";`

  **QA Scenarios**:
  ```
  Scenario: Plugin registered
    Tool: Bash (grep)
    Steps:
      1. grep '@plugin "@tailwindcss/typography"' src/layouts/BaseLayout.astro
    Expected Result: Match found
  ```

  **Commit**: NO (group with verification)

---

## Final Verification Wave

- [x] F1. Build + Visual Check
  Run `npm run build`. Must pass with 0 errors and 92+ pages. Then verify a sample blog post renders with styled typography (headings are larger/bolder, lists have bullets, inline code is monospaced).
  Output: `Build [PASS/FAIL] | Visual [PASS/FAIL]`

- [x] F2. Git Commit
  Stage `src/layouts/BaseLayout.astro` and `package.json`/`package-lock.json`. Commit with message: `fix(blog): register @tailwindcss/typography for prose styling`
  Do NOT push to remote.

---

## Commit Strategy

- **F2**: `fix(blog): register @tailwindcss/typography for prose styling`

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: 92+ pages, 0 errors
grep '@plugin "@tailwindcss/typography"' src/layouts/BaseLayout.astro  # Expected: match
```

### Final Checklist
- [ ] Plugin registered in CSS
- [ ] Build passes
- [ ] Blog posts render with styled typography
- [ ] Changes committed (not pushed)
