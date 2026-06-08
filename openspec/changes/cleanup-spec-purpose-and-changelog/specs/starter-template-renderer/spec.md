## MODIFIED Requirements

### Requirement: Starter Render Command

The starter repository SHALL provide a generic starter-owned renderer for generating projects from the starter template.

#### Scenario: Productive render script exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `starter:render` script SHALL exist
- **AND** it SHALL invoke the starter-owned template renderer.

#### Scenario: Renderer uses starter metadata

- **WHEN** the renderer runs
- **THEN** it SHALL read `starter.yaml` to determine the template path, placeholder behaviour, declared variants, and overlay paths.

#### Scenario: Renderer is variant-agnostic

- **WHEN** the renderer is implemented
- **THEN** it SHALL support declared variants generically
- **AND** it SHALL NOT hardcode concrete variant-specific rendering rules.

#### Scenario: Starter metadata declares renderer engine

- **WHEN** `starter.yaml` is inspected
- **THEN** `template.engine` SHALL identify the starter-owned renderer.