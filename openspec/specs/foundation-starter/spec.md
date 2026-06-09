# foundation-starter Specification

## Purpose

The foundation-starter specification defines the contract for a neutral starter template that provides a baseline structure for generating new projects using the OpenSpec framework. This specification outlines the expected directory layout, project structure, and workspace configuration for generated projects.

## Requirements
### Requirement: Neutral Foundation Starter

The starter repository SHALL define a neutral foundation starter for Nx + pnpm monorepos while allowing approved variants outside the neutral template.

#### Scenario: Starter identity is declared

- **WHEN** a consumer inspects the starter metadata
- **THEN** the starter id SHALL be `foundation-nx-pnpm`
- **AND** the starter kind SHALL be `foundation`
- **AND** the starter SHALL declare a semantic version.

#### Scenario: Neutral template remains variant-independent

- **WHEN** the neutral template is used without selecting a variant
- **THEN** it MUST NOT require any concrete variant metadata
- **AND** it MUST NOT require a variant-specific renderer
- **AND** it MUST NOT include concrete variant generated files.

#### Scenario: Approved variants may exist outside the neutral template

- **WHEN** a concrete variant is introduced by an approved change
- **THEN** the variant files SHALL live outside `template/`
- **AND** the neutral template SHALL remain usable without that variant.

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

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `variants`
- **AND** `variants` SHALL be represented as a map keyed by variant id.

#### Scenario: Variant entries may declare required placeholders

- **WHEN** a concrete variant requires additional rendering data
- **THEN** its `starter.yaml` entry MAY declare variant-specific required placeholders.

### Requirement: Starter Repository Separation

The starter repository SHALL separate its own OpenSpec artifacts from the OpenSpec artifacts imported into generated projects.

#### Scenario: Starter development OpenSpec exists

- **WHEN** maintainers evolve the starter
- **THEN** they SHALL use the root `openspec/` directory of the starter repository.

#### Scenario: Importable OpenSpec exists inside template

- **WHEN** a project is generated from the starter
- **THEN** it SHALL receive OpenSpec specs from `template/openspec/specs/`
- **AND** it MUST NOT receive the root active changes used to build the starter.

### Requirement: Variant Overlay Contract

The starter repository SHALL define the contract for variant and overlay metadata, application order, and validation expectations.

#### Scenario: Variants remain map-based

- **WHEN** the root `starter.yaml` contract is inspected
- **THEN** variants SHALL be represented as a map keyed by variant id.

#### Scenario: Variant metadata shape supports overlay and validation entries

- **WHEN** a variant entry is declared in `starter.yaml`
- **THEN** the entry SHALL support a human-readable name
- **AND** it SHALL support a description
- **AND** it MAY support an overlay path
- **AND** it MAY support required placeholders
- **AND** it MAY support additional validation commands.

#### Scenario: Overlay paths are starter-root relative

- **WHEN** a variant declares an overlay path
- **THEN** the path SHALL be relative to the starter repository root
- **AND** it SHALL NOT be interpreted relative to `template/`.

#### Scenario: Overlay content is separate from neutral template

- **WHEN** overlay content is added as part of a variant
- **THEN** it SHALL live outside `template/`
- **AND** it SHALL NOT require changing the neutral template for unrelated variants.

#### Scenario: Overlay OpenSpec config replacement is explicit

- **WHEN** an overlay includes `openspec/config.yaml`
- **THEN** it SHALL replace the generated `openspec/config.yaml` as a full file
- **AND** it SHALL NOT rely on YAML merge or partial override semantics.

#### Scenario: Overlay OpenSpec config preserves base guarantees

- **WHEN** an overlay replaces `openspec/config.yaml`
- **THEN** the replacement SHALL declare `schema: spec-driven`
- **AND** it SHALL retain rendered project identity and starter provenance
- **AND** it SHALL NOT copy starter-maintenance root context
- **AND** it SHALL preserve or strengthen generated-project authoring and validation rules
- **AND** it SHALL render without unresolved placeholders.

#### Scenario: Variant validations preserve base validations

- **WHEN** a variant declares validation commands
- **THEN** those validations SHALL be additive to the neutral starter validations unless a later approved change modifies the base validation contract.

### Requirement: Approved Variant Declaration

The starter repository SHALL allow concrete variants only when introduced by approved changes.

#### Scenario: MWS variant is declared

- **WHEN** the starter repository is inspected
- **THEN** `starter.yaml` SHALL declare a `mws` variant under `variants`.

#### Scenario: MWS variant declares overlay path

- **WHEN** `starter.yaml` is inspected
- **THEN** `variants.mws.overlay.path` SHALL be `variants/mws/overlay`.

#### Scenario: MWS variant declares additional required placeholder

- **WHEN** `starter.yaml` is inspected
- **THEN** `variants.mws.placeholders.required` SHALL include `PROJECT_ID`.

#### Scenario: MWS variant validation is declared

- **WHEN** `starter.yaml` is inspected
- **THEN** `variants.mws.validations` SHALL include a command that validates the rendered MWS variant.

#### Scenario: Neutral template remains default

- **WHEN** a project is generated without selecting a variant
- **THEN** MWS overlay files SHALL NOT be included in the generated project.

