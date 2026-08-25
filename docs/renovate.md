# Renovate for the Starter Repository

This starter repository automates dependency updates for `@fission-ai/openspec` with [Renovate](https://docs.renovatebot.com/). Renovate runs as an external service; it is not an npm dependency.

## What the Configuration Does

`renovate.json` at the repository root:

- Extends `config:recommended` and **disables** the Dependency Dashboard (`dependencyDashboard: false`); Renovate still auto-opens configuration-migration pull requests when it detects deprecated options (`configMigration` defaults to `true`).
- Targets the `devel` branch.
- Restricts the active managers to `npm` (`enabledManagers`), so the `github-actions` manager (workflow `uses:`) and the `nvm` manager (`.nvmrc` files) never run. The `npm` manager also covers the root `packageManager` pin (the pnpm version), so that pin is still proposed as a manual update.
- Manages only the root `package.json` dependencies, and inside `template/package.json` manages only `@fission-ai/openspec`. Every other dependency in `template/package.json` (eslint, nx, prettier, typescript…) is disabled from updates by a package rule, because the template is consumer-owned starter content.
- Automerges `patch` and `minor` updates of `@fission-ai/openspec` through pull-request automerge with platform automerge.
- Never automerges `major` updates of `@fission-ai/openspec`; they are proposed as regular pull requests for human review.
- Regenerates the checked-in OpenSpec tooling (`.opencode/commands/**`, `.opencode/skills/**`) after an OpenSpec update through post-upgrade tasks.

The `.github/workflows/openspec-scope.yml` workflow runs on OpenSpec-scope pull requests to `devel`: it installs with a frozen lockfile, configures the OpenSpec profile, regenerates tooling, and fails if the result differs from the checked-in state. It also runs strict OpenSpec validation. **On Renovate branches (`renovate/*`) the workflow commits the regenerated tooling back to the pull request**, so the drift gate passes and `platformAutomerge` can proceed even when the hosted Renovate app ignores `postUpgradeTasks`. On non-Renovate branches it never commits and still fails on drift, so the author must fix and push the tooling. Its green status is what informs Renovate that a branch is ready for automerge.

## Activating Renovate on GitHub

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) and grant it access to this repository. This is the simplest hosted option.
   - Alternative: run Renovate as a [GitHub Action](https://github.com/renovatebot/github-action) on a schedule, or use a self-hosted Renovate runner.
2. Renovate opens an onboarding pull request and the dependency dashboard issue. Review and merge the onboarding PR to enable updates.
3. Enable the repository settings required for automerge:
   - Settings → General → enable **Allow auto-merge**.
   - Branch protection on `devel` (or a ruleset) requiring the `OpenSpec scope` check for the paths it covers, and requiring it as passing before merge.
   - Grant the Renovate bot permission to approve or bypass as needed for auto-merge.

## Activating Renovate on Other Git Servers

On GitLab (self-hosted or hosted), Bitbucket, Azure DevOps, Gitea/Forgejo, or other platforms, run Renovate self-hosted:

- Run the Renovate CLI or Docker image on a schedule (for example a scheduled CI pipeline) with a platform token for the Git server.
- Point Renovate at the repository explicitly (`repositories` / `repositoryList`) or use autodiscover mode.
- For post-upgrade tasks to run, allow the needed commands in the runner config with `allowedPostUpgradeCommands`.
- Platform automerge behavior depends on the server; for platforms without native automerge, use `automergeType: "pr"` plus a bot account with merge rights.

## Post-Upgrade Tasks Caveat

The hosted Mend Renovate GitHub App ignores `postUpgradeTasks` unless the commands are explicitly allowlisted in the app/administration configuration, which is not available for regular hosted-app repositories. The OpenSpec-scope workflow covers this case: on `renovate/*` branches it regenerates and commits the tooling itself, so the drift gate passes and automerge proceeds without a human in the loop.

When post-upgrade tasks cannot run and the workflow is not the mechanism (for example on a self-hosted runner without the commit step), the OpenSpec-scope workflow fails with generated tooling drift. The manual fallback is to reproduce the post-upgrade steps locally and push them to the Renovate branch:

```bash
pnpm exec openspec config set profile custom
pnpm exec openspec config set delivery both
pnpm exec openspec config set workflows '["propose","explore","new","continue","apply","update","ff","sync","verify","onboard"]'
pnpm ospec:update
```

These `config set` commands target the OpenSpec version installed by the update; the fallback must run with the updated dependency. Self-hosted runners with `allowedPostUpgradeCommands` avoid this manual step. `renovate.json` keeps the `postUpgradeTasks` block so such runners regenerate tooling without relying on the CI workflow.

## Scope Restrictions and Managers

Renovate's default behaviour is to manage every dependency it detects across all its managers. This repository narrows that surface deliberately.

**Managers (`enabledManagers`).** A *manager* is the Renovate component that knows how to read a given kind of dependency declaration. This repository sets `enabledManagers: ["npm"]`, which means only the npm manager runs:

- `npm` reads dependencies from `package.json` files (root and `template/package.json`), including the `packageManager` field pin (the pnpm version). It does not matter that the project installs with pnpm — dependency extraction from a `package.json` is always the npm manager's job.
- `github-actions` (which scans workflow `uses:` such as `actions/checkout`) and `nvm` (which scans `.nvmrc` files such as `template/.nvmrc`) are **disabled**, so Renovate never opens PRs for workflow actions or Node version pins.

**Template scope (`packageRules`).** Inside `template/package.json` the starter declares eslint, nx, prettier, typescript, and OpenSpec. Only OpenSpec should be bot-managed from this repository, because the rest of the template is consumer-owned. This is enforced with two ordered package rules:

1. Disable every npm-manager dependency in `template/package.json` (`matchManagers: ["npm"]`, `matchFileNames: ["template/package.json"]`, `enabled: false`).
2. Re-enable only `@fission-ai/openspec` in that same file (`matchFileNames: ["template/package.json"]`, `matchDepNames: ["@fission-ai/openspec"]`, `enabled: true`). Because package rules apply in order, the more specific re-enable wins for OpenSpec while everything else stays disabled.

The root `package.json` is untouched by these rules, so all of its dependencies remain eligible for updates (manual pull requests by default; only OpenSpec automerges).

## Dependency Dashboard Is Disabled

`dependencyDashboard` is set to `false`, so Renovate does not create the issue whose checkboxes require manual responses (unlimiting rate-limited PRs, triggering config migration). This does not stop Renovate from proposing updates. It also does not stop configuration migrations: `configMigration` defaults to `true`, so when Renovate detects a deprecated option (for example the old `matchPackageNames` key) it still opens a dedicated migration pull request automatically. If the default hourly PR limit ever queues an OpenSpec update behind others, raise `prHourlyLimit` rather than re-enabling the dashboard.

## Workflow Failure on Renovate Branches

A Renovate branch carries the latest OpenSpec version, so the OpenSpec-scope workflow is expected to pass there. If it fails, OpenSpec changed its tooling contract: address it with a follow-up starter change, never by weakening the workflow.

## Template Config Is Not Synchronized

OpenSpec dependency updates do **not** modify `template/openspec/config.yaml`. That file is user-owned starter content, and `openspec update` only regenerates assistant tooling files.

On every OpenSpec update, review the OpenSpec release notes and consider whether the generated-template config (and its MWS variant overlay counterpart) needs new or refined rules. Template config improvements are handled as a separate OpenSpec change in this repository; the generated projects' own configs are always consumer-owned.

## Validating the Renovate Configuration

Check the configuration manually with:

```bash
npx --yes -p renovate renovate-config-validator renovate.json
```
