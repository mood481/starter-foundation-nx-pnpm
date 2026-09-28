# Renovate for the Starter Repository

This starter repository automates root starter-maintenance dependency updates
with [Renovate](https://docs.renovatebot.com/).
Renovate runs as an external service; it is not an npm dependency.

## What the Configuration Does

`renovate.json` at the repository root:

- Extends `config:recommended` and **disables** the Dependency Dashboard (`dependencyDashboard: false`); Renovate still auto-opens configuration-migration pull requests when it detects deprecated options (`configMigration` defaults to `true`).
- Targets the `devel` branch.
- Restricts the active managers to `npm` (`enabledManagers`), so the `github-actions` manager (workflow `uses:`) and the `nvm` manager (`.nvmrc` files) never run. The `npm` manager also covers the root `packageManager` pin (the pnpm version): minor and patch pnpm bumps are still proposed as manual pull requests, but **major** pnpm updates are blocked by a package rule.
- Manages only the root `package.json` dependencies. The template `template/package.json` is excluded from Renovate entirely by a file-level package rule (`matchFileNames: ["template/package.json"], enabled: false`), so Renovate never proposes template updates on GitHub. The template no longer ships a lockfile, so there is no template-lockfile maintenance step; a generated project's `pnpm-lock.yaml` is produced by its own `pnpm install` during validation.

All updates arrive as regular pull requests for human review; no automerge rules are configured.

## Activating Renovate on GitHub

1. Install the [Mend Renovate GitHub App](https://github.com/apps/renovate) and grant it access to this repository. This is the simplest hosted option.
   - Alternative: run Renovate as a [GitHub Action](https://github.com/renovatebot/github-action) on a schedule, or use a self-hosted Renovate runner.
2. Renovate opens an onboarding pull request and the dependency dashboard issue. Review and merge the onboarding PR to enable updates.
3. Enable the repository settings required for automerge (if you add automerge rules later):
   - Settings → General → enable **Allow auto-merge**.
   - Branch protection on `devel` (or a ruleset) requiring the relevant checks as passing before merge.
   - Grant the Renovate bot permission to approve or bypass as needed for auto-merge.

## Activating Renovate on Other Git Servers

On GitLab (self-hosted or hosted), Bitbucket, Azure DevOps, Gitea/Forgejo, or other platforms, run Renovate self-hosted:

- Run the Renovate CLI or Docker image on a schedule (for example a scheduled CI pipeline) with a platform token for the Git server.
- Point Renovate at the repository explicitly (`repositories` / `repositoryList`) or use autodiscover mode.
- For post-upgrade tasks to run, allow the needed commands in the runner config with `allowedPostUpgradeCommands`.
- Platform automerge behavior depends on the server; for platforms without native automerge, use `automergeType: "pr"` plus a bot account with merge rights.

## Scope Restrictions and Managers

Renovate's default behaviour is to manage every dependency it detects across all its managers. This repository narrows that surface deliberately.

**Managers (`enabledManagers`).** A *manager* is the Renovate component that knows how to read a given kind of dependency declaration. This repository sets `enabledManagers: ["npm"]`, which means only the npm manager runs:

- `npm` reads dependencies from `package.json` files (root and `template/package.json`), including the `packageManager` field pin (the pnpm version). It does not matter that the project installs with pnpm — dependency extraction from a `package.json` is always the npm manager's job.
- `github-actions` (which scans workflow `uses:` such as `actions/checkout`) and `nvm` (which scans `.nvmrc` files such as `template/.nvmrc`) are **disabled**, so Renovate never opens PRs for workflow actions or Node version pins.

**Template scope (`packageRules`).** Inside `template/package.json` the starter declares only neutral workspace dependencies. None of these are managed by Renovate: a single file-level package rule disables `template/package.json` entirely (`matchFileNames: ["template/package.json"], enabled: false`). The template is intentionally consumer-owned and is kept in sync locally by the maintainer, not by Renovate.

The root `package.json` is untouched by that rule, so all of its dependencies remain eligible for updates as manual pull requests.

**No template lockfile is shipped.** The neutral `template/` intentionally has no committed `pnpm-lock.yaml`, because a generated project's dependency set can change at render time (variant overlay, and future extension package additions). The generated project's lockfile is produced by a real `pnpm install` during template validation, so there is no local template-lockfile regeneration step and nothing for Renovate (or a maintainer) to keep in sync for the template.

## Dependency Dashboard Is Disabled

`dependencyDashboard` is set to `false`, so Renovate does not create the issue whose checkboxes require manual responses (unlimiting rate-limited PRs, triggering config migration). This does not stop Renovate from proposing updates. It also does not stop configuration migrations: `configMigration` defaults to `true`, so when Renovate detects a deprecated option (for example the old `matchPackageNames` key) it still opens a dedicated migration pull request automatically. If the default hourly PR limit ever queues an update behind others, raise `prHourlyLimit` rather than re-enabling the dashboard.

## Template Config Is Not Synchronized

Root dependency updates affect starter-maintenance tooling only. They do
not add SDD tooling to the neutral `template/`. Optional generated SDD integrations
are supplied by their selected variant overlay or extension and must be reviewed
through their own changes rather than by modifying the neutral template.

## Validating the Renovate Configuration

Check the configuration manually with:

```bash
npx --yes -p renovate renovate-config-validator renovate.json
```
