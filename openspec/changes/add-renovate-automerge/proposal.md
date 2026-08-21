## Why

The starter repository depends on `@fission-ai/openspec` for all spec-driven development workflows, and OpenSpec releases frequently. Today every OpenSpec update is manual: bump the dependency, regenerate the checked-in assistant tooling (`.opencode/commands/`, `.opencode/skills/`, `.agents/skills/`), and validate. This is repetitive, easy to forget, and lets the starter drift behind OpenSpec releases.

Renovate can automate this loop. Another project in the same ecosystem already proved the pattern; its in-use files are kept locally under gitignored `tmp/` as examples (`tmp/renovate.json` and `tmp/openspec-scope.yml`): Renovate proposes the update, regenerates the OpenSpec tooling as a post-upgrade task, and a scoped CI workflow rejects any drift before merge. This change ports that setup to the starter repository with the same workflow semantics, with one hardening difference: only `patch` and `minor` OpenSpec updates automerge; `major` updates always stay manual.

## What Changes

- Add a root `renovate.json` for the starter repository, based on the in-use example `tmp/renovate.json`:
  - Extends `config:recommended` and enables the Renovate dependency dashboard.
  - Targets the `devel` branch, matching the example.
  - Automerges `@fission-ai/openspec` `patch` and `minor` updates through PR automerge with platform automerge.
  - Never automerges `@fission-ai/openspec` `major` updates; they remain manual PRs.
  - Regenerates OpenSpec tooling after an OpenSpec update through `postUpgradeTasks` (profile/delivery/workflows config plus `pnpm ospec:update`), limited to the generated tooling paths.
- Add a GitHub Actions workflow adapted from the in-use example `tmp/openspec-scope.yml`. The example is a reference, not a copy-paste target: the implementation SHALL create the workflow appropriate for this repository — OpenSpec-scope pull requests against `devel`, this repo's `ospec:` script names, this repo's paths. The workflow installs, configures the OpenSpec profile, regenerates tooling, rejects any drift (including untracked generated files), and runs strict OpenSpec validation; its green status is what informs Renovate that a branch is ready for automerge. A Renovate branch carries the latest OpenSpec version, so the workflow is expected to pass; if it fails, OpenSpec changed its tooling contract and maintainers must adapt the starter — that failure is intentional.
- Add an `ospec:update` package script that invokes the project-local OpenSpec CLI `update` command, following the existing `ospec:` prefix convention.
- Add `docs/renovate.md` documenting how to activate/install Renovate for this repository on GitHub (Mend app or self-hosted) and on other Git servers, including the `allowedPostUpgradeCommands` caveat and the repository settings required for automerge.
- Update `README.md` to link the Renovate documentation and reflect the new root files in the repository structure.
- Bump the starter version from `0.1.0` to `0.2.0` in `starter.yaml` and `package.json`.
- Add a `0.2.0` entry to `CHANGELOG.md` referencing this change.

## Capabilities

### New Capabilities

- `dependency-automation`: the starter repository automates OpenSpec dependency updates with Renovate, automerging patch/minor updates, keeping major updates manual, regenerating OpenSpec tooling on update, guarding drift with a scoped CI workflow, and documenting platform activation.

### Modified Capabilities

- `quality-gates`: the starter OpenSpec package scripts requirement now also exposes a tooling update helper script (`ospec:update`).

## Impact

- Affected starter-repository files: `renovate.json` (new), `.github/workflows/openspec-scope.yml` (new), `docs/renovate.md` (new), `package.json` (new `ospec:update` script, version `0.2.0`), `starter.yaml` (version `0.2.0`), `README.md`, `CHANGELOG.md`.
- Affected specs: new `dependency-automation` spec; modified `quality-gates` spec.
- Affected tooling/dependencies: no new package dependencies; Renovate runs as an external service, not as an npm dependency.
- Affected validation behaviour: pull requests that touch the OpenSpec scope are validated by the new CI workflow; local `pnpm validate` is unchanged.
- Affected generated-template files under `template/`: none. This change affects only the starter repository; generated projects do not receive Renovate configuration from this change.

## Out of Scope

- Updating `@fission-ai/openspec` itself; the first update is left to Renovate once enabled.
- Regenerating the checked-in OpenSpec assistant tooling as part of this change; tooling regeneration happens in the Renovate post-update flow, not in this change.
- Renovate configuration for generated projects under `template/` or for variants.
- Automerge for any dependency other than `@fission-ai/openspec`.
- Auto-committing regenerated tooling from CI; the workflow only rejects drift.
- Synchronizing `template/openspec/config.yaml` with OpenSpec guidance on dependency updates; `openspec update` does not regenerate user-owned config, so template config improvements remain a separate maintainer change.
- Renovate config validation as a required local gate (documented as an optional manual check).

## Risks

- If the hosted Renovate app does not allow `postUpgradeTasks`, tooling regeneration inside Renovate PRs is silently skipped; the drift-guard workflow then fails until a maintainer regenerates locally. The documentation must explain this and the self-hosted alternative.
- A workflow failure on a Renovate branch means OpenSpec changed its tooling contract; this failure is intentional and signals the follow-up starter change. Until the first Renovate OpenSpec update lands, human PRs touching the OpenSpec scope may also fail the profile step with the current pinned CLI; this is accepted and resolves itself with the Renovate update.
- If platform automerge is enabled without the required repository settings (allow auto-merge, branch protection), automerging stalls; the documentation must list the required settings.
- If the workflow drift check misses untracked generated files, incomplete regenerations could pass; the workflow must check working-tree status, not only tracked diffs.
