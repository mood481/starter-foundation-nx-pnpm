# Renovate for the Starter Repository

This starter repository automates dependency updates for `@fission-ai/openspec` with [Renovate](https://docs.renovatebot.com/). Renovate runs as an external service; it is not an npm dependency.

## What the Configuration Does

`renovate.json` at the repository root:

- Extends `config:recommended` and enables the dependency dashboard.
- Targets the `devel` branch.
- Automerges `patch` and `minor` updates of `@fission-ai/openspec` through pull-request automerge with platform automerge.
- Never automerges `major` updates of `@fission-ai/openspec`; they are proposed as regular pull requests for human review.
- Regenerates the checked-in OpenSpec assistant tooling (`.agents/skills/**`, `.opencode/commands/**`, `.opencode/skills/**`) after an OpenSpec update through post-upgrade tasks.

The `.github/workflows/openspec-scope.yml` workflow runs on OpenSpec-scope pull requests to `devel`: it installs with a frozen lockfile, configures the OpenSpec profile, regenerates tooling, and fails if the result differs from the checked-in state. It also runs strict OpenSpec validation. It never commits; drift must be fixed and pushed by the change author. Its green status is what informs Renovate that a branch is ready for automerge.

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

The hosted Mend Renovate GitHub App ignores `postUpgradeTasks` unless the commands are explicitly allowlisted in the app/administration configuration, which is not available for regular hosted-app repositories.

When post-upgrade tasks cannot run, the OpenSpec-scope workflow fails with generated tooling drift. The manual fallback is to reproduce the post-upgrade steps locally and push them to the Renovate branch:

```bash
pnpm exec openspec config set profile custom
pnpm exec openspec config set delivery both
pnpm exec openspec config set workflows '["propose","explore","new","continue","apply","update","ff","sync","verify","onboard"]'
pnpm ospec:update
```

These `config set` commands target the OpenSpec version installed by the update; the fallback must run with the updated dependency. Self-hosted runners with `allowedPostUpgradeCommands` avoid this manual step.

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
