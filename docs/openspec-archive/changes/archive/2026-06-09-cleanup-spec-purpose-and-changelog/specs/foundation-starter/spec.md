## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Initial variant map remains empty

**Reason**: The initial variant map is no longer empty; the `mws` variant is now declared. This transitional scenario contradicts the current repository state.

**Migration**: Superseded by the `Approved Variant Declaration` requirement and the `Variant Overlay Contract` requirement which together govern variant declarations.

### Requirement: No concrete variant is introduced

**Reason**: Concrete variants now exist (e.g., `mws`). This transitional scenario contradicts the current repository state.

**Migration**: Superseded by the `Approved Variant Declaration` requirement and the variant overlay contract.