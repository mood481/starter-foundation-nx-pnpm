## MODIFIED Requirements

### Requirement: Renovate Configuration

The starter repository SHALL provide a root `renovate.json` that configures Renovate as an external service for the starter repository.

#### Scenario: Configuration file exists and declares its schema

- **WHEN** the starter repository root is inspected
- **THEN** a `renovate.json` file SHALL exist
- **AND** it SHALL declare the Renovate `$schema`
- **AND** it SHALL extend `config:recommended`.

#### Scenario: Dependency dashboard is disabled

- **WHEN** `renovate.json` is inspected
- **THEN** the Renovate dependency dashboard SHALL be disabled (`dependencyDashboard: false`)
- **AND** Renovate SHALL still auto-open configuration-migration pull requests when it detects deprecated options (`configMigration` defaults to `true`).

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

### Requirement: OpenSpec Scope Pull Request Gate

The starter repository SHALL run a GitHub Actions workflow on pull requests that touch the OpenSpec scope, proving that checked-in assistant tooling matches the pinned OpenSpec version.

#### Scenario: Workflow triggers on OpenSpec-scope paths

- **WHEN** a pull request targeting `devel` changes `openspec/config.yaml`, `.agents/skills/**`, `.opencode/commands/**`, `.opencode/skills/**`, `package.json`, `pnpm-lock.yaml`, `renovate.json`, or the workflow itself
- **THEN** the OpenSpec-scope workflow SHALL run.

#### Scenario: Workflow adapts the in-use example

- **WHEN** the workflow file is inspected
- **THEN** it SHALL follow the shape of the in-use example `tmp/openspec-scope.yml` from the sibling project
- **AND** it SHALL be adapted to this repository's `ospec:` script names and paths
- **AND** it SHALL trigger on pull requests to `devel`.

#### Scenario: Workflow regenerates tooling and rejects drift

- **WHEN** the OpenSpec-scope workflow runs
- **THEN** it SHALL install dependencies with the frozen lockfile
- **AND** it SHALL configure the OpenSpec profile, delivery, and workflows
- **AND** it SHALL regenerate assistant tooling
- **AND** it MUST fail if the working tree differs afterwards, including untracked generated files.

#### Scenario: Workflow commits regenerated tooling on Renovate branches only

- **WHEN** the OpenSpec-scope workflow runs on a pull request whose head ref starts with `renovate/`
- **THEN** after regenerating tooling it SHALL commit and push the generated-tooling paths (`.agents/skills`, `.opencode/commands`, `.opencode/skills`) to the pull request head
- **AND** this commit SHALL use the `github-actions[bot]` identity
- **AND** it SHALL be idempotent so a second run makes no further commit.

#### Scenario: Workflow never commits for non-Renovate branches

- **WHEN** the OpenSpec-scope workflow runs on a pull request whose head ref does not start with `renovate/`
- **THEN** it MUST NOT commit or push
- **AND** it MUST fail the drift gate if generated tooling is stale, so the author must fix and push the tooling.

#### Scenario: Workflow runs strict OpenSpec validation

- **WHEN** the OpenSpec-scope workflow runs
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.

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
