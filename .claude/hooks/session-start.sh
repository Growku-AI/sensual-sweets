#!/usr/bin/env bash
# SessionStart hook — prints a short repo-context banner Claude sees at session start.
# Stack-agnostic (git only); silently no-ops outside a git repo.
set -uo pipefail

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch=$(git branch --show-current 2>/dev/null || echo "(detached)")
dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

echo "Repo context: branch '$branch', $dirty uncommitted change(s)."
echo "Recent commits:"
git log --oneline -n 5 2>/dev/null || true

exit 0
