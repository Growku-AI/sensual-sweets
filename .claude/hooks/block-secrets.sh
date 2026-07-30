#!/usr/bin/env bash
# PreToolUse guard — blocks writes to secret/credential files and obvious hardcoded
# secrets. Wired in .claude/settings.json. Requires `jq` (fails open without it).
# Best-effort denylist, not exhaustive — pair with gitleaks/trufflehog for real coverage.
set -euo pipefail

command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
# MultiEdit sends {file_path, edits:[{old_string,new_string},...]} — scan every new_string.
content=$(printf '%s' "$input" | jq -r 'if .tool_input.edits then ([.tool_input.edits[].new_string] | join("\n")) else (.tool_input.new_string // .tool_input.content // empty) end')

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

case "$file" in
  *.env|*.env.*|*/secrets/*|*.pem|*.key)
    deny "Refusing to write to a secret/credential file ($file). Use environment variables instead." ;;
esac

if printf '%s' "$content" | grep -Eq '(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}|sk_live_[0-9a-zA-Z]{20,}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35})'; then
  deny "Refusing to write what looks like a hardcoded secret. Move it to an env var or secrets manager."
fi

exit 0
