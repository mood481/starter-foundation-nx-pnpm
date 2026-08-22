## ADDED Requirements

### Requirement: Renovate Configuration

The starter repository SHALL provide a root `renovate.json` that configures Renovate as an external service for the starter repository.

#### Scenario: Configuration file exists and declares its schema

- **WHEN** the starter repository root is inspected
- **THEN** a `renovate.json` file SHALL exist
- **AND** it SHALL declare the Renovate `$schema`
- **AND** it SHALL extend `config:recommended`.

#### Scenario: Dependency dashboard is enabled

- **WHEN** `renovate.json` is inspected
- **THEN** the Renovate dependency dashboard SHALL be enabled.

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
- **THEN** committed files SHALL be limited to `.agents/skills/**`, `.opencode/commands/**`, and `.opencode/skills/**`.

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

#### Scenario: Workflow runs strict OpenSpec validation

- **WHEN** the OpenSpec-scope workflow runs
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.

#### Scenario: Workflow never commits

- **WHEN** the OpenSpec-scope workflow detects drift
- **THEN** it MUST fail the check
- **AND** it MUST NOT push commits to the pull request.

#### Scenario: Workflow failure on Renovate branches signals a contract change

- **WHEN** the OpenSpec-scope workflow fails on a Renovate branch that carries the latest OpenSpec version
- **THEN** the failure SHALL be treated as a signal that OpenSpec changed its tooling contract
- **AND** maintainers SHALL address it through a follow-up starter change
- **AND** the workflow SHALL NOT be weakened to make the branch pass.

### Requirement: Renovate Activation Documentation

The starter repository SHALL document how to activate and install Renovate for the repository on GitHub and on other Git servers.

#### Scenario: GitHub activation is documented

- **WHEN** a maintainer reads the Renovate documentation
- **THEN** it SHALL explain how to activate Renovate on GitHub
- **AND** it SHALL list the repository settings required for automerge, including allowing auto-merge and branch protection on the `devel` branch.

#### Scenario: Other Git servers are documented

- **WHEN** a maintainer hosts the repository outside GitHub
- **THEN** the documentation SHALL explain how to run Renovate against other Git servers through self-hosted or scheduled execution.

#### Scenario: Post-upgrade task permission caveat is documented

- **WHEN** a maintainer reads the Renovate documentation
- **THEN** it SHALL explain that hosted Renovate may ignore post-upgrade tasks unless the commands are allowlisted
- **AND** it SHALL explain the manual tooling regeneration fallback when the drift gate fails for that reason.

#### Scenario: Template config is not synchronized automatically

- **WHEN** a maintainer reads the Renovate documentation
- **THEN** it SHALL state that OpenSpec dependency updates do not modify `template/openspec/config.yaml`
- **AND** it SHALL instruct maintainers to review the OpenSpec release notes on each update
- **AND** it SHALL state that template config improvements are handled through a separate OpenSpec change.

#### Scenario: Documentation is discoverable

- **WHEN** a maintainer reads `README.md`
- **THEN** it SHALL link to the Renovate activation documentation.
