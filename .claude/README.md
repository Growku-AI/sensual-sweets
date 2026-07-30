# `.claude/` — Claude Code configuration

This folder configures how Claude Code works in this repo. It is committed so the
whole team (and your future self) shares the same commands, agents, rules, and guardrails.

## What's here

| Path | Purpose | Who reads it |
|---|---|---|
| `settings.json` | Permissions, env, hooks wiring | Claude Code (committed) |
| `settings.local.json` | Your personal overrides | Claude Code (git-ignored) |
| `rules/` | Standing conventions, auto-loaded every session | Claude |
| `commands/` | Slash commands you invoke with `/name` | You → Claude |
| `agents/` | Subagents Claude delegates to | Claude |
| `skills/` | Reusable workflows Claude auto-invokes when relevant | Claude |
| `hooks/` | Shell scripts run at tool lifecycle events | Claude Code |
| `output-styles/` | Optional alternate response styles | Claude Code |
| `CONVENTIONS.md` | How to author files in this folder | You |

## Use it

- Run a command: type `/review-pr` (or `/git:commit`) in a Claude Code session.
- Let Claude work: skills like `changelog` and the `code-reviewer` agent trigger on their own when relevant.
- Conventions in `rules/` load automatically — you don't invoke them.

## Add to it

Copy the matching `_template.*` file, rename it `verb-noun` (commands/skills) or `role` (agents),
fill in the frontmatter, and keep bodies short. See `CONVENTIONS.md`.

To create a new agent without hand-writing it, run `/new-agent <role and purpose>` — e.g.
`/new-agent supabase-agent for schema and RLS work`. The `agent-factory` agent inspects the
repo's stack and conventions and writes a well-formed agent file into `.claude/agents/`. It
never overwrites an existing agent without your explicit confirmation.

## Don't touch manually

- `settings.local.json` — personal, git-ignored. Copy from `settings.local.json.example`.
- Anything Claude generates at runtime (`todos/`, `logs/`, `cache/`).

> Requires `jq` on PATH for the example hooks. Remove the hook blocks from `settings.json` if you don't want them.
