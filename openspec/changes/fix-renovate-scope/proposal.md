## Why

Renovate is enabled on this repository (default branch `devel`, `baseBranches: ["devel"]`), but its current configuration has gaps that block the intended zero-touch automation and widen its scope beyond what this repository should own:

1. **The OpenSpec-scope workflow only rejects drift; it never fixes it.** On the Mend Renovate GitHub App, `postUpgradeTasks` are ignored unless allowlisted, so an OpenSpec update PR arrives with the dependency bumped but the checked-in OpenSpec tooling (`.opencode/commands/`, `.opencode/skills/`) stale. The workflow then fails the drift gate and blocks `platformAutomerge`. The workflow should instead regenerate and commit the tooling on Renovate PRs, so the gate passes and automerge can proceed without a human in the loop.
2. **Renovate's scope is too wide.** It currently proposes updates for `github-actions` (the workflow's `uses:`), for `nvm` (`template/.nvmrc`), and for every dependency inside `template/package.json` (eslint, nx, prettier, typescript…). The starter repository should only automate the root `package.json` dependencies and, inside the template, exclusively `@fission-ai/openspec`. The template is starter content that consumers own; its other dependencies must not be bot-managed from this repository.
3. **The Dependency Dashboard issue requires manual interaction** (checkboxes to unlimit rate-limited PRs, to trigger config migration). We want Renovate to run without that manual-response issue, while still auto-receiving config-migration PRs when Renovate deprecates options.
4. **Renovate has deprecated `matchPackageNames` in favour of `matchDepNames`.** The current config still uses the deprecated key, producing a standing "Config Migration Needed" prompt that should be cleared.
5. **Unrelated pull requests run — and fail — the OpenSpec commands, and the template lockfile is never updated.** Any `package.json` change (for example a pnpm version bump) triggers the OpenSpec-scope workflow, which unconditionally regenerates tooling and fails on changes that do not touch OpenSpec. Separately, the file-level template disable rule keeps the npm manager inactive for `template/package.json`, so `template/pnpm-lock.yaml` is never regenerated when OpenSpec changes there.

This change affects the starter repository only. No generated-project files under `template/` are added or modified; the narrower Renovate scope does not add or remove any template file, it only changes which template dependencies the bot may propose from this repository.

## What Changes

- Update `renovate.json`:
  - Set `dependencyDashboard` to `false` so the manual-response issue is not created.
  - Add `enabledManagers: ["npm"]` to disable the `github-actions` and `nvm` managers (which is what stops PRs for workflow actions and `.nvmrc`). The npm manager still covers the root `packageManager` pin (the pnpm version).
  - Scope the template to OpenSpec with **dependency-level** rules instead of a file-level disable: disable only `@eslint/js`, `eslint`, `nx`, `prettier`, and `typescript` in `template/package.json`, and keep `@fission-ai/openspec` enabled. This keeps the npm manager active for the template so its `pnpm-lock.yaml` is regenerated when OpenSpec changes, while every other template dependency stays consumer-owned.
  - Set `updateLockFiles: false` on the template OpenSpec rule so Renovate does **not** attempt to regenerate `template/pnpm-lock.yaml` itself (the placeholder `packageManager` makes `pnpm` fail with an "Artifact file update failure" error); the OpenSpec-scope workflow owns that regeneration instead.
  - Add a rule that blocks **major** pnpm updates (`matchDepNames: ["pnpm"]`, `matchUpdateTypes: ["major"]`, `enabled: false`); minor/patch pnpm bumps are still proposed as manual PRs.
  - Migrate `matchPackageNames` → `matchDepNames` across the OpenSpec rules (current Renovate key).
  - Add `gitIgnoredAuthors: ["github-actions[bot]@users.noreply.github.com"]` so Renovate still recognizes its own pull requests after the OpenSpec-scope workflow commits regenerated tooling to them, preventing the "Edited/Blocked" rebase block.
  - Keep the `postUpgradeTasks` block for self-hosted runners (where `allowedPostUpgradeCommands` makes them run), and keep the patch/minor automerge and major-manual split.
- Update `.github/workflows/openspec-scope.yml`:
  - Grant `contents: write` and check out the PR head ref so the workflow can push.
  - After regenerating tooling, commit the regenerated files back to the Renovate branch (`renovate/*` only) so the drift gate passes and automerge can proceed. Human PRs keep the fail-on-drift behaviour.
  - Add a concurrency group keyed on the head ref.
    - Make OpenSpec regeneration, the Renovate-branch commit, and the drift checks conditional on a detected OpenSpec-relevant change (the `@fission-ai/openspec` version changed, `openspec/config.yaml` changed, or `.opencode/` tooling changed); strict validation still runs on every pull request. This prevents unrelated PRs (such as pnpm version bumps) from running — and failing — the OpenSpec commands.
    - Add `template/package.json` and `template/pnpm-lock.yaml` to the workflow `paths` trigger so template OpenSpec PRs actually run the workflow.
    - Regenerate `template/pnpm-lock.yaml` when the template's `@fission-ai/openspec` changes: the template `package.json` uses placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) that make it non-installable, so Renovate cannot refresh the lockfile itself. The workflow substitutes the placeholders with concrete values derived from the root `package.json`, runs `pnpm install --ignore-scripts` in `template/`, restores the placeholder `package.json`, and commits the regenerated lockfile on `renovate/*` branches alongside the OpenSpec tooling.
- Update `docs/renovate.md` to explain the new behaviour: the workflow commits tooling on Renovate PRs, the template/manager scope restrictions, the disabled dashboard, and how config migration still auto-opens as a PR.
- Update `openspec/specs/dependency-automation/spec.md` to reflect the committed-tooling behaviour, the template/manager scope, the `matchDepNames` migration, the pnpm-major block, template lockfile maintenance, and conditional workflow regeneration.
- Bump the starter version from `0.2.0` to `0.3.0` in `starter.yaml` and `package.json`, and add a `0.3.0` entry to `CHANGELOG.md`.

## Capabilities

### Modified Capabilities

- `dependency-automation`: the starter now restricts Renovate to the root `package.json` and to `@fission-ai/openspec` inside `template/package.json`, disables the `github-actions` and `nvm` managers, runs without the Dependency Dashboard issue, blocks major pnpm updates while still proposing minor/patch pnpm bumps as manual PRs, regenerates `template/pnpm-lock.yaml` when OpenSpec changes in the template, and lets the OpenSpec-scope workflow commit regenerated tooling on Renovate PRs — but only runs OpenSpec regeneration when the change is actually OpenSpec-relevant, so patch/minor OpenSpec updates automerge end-to-end.

## Impact

- Affected starter-repository files: `renovate.json`, `.github/workflows/openspec-scope.yml`, `docs/renovate.md`, `openspec/specs/dependency-automation/spec.md`, `starter.yaml` (`0.3.0`), `package.json` (`0.3.0`), `CHANGELOG.md`.
- Affected specs: modified `dependency-automation` spec.
- Affected tooling/dependencies: no new package dependencies.
- Affected generated-template files under `template/`: none. Renovate's narrowed scope does not add or remove any template file; it only changes which template dependencies the bot may propose from this repository.
- Affected behaviour: Renovate will stop opening PRs for workflow actions and `.nvmrc`, and will stop opening PRs for non-OpenSpec dependencies inside `template/package.json`. Major pnpm updates are no longer proposed (minor/patch pnpm bumps remain as manual PRs). The OpenSpec-scope workflow now commits regenerated tooling on Renovate PRs and skips OpenSpec regeneration entirely for PRs that do not change OpenSpec, so unrelated PRs (such as pnpm version bumps) stay green.

## Out of Scope

- Updating `@fission-ai/openspec` itself; the first update under the new config is left to Renovate.
- Synchronizing `template/openspec/config.yaml` with OpenSpec guidance; that remains a separate maintainer change.
- Auto-committing regenerated tooling for human PRs; they still fail the drift gate and must be fixed by the author.
- Changing the automerge policy (patch/minor OpenSpec automerge, major OpenSpec manual, no other package automerges).
- Adjusting `prHourlyLimit`/scheduling; left at Renovate defaults to observe behaviour after rollout.

## Risks

- If a Renovate OpenSpec update also changes tracked files outside the generated-tooling paths, the "Reject non-generated drift" step still fails; this remains the intended contract-change signal and is addressed as a follow-up starter change.
- Granting `contents: write` to a PR-triggered workflow widens token scope; it is safe here because the only write is a scoped, idempotent commit of generated tooling on `renovate/*` branches by the `github-actions[bot]` identity.
- Disabling `github-actions`/`nvm` means Renovate will no longer propose updates to workflow actions or `.nvmrc` from this repository; that is the intended scope reduction. If a workflow action update is later desired, it must be done manually or via an explicit rule.
- The `npm` manager stays enabled so the root `packageManager` pin (pnpm version) is still proposed; only `github-actions` and `nvm` are disabled.
