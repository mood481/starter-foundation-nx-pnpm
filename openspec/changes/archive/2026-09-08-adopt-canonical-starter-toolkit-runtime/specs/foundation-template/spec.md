## MODIFIED Requirements

### Requirement: Workspace Configuration

The template SHALL provide the base workspace configuration for pnpm and Nx without requiring a concrete SDD provider, and SHALL NOT ship a committed lockfile (the generated project's lockfile is created by installing its resolved dependencies, which may change with render-time variants or extensions).

#### Scenario: pnpm workspace file exists

- **WHEN** the template is inspected
- **THEN** `pnpm-workspace.yaml` SHALL exist.

#### Scenario: pnpm lockfile exists

- **WHEN** the template is inspected
- **THEN** `pnpm-lock.yaml` SHALL NOT be committed to the neutral template
- **AND** it SHALL be produced in the generated project by `pnpm install` to support reproducible dependency installation thereafter.

#### Scenario: Nx configuration file exists

- **WHEN** the template is inspected
- **THEN** `nx.json` SHALL exist.

#### Scenario: Package metadata exists

- **WHEN** the template is inspected
- **THEN** `package.json` SHALL exist
- **AND** it SHALL define common workspace validation scripts
- **AND** those scripts MUST NOT require a concrete SDD CLI.
