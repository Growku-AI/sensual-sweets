---
description: Stage changes and write a Conventional Commit
argument-hint: [message hint]
allowed-tools: Bash(git status *), Bash(git diff *), Bash(git add *), Bash(git commit *)
---

## Context

!`git status --short`

!`git diff --stat`

## Task

1. Group the current changes into one logical commit (or tell me if they should be split).
2. Write a Conventional Commit message (`feat`/`fix`/`chore`/`docs`/`refactor`/`test`). Consider this hint: $ARGUMENTS
3. Stage the relevant files and commit. Do not push.
