# Workspace Structure

## Purpose

Defines the monorepo directory layout, workspace configuration, and placeholder rendering contract for the generated project.

## Requirements

### Requirement: Monorepo Directories

The generated project SHALL provide a predictable monorepo directory layout.

#### Scenario: Application directory exists

- **WHEN** the generated project is inspected
- **THEN** an `apps/` directory SHALL exist for application projects.

#### Scenario: Service directory exists

- **WHEN** the generated project is inspected
- **THEN** a `services/` directory SHALL exist for backend services, APIs, workers, and service runtimes.

#### Scenario: Package directory exists

- **WHEN** the generated project is inspected
- **THEN** a `packages/` directory SHALL exist for shared libraries and reusable packages.

#### Scenario: Tools directory exists

- **WHEN** the generated project is inspected
- **THEN** a `tools/` directory SHALL exist for project-local scripts, generators, and automation tools.

#### Scenario: Documentation directory exists

- **WHEN** the generated project is inspected
- **THEN** a `docs/` directory SHALL exist.

### Requirement: Workspace Configuration

The generated project SHALL provide base workspace configuration.

#### Scenario: pnpm workspace is configured

- **WHEN** the generated project is inspected
- **THEN** `pnpm-workspace.yaml` SHALL exist
- **AND** it SHALL declare workspace package globs for `apps/*`, `services/*`, `packages/*`, and `tools/*`.

#### Scenario: pnpm lockfile exists

- **WHEN** the generated project is inspected
- **THEN** `pnpm-lock.yaml` SHALL exist to support reproducible dependency installation.

#### Scenario: Build output is excluded

- **WHEN** the pnpm workspace configuration is inspected
- **THEN** `dist/` and `build/` directories SHALL be excluded from workspace package matching.

### Requirement: Placeholder Rendering

Placeholder rendering SHALL produce resolved files from the template. Unresolved placeholders MUST fail the render process.

#### Scenario: Placeholder style is consistent

- **WHEN** placeholders are used in template files
- **THEN** they SHALL use double-underscore syntax such as `__PROJECT_SLUG__`.

#### Scenario: Unresolved placeholders fail validation

- **WHEN** rendering completes
- **AND** unresolved placeholders remain
- **THEN** the render process MUST fail.
