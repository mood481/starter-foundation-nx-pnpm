## Execution Plan

### Renovate configuration (`renovate.json`)

- [x] Set `dependencyDashboard` to `false` so the manual-response issue is not created.
- [x] Add `enabledManagers: ["npm"]` to disable the `github-actions` and `nvm` managers while keeping the root `packageManager` pin (the pnpm version, handled by the npm manager) managed.
- [x] Add a package rule that disables all npm-manager dependencies in `template/package.json` (`matchManagers: ["npm"]`, `matchFileNames: ["template/package.json"]`, `enabled: false`).
- [x] Add a package rule that re-enables only `@fission-ai/openspec` in `template/package.json` (`matchFileNames: ["template/package.json"]`, `matchDepNames: ["@fission-ai/openspec"]`, `enabled: true`).
- [x] Migrate the OpenSpec automerge rules from `matchPackageNames` to `matchDepNames` (`patch`/`minor` automerge + `major` manual).
- [x] Add `gitIgnoredAuthors: ["github-actions[bot]@users.noreply.github.com"]` so Renovate still recognizes its own PRs after the workflow commits regenerated tooling, preventing the "Edited/Blocked" rebase block.
- [x] Keep the `postUpgradeTasks` block unchanged for self-hosted runners.
- [x] Confirm no package other than `@fission-ai/openspec` is configured to automerge, and major OpenSpec updates remain manual.

### GitHub Actions workflow (`.github/workflows/openspec-scope.yml`)

- [x] Change `permissions` to `contents: write`.
- [x] Add a `concurrency` group keyed on `github.head_ref`.
- [x] Check out the PR head ref with `ref: ${{ github.head_ref }}` and `token: ${{ secrets.GITHUB_TOKEN }}`.
- [x] Add a step that, only when `github.head_ref` starts with `renovate/`, stages `.opencode/commands`, `.opencode/skills`, and commits + pushes if there is drift (idempotent, `github-actions[bot]` identity).
- [x] Keep the generated-tooling and non-generated drift-rejection steps and the strict `pnpm ospec:validate` step.
- [x] Confirm the workflow never commits for non-`renovate/` PRs (the commit step is guarded by `startsWith(github.head_ref, 'renovate/')`).

### pnpm, template lockfile, and conditional regeneration

- [x] Add a package rule that blocks major pnpm updates (`matchDepNames: ["pnpm"]`, `matchUpdateTypes: ["major"]`, `enabled: false`); minor/patch pnpm bumps remain manual PRs.
- [x] Replace the file-level `template/package.json` disable rule with a dependency-level rule that disables only `@eslint/js`, `eslint`, `nx`, `prettier`, `typescript`, keeping `@fission-ai/openspec` enabled so the npm manager stays active and `template/pnpm-lock.yaml` regenerates on OpenSpec changes.
- [x] Add a "Detect OpenSpec-relevant change" step to `openspec-scope.yml` that sets `changed` when the OpenSpec version changed, `openspec/config.yaml` changed, `.opencode/` tooling changed, or the head ref starts with `renovate/`.
- [x] Gate the Configure-profile, Regenerate, Commit, and both drift-rejection steps on `steps.detect.outputs.changed == 'true'`; keep `pnpm ospec:validate` running on every pull request.
- [x] Confirm unrelated PRs (for example pnpm version bumps) no longer run OpenSpec regeneration and stay green.

### Documentation (`docs/renovate.md`)

- [x] Update the workflow description: it now commits regenerated tooling on Renovate PRs; human PRs still fail on drift.
- [x] Document the template/manager scope restriction and the role of `enabledManagers` (`npm`) vs `matchManagers` in package rules.
- [x] Document that the Dependency Dashboard is intentionally disabled and that `configMigration` still auto-opens migration PRs.
- [x] Keep the post-upgrade tasks caveat and the manual `renovate-config-validator` check.

### Spec (`openspec/specs/dependency-automation/spec.md`)

The spec changes are delivered as a delta in `specs/dependency-automation/spec.md` and are applied when this change is archived; no manual edit of the main spec is performed as part of implementation. (Covered by the change delta: disabled dashboard, `matchDepNames`, new Manager Restriction and Template Dependency Scope requirements, and the workflow-commits-on-Renovate-branches gate.)

### Version bump and changelog

- [x] Bump `version` to `0.3.0` in `starter.yaml`.
- [x] Bump `version` to `0.3.0` in `package.json`.
- [x] Add a `## 0.3.0` section to `CHANGELOG.md` with a `### fix-renovate-scope` entry describing the change.

## Validation

### OpenSpec validation

- [x] Run `pnpm ospec:validate`.
- [x] Run `pnpm validate:spec`.

### Configuration validation

- [x] Run `npx --yes -p renovate renovate-config-validator renovate.json` and confirm it passes.
- [x] Confirm `renovate.json` has `dependencyDashboard: false`, `enabledManagers: ["npm"]`, the template disable/re-enable rules, and uses `matchDepNames`.
- [x] Confirm the workflow YAML parses, references existing `pnpm` scripts, sets `contents: write`, checks out `github.head_ref`, and gates the commit on `renovate/` head refs.
- [x] Confirm `renovate.json` blocks major pnpm updates and scopes the template with dependency-level rules (not a file-level disable), so `template/pnpm-lock.yaml` regenerates with OpenSpec changes.

### Repository validation

- [x] Run `pnpm validate` and confirm it passes unchanged (requires Node >= 22.22.2; the template-render step passes under that runtime).
- [x] Confirm `starter.yaml` and `package.json` both declare `0.3.0` and `CHANGELOG.md` contains the `0.3.0` entry.

### Constraint validation

- [x] Confirm `@fission-ai/openspec` was not updated and the lockfile still pins the current version.
- [x] Confirm no files under `template/` or `variants/` were added or modified.
- [x] Confirm Renovate was not added as an npm dependency.
- [x] Confirm the workflow only commits on `renovate/*` branches.
- [x] Confirm no files under `.opencode/` were modified by this change.
- [x] Confirm terminology consistency: `variant`/`overlay` used, no `flavour` metadata introduced.
