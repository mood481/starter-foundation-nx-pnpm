## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: No Concrete Variant In Initial Contract

This requirement is removed because the initial neutral contract has already been established and this change introduces the first approved concrete variant. The replacement requirements preserve neutrality at the `template/` level while allowing approved variants outside `template/`.

## ADDED Requirements

### Requirement: Approved Variant Declaration

The starter repository SHALL allow concrete variants only when introduced by approved changes.

#### Scenario: MWS variant is declared

- **WHEN** this change is implemented
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
