#!/usr/bin/env bash
# PostToolUse formatter — runs your formatter on files Claude just wrote/edited.
# Wired in .claude/settings.json. Requires `jq` (no-op without it). Non-blocking: never fails the call.
set -euo pipefail

command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    command -v npx >/dev/null 2>&1 && npx --no-install prettier --write "$file" >/dev/null 2>&1 || true ;;
  *.py)
    command -v ruff >/dev/null 2>&1 && ruff format "$file" >/dev/null 2>&1 || true ;;
esac

exit 0
