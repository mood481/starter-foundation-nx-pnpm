## ADDED Requirements

### Requirement: Generated Spec Validation Gate

Generated projects SHALL include OpenSpec validation in their baseline validation flow.

#### Scenario: Validate includes spec validation

- **WHEN** `pnpm validate` is run in a generated project
- **THEN** it SHALL run strict OpenSpec validation before workspace lint, typecheck, and test checks.

#### Scenario: Spec-only validation remains available

- **WHEN** generated-project maintainers need only OpenSpec validation
- **THEN** `pnpm validate:spec` SHALL be executable.

#### Scenario: Frozen install supports OpenSpec dependency

- **WHEN** a generated project is validated with `pnpm install --frozen-lockfile`
- **THEN** the lockfile SHALL include the local OpenSpec dependency required by generated-project scripts.
