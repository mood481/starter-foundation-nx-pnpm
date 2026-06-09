# mws-foundation-variant Specification

## Purpose

The mws-foundation-variant specification defines the contract for the MWS-compatible variant overlay, including MWS project metadata, generated documentation, OpenSpec baseline, and variant render validation.
## Requirements
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
- **THEN** it SHALL add only foundation metadata, documentation, and OpenSpec specs
- **AND** it MUST NOT add application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability modules.

### Requirement: MWS Project Metadata

Projects generated with the `mws` variant SHALL include root MWS project metadata.

#### Scenario: Metadata file is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `mws.project.yaml` SHALL exist at the generated project root.

#### Scenario: Metadata identifies project

- **WHEN** rendered `mws.project.yaml` is inspected
- **THEN** it SHALL include the generated project id
- **AND** it SHALL include the generated project name
- **AND** it SHALL include the generated project slug
- **AND** it SHALL include the generated project description.

#### Scenario: Metadata retains starter provenance

- **WHEN** rendered `mws.project.yaml` is inspected
- **THEN** it SHALL include the starter id
- **AND** it SHALL include the starter version
- **AND** it SHALL identify the selected variant as `mws`.

#### Scenario: Metadata declares foundation lifecycle

- **WHEN** rendered `mws.project.yaml` is inspected
- **THEN** it SHALL declare the lifecycle phase as `foundation`
- **AND** it SHALL declare no modules by default.

### Requirement: MWS Variant Selection Input

The starter repository SHALL document MWS variant selection through the generic starter renderer and a structured render input file.

#### Scenario: MWS render input example exists

- **WHEN** the starter repository is inspected
- **THEN** `examples/render-input.mws.yaml` SHALL exist.

#### Scenario: MWS render input selects variant

- **WHEN** `examples/render-input.mws.yaml` is inspected
- **THEN** it SHALL select the `mws` variant.

#### Scenario: MWS render input includes required project id

- **WHEN** `examples/render-input.mws.yaml` is inspected
- **THEN** it SHALL include `PROJECT_ID` under structured placeholders.

#### Scenario: MWS render input includes base placeholders

- **WHEN** `examples/render-input.mws.yaml` is inspected
- **THEN** it SHALL include base project placeholders for project name, project slug, project description, and default package scope.

#### Scenario: MWS uses generic renderer selection

- **WHEN** a project is generated with the `mws` variant
- **THEN** the `mws` overlay SHALL be selected through the generic starter renderer.

### Requirement: MWS Generated Documentation

Projects generated with the `mws` variant SHALL include MWS-specific foundation documentation.

#### Scenario: MWS documentation is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `docs/mws.md` SHALL exist.

#### Scenario: MWS OpenSpec operation documentation is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `docs/mws-openspec.md` SHALL exist.

#### Scenario: MWS documentation explains variant usage

- **WHEN** `docs/mws.md` is inspected
- **THEN** it SHALL explain that the repository was generated with the `mws` variant
- **AND** it SHALL identify `mws.project.yaml` as the generated project metadata file
- **AND** it SHOULD explain that later modules and capabilities are added through module starters and OpenSpec changes.

#### Scenario: MWS OpenSpec operation documentation explains human workflow

- **WHEN** `docs/mws-openspec.md` is inspected
- **THEN** it SHALL explain how human maintainers use local OpenSpec scripts for development and review
- **AND** it SHALL explain that local assistant command packs are not part of the generated template or MWS variant contract.

### Requirement: MWS Generated OpenSpec Baseline

Projects generated with the `mws` variant SHALL include an importable OpenSpec spec for MWS foundation lifecycle expectations.

#### Scenario: MWS lifecycle spec is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `openspec/specs/mws-project-lifecycle/spec.md` SHALL exist.

#### Scenario: MWS lifecycle spec stays generated-project focused

- **WHEN** `openspec/specs/mws-project-lifecycle/spec.md` is inspected
- **THEN** it SHALL describe generated-project expectations
- **AND** it MUST NOT describe the internal implementation of MWS orchestration services.

#### Scenario: MWS variant replaces generated OpenSpec config

- **WHEN** the `mws` overlay is applied
- **THEN** it SHALL replace `openspec/config.yaml` as a full file.

#### Scenario: MWS OpenSpec config is stricter than neutral config

- **WHEN** rendered `openspec/config.yaml` is inspected for an MWS generated project
- **THEN** it SHALL declare `schema: spec-driven`
- **AND** it SHALL retain rendered project identity and starter provenance
- **AND** it SHALL include MWS-specific rules for deterministic, high-reliability implementation
- **AND** it SHALL NOT copy starter-maintenance root context.

### Requirement: MWS Variant Render Validation

The starter repository SHALL validate the rendered output of the `mws` variant.

#### Scenario: MWS validation command exists

- **WHEN** root package scripts are inspected
- **THEN** a `validate:template:mws` command SHALL exist.

#### Scenario: MWS validation uses generic renderer

- **WHEN** `validate:template:mws` is run
- **THEN** it SHALL render the `mws` variant through the generic starter renderer semantics.

#### Scenario: MWS render resolves all placeholders

- **WHEN** MWS variant render validation runs
- **THEN** the rendered output SHALL contain no unresolved double-underscore placeholders.

#### Scenario: MWS render includes overlay files

- **WHEN** MWS variant render validation runs
- **THEN** the rendered output SHALL include `mws.project.yaml`
- **AND** it SHALL include `docs/mws.md`
- **AND** it SHALL include `docs/mws-openspec.md`
- **AND** it SHALL include `openspec/config.yaml`
- **AND** it SHALL include `openspec/specs/mws-project-lifecycle/spec.md`.

#### Scenario: Neutral render excludes MWS overlay files

- **WHEN** neutral template render validation runs without selecting a variant
- **THEN** the rendered output SHALL NOT include `mws.project.yaml`
- **AND** it SHALL NOT include `docs/mws.md`
- **AND** it SHALL NOT include `docs/mws-openspec.md`
- **AND** it SHALL NOT include `openspec/specs/mws-project-lifecycle/spec.md`.

