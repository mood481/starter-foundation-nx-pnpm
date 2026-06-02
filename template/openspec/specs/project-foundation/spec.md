# Project Foundation

## Requirements

### Requirement: Project Identity

The generated project SHALL declare a unique identity derived from the starter contract.

#### Scenario: Project name is declared

- **WHEN** the generated project is inspected
- **THEN** the root `package.json` SHALL declare a project name.

#### Scenario: Project description is declared

- **WHEN** the generated project is inspected
- **THEN** the root `package.json` SHALL declare a project description.

### Requirement: Neutral Foundation

The generated project SHALL remain neutral and MUST NOT require any concrete variant.

#### Scenario: No variant-specific files are required

- **WHEN** the generated project is used
- **THEN** it MUST NOT require variant-specific metadata
- **AND** it MUST NOT require a variant-specific renderer
- **AND** it MUST NOT include concrete variant files.

### Requirement: Starter Provenance

The generated project SHALL retain starter provenance information.

#### Scenario: Starter identifier is traceable

- **WHEN** the generated project is inspected
- **THEN** it SHALL be possible to identify the starter that produced it.

### Requirement: Multi-Language Support

The generated project SHALL support multiple implementation languages.

#### Scenario: JavaScript tooling does not imply JavaScript-only

- **WHEN** the generated project uses pnpm and Nx for orchestration
- **THEN** this MUST NOT require all projects to be implemented in JavaScript or TypeScript.

#### Scenario: Non-JavaScript projects can be registered

- **WHEN** a Python, Go, or other language project is added
- **THEN** it SHALL be registerable through explicit configuration.
