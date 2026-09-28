# Foundation Starter Specification

## ADDED Requirements

### Requirement: Neutral Foundation Starter

The starter repository SHALL define a neutral foundation starter for Nx + pnpm monorepos.

#### Scenario: Starter identity is declared

- **WHEN** a consumer inspects the starter metadata
- **THEN** the starter id SHALL be `foundation-nx-pnpm`
- **AND** the starter kind SHALL be `foundation`
- **AND** the starter SHALL declare a semantic version.

#### Scenario: Starter remains neutral

- **WHEN** the neutral starter is used
- **THEN** it MUST NOT require any concrete variant metadata
- **AND** it MUST NOT require a variant-specific renderer
- **AND** it MUST NOT include concrete variant files.

### Requirement: Starter Metadata Contract

The starter repository SHALL provide a root `starter.yaml` file describing how the starter is consumed.

#### Scenario: Template path is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `template.path` as `template`.

#### Scenario: Placeholder strategy is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare the placeholder style
- **AND** it SHALL require unresolved placeholders to fail rendering.

#### Scenario: SDD provider is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare OpenSpec as the default SDD provider
- **AND** it SHALL declare the SDD root as `openspec`.

#### Scenario: Variant map is declared

- **WHEN** the initial `starter.yaml` file is read
- **THEN** it SHALL declare `variants`
- **AND** `variants` SHALL be empty for the neutral initial contract.

### Requirement: Starter Repository Separation

The starter repository SHALL separate its own OpenSpec artifacts from the OpenSpec artifacts imported into generated projects.

#### Scenario: Starter development OpenSpec exists

- **WHEN** maintainers evolve the starter
- **THEN** they SHALL use the root `openspec/` directory of the starter repository.

#### Scenario: Importable OpenSpec exists inside template

- **WHEN** a project is generated from the starter
- **THEN** it SHALL receive OpenSpec specs from `template/openspec/specs/`
- **AND** it MUST NOT receive the root active changes used to build the starter.

### Requirement: No Concrete Variant In Initial Contract

The initial foundation starter SHALL be variant-ready but SHALL NOT define any concrete variant.

#### Scenario: Variants are initially empty

- **WHEN** the initial `starter.yaml` is read
- **THEN** the `variants` map SHALL be empty.

#### Scenario: Concrete variants are introduced later

- **WHEN** this change is implemented
- **THEN** no concrete variant directory SHALL be created.
