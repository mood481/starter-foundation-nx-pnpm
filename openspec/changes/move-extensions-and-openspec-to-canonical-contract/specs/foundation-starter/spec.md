## MODIFIED Requirements

### Requirement: Neutral Foundation Starter

The starter repository SHALL define a neutral foundation starter for Nx + pnpm monorepos, delegating render/validation contracts to the canonical starter-toolkit while allowing approved variants and optional external extensions outside the neutral template.

#### Scenario: Starter identity is declared

- **WHEN** a consumer inspects the starter metadata
- **THEN** the starter id SHALL be `foundation-nx-pnpm`
- **AND** the starter kind SHALL be `foundation`
- **AND** the release version SHALL be owned by package/distribution metadata such as `package.json` rather than a hard-coded number in the specification.

#### Scenario: Neutral template remains variant-independent

- **WHEN** the neutral template is used without selecting a variant or extension
- **THEN** it MUST NOT require any concrete variant metadata
- **AND** it MUST NOT require a variant-specific renderer
- **AND** it MUST NOT include concrete variant generated files
- **AND** it MUST NOT require or include a concrete SDD provider.

#### Scenario: Approved variants may exist outside the neutral template

- **WHEN** a concrete variant or an optional external extension is selected by the canonical render contract
- **THEN** its contributions SHALL be applied separately from the neutral template
- **AND** the neutral template SHALL remain usable without that variant or extension.

### Requirement: Starter Metadata Contract

The starter repository SHALL provide a root `starter.yaml` conforming to the canonical starter contract (schema version, identity, modes, template, variants, and provides) and SHALL NOT declare repository-owned extension descriptors or a default SDD provider.

#### Scenario: Schema version and modes are declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `schemaVersion`
- **AND** it SHALL declare `modes` and a `defaultMode` that names an enabled mode.

#### Scenario: Template path is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `template.path` as `template`.

#### Scenario: Placeholder strategy is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare the required placeholder keys
- **AND** it SHALL require unresolved placeholders to fail rendering.

#### Scenario: SDD provider is declared

- **WHEN** the neutral `starter.yaml` file is read
- **THEN** it MUST NOT declare a default SDD provider
- **AND** it MUST NOT declare a neutral SDD root
- **AND** it MUST NOT declare importable SDD paths.

#### Scenario: Extension defaults are declared without bundling an extension

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL NOT contain a repository extension-declaration or extension-group block
- **AND** `provides` SHALL list only capabilities this starter actually provides (for example `workspace`, `nx`, `pnpm`, `multi-language`)
- **AND** any concrete extension SHALL be supplied externally under the toolkit render-extension contract, not declared here.

#### Scenario: Variant map is declared

- **WHEN** the `starter.yaml` file is read
- **THEN** it SHALL declare `variants`
- **AND** `variants` SHALL be represented as a map keyed by variant id.

#### Scenario: Variant entries may declare required placeholders

- **WHEN** a concrete variant requires additional rendering data
- **THEN** its `starter.yaml` entry SHALL support an optional declaration of variant-specific required placeholders.

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

- **WHEN** the starter repository is inspected
- **THEN** the repository SHALL provide a `validate:template:mws` command that validates the rendered `mws` variant
- **AND** the variant MAY optionally declare additional validation commands in `starter.yaml` but is not required to.

#### Scenario: Neutral template remains default

- **WHEN** a project is generated without selecting a variant
- **THEN** MWS overlay files SHALL NOT be included in the generated project.
