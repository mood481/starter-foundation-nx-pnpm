## Context

The `add-renovate-automerge` change established Renovate automation for the starter repository: a root `renovate.json` targeting `devel`, patch/minor `@fission-ai/openspec` updates automerging while major updates stay manual, `postUpgradeTasks` to regenerate OpenSpec assistant tooling, and a `.github/workflows/openspec-scope.yml` gate that rejects generated-tooling drift. It deliberately did **not** auto-commit: the design assumed Renovate's `postUpgradeTasks` would regenerate the tooling inside the PR.

In practice the Mend Renovate GitHub App ignores `postUpgradeTasks` unless the commands are allowlisted by the app administrator, which is not available for regular hosted-app repositories. As a result an OpenSpec update PR arrives with the dependency bumped but the checked-in tooling stale, the workflow fails the drift gate, and `platformAutomerge` stalls. The documentation already described this as a manual-fallback case, but the intent of the automation is that patch/minor OpenSpec updates land with no human in the loop.

Separately, once Renovate began running it surfaced a broader dependency surface than intended: the `github-actions` manager (scanning workflow `uses:`), the `nvm` manager (scanning `template/.nvmrc`), and every dependency in `template/package.json` (eslint, nx, prettier, typescript). The starter repository should only own automation for its own root `package.json` and for `@fission-ai/openspec` inside the template; the rest of `template/package.json` is consumer-owned starter content.

The Dependency Dashboard issue also adds a manual-response burden (rate-limit unlimit checkboxes, config-migration trigger). Renovate's `configMigration` (default `true`) still auto-opens a migration PR independently of the dashboard, so disabling the dashboard does not lose migrations.

Renovate has also deprecated `matchPackageNames` in favour of `matchDepNames`; leaving the old key produces a standing "Config Migration Needed" prompt.

## Goals / Non-Goals

**Goals:**

- The OpenSpec-scope workflow regenerates and commits the assistant tooling on Renovate PRs, so the drift gate passes and automerge proceeds without manual intervention.
- Human PRs keep the fail-on-drift gate (no auto-commit), preserving explicit provenance.
- Renovate manages only the root `package.json` dependencies and only `@fission-ai/openspec` inside `template/package.json`.
- The `github-actions` and `nvm` managers are disabled so no PRs are opened for workflow actions or `.nvmrc`.
- Renovate runs without the Dependency Dashboard issue, but still auto-receives config-migration PRs.
- The config uses the current `matchDepNames` key.

**Non-Goals:**

- No automerge for any package other than `@fission-ai/openspec`, and no automerge for major OpenSpec updates.
- No auto-commit of tooling for human PRs.
- No dependency updates performed by this change.
- No `template/openspec/config.yaml` synchronization.
- No `prHourlyLimit`/schedule tuning (kept at defaults to observe after rollout).
- No new npm dependencies.

## Decisions

### Decision 1: The workflow commits regenerated tooling on Renovate branches only

The workflow already installs, configures the OpenSpec profile, and runs `pnpm ospec:update`. We add a step (guarded by `startsWith(github.head_ref, 'renovate/')`) that stages the generated-tooling paths and, if there is drift, commits and pushes them to the PR head ref. This makes the subsequent drift-gate steps pass and lets `platformAutomerge` proceed on the Mend app without allowlisted `postUpgradeTasks`. Human PRs skip the commit step and still fail the drift gate, so author-fixed provenance is preserved.

The step is idempotent: after the push, the next workflow run finds no drift and makes no commit, so no loop occurs. `concurrency` keyed on `github.head_ref` prevents overlapping runs on the same branch.

### Decision 2: `postUpgradeTasks` stays for self-hosted runners

The `renovate.json` `postUpgradeTasks` block is retained so that self-hosted Renovate runners (with `allowedPostUpgradeCommands`) still regenerate tooling without needing this workflow. On the Mend app it is ignored, and the workflow covers that case. This satisfies the requirement that the tooling regeneration is covered both ways.

### Decision 3: Scope Renovate with `enabledManagers` plus template package rules

- `enabledManagers: ["npm"]` disables the `github-actions` and `nvm` managers globally. The `npm` manager covers the root `packageManager` pin (the pnpm version, declared in `package.json`), so it is still proposed as a manual PR.
- A package rule with `matchManagers: ["npm"]` + `matchFileNames: ["template/package.json"]` + `enabled: false` disables every npm-manager dependency inside the template's `package.json` (eslint, nx, prettier, typescript, and openspec itself).
- A later, more specific rule re-enables only `@fission-ai/openspec` in `template/package.json` (`enabled: true`). Renovate applies package rules in order, so the specific re-enable wins for that dependency.

Note on managers: dependency declarations inside any `package.json` (including one installed with pnpm) are extracted by Renovate's **npm** manager, not by a separate pnpm manager. The `packageManager` field (the pnpm version pin) is also handled by the npm manager. So disabling the template's in-file dependencies correctly uses `matchManagers: ["npm"]`, and `enabledManagers: ["npm"]` is sufficient to keep the pnpm version pin managed while dropping `github-actions` and `nvm`.

### Decision 4: Dependency Dashboard disabled; config migration via auto-PR

`dependencyDashboard: false` removes the issue that requires manual checkbox responses. `configMigration` keeps its default (`true`), so when Renovate detects deprecated options it still opens a migration PR automatically — no dashboard needed. We adopt `matchDepNames` in this change so the current standing migration prompt clears.

### Decision 5: Version bumps to `0.3.0`

This refines the Renovate automation behaviour (scope + workflow auto-fix), so it is a minor version bump following the repository's per-change version convention.

## Repository Structure

Modified starter-repository files:

```txt
.
├── .github/
│   └── workflows/
│       └── openspec-scope.yml   # modified: commits regenerated tooling on renovate/* PRs
├── docs/
│   └── renovate.md              # modified: scope + dashboard-off + workflow auto-commit
├── renovate.json                # modified: dashboard off, enabledManagers, template scope, matchDepNames
├── openspec/
│   ├── specs/
│   │   └── dependency-automation/spec.md   # modified
│   └── changes/
│       └── fix-renovate-scope/              # new change
├── package.json                 # modified: version 0.3.0
├── starter.yaml                 # modified: version 0.3.0
└── CHANGELOG.md                 # modified: 0.3.0 entry
```

No files under `template/` or `variants/` are added or modified.

## Constraints

- Agents MUST NOT update `@fission-ai/openspec` as part of this change; the lockfile stays on the current version.
- Agents MUST NOT add Renovate configuration to `template/` or any variant overlay.
- Agents MUST NOT add Renovate as an npm dependency.
- Agents MUST NOT enable automerge for `major` updates or for any package other than `@fission-ai/openspec`.
- Agents MUST NOT auto-commit regenerated tooling for human PRs; the commit step is guarded to `renovate/*` branches only.
- Agents MUST keep the `ospec:` script prefix convention.
- Agents MUST NOT regenerate checked-in OpenSpec tooling as part of this change.
- Agents MUST NOT weaken existing validation (`pnpm validate`, rendered-template validation).
- Terminology MUST remain `variant`/`overlay`; this change introduces neither.

## Alternatives Considered

- **Keep workflow fail-only and document manual fallback only**: rejected; the automation's purpose is zero-touch patch/minor OpenSpec updates, and Mend ignores `postUpgradeTasks`, so the manual fallback would be the permanent path.
- **Disable only via `ignorePaths`/`ignoreDeps`**: rejected; `enabledManagers` plus template `packageRules` is more explicit and also drops the `github-actions`/`nvm` managers that `ignorePaths` would not fully cover (e.g. `.nvmrc`).
- **Keep `matchPackageNames`**: rejected; it is deprecated and produces a standing migration prompt; `matchDepNames` is the current key.
- **Keep the Dependency Dashboard for rate-limit unlimit**: rejected; the manual-response issue is undesirable and `prHourlyLimit`/behaviour can be observed and tuned later without it.
- **Bump `prHourlyLimit` now**: deferred; the user wants to observe behaviour after rollout before tuning.

## Risks / Trade-offs

- The `github-actions`/`nvm` managers are now off, so workflow-action and `.nvmrc` updates are no longer proposed by Renovate from this repository; acceptable as intended scope reduction.
- A malicious or broken OpenSpec release could be automerged on patch/minor; mitigated by the workflow's strict validation and drift gate running before automerge.
- The `contents: write` permission on a PR workflow is broader than before; it is safe because the only write is the scoped idempotent tooling commit on `renovate/*` branches.
- If OpenSpec's tooling regeneration ever touches files outside the generated-tooling paths, the non-generated-drift gate still fails and signals a contract change (addressed as a follow-up change).

## Migration Plan

1. Merge this change into `devel`.
2. Observe Renovate's next run: confirm no new PRs for workflow actions or `template/.nvmrc`, and that an OpenSpec update PR (when Renovate proposes one) gets its tooling regenerated by the workflow and automerges.
3. If rate-limiting still queues OpenSpec behind other PRs, revisit `prHourlyLimit` (not changed now).
4. If a config-migration PR appears, review and merge it (independent of the dashboard).

Rollback: revert this change commit; the previous `renovate.json`/workflow behaviour is restored.

## Validation Strategy

Agent-verifiable, local validation:

- `pnpm ospec:validate` passes for the change artifacts and all specs.
- `pnpm validate` passes unchanged (no template files touched).
- `renovate.json` parses as JSON, declares its `$schema`, has `dependencyDashboard: false`, `enabledManagers: ["npm","pnpm"]`, the template disable/re-enable rules, and uses `matchDepNames`.
- `npx --yes -p renovate renovate-config-validator renovate.json` passes.
- The workflow YAML parses, references existing `pnpm` scripts, sets `permissions: contents: write`, checks out `github.head_ref`, and gates the commit step on `renovate/` head refs.
- `git status` shows no changes under `.opencode/` introduced by this change.
- `starter.yaml` and `package.json` both declare `0.3.0`, and `CHANGELOG.md` has a `0.3.0` entry.

Out of agent reach: live Renovate/CI behaviour is validated by observing the next Renovate run after rollout.
