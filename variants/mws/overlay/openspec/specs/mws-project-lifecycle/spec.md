# MWS Project Lifecycle

## Purpose

Define the foundation lifecycle expectations for repositories generated with the MWS variant.

## Requirements

### Requirement: MWS Foundation Metadata

An MWS generated project SHALL include root metadata that identifies the project and selected starter variant.

#### Scenario: Metadata file exists

- **WHEN** an MWS generated project is inspected
- **THEN** `mws.project.yaml` SHALL exist at the repository root.

#### Scenario: Metadata identifies selected variant

- **WHEN** `mws.project.yaml` is inspected
- **THEN** it SHALL identify the selected variant as `mws`.

#### Scenario: Metadata identifies project

- **WHEN** `mws.project.yaml` is inspected
- **THEN** it SHALL include the generated project id
- **AND** it SHALL include the generated project name
- **AND** it SHALL include the generated project slug.

### Requirement: Foundation Lifecycle Phase

An MWS generated project SHALL start in the foundation lifecycle phase without selected modules.

#### Scenario: Foundation phase is declared

- **WHEN** `mws.project.yaml` is inspected
- **THEN** it SHALL declare lifecycle phase `foundation`.

#### Scenario: No modules are selected by default

- **WHEN** `mws.project.yaml` is inspected
- **THEN** lifecycle modules SHALL be empty by default.

### Requirement: Future MWS Modules

MWS modules SHALL be added only through explicit later changes or module starters.

#### Scenario: Foundation contains no application modules

- **WHEN** an MWS generated project is first rendered
- **THEN** it SHALL NOT include application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability modules by default.

#### Scenario: Later modules require explicit scope

- **WHEN** a later MWS module or capability is added
- **THEN** the change SHALL explicitly describe module scope, generated files, metadata updates, and validation requirements.
