# Plan: Fill Blog Posts with Real Content

## TL;DR

> Replace placeholder text in 16 bilingual blog posts (8 EN + 8 RU) with real, research-backed, SEO-optimized articles about randomness, security, gaming, design, and decision-making topics. Each article 800–1500 words with h2/h3 structure, practical examples, and natural references to related Randify generators.
>
> **Deliverables**: 16 updated `.md` files with real content bodies, preserved frontmatter
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves of 4 parallel tasks each
> **Critical Path**: EN Wave 1 → EN Wave 2 → RU Wave 1 → RU Wave 2 → Build Verify

---

## Context

### Original Request
"Отлично! Теперь наполни блоги реалным содержимым. проведи нужные исследования и сделай качественные блоги на эти тематики"

### Current State
- All 16 blog post templates exist with correct frontmatter (title, description, dates, tags, relatedGenerators)
- Body contains placeholder text ("This article will explore...", "Stay tuned...")
- Files located in `src/content/blog/en/` (8 files) and `src/content/blog/ru/` (8 files)
- RU filenames differ slightly from EN slugs:
  - EN `dice-notation-explained.md` → RU `dice-notation-guide.md`
  - EN `random-team-picker.md` → RU `random-team-selection.md`
  - EN `color-theory-palettes.md` → RU `color-theory-guide.md`
- Blog is already wired into Astro Content Collections; body text is the only missing piece

---

## Work Objectives

### Core Objective
Replace all placeholder body text with real, high-quality articles that provide genuine value to readers and improve SEO for Yandex РСЯ moderation.

### Concrete Deliverables
- 8 EN blog posts with real content (800–1500 words each)
- 8 RU blog posts with real content (800–1500 words each), adapted (not translated verbatim) for Russian audience
- All frontmatter preserved exactly as-is
- Build passes (`npm run build`) with 0 errors

### Definition of Done
- [ ] All 16 `.md` files contain real content, no placeholder text remains
- [ ] `npm run build` produces 92+ pages with 0 errors
- [ ] Content is factually accurate, well-structured with h2/h3 headings
- [ ] Each article naturally references its related Randify generators

### Must Have
- Real, substantive content in every post (no filler, no Lorem ipsum)
- SEO-optimized: keywords in h2 headings and first paragraph
- Practical examples, checklists, or actionable advice in each article
- h2/h3 structure for readability
- Natural integration of related generator names

### Must NOT Have (Guardrails)
- Do NOT modify frontmatter (preserve exactly)
- Do NOT change filenames or slugs
- Do NOT add external links (keep readers on site)
- Do NOT use AI-sounding filler ("in conclusion", "it's important to note", excessive adverbs)
- Do NOT push to main without user approval

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no test runner configured)
- **Automated tests**: None
- **Agent-Executed QA**: Build verification + content spot-checks

### QA Policy
Every wave includes agent-executed verification:
- **Build**: `npm run build` must pass
- **Content check**: Read random sample of posts to verify no placeholder text remains

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 4 EN posts):
├── Task 1: EN — Cryptographically Secure Randomness
├── Task 2: EN — Strong Passwords
├── Task 3: EN — Dice Notation
└── Task 4: EN — Psychology of Randomness

Wave 2 (After Wave 1 — 4 EN posts):
├── Task 5: EN — RNG in Gaming
├── Task 6: EN — Random Team Picker
├── Task 7: EN — Color Theory Palettes
└── Task 8: EN — UUID vs Sequential IDs

Wave 3 (After Wave 2 — 4 RU posts):
├── Task 9: RU — Криптографически стойкая случайность
├── Task 10: RU — Надёжные пароли
├── Task 11: RU — Нотация кубиков
└── Task 12: RU — Психология случайности

Wave 4 (After Wave 3 — 4 RU posts):
├── Task 13: RU — RNG в играх
├── Task 14: RU — Случайный выбор команд
├── Task 15: RU — Теория цвета
└── Task 16: RU — UUID vs последовательные ID

Wave FINAL (After ALL tasks):
├── Task F1: Build verification + content spot-check
└── Task F2: Git commit (do NOT push)
```

### Dependency Matrix
- **Waves 1 & 2**: Independent (all EN posts can theoretically run in parallel, but 8 parallel tasks is too many)
- **Wave 3**: Depends on Wave 2 (RU writers should see EN content for reference, but not strictly blocked)
- **Wave 4**: Depends on Wave 3
- **FINAL**: Depends on Wave 4

---

## TODOs

- [x] 1. EN — What is Cryptographically Secure Randomness

  **What to do**:
  - Read `src/content/blog/en/what-is-cryptographically-secure-randomness.md`
  - Replace placeholder body with real article (800–1500 words)
  - Structure: h2 headings (What Is..., Why Math.random Is Not Enough, Where It Matters, Practical Checklist, Conclusion)
  - Include practical examples: `crypto.getRandomValues()`, `/dev/urandom`, `secrets` module
  - Mention related generators naturally: Password Generator, Hash Generator, UUID Generator
  - SEO keywords: "cryptographically secure randomness", "CSPRNG", "secure random number generator"

  **Must NOT do**:
  - Do NOT modify frontmatter
  - Do NOT change filename

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []
  - Reason: Pure content writing task

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (Tasks 1–4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/content/blog/en/what-is-cryptographically-secure-randomness.md` — target file
  - `src/content/blog/en/how-to-create-strong-passwords.md` — related post for cross-linking context

  **Acceptance Criteria**:
  - [ ] File contains real content with h2/h3 headings
  - [ ] No placeholder text ("Stay tuned", "This article will explore") remains
  - [ ] Word count ≥ 800

  **QA Scenarios**:
  ```
  Scenario: Content replaced successfully
    Tool: Bash (grep)
    Steps:
      1. grep -i "stay tuned" src/content/blog/en/what-is-cryptographically-secure-randomness.md
    Expected Result: No matches (exit code 1)
    Evidence: terminal output
  ```

  **Commit**: NO (group with final wave)

- [x] 2. EN — How to Create Strong Passwords

  **What to do**:
  - Read `src/content/blog/en/how-to-create-strong-passwords.md`
  - Replace placeholder body with real article (800–1500 words)
  - Structure: h2 headings (Why Length Beats Complexity, Passphrases vs Passwords, Password Managers, Two-Factor Authentication, Practical Checklist)
  - Include NIST guidelines reference
  - Mention related generators: Password Generator, Hash Generator
  - SEO keywords: "strong passwords", "password security", "create strong password"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1

  **QA Scenarios**:
  ```
  Scenario: No placeholder text
    Tool: Bash (grep)
    Steps:
      1. grep -i "stay tuned" src/content/blog/en/how-to-create-strong-passwords.md
    Expected Result: No matches
  ```

  **Commit**: NO

- [x] 3. EN — Dice Notation Explained

  **What to do**:
  - Read `src/content/blog/en/dice-notation-explained.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (Basic Notation, Common Dice Types, Modifiers and Advantage, Exploding Dice, Digital Dice Rollers)
  - Explain d4, d6, d8, d10, d12, d20, percentile dice
  - Cover advantage/disadvantage (D&D 5e), exploding dice mechanic
  - Mention related generator: Dice Roller
  - SEO keywords: "dice notation", "dnd dice", "exploding dice", "rpg dice"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1

  **Commit**: NO

- [x] 4. EN — Psychology of Randomness

  **What to do**:
  - Read `src/content/blog/en/psychology-of-randomness.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (The Pattern-Seeking Brain, The Hot-Hand Fallacy, Gambler's Fallacy, How to Be Truly Random, Tools for Fairness)
  - Reference real experiments (e.g., Tversky & Kahneman)
  - Mention related generators: Coin Flip, Yes/No, Random Number
  - SEO keywords: "psychology of randomness", "human randomness bias", "gambler's fallacy"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1

  **Commit**: NO

- [x] 5. EN — RNG in Gaming

  **What to do**:
  - Read `src/content/blog/en/rng-in-gaming.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (PRNG vs True RNG, Seeds and Determinism, Loot Boxes and Regulation, Fairness Auditing, Player Trust)
  - Mention related generators: Dice Roller, Lottery, Wheel Spinner
  - SEO keywords: "RNG in gaming", "random number generator games", "fairness in gaming"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

  **Commit**: NO

- [x] 6. EN — Random Team Picker

  **What to do**:
  - Read `src/content/blog/en/random-team-picker.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (Eliminating Bias, Random vs Balanced Teams, Sports Leagues, Corporate Workshops, Tools and Tips)
  - Mention related generators: Team Generator, List Shuffler
  - SEO keywords: "random team picker", "fair team selection", "team generator"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

  **Commit**: NO

- [x] 7. EN — Color Theory Palettes

  **What to do**:
  - Read `src/content/blog/en/color-theory-palettes.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (The Color Wheel, Complementary Colors, Analogous and Triadic, Accessibility and Contrast, Using Palette Generators)
  - Mention related generators: Color Generator, Gradient Generator, Palette Generator
  - SEO keywords: "color theory palettes", "harmonious color palettes", "color palette generator"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

  **Commit**: NO

- [x] 8. EN — UUID vs Sequential IDs

  **What to do**:
  - Read `src/content/blog/en/uuid-vs-sequential-ids.md`
  - Replace placeholder with real article (800–1500 words)
  - Structure: h2 headings (What Is a UUID?, Storage and Performance, Collision Probability, Distributed Systems, When to Use What)
  - Mention UUID v4, ULID, Snowflake IDs
  - Mention related generators: UUID Generator, Hash Generator
  - SEO keywords: "UUID vs sequential ID", "when to use UUID", "database ID strategy"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2

  **Commit**: NO

- [x] 9. RU — Криптографически стойкая случайность

  **What to do**:
  - Read `src/content/blog/ru/what-is-cryptographically-secure-randomness.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt content for Russian audience (not verbatim translation of EN)
  - Structure: same topics as EN but localized
  - Mention related generators naturally
  - SEO keywords in Russian: "криптографически стойкая случайность", "CSPRNG", "безопасная генерация случайных чисел"

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Commit**: NO

- [x] 10. RU — Надёжные пароли

  **What to do**:
  - Read `src/content/blog/ru/how-to-create-strong-passwords.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Commit**: NO

- [x] 11. RU — Нотация кубиков

  **What to do**:
  - Read `src/content/blog/ru/dice-notation-guide.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian RPG community
  - Mention related generator: Dice Roller

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Commit**: NO

- [x] 12. RU — Психология случайности

  **What to do**:
  - Read `src/content/blog/ru/psychology-of-randomness.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3

  **Commit**: NO

- [x] 13. RU — RNG в играх

  **What to do**:
  - Read `src/content/blog/ru/rng-in-gaming.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Commit**: NO

- [x] 14. RU — Случайный выбор команд

  **What to do**:
  - Read `src/content/blog/ru/random-team-selection.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Commit**: NO

- [x] 15. RU — Теория цвета

  **What to do**:
  - Read `src/content/blog/ru/color-theory-guide.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Commit**: NO

- [x] 16. RU — UUID vs последовательные ID

  **What to do**:
  - Read `src/content/blog/ru/uuid-vs-sequential-ids.md`
  - Replace placeholder with real article (800–1500 words) in Russian
  - Adapt for Russian audience
  - Mention related generators

  **Must NOT do**:
  - Do NOT modify frontmatter

  **Recommended Agent Profile**:
  - **Category**: `writing`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4

  **Commit**: NO

---

## Final Verification Wave

- [x] F1. Build Verification + Content Spot-Check
  Run `npm run build`. Must produce 92+ pages with 0 errors. Read 4 random posts (2 EN + 2 RU) and verify:
  - No placeholder text remains
  - h2 headings present
  - Word count ≥ 800 per article
  Output: `Build [PASS/FAIL] | Content [PASS/FAIL]`

- [x] F2. Git Commit
  Stage all modified files. Commit with message: `content(blog): add real articles to all 16 posts`
  Do NOT push to remote.

---

## Commit Strategy

- **F2**: `content(blog): add real articles to all 16 posts` — all modified `.md` files

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: 92+ pages, 0 errors
grep -ri "stay tuned" src/content/blog/  # Expected: 0 matches
grep -ri "this article will explore" src/content/blog/  # Expected: 0 matches
```

### Final Checklist
- [ ] All 16 posts contain real content
- [ ] No placeholder text anywhere
- [ ] Build passes
- [ ] Frontmatter untouched
- [ ] Changes committed (not pushed)
