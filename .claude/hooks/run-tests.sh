#!/usr/bin/env bash
# OPT-IN Stop-hook stub — runs the project's test suite when Claude finishes a turn.
# Not wired by default (test commands are project-specific and can be slow).
# To enable, add to .claude/settings.json:
#   "Stop": [{ "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/run-tests.sh" }] }]
set -uo pipefail

# Only npm projects with a real test script; extend for your stack.
[ -f package.json ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0
script=$(jq -r '.scripts.test // empty' package.json)
[ -n "$script" ] || exit 0
case "$script" in *"no test specified"*) exit 0 ;; esac

if ! npm test --silent >/tmp/claude-run-tests.log 2>&1; then
  echo "Tests failed — see /tmp/claude-run-tests.log. Fix before calling the task done." >&2
  exit 2  # exit 2 blocks the stop and feeds stderr back to Claude
fi

exit 0
