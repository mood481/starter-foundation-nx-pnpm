## MODIFIED Requirements

### Requirement: Generated OpenSpec Configuration

Generated projects SHALL include an OpenSpec configuration file for the generated repository.

#### Scenario: Importable OpenSpec config is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/config.yaml` SHALL exist.

#### Scenario: Generated OpenSpec config uses spec-driven schema

- **WHEN** `template/openspec/config.yaml` is inspected
- **THEN** it SHALL declare `schema: spec-driven`.

#### Scenario: Generated OpenSpec config is project-aware

- **WHEN** `template/openspec/config.yaml` is rendered
- **THEN** it SHALL identify the generated project using rendered project placeholders
- **AND** it SHALL retain starter provenance using rendered starter placeholders.

#### Scenario: Generated OpenSpec config leaves project context editable

- **WHEN** `template/openspec/config.yaml` is inspected
- **THEN** it SHALL include editable project-specific context prompts for domain, users, runtime stack, delivery constraints, and terminology.

#### Scenario: Generated OpenSpec config defines lightweight global authoring rules

- **WHEN** `template/openspec/config.yaml` is inspected
- **THEN** it SHALL define generated-project OpenSpec rules for proposals, specs, designs, and tasks
- **AND** those rules SHALL remain domain-neutral and lighter than starter-maintenance root rules.

#### Scenario: Generated OpenSpec config renders without unresolved placeholders

- **WHEN** rendered-template validation runs
- **THEN** `openspec/config.yaml` in the rendered output SHALL contain no unresolved double-underscore placeholders.

## ADDED Requirements

### Requirement: Generated Local OpenSpec Tooling

Generated projects SHALL provide local OpenSpec tooling that uses the project dependency rather than requiring a global OpenSpec installation.

#### Scenario: OpenSpec dependency is included

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL include `@fission-ai/openspec` as a development dependency compatible with version `1.4.0`.

#### Scenario: Local OpenSpec wrapper exists

- **WHEN** the generated root `package.json` scripts are inspected
- **THEN** an `ospec` script SHALL exist
- **AND** it SHALL invoke the local OpenSpec CLI.

#### Scenario: Local OpenSpec validation scripts exist

- **WHEN** the generated root `package.json` scripts are inspected
- **THEN** `ospec:validate` SHALL run strict validation for all OpenSpec artifacts
- **AND** `validate:spec` SHALL run OpenSpec strict validation.

#### Scenario: JSON validation output uses wrapper

- **WHEN** generated-project maintainers need strict OpenSpec validation as JSON
- **THEN** it SHALL be available through `pnpm ospec validate --all --strict --json`.
