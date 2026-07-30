# Authoring conventions for `.claude/`

These rules keep the folder navigable as it grows. They are for humans editing the
config — Claude does not need to read this file.

## Naming
- Filenames: `kebab-case`. No spaces, camelCase, or underscores (except `_template` and `_`-prefixed meta files).
- Commands: verb-first → `review-pr.md` becomes `/review-pr`.
- Agents: role noun → `code-reviewer.md`, `security-auditor.md`.
- Skills: verb-noun folder → `skills/changelog/`, the folder name is the skill name.
- Rules: topic noun → `testing.md`, `security.md`.

## Foldering
- Keep `commands/`, `agents/`, `skills/` flat until a directory exceeds ~6–8 files.
- Then namespace one level deep: `commands/git/commit.md` → `/git:commit`. Never nest deeper than two levels.
- Put rarely-used or risky commands under `commands/advanced/`.

## Frontmatter
- Field order: `name` → `description` → `argument-hint` / `tools` → `model` → `allowed-tools` → `hooks`.
- `description` is load-bearing for skills and agents: write it as explicit trigger conditions
  ("Use when the user asks to …"), not a vague summary. Vague descriptions never fire.

## Size
- `CLAUDE.md` and each `rules/*.md`: keep under ~200 lines (they load every session).
- `SKILL.md` bodies: under ~200 lines; move detail into a sibling `reference.md` and link it.

## What goes where
- Always-on convention → `rules/<topic>.md` (auto-loaded).
- A workflow Claude should run on demand → a `skill`.
- A workflow you trigger explicitly → a `command`.
- A specialist with its own context window → an `agent`.
- A hard guardrail that must always fire → a `hook` (not a rule — rules are advisory).
