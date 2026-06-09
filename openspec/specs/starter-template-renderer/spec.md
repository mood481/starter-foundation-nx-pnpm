# starter-template-renderer Specification

## Purpose

The starter-template-renderer specification defines the contract for the starter-owned generic renderer that generates projects from the template, supports optional variant selection and overlay application, and resolves placeholders deterministically.
## Requirements
### Requirement: Starter Render Command

The starter repository SHALL provide a generic starter-owned renderer for generating projects from the starter template.

#### Scenario: Productive render script exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `starter:render` script SHALL exist
- **AND** it SHALL invoke the starter-owned template renderer.

#### Scenario: Renderer uses starter metadata

- **WHEN** the renderer runs
- **THEN** it SHALL read `starter.yaml` to determine the template path, placeholder behaviour, declared variants, and overlay paths.

#### Scenario: Renderer is variant-agnostic

- **WHEN** the renderer is implemented
- **THEN** it SHALL support declared variants generically
- **AND** it SHALL NOT hardcode concrete variant-specific rendering rules.

#### Scenario: Starter metadata declares renderer engine

- **WHEN** `starter.yaml` is inspected
- **THEN** `template.engine` SHALL identify the starter-owned renderer.

### Requirement: Structured Render Input

The starter renderer SHALL read generation inputs from structured YAML or JSON files.

#### Scenario: Default render input is used

- **WHEN** `pnpm starter:render` is run without an explicit input path
- **THEN** the renderer SHALL read `starter.render.yaml` as the default input file.

#### Scenario: Explicit render input is supported

- **WHEN** the renderer is invoked with `--input <path>`
- **THEN** it SHALL read render inputs from the specified YAML or JSON file.

#### Scenario: Render input declares output path

- **WHEN** a render input file is inspected
- **THEN** it SHALL provide `output.path` for the generated project destination.

#### Scenario: Render input declares placeholders

- **WHEN** a render input file is inspected
- **THEN** it SHALL provide placeholder values under `placeholders`
- **AND** placeholder keys SHALL use names without double-underscore delimiters.

#### Scenario: Placeholder values are not required as CLI flags

- **WHEN** the renderer is invoked for normal project generation
- **THEN** it SHALL NOT require placeholder values to be passed as individual command-line flags.

### Requirement: Variant Selection

The starter renderer SHALL support optional variant selection through the render input file or through the command line.

#### Scenario: Neutral rendering is default

- **WHEN** no variant is selected
- **THEN** the renderer SHALL generate from the neutral template without applying any variant overlay.

#### Scenario: Input variant is supported

- **WHEN** the render input file declares `variant`
- **THEN** the renderer SHALL use that declared variant.

#### Scenario: CLI variant is supported

- **WHEN** the renderer is invoked with `--variant <id>`
- **THEN** the renderer SHALL use the specified variant.

#### Scenario: Variant conflict fails

- **WHEN** both the render input file and CLI declare variants
- **AND** the declared variants differ
- **THEN** rendering MUST fail before generated files are written.

#### Scenario: Unknown variant fails

- **WHEN** the selected variant is not declared in `starter.yaml`
- **THEN** rendering MUST fail before generated files are written.

### Requirement: Placeholder Resolution

The starter renderer SHALL resolve required, derived, and variant-specific placeholders deterministically.

#### Scenario: Base required placeholders are declared

- **WHEN** `starter.yaml` is inspected
- **THEN** the neutral template SHALL declare base required render placeholders for project name, project slug, project description, and default package scope.

#### Scenario: Starter placeholders are derived

- **WHEN** the renderer builds the placeholder map
- **THEN** it SHALL derive starter id and starter version from starter metadata.

#### Scenario: Runtime placeholders are derived

- **WHEN** the renderer builds the placeholder map
- **THEN** it SHALL derive Node and pnpm version placeholders from starter repository metadata or the current runtime.

#### Scenario: Variant placeholders are required when selected

- **WHEN** a selected variant declares required placeholders in `starter.yaml`
- **THEN** those placeholders SHALL be required in addition to the neutral template placeholders.

#### Scenario: Missing required placeholder fails

- **WHEN** a required placeholder is missing from the effective render input
- **THEN** rendering MUST fail before generated files are written.

#### Scenario: Unresolved placeholder fails

- **WHEN** placeholder rendering completes
- **AND** unresolved double-underscore placeholders remain in the generated output
- **THEN** rendering MUST fail.

### Requirement: Template And Overlay Rendering

The starter renderer SHALL apply the neutral template and any selected variant overlay in deterministic order.

#### Scenario: Neutral template is copied first

- **WHEN** rendering starts
- **THEN** the renderer SHALL copy the directory declared by `starter.yaml` `template.path` into the generated output path before placeholder rendering.

#### Scenario: Selected overlay is applied before placeholders

- **WHEN** a selected variant declares an overlay path
- **THEN** the renderer SHALL apply the overlay after copying the neutral template and before placeholder rendering.

#### Scenario: Overlay path is starter-root relative

- **WHEN** the renderer resolves a variant overlay path
- **THEN** it SHALL resolve the path relative to the starter repository root.

#### Scenario: Overlay file collisions replace files

- **WHEN** an overlay file path collides with a neutral template file path
- **THEN** the overlay file SHALL replace the neutral file as a full file.

### Requirement: Render Output Safety

The starter renderer SHALL protect callers from unsafe or ambiguous output writes.

#### Scenario: Relative output paths are input-relative

- **WHEN** `output.path` is relative
- **THEN** the renderer SHALL resolve it relative to the render input file directory.

#### Scenario: Non-empty output path fails

- **WHEN** the resolved output path already exists and is not empty
- **THEN** rendering MUST fail before generated files are written.

#### Scenario: Rendered output excludes starter active changes

- **WHEN** the renderer produces a generated project
- **THEN** root starter-maintenance `openspec/changes/` SHALL NOT be copied into the generated output.

### Requirement: Render Input Examples

The starter repository SHALL provide examples for structured render inputs.

#### Scenario: Neutral render input example exists

- **WHEN** the starter repository is inspected
- **THEN** `examples/render-input.neutral.yaml` SHALL exist.

#### Scenario: Neutral example stays variant-independent

- **WHEN** `examples/render-input.neutral.yaml` is inspected
- **THEN** it SHALL NOT select a concrete variant
- **AND** it SHALL NOT include variant-specific placeholders.

