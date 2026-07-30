---
name: changelog
description: >
  Generate or update CHANGELOG.md from git history. Use when the user asks to
  write a changelog, update the changelog, or summarize changes for a release.
argument-hint: [version]
allowed-tools: Bash(git log *) Bash(git tag *) Read Write Edit
---

## Overview

Produce Keep-a-Changelog style entries from commits since the last release tag.

## Steps

1. Find the last tag:
   !`git describe --tags --abbrev=0 2>/dev/null || echo "(none)"`
2. List commits since then:
   !`git log "$(git describe --tags --abbrev=0 2>/dev/null)"..HEAD --oneline 2>/dev/null || git log --oneline -n 50`
3. Group commits into Added / Changed / Fixed / Removed (drop empty groups).
4. Prepend a new section for version `$1` to `CHANGELOG.md`, creating the file if missing.

See [reference.md](reference.md) for the exact section format.
