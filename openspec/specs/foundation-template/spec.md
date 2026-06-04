# foundation-template Specification

## Purpose

The foundation-template specification defines the contract for a starter template that provides a baseline structure for generating new projects using the OpenSpec framework. This specification outlines the expected directory layout, project structure, and workspace configuration for generated projects.

## Requirements
### Requirement: Template Directory

The starter SHALL provide a `template/` directory containing the files imported into generated projects.

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
- **AND** `openspec/`.

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

The template SHALL provide the base workspace configuration for pnpm and Nx.

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
- **AND** it SHALL define common validation scripts.

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

