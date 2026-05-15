# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dm/notes.spec.ts >> Notes Panel >> clear button empties notes
- Location: tests/dm/notes.spec.ts:19:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:4321/dm/#notes", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```