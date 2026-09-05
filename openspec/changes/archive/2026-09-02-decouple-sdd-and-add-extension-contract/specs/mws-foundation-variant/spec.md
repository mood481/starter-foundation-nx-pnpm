## MODIFIED Requirements

### Requirement: MWS Generated OpenSpec Baseline

Projects generated with the `mws` variant SHALL include an MWS-provided OpenSpec baseline as an explicit variant contribution; this requirement does not make OpenSpec part of the neutral template.

#### Scenario: MWS lifecycle spec is added

- **WHEN** a project is generated with the `mws` variant
- **THEN** `openspec/specs/mws-project-lifecycle/spec.md` SHALL exist.

#### Scenario: MWS lifecycle spec stays generated-project focused

- **WHEN** `openspec/specs/mws-project-lifecycle/spec.md` is inspected
- **THEN** it SHALL describe generated-project expectations
- **AND** it MUST NOT describe the internal implementation of MWS orchestration services.

#### Scenario: MWS variant replaces generated OpenSpec config

- **WHEN** the `mws` overlay is applied
- **THEN** it SHALL add `openspec/config.yaml` as a complete variant-provided file
- **AND** it SHALL NOT depend on a neutral `openspec/config.yaml`
- **AND** it SHALL not be interpreted through YAML merge or partial override semantics.

#### Scenario: MWS OpenSpec config is stricter than neutral config

- **WHEN** rendered `openspec/config.yaml` is inspected for an MWS generated project
- **THEN** it SHALL declare `schema: spec-driven`
- **AND** it SHALL retain rendered project identity and starter provenance
- **AND** it SHALL include MWS-specific rules for deterministic, high-reliability implementation
- **AND** it SHALL NOT copy starter-maintenance root context.
