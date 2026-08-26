## MODIFIED Requirements

### Requirement: Renovate Configuration

The starter repository SHALL provide a root `renovate.json` that configures Renovate as an external service for the starter repository.

#### Scenario: Configuration file exists and declares its schema

- **WHEN** the starter repository root is inspected
- **THEN** a `renovate.json` file SHALL exist
- **AND** it SHALL declare the Renovate `$schema`
- **AND** it SHALL extend `config:recommended`.

#### Scenario: Dependency dashboard is enabled

- **WHEN** `renovate.json` is inspected
- **THEN** the Renovate dependency dashboard SHALL be disabled (`dependencyDashboard: false`)
- **AND** Renovate SHALL still auto-open configuration-migration pull requests when it detects deprecated options (`configMigration` defaults to `true`).

#### Scenario: Workflow bot commits do not block Renovate ownership

- **WHEN** `renovate.json` is inspected
- **THEN** it SHALL declare `gitIgnoredAuthors` with the `github-actions[bot]` commit email used by the OpenSpec-scope workflow
- **AND** Renovate SHALL still treat its own pull requests as owned by Renovate after the workflow commits regenerated tooling to them
- **AND** Renovate SHALL continue to rebase and automerge those pull requests instead of marking them "Edited/Blocked".

#### Scenario: Base branch targets the integration branch

- **WHEN** `renovate.json` is inspected
- **THEN** Renovate SHALL target the starter repository integration branch `devel`
- **AND** it SHALL NOT target a branch that does not exist in the starter repository.

#### Scenario: Renovate is not an npm dependency

- **WHEN** the starter repository dependencies are inspected
- **THEN** Renovate SHALL NOT be declared as a package dependency or devDependency.

### Requirement: OpenSpec Automerge Policy

The starter repository SHALL automerge `@fission-ai/openspec` patch and minor updates and SHALL keep major updates manual.

#### Scenario: Patch and minor updates automerge

- **WHEN** Renovate proposes a `patch` or `minor` update of `@fission-ai/openspec`
- **THEN** the update SHALL be configured for automerge through a pull request with platform automerge.

#### Scenario: Major updates never automerge

- **WHEN** Renovate proposes a `major` update of `@fission-ai/openspec`
- **THEN** the update SHALL be proposed as a pull request
- **AND** it MUST NOT automerge
- **AND** the configuration SHALL state this major-update exclusion explicitly.

#### Scenario: Automerge is scoped to OpenSpec

- **WHEN** `renovate.json` is inspected
- **THEN** automerge SHALL be configured only for `@fission-ai/openspec`
- **AND** no other package SHALL be configured to automerge.

#### Scenario: Current dependency-name matcher is used

- **WHEN** `renovate.json` is inspected
- **THEN** the OpenSpec rules SHALL match the dependency with `matchDepNames` (the current Renovate key)
- **AND** they SHALL NOT use the deprecated `matchPackageNames` key.

### Requirement: OpenSpec Tooling Regeneration on Dependency Update

Renovate OpenSpec updates SHALL regenerate the checked-in OpenSpec assistant tooling as part of the update.

#### Scenario: Post-upgrade tasks reconfigure the OpenSpec profile

- **WHEN** Renovate processes an `@fission-ai/openspec` update
- **THEN** post-upgrade tasks SHALL set the OpenSpec profile, delivery, and workflows configuration before regenerating tooling, because OpenSpec configuration is global and not checked in
- **AND** the configuration commands SHALL follow the in-use example `tmp/renovate.json`, since they run with the updated OpenSpec version on the Renovate branch.

#### Scenario: Post-upgrade tasks regenerate tooling through the package script

- **WHEN** Renovate processes an `@fission-ai/openspec` update
- **THEN** post-upgrade tasks SHALL regenerate assistant tooling through the `ospec:update` package script.

#### Scenario: Post-upgrade side effects are limited to tooling paths

- **WHEN** Renovate commits post-upgrade task results
- **THEN** committed files SHALL be limited to `.opencode/commands/**` and `.opencode/skills/**`.

### Requirement: OpenSpec Scope Pull Request Gate

The starter repository SHALL run a GitHub Actions workflow on pull requests that touch the OpenSpec scope, proving that checked-in assistant tooling matches the pinned OpenSpec version.

#### Scenario: Workflow triggers on OpenSpec-scope paths

- **WHEN** a pull request targeting `devel` changes `openspec/config.yaml`, `.opencode/commands/**`, `.opencode/skills/**`, `package.json`, `pnpm-lock.yaml`, `template/package.json`, `template/pnpm-lock.yaml`, `renovate.json`, or the workflow itself
- **THEN** the OpenSpec-scope workflow SHALL run.

#### Scenario: Workflow adapts the in-use example

- **WHEN** the workflow file is inspected
- **THEN** it SHALL follow the shape of the in-use example `tmp/openspec-scope.yml` from the sibling project
- **AND** it SHALL be adapted to this repository's `ospec:` script names and paths
- **AND** it SHALL trigger on pull requests to `devel`.

#### Scenario: Workflow regenerates tooling and rejects drift

- **WHEN** the OpenSpec-scope workflow detects an OpenSpec-relevant change (the `@fission-ai/openspec` version changed, `openspec/config.yaml` changed, `.opencode/` tooling changed, or the head ref starts with `renovate/`)
- **THEN** it SHALL install dependencies with the frozen lockfile
- **AND** it SHALL configure the OpenSpec profile, delivery, and workflows
- **AND** it SHALL regenerate assistant tooling
- **AND** it MUST fail if the working tree differs afterwards, including untracked generated files
- **AND** when the change is not OpenSpec-relevant, it SHALL skip regeneration and drift rejection and SHALL still run strict validation.

#### Scenario: Workflow detects OpenSpec-relevant changes

- **WHEN** the OpenSpec-scope workflow starts
- **THEN** it SHALL compute whether the change is OpenSpec-relevant from the pull-request diff (the `@fission-ai/openspec` version in `package.json` or `template/package.json`, a change to `openspec/config.yaml`, or a change to `.opencode/commands/` or `.opencode/skills/`)
- **AND** it SHALL gate regeneration, the Renovate-branch commit, and drift rejection on that result.

#### Scenario: Workflow commits regenerated tooling on Renovate branches only

- **WHEN** the OpenSpec-scope workflow runs on a pull request whose head ref starts with `renovate/`
- **THEN** after regenerating tooling it SHALL commit and push the generated-tooling paths (`.opencode/commands`, `.opencode/skills`) to the pull request head
- **AND** this commit SHALL use the `github-actions[bot]` identity
- **AND** it SHALL be idempotent so a second run makes no further commit.

#### Scenario: Workflow never commits

- **WHEN** the OpenSpec-scope workflow runs on a pull request whose head ref does not start with `renovate/`
- **THEN** it MUST NOT commit or push
- **AND** it MUST fail the drift gate if generated tooling is stale, so the author must fix and push the tooling.

#### Scenario: Workflow runs strict OpenSpec validation

- **WHEN** the OpenSpec-scope workflow runs and `changed` is true
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.
- **AND** when `changed` is false (for example a pnpm version-bump pull request), it SHALL run no OpenSpec validation or regeneration steps.

#### Scenario: Workflow failure on Renovate branches signals a contract change

- **WHEN** the OpenSpec-scope workflow fails on a Renovate branch after the tooling commit step
- **THEN** the failure SHALL be treated as a signal that OpenSpec changed its tooling contract
- **AND** maintainers SHALL address it through a follow-up starter change
- **AND** the workflow SHALL NOT be weakened to make the branch pass.

## ADDED Requirements

### Requirement: Manager Restriction

Renovate SHALL only use the `npm` manager for this repository.

#### Scenario: Only the npm manager is enabled

- **WHEN** `renovate.json` is inspected
- **THEN** `enabledManagers` SHALL be `["npm"]`
- **AND** Renovate SHALL NOT run the `github-actions` manager (workflow `uses:`)
- **AND** Renovate SHALL NOT run the `nvm` manager (`.nvmrc` files).

#### Scenario: Root package-manager pin stays managed

- **WHEN** `renovate.json` is inspected
- **THEN** the `npm` manager SHALL remain enabled so the root `packageManager` pin (the pnpm version, handled by the npm manager) is still proposed as a manual update.

### Requirement: Template Dependency Scope

Renovate SHALL manage the root `package.json` dependencies, and inside `template/package.json` it SHALL manage only `@fission-ai/openspec`.

#### Scenario: Root package.json dependencies are managed

- **WHEN** Renovate inspects the root `package.json`
- **THEN** its dependencies SHALL be eligible for updates (manual pull requests by default).

#### Scenario: Template non-OpenSpec dependencies are ignored

- **WHEN** Renovate inspects `template/package.json`
- **THEN** every dependency other than `@fission-ai/openspec` SHALL be disabled from updates
- **AND** those dependencies SHALL NOT receive Renovate pull requests from this repository.

#### Scenario: Template OpenSpec dependency is managed

- **WHEN** Renovate inspects `template/package.json`
- **THEN** `@fission-ai/openspec` SHALL remain eligible for updates under the same automerge policy as the root dependency.

## ADDED Requirements

### Requirement: pnpm Version Pin Restriction

Renovate SHALL NOT propose major updates to the pnpm `packageManager` pin.

#### Scenario: Major pnpm updates are blocked

- **WHEN** Renovate evaluates the root `packageManager` pin (pnpm)
- **THEN** it SHALL NOT propose a major pnpm update
- **AND** it SHALL keep the existing pin unchanged for major bumps.

#### Scenario: Minor and patch pnpm updates remain manual

- **WHEN** Renovate evaluates the root `packageManager` pin (pnpm)
- **THEN** minor and patch pnpm updates SHALL still be proposed as manual pull requests.

### Requirement: Template Dependency Lockfile Maintenance

The OpenSpec-scope workflow SHALL regenerate `template/pnpm-lock.yaml` when Renovate updates `@fission-ai/openspec` in `template/package.json`, because the template's `package.json` uses placeholders that prevent Renovate from running `pnpm install` itself.

#### Scenario: Template lockfile updates with OpenSpec

- **WHEN** the OpenSpec-scope workflow detects a change to `@fission-ai/openspec` in `template/package.json` on a `renovate/*` branch
- **THEN** it SHALL substitute the template placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) with concrete values
- **AND** it SHALL run `pnpm install --ignore-scripts` in `template/` to regenerate `template/pnpm-lock.yaml`
- **AND** it SHALL restore the placeholder `template/package.json`
- **AND** it SHALL commit the regenerated `template/pnpm-lock.yaml` to the pull request head.

#### Scenario: Renovate does not update the template lockfile itself

- **WHEN** Renovate inspects `template/package.json`
- **THEN** it SHALL set `updateLockFiles: false` for the OpenSpec dependency so it does not attempt to regenerate `template/pnpm-lock.yaml` (the template's placeholder `packageManager` would make `pnpm` fail with an artifact error).

#### Scenario: Non-OpenSpec template dependencies stay disabled

- **WHEN** Renovate inspects `template/package.json`
- **THEN** every dependency other than `@fission-ai/openspec` SHALL be disabled from updates
- **AND** the npm manager SHALL remain enabled for the file so its lockfile stays maintained by the workflow.
