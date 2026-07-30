# Change scope & dependency hygiene

- Keep changes scoped to the requested task; no unasked-for refactors, renames, or reformatting of unrelated files.
- Prefer the smallest diff that correctly solves the task.
- Don't add a new dependency without calling it out first (name, why, lighter alternatives considered).
- If a larger change seems warranted (e.g. a refactor while fixing a bug), propose it separately instead of bundling it.
