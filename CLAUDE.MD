# Project instructions for Claude Code

## Before editing

1. Read the applicable local rules, the target files, and relevant configuration.
2. Inspect the current diff and preserve unrelated working-tree changes.
3. For issue, ticket, domain, ADR, or triage work, read the matching guide under `docs/agents/` before acting.

## Hard constraints

- **Blog consent:** Create a new post only after chenmi explicitly requests it. Otherwise, limit blog work to editing or repairing existing posts; do not draft or propose new post content.
- **Shell:** Use `gsed` for sed-like operations and `rg` for searches. Use the repository's existing formatter and code-mod tools.
- **Server:** In agent mode, use finite verification commands. Prefer `npm run build` or `npm run build:check`; use `npm run preview` only when explicitly requested.
- **Dependencies:** Check versions with `npm outdated` or `npm view <package> version`. Prefer the latest compatible stable release, never downgrade to conceal a failure, and do not update unrelated packages.

## Change and verification loop

1. Make the smallest change that satisfies the request and match surrounding conventions.
2. When behavior changes, add or update behavior-focused tests in the root `__tests__/` directory.
3. Verify by risk: focused tests for local logic; `npm run test:run` for testable behavior; `npm run build:check` for Astro, TypeScript, template, or dependency changes; `npm run check` for Biome-covered source changes.
4. If a check is unavailable or fails, investigate when in scope and report the exact limitation or failure.
5. Review the final diff for scope, stale comments, and accidental content changes; finish only after `git diff --check` passes.

## Test-specific rules

- Tests belong in `__tests__/`, not beside source files.
- React component tests start with `// @vitest-environment jsdom`.
- Use `npm run test:run` for finite runs; reserve `npm run test` for interactive development.

## Conditional project rules

- **New or edited blog content:** Read the existing post and its schema/frontmatter before changing it. Authorized new posts use ISO-8601 `pubDate` values (`YYYY-MM-DDTHH:MM:SS+HH:MM`) and array-form tags such as `tags: ["tag1", "tag2"]`.
- **Broken blog images:** Blog URLs use `/assets/img/YEAR/POST-NAME/IMAGE.jpg`; locate source files with `find`, place them under `public/assets/img/`, and verify the reference with a build.

## Agent skills

- **Issue tracker, issue/spec publishing, or ticket lookup:** Use GitHub Issues via `gh`; read `docs/agents/issue-tracker.md` first.
- **Triage:** Use the five default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); read `docs/agents/triage-labels.md` first.
- **Domain exploration, glossary terms, or architectural decisions:** Use the single-context `CONTEXT.md` / `docs/adr/` layout; read `docs/agents/domain.md` first.
