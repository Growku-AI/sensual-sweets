---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.js"
  - "tests/**/*"
---

# Testing

- Every bug fix ships with a regression test that fails before the fix.
- Co-locate unit tests next to source as `<name>.test.ts`; integration tests under `tests/`.
- Run the suite before claiming a task is done: `npm test`.
- Test behavior and edge cases, not implementation details.

<!-- This rule is path-scoped: it only loads when Claude works on matching files. -->
