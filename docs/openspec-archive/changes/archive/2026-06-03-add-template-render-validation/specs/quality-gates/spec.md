## ADDED Requirements

### Requirement: Rendered Template Validation

The starter repository SHALL provide an automated validation command that renders the neutral template and verifies the rendered generated project.

#### Scenario: Template validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:template` script SHALL exist.

#### Scenario: Spec-only validation command exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `validate:spec` script SHALL exist
- **AND** it SHALL run strict OpenSpec validation without rendered-template validation.

#### Scenario: Template is rendered to temporary output

- **WHEN** `pnpm validate:template` is run
- **THEN** it SHALL copy `template/` to a temporary generated-project directory
- **AND** it SHALL resolve the neutral starter placeholders using deterministic validation values.

#### Scenario: Unresolved placeholders fail validation

- **WHEN** rendered-template validation scans the generated-project directory
- **AND** unresolved double-underscore placeholders remain
- **THEN** validation MUST fail before generated-project dependency installation succeeds.

#### Scenario: Rendered project installs reproducibly

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm install --frozen-lockfile` in the rendered generated-project directory.

#### Scenario: Rendered project validation runs

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm validate` in the rendered generated-project directory.

#### Scenario: Rendered project graph is generated

- **WHEN** `pnpm validate:template` validates the rendered generated project
- **THEN** it SHALL run `pnpm nx graph --file=tmp/nx-graph.json` in the rendered generated-project directory.

#### Scenario: Repository validation includes template validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run strict OpenSpec validation
- **AND** it SHALL run rendered-template validation.

#### Scenario: Template validation remains neutral

- **WHEN** rendered-template validation is implemented
- **THEN** it MUST NOT introduce concrete variant, overlay, module, application, service, API, auth, storage, observability, or infrastructure behaviour.

### Requirement: Generated Nx Telemetry Defaults

The generated template SHALL disable Nx telemetry and block Nx Cloud connections by default.

#### Scenario: Nx analytics are disabled

- **WHEN** `template/nx.json` is inspected
- **THEN** `analytics` SHALL be `false`.

#### Scenario: Nx Cloud connections are blocked

- **WHEN** `template/nx.json` is inspected
- **THEN** `neverConnectToCloud` SHALL be `true`.
