# sdd-contract Specification

## Purpose

This specification defines the requirements for a project-specific SDD provider.

## Requirements
### Requirement: OpenSpec Default Layout

Generated projects SHALL use OpenSpec as the default SDD provider.

#### Scenario: OpenSpec root exists

- **WHEN** a project is generated
- **THEN** an `openspec/` directory SHALL exist.

#### Scenario: OpenSpec specs path exists

- **WHEN** a project is generated
- **THEN** `openspec/specs/` SHALL exist.

#### Scenario: OpenSpec changes path exists

- **WHEN** a project is generated
- **THEN** `openspec/changes/` SHALL exist.

#### Scenario: OpenSpec archive path exists

- **WHEN** a project is generated
- **THEN** `openspec/archive/` SHALL exist.

### Requirement: Importable Foundation Specs

The foundation template SHALL include canonical OpenSpec specs that are imported into generated projects.

#### Scenario: Project foundation spec is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/specs/project-foundation/spec.md` SHALL exist.

#### Scenario: Workspace structure spec is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/specs/workspace-structure/spec.md` SHALL exist.

#### Scenario: Nx workspace spec is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/specs/nx-workspace/spec.md` SHALL exist.

#### Scenario: Quality gates spec is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/specs/quality-gates/spec.md` SHALL exist.

#### Scenario: SDD layout spec is included

- **WHEN** the template is inspected
- **THEN** `template/openspec/specs/sdd-layout/spec.md` SHALL exist.

### Requirement: Starter Changes Are Not Imported

Generated projects SHALL NOT include the active OpenSpec changes used to build the starter itself.

#### Scenario: Starter implementation changes are excluded

- **WHEN** a project is generated from the template
- **THEN** root-level `openspec/changes/` from the starter repository MUST NOT be copied into the generated project.

#### Scenario: Generated project starts with empty changes

- **WHEN** a project is generated
- **THEN** generated `openspec/changes/` SHALL be present
- **AND** it SHOULD contain no active changes by default.

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
- **THEN** it SHALL include editable project-specific context sections for domain, users, runtime stack, delivery constraints, and terminology.

#### Scenario: Generated OpenSpec config defines lightweight global authoring rules

- **WHEN** `template/openspec/config.yaml` is inspected
- **THEN** it SHALL define generated-project OpenSpec rules for proposals, specs, designs, and tasks
- **AND** those rules SHALL remain domain-neutral and lighter than starter-maintenance root rules.

#### Scenario: Generated OpenSpec config renders without unresolved placeholders

- **WHEN** rendered-template validation runs
- **THEN** `openspec/config.yaml` in the rendered output SHALL contain no unresolved double-underscore placeholders.

