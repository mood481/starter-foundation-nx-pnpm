## MODIFIED Requirements

### Requirement: MWS Foundation Variant Overlay

The starter repository SHALL provide an `mws` variant overlay for generating MWS-compatible foundation repositories.

#### Scenario: MWS overlay directory exists

- **WHEN** the starter repository is inspected
- **THEN** `variants/mws/overlay/` SHALL exist.

#### Scenario: MWS overlay is separate from neutral template

- **WHEN** the `mws` variant overlay is inspected
- **THEN** its files SHALL live outside `template/`
- **AND** the neutral template SHALL remain usable without selecting `mws`.

#### Scenario: MWS overlay adds only foundation content

- **WHEN** the `mws` overlay is inspected
- **THEN** it SHALL add only MWS foundation metadata and foundation documentation
- **AND** it SHALL NOT add an OpenSpec/SDD baseline, application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability modules.

### Requirement: MWS Variant Selection Input

The starter repository SHALL document MWS variant selection through the canonical `@mood481/starter-renderer` and a structured render request file.

#### Scenario: MWS render input example exists

- **WHEN** the starter repository is inspected
- **THEN** `examples/render.mws.yaml` SHALL exist.

#### Scenario: MWS render input selects variant

- **WHEN** `examples/render.mws.yaml` is inspected
- **THEN** it SHALL select the `mws` variant.

#### Scenario: MWS render input includes required project id

- **WHEN** `examples/render.mws.yaml` is inspected
- **THEN** it SHALL include `PROJECT_ID` under structured placeholders.

#### Scenario: MWS render input includes base placeholders

- **WHEN** `examples/render.mws.yaml` is inspected
- **THEN** it SHALL include base project placeholders for project name, project slug, project description, and default package scope.

#### Scenario: MWS uses generic renderer selection

- **WHEN** a project is generated with the `mws` variant
- **THEN** the `mws` overlay SHALL be selected through the canonical `starter-render`.

### Requirement: MWS Variant Render Validation

The starter repository SHALL validate the rendered output of the `mws` variant.

#### Scenario: MWS validation command exists

- **WHEN** root package scripts are inspected
- **THEN** a `validate:template:mws` command SHALL exist.

#### Scenario: MWS validation uses generic renderer

- **WHEN** `validate:template:mws` is run
- **THEN** it SHALL render the `mws` variant through the canonical `starter-render` semantics.

#### Scenario: MWS render resolves all placeholders

- **WHEN** MWS variant render validation runs
- **THEN** the rendered output SHALL contain no unresolved double-underscore placeholders.

#### Scenario: MWS render includes overlay files

- **WHEN** MWS variant render validation runs
- **THEN** the rendered output SHALL include `mws.project.yaml`
- **AND** it SHALL include `docs/mws.md`.

#### Scenario: Neutral render excludes MWS overlay files

- **WHEN** neutral template render validation runs without selecting a variant
- **THEN** the rendered output SHALL NOT include `mws.project.yaml`
- **AND** it SHALL NOT include `docs/mws.md`.

## ADDED Requirements

### Requirement: MWS Generated Variant Documentation

Projects generated with the `mws` variant SHALL include MWS-specific foundation documentation that describes the variant without implying a bundled SDD provider.

#### Scenario: MWS documentation is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `docs/mws.md` SHALL exist.

#### Scenario: MWS documentation explains variant usage

- **WHEN** `docs/mws.md` is inspected
- **THEN** it SHALL explain that the repository was generated with the `mws` variant
- **AND** it SHALL identify `mws.project.yaml` as the generated project metadata file
- **AND** it SHALL NOT claim that the `mws` variant provides an OpenSpec/SDD baseline.

## REMOVED Requirements

### Requirement: MWS Generated OpenSpec Baseline

**Reason**: OpenSpec is no longer contributed by the `mws` variant; it is an optional external extension resolved through the canonical toolkit render-extension contract, and the variant overlay no longer ships `openspec/config.yaml` or a lifecycle spec.

**Migration**: The `mws` variant contributes only `mws.project.yaml` and `docs/mws.md`. Any generated OpenSpec/SDD content must come from an explicitly selected external extension under the toolkit contract, not from the variant.

### Requirement: MWS Generated Documentation

**Reason**: This requirement bundled an `docs/mws-openspec.md` deliverable that the `mws` overlay no longer provides; the variant-documentation behavior is redefined without OpenSpec.

**Migration**: Replaced by `MWS Generated Variant Documentation`, which asserts only `docs/mws.md` for the variant.
