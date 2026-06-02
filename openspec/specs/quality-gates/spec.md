# quality-gates Specification

## Purpose
TBD - created by archiving change add-foundation-template-contract. Update Purpose after archive.
## Requirements
### Requirement: Baseline Validation Commands

The generated project SHALL expose baseline validation commands from the root package metadata.

#### Scenario: Validate command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `validate` script.

#### Scenario: Lint command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `lint` script.

#### Scenario: Test command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `test` script.

#### Scenario: Typecheck command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHOULD define a `typecheck` script.

### Requirement: Deterministic Foundation Validation

The generated project SHALL support deterministic validation of the neutral foundation.

#### Scenario: Dependencies can be installed reproducibly

- **WHEN** a generated project is validated
- **THEN** dependency installation SHOULD support frozen-lockfile mode.

#### Scenario: Lockfile exists

- **WHEN** the generated project is inspected
- **THEN** `pnpm-lock.yaml` SHALL exist.

#### Scenario: Workspace validation can be run

- **WHEN** a generated project is validated
- **THEN** `pnpm validate` SHALL be executable.

#### Scenario: Nx project graph can be generated

- **WHEN** a generated project is validated
- **THEN** Nx SHOULD be able to produce a project graph output.

### Requirement: Placeholder Validation

Rendered generated projects SHALL NOT contain unresolved placeholders.

#### Scenario: Placeholder scan runs after rendering

- **WHEN** the template is rendered
- **THEN** validation SHALL scan generated files for unresolved double-underscore placeholders.

#### Scenario: Unresolved placeholder is found

- **WHEN** validation finds an unresolved placeholder
- **THEN** validation MUST fail.

### Requirement: Neutral Boundary Validation

Neutral foundation validation SHALL verify that variant-specific files were not introduced.

#### Scenario: Concrete variant directory is absent

- **WHEN** the neutral starter is validated
- **THEN** no concrete variant directory SHALL exist.

#### Scenario: Variant metadata is absent from generated template

- **WHEN** the neutral template is validated
- **THEN** variant-specific generated metadata MUST NOT be present.

### Requirement: Starter OpenSpec Package Scripts

The starter repository SHALL expose working OpenSpec package scripts from the root package metadata.

#### Scenario: Local OpenSpec wrapper is exposed

- **WHEN** the root `package.json` scripts are inspected
- **THEN** an `ospec` script SHALL exist
- **AND** it SHALL invoke the project-local OpenSpec CLI.

#### Scenario: Helper scripts use clear OpenSpec prefix

- **WHEN** the root `package.json` scripts are inspected
- **THEN** standalone OpenSpec helper scripts SHALL use the `ospec:` prefix
- **AND** OpenSpec scripts SHALL NOT use the `os:` prefix.

#### Scenario: Common OpenSpec commands are exposed

- **WHEN** maintainers use the root package scripts
- **THEN** standalone helper scripts SHALL exist for listing changes, listing specs, validating all artifacts strictly, and validating all artifacts strictly as JSON.

#### Scenario: Context-dependent commands use wrapper

- **WHEN** maintainers need OpenSpec commands that require a change id or additional context
- **THEN** those commands SHALL be run through `pnpm ospec` with explicit arguments
- **AND** root package scripts SHALL NOT hardcode a specific change id.

#### Scenario: Repository validate uses OpenSpec validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.

