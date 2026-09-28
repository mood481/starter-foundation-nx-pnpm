## MODIFIED Requirements

### Requirement: Renovate Activation Documentation

The starter repository SHALL document how to activate and install Renovate for the repository on GitHub and on other Git servers without implying that generated projects use OpenSpec.

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
- **THEN** it SHALL state that root OpenSpec dependency updates affect starter-maintenance tooling only
- **AND** it SHALL state that optional generated SDD integrations are supplied by separate variants or extensions
- **AND** it SHALL instruct maintainers to review those integrations through their own changes rather than modifying the neutral template.

#### Scenario: Documentation is discoverable

- **WHEN** a maintainer reads `README.md`
- **THEN** it SHALL link to the Renovate activation documentation.

### Requirement: Template Dependency Lockfile Maintenance

The starter SHALL provide a local mechanism to regenerate `template/pnpm-lock.yaml` when `template/package.json` changes, because the template's `package.json` uses placeholders that prevent `pnpm install` from running directly. Renovate SHALL NOT manage the template; the maintainer updates it locally at their discretion.

#### Scenario: Template lockfile updates with OpenSpec

- **WHEN** a maintainer changes a dependency in `template/package.json` and runs the template lockfile update script
- **THEN** it SHALL substitute the template placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) in `template/package.json` with concrete values derived from the root `package.json`
- **AND** it SHALL run `pnpm install --ignore-scripts` in `template/` to regenerate `template/pnpm-lock.yaml`
- **AND** it SHALL restore the placeholder `template/package.json`
- **AND** the maintainer SHALL commit the regenerated `template/pnpm-lock.yaml`.

#### Scenario: Renovate does not update the template lockfile itself

- **WHEN** `renovate.json` is inspected
- **THEN** it SHALL disable `template/package.json` entirely (`enabled: false`)
- **AND** Renovate SHALL NOT propose any dependency update for the template on GitHub
- **AND** Renovate SHALL NOT attempt to regenerate `template/pnpm-lock.yaml`.

#### Scenario: Non-OpenSpec template dependencies stay disabled

- **WHEN** `renovate.json` is inspected
- **THEN** every dependency in `template/package.json` SHALL be disabled from Renovate updates because the entire file is disabled (`enabled: false`)
- **AND** the npm manager SHALL remain enabled for the repository root so the root lockfile stays maintained.
