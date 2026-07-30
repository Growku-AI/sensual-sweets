---
description: Run the project's test suite and summarize failures with file:line pointers
argument-hint: [test-path-or-pattern]
allowed-tools: Bash(npm test *), Bash(npm run *), Bash(pnpm *), Bash(yarn *), Read, Grep, Glob
---

## Task

1. Run the test command from CLAUDE.md's Stack section (default: `npm test`), scoped to `$ARGUMENTS` if given.
2. If everything passes, report the count and stop.
3. For each failure: quote the assertion, point to the failing source with `file:line`, and state the most likely cause.
4. Do not fix anything unless asked — report only.
