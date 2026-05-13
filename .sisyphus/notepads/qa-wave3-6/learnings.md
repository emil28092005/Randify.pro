# QA Wave 3-6 Findings

## Scenarios Verified

1. **No Math.random in generators** — `grep -r "Math.random" src/components/generators/` returned 0 matches across 28 files. CLEAN.
2. **DiceGenerator imports dice-engine** — Found `import { parseDiceNotation, rollDice, rollAdvantage, buildNotation } from "@/lib/dice-engine";` at line 274.
3. **DiceGenerator line count** — 760 lines (< 800 limit, was 958 before dedup).
4. **Build produces 62 pages** — `npm run build` output: `[build] 62 page(s) built in 3.60s`.
5. **Tests pass** — `npm run test`: 3 test files passed, 51 tests passed.
6. **random.ts uses crypto.getRandomValues** — Confirmed at lines 14, 23, 28.
7. **i18n.ts uses document.documentElement.lang** — Confirmed at line 4.
8. **28/28 generators use new imports** — All import from `@/lib/client/random`, `@/lib/client/i18n`, or `@/lib/dice-engine`.

## Edge Cases Checked

- **NumberGenerator**: validates integer inputs, checks `min >= max`.
- **PasswordGenerator**: validates at least one character type is selected.
- **CardGenerator**: validates count >= 1, count <= 52, and unique draw <= 52.
- **ListGenerator**: validates non-empty list, count >= 1, unique pick <= list length.
- **ShufflerGenerator**: validates at least 2 items before shuffling.

## Integration

- All generators use shared `random.ts` (crypto-based) and `i18n.ts` (document.documentElement.lang).
- No inline dice engine duplication remains in DiceGenerator.
- Build and tests are green.
