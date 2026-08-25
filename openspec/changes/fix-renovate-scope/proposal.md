## Why

Renovate is enabled on this repository (default branch `devel`, `baseBranches: ["devel"]`), but its current configuration has gaps that block the intended zero-touch automation and widen its scope beyond what this repository should own:

1. **The OpenSpec-scope workflow only rejects drift; it never fixes it.** On the Mend Renovate GitHub App, `postUpgradeTasks` are ignored unless allowlisted, so an OpenSpec update PR arrives with the dependency bumped but the checked-in OpenSpec tooling (`.opencode/commands/`, `.opencode/skills/`) stale. The workflow then fails the drift gate and blocks `platformAutomerge`. The workflow should instead regenerate and commit the tooling on Renovate PRs, so the gate passes and automerge can proceed without a human in the loop.
2. **Renovate's scope is too wide.** It currently proposes updates for `github-actions` (the workflow's `uses:`), for `nvm` (`template/.nvmrc`), and for every dependency inside `template/package.json` (eslint, nx, prettier, typescript…). The starter repository should only automate the root `package.json` dependencies and, inside the template, exclusively `@fission-ai/openspec`. The template is starter content that consumers own; its other dependencies must not be bot-managed from this repository.
3. **The Dependency Dashboard issue requires manual interaction** (checkboxes to unlimit rate-limited PRs, to trigger config migration). We want Renovate to run without that manual-response issue, while still auto-receiving config-migration PRs when Renovate deprecates options.
4. **Renovate has deprecated `matchPackageNames` in favour of `matchDepNames`.** The current config still uses the deprecated key, producing a standing "Config Migration Needed" prompt that should be cleared.

This change affects the starter repository only. No generated-project files under `template/` are added or modified; the narrower Renovate scope does not add or remove any template file, it only changes which template dependencies the bot may propose from this repository.

## What Changes

- Update `renovate.json`:
  - Set `dependencyDashboard` to `false` so the manual-response issue is not created.
  - Add `enabledManagers: ["npm"]` to disable the `github-actions` and `nvm` managers (which is what stops PRs for workflow actions and `.nvmrc`). The npm manager still covers the root `packageManager` pin (the pnpm version).
  - Add package rules that disable every dependency in `template/package.json` except `@fission-ai/openspec` (disable-all, then re-enable only OpenSpec), so only OpenSpec is bot-managed inside the template.
  - Migrate `matchPackageNames` → `matchDepNames` across the OpenSpec rules (current Renovate key).
  - Keep the `postUpgradeTasks` block for self-hosted runners (where `allowedPostUpgradeCommands` makes them run), and keep the patch/minor automerge and major-manual split.
- Update `.github/workflows/openspec-scope.yml`:
  - Grant `contents: write` and check out the PR head ref so the workflow can push.
  - After regenerating tooling, commit the regenerated files back to the Renovate branch (`renovate/*` only) so the drift gate passes and automerge can proceed. Human PRs keep the fail-on-drift behaviour.
  - Add a concurrency group keyed on the head ref.
- Update `docs/renovate.md` to explain the new behaviour: the workflow commits tooling on Renovate PRs, the template/manager scope restrictions, the disabled dashboard, and how config migration still auto-opens as a PR.
- Update `openspec/specs/dependency-automation/spec.md` to reflect the committed-tooling behaviour, the template/manager scope, and the `matchDepNames` migration.
- Bump the starter version from `0.2.0` to `0.3.0` in `starter.yaml` and `package.json`, and add a `0.3.0` entry to `CHANGELOG.md`.

## Capabilities

### Modified Capabilities

- `dependency-automation`: the starter now restricts Renovate to the root `package.json` and to `@fission-ai/openspec` inside `template/package.json`, disables the `github-actions` and `nvm` managers, runs without the Dependency Dashboard issue, and lets the OpenSpec-scope workflow commit regenerated tooling on Renovate PRs so patch/minor OpenSpec updates automerge end-to-end.

## Impact

- Affected starter-repository files: `renovate.json`, `.github/workflows/openspec-scope.yml`, `docs/renovate.md`, `openspec/specs/dependency-automation/spec.md`, `starter.yaml` (`0.3.0`), `package.json` (`0.3.0`), `CHANGELOG.md`.
- Affected specs: modified `dependency-automation` spec.
- Affected tooling/dependencies: no new package dependencies.
- Affected generated-template files under `template/`: none. Renovate's narrowed scope does not add or remove any template file; it only changes which template dependencies the bot may propose from this repository.
- Affected behaviour: Renovate will stop opening PRs for workflow actions and `.nvmrc`, and will stop opening PRs for non-OpenSpec dependencies inside `template/package.json`. The OpenSpec-scope workflow now commits regenerated tooling on Renovate PRs.

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
