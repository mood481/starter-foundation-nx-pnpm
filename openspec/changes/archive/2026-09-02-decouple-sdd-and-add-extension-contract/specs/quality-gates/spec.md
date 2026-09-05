## MODIFIED Requirements

### Requirement: Rendered Template Validation

The starter repository SHALL provide an automated validation command that renders the neutral template through the generic starter renderer and verifies the rendered SDD-neutral generated project.

#### Scenario: Template validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:template` script SHALL exist.

#### Scenario: Spec-only validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:spec` script SHALL exist
- **AND** it SHALL run strict OpenSpec validation for the starter repository
- **AND** it MUST NOT be required in the generated neutral project.

#### Scenario: Template is rendered to temporary output

- **WHEN** `pnpm validate:template` is run
- **THEN** it SHALL render the neutral template through the generic starter renderer into a temporary generated-project directory
- **AND** it SHALL resolve the neutral starter placeholders using deterministic validation values
- **AND** it SHALL use zero selected extensions.

#### Scenario: Validation uses renderer semantics

- **WHEN** `pnpm validate:template` renders the neutral template
- **THEN** it SHALL use the same template path, placeholder resolution, output safety, extension-empty-set, and unresolved-placeholder semantics as `pnpm starter:render`.

#### Scenario: Neutral output has no SDD artifacts

- **WHEN** rendered-template validation scans the generated-project directory
- **THEN** it MUST fail if OpenSpec or another concrete SDD artifact, dependency, or generated-project SDD script is present in a neutral render.

#### Scenario: Unresolved placeholders fail validation

- **WHEN** rendered-template validation scans the generated-project directory
- **AND** unresolved double-underscore placeholders remain
- **THEN** validation MUST fail before generated-project dependency installation succeeds.

#### Scenario: Rendered project installs reproducibly

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm install --frozen-lockfile` in the rendered generated-project directory.

#### Scenario: Rendered project validation runs

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm validate` in the rendered generated-project directory
- **AND** that validation MUST use the neutral workspace quality gates without a concrete SDD validator.

#### Scenario: Rendered project graph is generated

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm nx graph --file=tmp/nx-graph.json` in the rendered generated-project directory.

#### Scenario: Repository validation includes template validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run strict OpenSpec validation for the starter repository
- **AND** it SHALL run rendered-template validation.

#### Scenario: Template validation remains neutral

- **WHEN** rendered-template validation is implemented
- **THEN** it MUST NOT introduce concrete SDD, variant, overlay, extension, module, application, service, API, auth, storage, observability, or infrastructure behaviour.

## REMOVED Requirements

### Requirement: Generated Spec Validation Gate

**Reason**: A neutral generated project no longer contains an OpenSpec provider, so generated `pnpm validate` must not require OpenSpec validation.

**Migration**: Keep strict OpenSpec validation in the starter repository through root `pnpm validate:spec` and `pnpm validate`, and let a selected variant or future extension declare its own additive validation when it provisions an SDD.
