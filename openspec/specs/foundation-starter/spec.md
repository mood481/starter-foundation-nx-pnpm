# foundation-starter Specification

## Purpose

The foundation-starter specification defines the contract for a neutral starter template that provides a baseline structure for generating new projects using the OpenSpec framework. This specification outlines the expected directory layout, project structure, and workspace configuration for generated projects.

## Requirements

### Requirement: Neutral Foundation Starter

The starter repository SHALL define a neutral foundation starter for Nx + pnpm monorepos while allowing approved variants and optional extensions outside the neutral template.

#### Scenario: Starter identity is declared

- **WHEN** a consumer inspects the starter metadata
- **THEN** the starter id SHALL be `foundation-nx-pnpm`
- **AND** the starter kind SHALL be `foundation`
- **AND** the starter SHALL declare a semantic version
- **AND** the `0.5.0` release SHALL identify version `0.5.0`.

#### Scenario: Neutral template remains variant-independent

- **WHEN** the neutral template is used without selecting a variant or extension
- **THEN** it MUST NOT require any concrete variant metadata
- **AND** it MUST NOT require a variant-specific renderer
- **AND** it MUST NOT include concrete variant generated files
- **AND** it MUST NOT require or include a concrete SDD provider.

#### Scenario: Approved variants may exist outside the neutral template

- **WHEN** a concrete variant or optional extension is selected by an approved render contract
- **THEN** its contributions SHALL be applied separately from the neutral template
- **AND** the neutral template SHALL remain usable without that variant or extension.

### Requirement: Starter Metadata Contract

The starter repository SHALL provide a root `starter.yaml` file describing how the starter is consumed, including placeholder, variant, and optional-extension declarations.

#### Scenario: Template path is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `template.path` as `template`.

#### Scenario: Placeholder strategy is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare the placeholder style
- **AND** it SHALL require unresolved placeholders to fail rendering.

#### Scenario: SDD provider is declared

- **WHEN** the neutral `starter.yaml` file is read
- **THEN** it MUST NOT declare a default SDD provider
- **AND** it MUST NOT declare a neutral SDD root
- **AND** it MUST NOT declare importable SDD paths.

#### Scenario: Extension defaults are declared without bundling an extension

- **WHEN** the `starter.yaml` file is read
- **THEN** its `extensions` field SHALL be an empty list (`[]`)
- **AND** its optional `extensionGroups` field SHALL be an empty map when no group is provided
- **AND** its `provides` list SHALL include `extension-support`
- **AND** it MUST NOT declare a concrete extension descriptor.

#### Scenario: Variant map is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `variants`
- **AND** `variants` SHALL be represented as a map keyed by variant id.

#### Scenario: Variant entries may declare required placeholders

- **WHEN** a concrete variant requires additional rendering data
- **THEN** its `starter.yaml` entry SHALL support an optional declaration of variant-specific required placeholders.

### Requirement: Starter Repository Separation

The starter repository SHALL keep its own OpenSpec maintenance artifacts separate from optional SDD or capability content rendered into generated projects.

#### Scenario: Starter development OpenSpec exists

- **WHEN** maintainers evolve the starter
- **THEN** they SHALL use the root `openspec/` directory of the starter repository
- **AND** root OpenSpec dependencies and package scripts SHALL remain available for starter maintenance.

#### Scenario: Importable OpenSpec exists inside template

- **WHEN** a project is generated without a variant or extension
- **THEN** root active `openspec/changes/` SHALL NOT be copied into the generated project
- **AND** the neutral generated output SHALL NOT receive a concrete SDD directory, configuration, specs, dependency, or scripts.

#### Scenario: Selected capability content is opt-in

- **WHEN** a selected variant or extension contributes SDD or other capability content
- **THEN** that content SHALL be attributable to the selected contribution
- **AND** it SHALL NOT be treated as part of the neutral foundation baseline.

### Requirement: Variant Overlay Contract

The starter repository SHALL define the contract for variant and overlay metadata, application order, and validation expectations independently from the extension contract.

#### Scenario: Variants remain map-based

- **WHEN** the root `starter.yaml` contract is inspected
- **THEN** variants SHALL be represented as a map keyed by variant id.

#### Scenario: Variant metadata shape supports overlay and validation entries

- **WHEN** a variant entry is declared in `starter.yaml`
- **THEN** the entry SHALL support a human-readable name
- **AND** it SHALL support a description
- **AND** it SHALL support an optional overlay path
- **AND** it SHALL support optional required placeholders
- **AND** it SHALL support optional additional validation commands.

#### Scenario: Overlay paths are starter-root relative

- **WHEN** a variant declares an overlay path
- **THEN** the path SHALL be relative to the starter repository root
- **AND** it SHALL NOT be interpreted relative to `template/`.

#### Scenario: Overlay content is separate from neutral template

- **WHEN** overlay content is added as part of a variant
- **THEN** it SHALL live outside `template/`
- **AND** it SHALL NOT require changing the neutral template for unrelated variants.

#### Scenario: Overlay OpenSpec config replacement is explicit

- **WHEN** a variant overlay contributes a file path
- **THEN** an absent path SHALL be added
- **AND** a colliding path SHALL replace the target as a full file
- **AND** the renderer SHALL NOT infer YAML merge or partial override semantics.

#### Scenario: Overlay OpenSpec config preserves base guarantees

- **WHEN** a variant overlay provides an SDD configuration
- **THEN** the configuration SHALL retain rendered project identity and starter provenance when those fields are part of that variant's contract
- **AND** it SHALL NOT copy starter-maintenance root context
- **AND** it SHALL render without unresolved placeholders

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
