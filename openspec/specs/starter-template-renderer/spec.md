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

#### Scenario: Help documents all supported options

- **WHEN** the renderer is invoked with `--help` or `-h`
- **THEN** it SHALL print usage including `--input <path>`, `--variant <id>`, `--output <path>`, `--set <KEY=VALUE>` (repeatable), and `--help`
- **AND** it SHALL describe the two invocation modes (file mode via `--input` and CLI mode via `--output`/`--set`) with examples
- **AND** it SHALL exit with status 0 without writing any files.

#### Scenario: Npx executable exists

- **WHEN** `package.json` `bin` is inspected
- **THEN** a `starter-foundation-render` binary SHALL be declared pointing to `tools/scripts/render-template.mjs`
- **AND** `tools/scripts/render-template.mjs` SHALL have a `#!/usr/bin/env node` shebang and be executable so `npx @mood481/starter-foundation-nx-pnpm --help` works.

#### Scenario: Scoped publishable package

- **WHEN** `package.json` is inspected
- **THEN** `name` SHALL be `@mood481/starter-foundation-nx-pnpm`
- **AND** `version` SHALL be `0.4.0`
- **AND** `private` SHALL be `false`
- **AND** `publishConfig` and `files` SHALL allow publishing the renderer and required runtime files so `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --input <path>` and `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --variant <id> --output <path> --set <KEY=VALUE> ...` resolve to the same renderer logic.
- **AND** runtime packages imported by the published renderer SHALL be declared in `dependencies`.

### Requirement: Structured Render Input

The starter renderer SHALL read generation inputs from structured YAML or JSON files.

#### Scenario: Default render input is used

- **WHEN** `pnpm starter:render` is run without an explicit input path and without CLI-mode flags
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

- **WHEN** the renderer is invoked for normal project generation via file mode
- **THEN** it SHALL NOT require placeholder values to be passed as individual command-line flags.

#### Scenario: CLI inline mode does not require a render input file

- **WHEN** the renderer is invoked without `--input` with optional `--output` and repeated `--set`
- **THEN** it SHALL generate the project without reading a YAML/JSON render input file
- **AND** it SHALL obtain placeholder values from `--set` and `output.path` from `--output` when provided or otherwise from `dist/` relative to `cwd`.

#### Scenario: File mode remains authoritative when input is present

- **WHEN** the renderer is invoked with `--input <path>` together with any of `--variant`, `--output`, or `--set`
- **THEN** it SHALL read `output.path`, `variant`, and `placeholders` exclusively from the specified input file
- **AND** it SHALL ignore the concurrent `--variant`/`--output`/`--set` values and emit a warning to stderr
- **AND** it SHALL NOT treat the presence of those extra flags as an error nor merge them into the file-provided values.

### Requirement: Variant Selection

The starter renderer SHALL support optional variant selection through the render input file or through the command line.

#### Scenario: Neutral rendering is default

- **WHEN** no variant is selected
- **THEN** the renderer SHALL generate from the neutral template without applying any variant overlay.

#### Scenario: Input variant is supported

- **WHEN** the render input file declares `variant`
- **THEN** the renderer SHALL use that declared variant.

#### Scenario: CLI variant is supported

- **WHEN** the renderer is invoked without `--input` and with `--variant <id>` (CLI mode)
- **THEN** the renderer SHALL use the specified variant.

#### Scenario: Variant conflict fails

- **WHEN** both the render input file and CLI declare variants
- **AND** the declared variants differ
- **THEN** the input file variant SHALL take precedence, the CLI variant SHALL be ignored with a warning, and rendering SHALL NOT fail due to a variant mismatch (file mode is authoritative).

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

- **WHEN** `output.path` comes from a render input file and is relative
- **THEN** the renderer SHALL resolve it relative to the render input file directory.

#### Scenario: CLI output paths are cwd-relative

- **WHEN** `output.path` comes from `--output` in CLI mode and is relative
- **THEN** the renderer SHALL resolve it relative to `process.cwd()`.

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

### Requirement: CLI Output Path

The starter renderer SHALL support optional `--output <path>` for CLI inline mode.

#### Scenario: CLI output is optional without input

- **WHEN** the renderer is invoked without `--input`, with the required CLI `--set` assignments, and without `--output`
- **THEN** it SHALL use `dist/` relative to `cwd` and continue rendering without requiring `--output`.

#### Scenario: CLI output overrides default when provided

- **WHEN** the renderer is invoked without `--input` and with `--output <path>`
- **THEN** it SHALL treat the provided path (resolved relative to `cwd`) as the destination, overriding the default.

#### Scenario: CLI output value validation

- **WHEN** the renderer is invoked with `--output` but no following value or with an empty value
- **THEN** rendering MUST fail with a message indicating a missing value for `--output`.

#### Scenario: Example CLI output usage

- **WHEN** the renderer is invoked as `starter-foundation-render --variant <variant-id> --output ../tmp/rendered-example --set KEY=VALUE ...`
- **THEN** it SHALL treat `../tmp/rendered-example` (resolved relative to `cwd`) as the destination and proceed to render.

### Requirement: CLI Placeholder Assignment

The starter renderer SHALL support repeatable `--set <KEY=VALUE>` assignments for placeholder values in CLI mode.

#### Scenario: Repeatable set syntax

- **WHEN** the renderer is invoked with multiple `--set KEY=VALUE` arguments
- **THEN** each occurrence SHALL add or overwrite the placeholder `KEY` with `VALUE`, where `VALUE` is everything after the first `=` (including additional `=` characters and spaces when quoted, e.g. `--set "PROJECT_NAME=Example MWS Foundation"`).

#### Scenario: Set key validation

- **WHEN** a `--set` argument is not in `KEY=VALUE` form (missing `=` or empty key) or declares a key with double-underscore delimiters (`__KEY__`)
- **THEN** rendering MUST fail before generated files are written with a message indicating malformed `--set`.

#### Scenario: Set key grammar is constrained

- **WHEN** a `--set` key does not match `^[A-Z0-9_]+$`
- **THEN** rendering MUST fail before generated files are written with a message indicating malformed `--set`.

#### Scenario: Set value allows spaces and special characters

- **WHEN** the renderer is invoked with `--set "PROJECT_DESCRIPTION=Example MWS-compatible foundation repository."` or `--set DEFAULT_PACKAGE_SCOPE=@example-mws`
- **THEN** the values including spaces, dots, and `@` SHALL be stored verbatim for placeholder replacement.

#### Scenario: CLI placeholder coverage follows starter metadata

- **WHEN** rendering in CLI mode for a declared variant
- **THEN** `--set` SHALL support providing every required placeholder declared by the neutral template and selected variant
- **AND** missing required placeholders (base or variant-specific) SHALL cause rendering to fail before writes, identical to file mode.

#### Scenario: Example CLI set invocation

- **WHEN** the renderer is invoked as:
  `starter-foundation-render --output ../tmp/rendered-example --set PROJECT_NAME="Example Project" --set PROJECT_SLUG=example-project --set "PROJECT_DESCRIPTION=Example project" --set DEFAULT_PACKAGE_SCOPE=@example`
- **THEN** it SHALL produce the same rendered content as the equivalent `render-input.neutral.yaml` file-mode invocation.

### Requirement: Npx Invocation Parity

The renderer invoked via `npx` SHALL have identical semantics to the local `pnpm starter:render` invocation.

#### Scenario: Npx file mode

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --input ./render-input.yaml`
- **THEN** the binary SHALL read the specified input file, resolve its `output.path`, apply its selected overlay, and render placeholders exactly as `pnpm starter:render -- --input ./render-input.yaml` does.

#### Scenario: Npx CLI mode

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --output ./my-project --set PROJECT_NAME="My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=My project" --set DEFAULT_PACKAGE_SCOPE=@my-project`
- **THEN** it SHALL render the neutral template to `./my-project` via CLI inline mode with no render input file.

#### Scenario: Npx help

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --help`
- **THEN** it SHALL print the same help as the local invocation and exit 0.

### Requirement: CLI Inline Mode Rendering Contract

The renderer in CLI mode SHALL follow the same rendering and safety contract as file mode.

#### Scenario: Declared variant overlay in CLI mode

- **WHEN** CLI mode selects a declared variant via `--variant <variant-id>`
- **THEN** the renderer SHALL apply that variant's declared overlay after copying the neutral template and before placeholder rendering, identical to file mode.

#### Scenario: Missing required placeholder fails in CLI mode

- **WHEN** a required base or variant placeholder is absent from the accumulated `--set` values in CLI mode
- **THEN** rendering MUST fail before generated files are written.

#### Scenario: Non-empty CLI output fails

- **WHEN** CLI mode resolves `--output` to an existing non-empty directory
- **THEN** rendering MUST fail before generated files are written.

#### Scenario: Unresolved placeholder fails in CLI mode

- **WHEN** placeholder rendering completes in CLI mode and unresolved `__...__` placeholders remain
- **THEN** rendering MUST fail.
