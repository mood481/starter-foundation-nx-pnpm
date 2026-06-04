# SDD Layout

## Purpose

Defines the Spec-Driven Development layout, including the OpenSpec directory structure, foundational specs, configuration, and change management baseline for the generated project.

## Requirements

### Requirement: OpenSpec Default Layout

The generated project SHALL use OpenSpec as the default SDD provider.

#### Scenario: OpenSpec root exists

- **WHEN** the generated project is inspected
- **THEN** an `openspec/` directory SHALL exist.

#### Scenario: OpenSpec specs path exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/` SHALL exist.

#### Scenario: OpenSpec changes path exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/changes/` SHALL exist.

#### Scenario: OpenSpec archive path exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/archive/` SHALL exist.

### Requirement: Foundation Specs

The generated project SHALL include canonical foundation specs.

#### Scenario: Project foundation spec exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/project-foundation/spec.md` SHALL exist.

#### Scenario: Workspace structure spec exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/workspace-structure/spec.md` SHALL exist.

#### Scenario: Nx workspace spec exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/nx-workspace/spec.md` SHALL exist.

#### Scenario: Quality gates spec exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/quality-gates/spec.md` SHALL exist.

#### Scenario: SDD layout spec exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/specs/sdd-layout/spec.md` SHALL exist.

### Requirement: OpenSpec Configuration

The generated project SHALL include an OpenSpec configuration for the generated repository.

#### Scenario: OpenSpec config exists

- **WHEN** the generated project is inspected
- **THEN** `openspec/config.yaml` SHALL exist.

#### Scenario: OpenSpec config uses spec-driven schema

- **WHEN** `openspec/config.yaml` is inspected
- **THEN** it SHALL declare `schema: spec-driven`.

#### Scenario: OpenSpec config is project-aware

- **WHEN** `openspec/config.yaml` is inspected
- **THEN** it SHALL identify the generated project
- **AND** it SHALL record starter provenance.

### Requirement: Empty Changes On Generation

The generated project SHALL start with no active changes.

#### Scenario: Changes directory is empty

- **WHEN** a project is generated
- **THEN** `openspec/changes/` SHALL exist
- **AND** it SHOULD contain no active changes by default.
