# foundation-starter Specification

## Purpose

The foundation-starter specification defines the contract for a neutral starter template that provides a baseline structure for generating new projects using the OpenSpec framework. This specification outlines the expected directory layout, project structure, and workspace configuration for generated projects.
## Requirements
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

### Requirement: Variant Overlay Contract

The starter repository SHALL define a neutral contract for future variants and overlays without introducing a concrete variant.

#### Scenario: Variants remain map-based

- **WHEN** the root `starter.yaml` contract is inspected
- **THEN** variants SHALL be represented as a map keyed by variant id.

#### Scenario: Initial variant map remains empty

- **WHEN** this change is implemented
- **THEN** `variants` SHALL remain empty
- **AND** no concrete variant SHALL be declared.

#### Scenario: Future variant metadata shape is defined

- **WHEN** documentation or specs describe a future variant entry
- **THEN** the entry SHALL support a human-readable name
- **AND** it SHALL support a description
- **AND** it MAY support an overlay path
- **AND** it MAY support additional validation commands.

#### Scenario: Overlay paths are starter-root relative

- **WHEN** a future variant declares an overlay path
- **THEN** the path SHALL be relative to the starter repository root
- **AND** it SHALL NOT be interpreted relative to `template/`.

#### Scenario: Overlay content is separate from neutral template

- **WHEN** future overlay content is added
- **THEN** it SHALL live outside `template/`
- **AND** it SHALL NOT require changing the neutral template for unrelated variants.

#### Scenario: Overlay OpenSpec config replacement is explicit

- **WHEN** a future overlay includes `openspec/config.yaml`
- **THEN** it SHALL replace the generated `openspec/config.yaml` as a full file
- **AND** it SHALL NOT rely on YAML merge or partial override semantics.

#### Scenario: Overlay OpenSpec config preserves base guarantees

- **WHEN** a future overlay replaces `openspec/config.yaml`
- **THEN** the replacement SHALL declare `schema: spec-driven`
- **AND** it SHALL retain rendered project identity and starter provenance
- **AND** it SHALL NOT copy starter-maintenance root context
- **AND** it SHALL preserve or strengthen generated-project authoring and validation rules
- **AND** it SHALL render without unresolved placeholders.

#### Scenario: Variant validations preserve base validations

- **WHEN** a future variant declares validation commands
- **THEN** those validations SHALL be additive to the neutral starter validations unless a later approved change modifies the base validation contract.

#### Scenario: No concrete variant is introduced

- **WHEN** this change is implemented
- **THEN** no `variants/` directory SHALL be created
- **AND** no `variants/mws/` directory SHALL be created
- **AND** no variant-specific generated files SHALL be added.

