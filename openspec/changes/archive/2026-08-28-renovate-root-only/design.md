## Context

The previous `fix-renovate-scope` change attempted to keep the template's OpenSpec dependency automated on GitHub by having Renovate update `template/package.json` while the workflow regenerated `template/pnpm-lock.yaml` (because the template `package.json` uses placeholders that break `pnpm install`). This surfaced as an `renovate/artifacts` "Artifact file update failure" and required fragile config (`updateLockFiles: false` + bespoke workflow regeneration). We are abandoning template automation on GitHub and narrowing Renovate to the root only (see proposal.md - Why).

## Goals / Non-Goals

**Goals:**
- Renovate manages the repository root (`package.json` + `pnpm-lock.yaml`) only.
- The OpenSpec-scope workflow keeps regenerating OpenSpec assistant tooling for root OpenSpec updates on `renovate/*` branches.
- The template's `pnpm-lock.yaml` is maintainable locally with a single, simple script.

**Non-Goals:**
- Automating template dependency updates on GitHub (Renovate-via-Docker is a possible future alternative, not designed here).
- Changing how root OpenSpec tooling regeneration works.
- Touching variant overlays.

## Decisions

### Decision 1 — Exclude `template/package.json` from Renovate with `enabled: false`
Add a single package rule `matchFileNames: ["template/package.json"], enabled: false`. This is the most direct way to guarantee Renovate never proposes any update for the template (OpenSpec or otherwise) on GitHub. Alternatives considered: file-level `includePaths`/`excludePaths` on the npm manager (more global and error-prone) and keeping `updateLockFiles: false` (still left Renovate proposing the version bump, requiring workflow regeneration). Disabling the file removes the entire problem class.

### Decision 2 — Remove template handling from the OpenSpec-scope workflow
Drop `template/package.json` and `template/pnpm-lock.yaml` from the workflow `paths` trigger, remove the `template_changed` detection output, and delete the "Regenerate template lockfile" step. The workflow's remaining job is exactly what it was originally built for: when a root OpenSpec-relevant change lands on a `renovate/*` branch, regenerate `.opencode/commands` and `.opencode/skills`, commit them as `github-actions[bot]`, and run strict validation. This keeps the CI simple and removes the placeholder-substitution logic from CI.

### Decision 3 — Local template lockfile script
Provide a Node script (e.g. `scripts/update-template-lockfile.mjs`) that:
1. Reads `pnpm` and `node` versions from the root `package.json`.
2. Substitutes `__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__` in `template/package.json` with concrete values (`template`/`template` for slug/description).
3. Runs `pnpm install --ignore-scripts` inside `template/` to regenerate `template/pnpm-lock.yaml`.
4. Restores the placeholder `template/package.json`.
It is exposed via a `template:update-lock` pnpm script. The maintainer runs it after editing `template/package.json` and commits the resulting lockfile. This keeps the template installable/rendered correctly without involving CI or Renovate.

### Decision 4 — Keep `gitIgnoredAuthors` and the pnpm major block
`gitIgnoredAuthors` is retained so Renovate still owns its `renovate/*` PRs after the workflow commits tooling to them (unchanged from current behavior, now only for root). The pnpm major-version block on the root `packageManager` pin is retained.

### Decision 5 — Omit Renovate `postUpgradeTasks` for OpenSpec updates
The hosted Mend Renovate app restricts `allowedPostUpgradeCommands` to a small git-only allowlist, so any `pnpm exec openspec ...` post-upgrade command is rejected ("Post-upgrade task did not match any on allowedCommands list"). Rather than widen the allowlist (which would make Renovate execute pnpm and duplicate the workflow's job), we omit `postUpgradeTasks` entirely. The OpenSpec-scope workflow already regenerates and commits the tooling on `renovate/*` branches, so the checked-in tooling stays in sync without Renovate running commands. This also keeps `renovate.json` portable across hosted and self-hosted Renovate.

## Risks / Trade-offs

- **Template dependency drift** → Mitigated by documenting the script in `docs/renovate.md` and keeping it trivial to run (`pnpm template:update-lock`). Affects generated-project freshness only, not starter CI.
- **Maintainer forgets to run the script** → The rendered/consumed template may ship a stale `template/pnpm-lock.yaml`. No CI enforcement is planned; the trade-off is accepted for simplicity (could be added later as a local pre-push hook or a render-time check).

## Migration Plan

1. Update `renovate.json` (disable `template/package.json`; remove template-specific rules).
2. Simplify `.github/workflows/openspec-scope.yml`.
3. Add `scripts/update-template-lockfile.mjs` and the `template:update-lock` pnpm script.
4. Update `docs/renovate.md`.
5. Run `renovate-config-validator` and `openspec validate`.
6. Manually run `pnpm template:update-lock` once to confirm `template/pnpm-lock.yaml` regenerates correctly, then commit.

Rollback: revert the `renovate.json` and workflow changes if needed; the template script is additive and harmless.
