---
description: One line shown in the / menu — what this command does
argument-hint: [optional-args]
allowed-tools: Read, Grep, Glob
# model: sonnet
---

## Goal

<!--
Imperative instructions for Claude. Keep under ~150 lines.
- $ARGUMENTS = everything the user typed after the command.
- $1, $2 = positional args; ${1:-default} for a fallback.
- !`cmd`   = run a shell command, inline its output here before Claude reads it.
- @path    = inline the contents of a file.
-->

Context:
- Current branch: !`git branch --show-current`

Task: review $1 (default: ${1:-HEAD}), using extra guidance: $ARGUMENTS
