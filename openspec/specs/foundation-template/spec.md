# foundation-template Specification

## Purpose

The foundation-template specification defines the contract for a starter template that provides a baseline structure for generating new projects using the OpenSpec framework. This specification outlines the expected directory layout, project structure, and workspace configuration for generated projects.

## Requirements

### Requirement: Template Directory

The starter SHALL provide a `template/` directory containing the SDD-neutral files imported into generated projects.

#### Scenario: Template root exists

- **WHEN** the starter is inspected
- **THEN** a `template/` directory SHALL exist.

#### Scenario: Template contains monorepo directories

- **WHEN** the template is inspected
- **THEN** it SHALL contain `apps/`
- **AND** `services/`
- **AND** `packages/`
- **AND** `tools/`
- **AND** `docs/`
- **AND** it MUST NOT require an `openspec/` directory.

### Requirement: Generated Project Structure

A project generated from the template SHALL use a predictable monorepo layout.

#### Scenario: Application path exists

- **WHEN** a project is generated
- **THEN** application projects SHALL be added under `apps/`.

#### Scenario: Service path exists

- **WHEN** a project is generated
- **THEN** backend services, APIs, workers, and service runtimes SHALL be added under `services/`.

#### Scenario: Package path exists

- **WHEN** a project is generated
- **THEN** shared libraries and reusable packages SHALL be added under `packages/`.

#### Scenario: Tooling path exists

- **WHEN** a project is generated
- **THEN** project-local scripts, generators, and automation tools SHALL be added under `tools/`.

### Requirement: Workspace Configuration

The template SHALL provide the base workspace configuration for pnpm and Nx without requiring a concrete SDD provider.

#### Scenario: pnpm workspace file exists

- **WHEN** the template is inspected
- **THEN** `pnpm-workspace.yaml` SHALL exist.

#### Scenario: pnpm lockfile exists

- **WHEN** the template is inspected
- **THEN** `pnpm-lock.yaml` SHALL exist to support reproducible dependency installation.

#### Scenario: Nx configuration file exists

- **WHEN** the template is inspected
- **THEN** `nx.json` SHALL exist.

#### Scenario: Package metadata exists

- **WHEN** the template is inspected
- **THEN** `package.json` SHALL exist
- **AND** it SHALL define common workspace validation scripts
- **AND** those scripts MUST NOT require a concrete SDD CLI.

### Requirement: Placeholder Rendering

The template SHALL support placeholders that are resolved during project generation.

#### Scenario: Placeholder style is consistent

- **WHEN** placeholders are used
- **THEN** they SHALL use double-underscore syntax such as `__PROJECT_SLUG__`.

#### Scenario: Unresolved placeholders fail validation

- **WHEN** rendering completes
- **AND** unresolved placeholders remain
- **THEN** the render process MUST fail.

### Requirement: Template Documentation

The template SHALL include documentation for generated project maintainers.

#### Scenario: Generated README exists

- **WHEN** a project is generated
- **THEN** it SHALL contain a root `README.md`.

#### Scenario: Development docs exist

- **WHEN** a project is generated
- **THEN** it SHALL contain `docs/development.md`
- **AND** `docs/monorepo.md`
- **AND** `docs/validation.md`.

### Requirement: SDD-Neutral Generated Foundation

A project generated from the neutral template SHALL be a valid Nx + pnpm foundation without a required SDD implementation.

#### Scenario: Neutral render contains no SDD artifacts

- **WHEN** the neutral template is rendered without a variant or extension
- **THEN** the generated output MUST NOT contain `openspec/`
- **AND** it MUST NOT contain an SDD configuration or baseline spec directory
- **AND** it MUST NOT contain a concrete SDD dependency or SDD-specific package script.

#### Scenario: Neutral validation remains workspace-focused

- **WHEN** `pnpm validate` is run in a neutral generated project
- **THEN** it SHALL validate the Nx and pnpm workspace quality baseline
- **AND** it MUST NOT invoke a concrete SDD validator.

#### Scenario: Optional SDD content is attributable to a selected contribution

- **WHEN** a generated project contains SDD artifacts
- **THEN** the selected variant or extension contract SHALL be the declared source of those artifacts
- **AND** an unselected neutral render SHALL not contain them.
