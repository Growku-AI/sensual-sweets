---
description: Review the current branch's changes for correctness, style, and risk
argument-hint: [base-branch]
allowed-tools: Bash(git diff *), Bash(git log *), Bash(git status *), Read, Grep, Glob
---

## Context

Base branch: ${1:-master}

Changed files:
!`git diff --name-only ${1:-master}...HEAD`

Diff stat:
!`git diff --stat ${1:-master}...HEAD`

## Task

Review the changes above ($ARGUMENTS):

1. Correctness and logic bugs.
2. Security — input handling, authz, secret exposure.
3. Tests — missing coverage for changed behavior.
4. Style — deviations from @.claude/rules/code-style.md.

Group findings as Critical / High / Medium / Low, each with `file:line` and a concrete fix.
Do not modify files — review only.
