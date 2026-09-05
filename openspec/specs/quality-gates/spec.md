# quality-gates Specification

## Purpose

This specification outlines the quality gate requirements for generated projects to ensure they meet the baseline validation standards defined by the OpenSpec project.

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

#### Scenario: Tooling update command is exposed

- **WHEN** the root `package.json` scripts are inspected
- **THEN** an `ospec:update` script SHALL exist
- **AND** it SHALL invoke the project-local OpenSpec CLI `update` command to regenerate checked-in assistant tooling.

#### Scenario: Context-dependent commands use wrapper

- **WHEN** maintainers need OpenSpec commands that require a change id or additional context
- **THEN** those commands SHALL be run through `pnpm ospec` with explicit arguments
- **AND** root package scripts SHALL NOT hardcode a specific change id.

#### Scenario: Repository validate uses OpenSpec validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.

### Requirement: Rendered Template Validation

The starter repository SHALL provide an automated validation command that renders the neutral template through the generic starter renderer and verifies the rendered SDD-neutral generated project.

#### Scenario: Template validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:template` script SHALL exist.

#### Scenario: Spec-only validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:spec` script SHALL exist
- **AND** it SHALL run strict OpenSpec validation for the starter repository
- **AND** it MUST NOT be required in the generated neutral project.

#### Scenario: Template is rendered to temporary output

- **WHEN** `pnpm validate:template` is run
- **THEN** it SHALL render the neutral template through the generic starter renderer into a temporary generated-project directory
- **AND** it SHALL resolve the neutral starter placeholders using deterministic validation values
- **AND** it SHALL use zero selected extensions.

#### Scenario: Validation uses renderer semantics

- **WHEN** `pnpm validate:template` renders the neutral template
- **THEN** it SHALL use the same template path, placeholder resolution, output safety, extension-empty-set, and unresolved-placeholder semantics as `pnpm starter:render`.

#### Scenario: Neutral output has no SDD artifacts

- **WHEN** rendered-template validation scans the generated-project directory
- **THEN** it MUST fail if OpenSpec or another concrete SDD artifact, dependency, or generated-project SDD script is present in a neutral render.

#### Scenario: Unresolved placeholders fail validation

- **WHEN** rendered-template validation scans the generated-project directory
- **AND** unresolved double-underscore placeholders remain
- **THEN** validation MUST fail before generated-project dependency installation succeeds.

#### Scenario: Rendered project installs reproducibly

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm install --frozen-lockfile` in the rendered generated-project directory.

#### Scenario: Rendered project validation runs

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm validate` in the rendered generated-project directory
- **AND** that validation MUST use the neutral workspace quality gates without a concrete SDD validator.

#### Scenario: Rendered project graph is generated

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm nx graph --file=tmp/nx-graph.json` in the rendered generated-project directory.

#### Scenario: Repository validation includes template validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run strict OpenSpec validation for the starter repository
- **AND** it SHALL run rendered-template validation.

#### Scenario: Template validation remains neutral

- **WHEN** rendered-template validation is implemented
- **THEN** it MUST NOT introduce concrete SDD, variant, overlay, extension, module, application, service, API, auth, storage, observability, or infrastructure behaviour.

### Requirement: Generated Nx Telemetry Defaults

The generated template SHALL disable Nx telemetry and block Nx Cloud connections by default.

#### Scenario: Nx analytics are disabled

- **WHEN** `template/nx.json` is inspected
- **THEN** `analytics` SHALL be `false`.

#### Scenario: Nx Cloud connections are blocked

- **WHEN** `template/nx.json` is inspected
- **THEN** `neverConnectToCloud` SHALL be `true`.
