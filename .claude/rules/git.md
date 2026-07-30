# Git workflow

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Never commit secrets — `.env` and credentials stay local.
- ALL merges into `develop`, `preview`, `release`, `master`, or `main` go through a Pull Request — never merge locally into or push directly to these branches. Feature branch → push → `gh pr create`. [Standing order: Michael, 2026-07-29]
- Keep commits focused; one logical change per commit.
