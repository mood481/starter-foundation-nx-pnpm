# nx-workspace-contract Specification

## Purpose
TBD - created by archiving change add-foundation-template-contract. Update Purpose after archive.
## Requirements
### Requirement: Nx As Workspace Orchestrator

The generated project SHALL use Nx as the workspace orchestration layer.

#### Scenario: Common targets are defined

- **WHEN** a project is added to the workspace
- **THEN** it SHOULD expose standard targets when applicable:
  - `lint`
  - `typecheck`
  - `test`
  - `build`
  - `e2e`
  - `serve`
  - `docker`.

#### Scenario: Validation target exists

- **WHEN** the root workspace scripts are inspected
- **THEN** a `validate` command SHALL exist.

### Requirement: Project Registration

Workspace projects SHALL be registered in a way that Nx can discover and orchestrate them.

#### Scenario: Explicit project configuration

- **WHEN** a new app, service, package, or tool is added
- **THEN** it SHOULD include a `project.json` file.

#### Scenario: Project names are unique

- **WHEN** a project is registered
- **THEN** its Nx project name SHALL be unique within the workspace.

#### Scenario: Project tags are present

- **WHEN** a project is registered
- **THEN** it SHALL declare at least one `type:*` tag
- **AND** at least one `lang:*` tag.

### Requirement: Multi-Language Support

The generated workspace SHALL support non-JavaScript projects.

#### Scenario: Python project can be registered

- **WHEN** a Python service is added
- **THEN** it MAY be registered through `project.json`
- **AND** its Nx targets MAY use command-based execution.

#### Scenario: Go project can be registered

- **WHEN** a Go service is added
- **THEN** it MAY be registered through `project.json`
- **AND** its Nx targets MAY use command-based execution.

#### Scenario: JavaScript tooling does not imply JavaScript-only implementation

- **WHEN** the workspace uses pnpm and Nx
- **THEN** this MUST NOT require all projects to be implemented in JavaScript or TypeScript.

### Requirement: Target Defaults

The root Nx configuration SHALL define target defaults for common task names.

#### Scenario: Cacheable targets are configured

- **WHEN** the root `nx.json` is inspected
- **THEN** common targets such as `lint`, `typecheck`, `test`, and `build` SHOULD be configured consistently.

#### Scenario: Build dependency order is defined

- **WHEN** build targets depend on upstream projects
- **THEN** the workspace SHOULD allow builds to depend on parent project builds where applicable.

