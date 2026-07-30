#!/usr/bin/env bash
# statusLine command — Claude Code pipes session JSON on stdin; print one line.
# Shows model name and git branch. Gracefully degrades without jq or git.
set -uo pipefail

input=$(cat)
model="claude"
if command -v jq >/dev/null 2>&1; then
  model=$(printf '%s' "$input" | jq -r '.model.display_name // "claude"')
fi
branch=$(git branch --show-current 2>/dev/null || true)

if [ -n "$branch" ]; then
  echo "$model · $branch"
else
  echo "$model"
fi
