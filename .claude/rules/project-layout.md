# Project layout

Canonical top-level layout for projects scaffolded from this template. Each folder has its own
`README.md` with more detail — read it before adding files there.

| Path | Contents |
|---|---|
| `app/` | The entire framework project — Next.js, Vite, iOS/Xcode, or any other stack. `package.json`, build config, source code, dependencies. |
| `plans/` | Planning hierarchy: `PLAN.md` → `<epic-slug>/EPIC.md` → `<epic-slug>/<feature-slug>/reference.md`. |
| `lib/` | Shared non-app code — build scripts, generators, dev tooling not imported by the app at runtime. |
| `tests/` | ALL tests — unit, integration, e2e, and shell tests. |
| repo root | Reserved for `.claude/`, `CLAUDE.md`, `AGENTS.md`, `scripts/`, `.mcp.json`, `VERSION`, and other repo-level config — not framework files. |

Rules:

- Never scaffold or generate framework files (`package.json`, `next.config.*`, `vite.config.*`, an Xcode project, etc.) at the repo root — they always go inside `app/`.
- Run dev/build/test commands for framework work from inside `app/` (`cd app && npm run dev`), not from the repo root.
- New plans go under `plans/`, following the Plan → Epic → Feature hierarchy — never as loose files elsewhere.
- Shared non-app tooling (scripts, generators, utilities not imported by the app at runtime) belongs in `lib/`.
- All tests belong under `tests/`, regardless of what they cover.

This layout applies to projects scaffolded from this template going forward. When working in a
repo that predates it — framework files already sitting at the repo root — follow that repo's
existing structure. Do not relocate its files to match this layout.
