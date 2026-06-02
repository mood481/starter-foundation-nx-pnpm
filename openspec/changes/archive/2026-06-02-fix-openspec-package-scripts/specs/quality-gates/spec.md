## ADDED Requirements

### Requirement: Starter OpenSpec Package Scripts

The starter repository SHALL expose working OpenSpec package scripts from the root package metadata.

#### Scenario: Local OpenSpec wrapper is exposed

- **WHEN** the root `package.json` scripts are inspected
- **THEN** an `ospec` script SHALL exist
- **AND** it SHALL invoke the project-local OpenSpec CLI.

#### Scenario: Helper scripts use clear OpenSpec prefix

- **WHEN** the root `package.json` scripts are inspected
- **THEN** standalone OpenSpec helper scripts SHALL use the `ospec:` prefix
- **AND** OpenSpec scripts SHALL NOT use the `os:` prefix.

#### Scenario: Common OpenSpec commands are exposed

- **WHEN** maintainers use the root package scripts
- **THEN** standalone helper scripts SHALL exist for listing changes, listing specs, validating all artifacts strictly, and validating all artifacts strictly as JSON.

#### Scenario: Context-dependent commands use wrapper

- **WHEN** maintainers need OpenSpec commands that require a change id or additional context
- **THEN** those commands SHALL be run through `pnpm ospec` with explicit arguments
- **AND** root package scripts SHALL NOT hardcode a specific change id.

#### Scenario: Repository validate uses OpenSpec validation

- **WHEN** `pnpm validate` is run in the starter repository
- **THEN** it SHALL run the strict all-artifacts OpenSpec validation script.
