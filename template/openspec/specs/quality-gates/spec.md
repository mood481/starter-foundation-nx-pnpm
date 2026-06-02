# Quality Gates

## Requirements

### Requirement: Baseline Validation Commands

The generated project SHALL expose baseline validation commands from the root package metadata.

#### Scenario: Validate command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `validate` script.

#### Scenario: Lint command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `lint` script.

#### Scenario: Test command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHALL define a `test` script.

#### Scenario: Typecheck command exists

- **WHEN** the generated root `package.json` is inspected
- **THEN** it SHOULD define a `typecheck` script.

### Requirement: Deterministic Foundation Validation

The generated project SHALL support deterministic validation.

#### Scenario: Dependencies can be installed reproducibly

- **WHEN** a generated project is validated
- **THEN** dependency installation SHOULD support frozen-lockfile mode.

#### Scenario: Lockfile exists

- **WHEN** the generated project is inspected
- **THEN** `pnpm-lock.yaml` SHALL exist.

#### Scenario: Workspace validation can be run

- **WHEN** a generated project is validated
- **THEN** `pnpm validate` SHALL be executable.

#### Scenario: Nx project graph can be generated

- **WHEN** a generated project is validated
- **THEN** Nx SHOULD be able to produce a project graph output.

### Requirement: Placeholder Validation

Rendered generated projects SHALL NOT contain unresolved placeholders.

#### Scenario: Placeholder scan runs after rendering

- **WHEN** the template is rendered
- **THEN** validation SHALL scan generated files for unresolved double-underscore placeholders.

#### Scenario: Unresolved placeholder is found

- **WHEN** validation finds an unresolved placeholder
- **THEN** validation MUST fail.

### Requirement: Neutral Boundary Validation

Foundation validation SHALL verify that variant-specific files were not introduced.

#### Scenario: Concrete variant directory is absent

- **WHEN** the neutral project is validated
- **THEN** no concrete variant directory SHALL exist.

#### Scenario: Variant metadata is absent

- **WHEN** the neutral project is validated
- **THEN** variant-specific metadata MUST NOT be present.
