# dependency-automation Specification

## Purpose
TBD - created by archiving change add-renovate-automerge. Update Purpose after archive.
## Requirements
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

#### Scenario: Template package.json is excluded from Renovate

- **WHEN** `renovate.json` is inspected
- **THEN** it SHALL disable Renovate for `template/package.json` (`enabled: false`)
- **AND** Renovate SHALL NOT propose any dependency update for the template on GitHub.

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

- **WHEN** a pull request targeting `devel` changes `openspec/config.yaml`, `.opencode/commands/**`, `.opencode/skills/**`, `package.json`, `pnpm-lock.yaml`, `renovate.json`, or the workflow itself
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
- **THEN** it SHALL compute whether the change is OpenSpec-relevant from the pull-request diff (the `@fission-ai/openspec` version in `package.json`, a change to `openspec/config.yaml`, or a change to `.opencode/commands/` or `.opencode/skills/`)
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

The starter SHALL provide a local mechanism to regenerate `template/pnpm-lock.yaml` when `template/package.json` changes, because the template's `package.json` uses placeholders that prevent `pnpm install` from running directly. Renovate SHALL NOT manage the template; the maintainer updates it locally at their discretion.

#### Scenario: Template lockfile updates with OpenSpec

- **WHEN** a maintainer changes `@fission-ai/openspec` (or any dependency) in `template/package.json` and runs the template lockfile update script (for example `pnpm template:update-lock` or `node scripts/update-template-lockfile.mjs`)
- **THEN** it SHALL substitute the template placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) in `template/package.json` with concrete values derived from the root `package.json`
- **AND** it SHALL run `pnpm install --ignore-scripts` in `template/` to regenerate `template/pnpm-lock.yaml`
- **AND** it SHALL restore the placeholder `template/package.json`
- **AND** the maintainer SHALL commit the regenerated `template/pnpm-lock.yaml`.

#### Scenario: Renovate does not update the template lockfile itself

- **WHEN** `renovate.json` is inspected
- **THEN** it SHALL disable `template/package.json` entirely (`enabled: false`)
- **AND** Renovate SHALL NOT propose OpenSpec or any other dependency update for the template on GitHub
- **AND** Renovate SHALL NOT attempt to regenerate `template/pnpm-lock.yaml`.

#### Scenario: Non-OpenSpec template dependencies stay disabled

- **WHEN** `renovate.json` is inspected
- **THEN** every dependency in `template/package.json` SHALL be disabled from Renovate updates because the entire file is disabled (`enabled: false`)
- **AND** the npm manager SHALL remain enabled for the repository root so the root lockfile stays maintained.

