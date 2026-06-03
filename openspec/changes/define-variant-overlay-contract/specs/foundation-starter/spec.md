## ADDED Requirements

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
