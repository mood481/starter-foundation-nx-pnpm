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
- **THEN** it SHALL add only foundation metadata, documentation, and OpenSpec specs
- **AND** it MUST NOT add application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability modules.