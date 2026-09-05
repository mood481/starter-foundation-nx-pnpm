## MODIFIED Requirements

### Requirement: Starter Render Command

The starter repository SHALL provide a generic starter-owned renderer for generating projects from the neutral starter template and composing selected variants and extensions.

#### Scenario: Productive render script exists

- **WHEN** the root `package.json` scripts are inspected
- **THEN** a `starter:render` script SHALL exist
- **AND** it SHALL invoke the starter-owned template renderer.

#### Scenario: Renderer uses starter metadata

- **WHEN** the renderer runs
- **THEN** it SHALL read `starter.yaml` to determine the template path, placeholder behaviour, declared variants, extension declarations and groups, and contribution paths or resolvers.

#### Scenario: Renderer is variant-agnostic

- **WHEN** the renderer is implemented
- **THEN** it SHALL support declared variants generically
- **AND** it SHALL support selected extensions through the generic extension contract
- **AND** it SHALL NOT hardcode concrete variant or extension-specific rendering rules.

#### Scenario: Starter metadata declares renderer engine

- **WHEN** `starter.yaml` is inspected
- **THEN** `template.engine` SHALL identify the starter-owned renderer.

#### Scenario: Help documents all supported options

- **WHEN** the renderer is invoked with `--help` or `-h`
- **THEN** it SHALL print usage including `--input <path>`, `--variant <id>`, `--extensions <id1,id2>`, `--output <path>`, `--set <KEY=VALUE>` (repeatable), and `--help`
- **AND** it SHALL describe the two invocation modes (file mode via `--input` and CLI mode via `--extensions`/`--output`/`--set`) with examples
- **AND** it SHALL exit with status 0 without writing any files.

#### Scenario: Npx executable exists

- **WHEN** `package.json` `bin` is inspected
- **THEN** a `starter-foundation-render` binary SHALL be declared pointing to `tools/scripts/render-template.mjs`
- **AND** `tools/scripts/render-template.mjs` SHALL have a `#!/usr/bin/env node` shebang and be executable.

#### Scenario: Scoped publishable package

- **WHEN** `package.json` is inspected
- **THEN** `name` SHALL be `@mood481/starter-foundation-nx-pnpm`
- **AND** `version` SHALL be `0.5.0`
- **AND** `private` SHALL be `false`
- **AND** `publishConfig` and `files` SHALL allow publishing the renderer, extension resolver boundary, metadata, neutral template, and approved variant overlays
- **AND** runtime packages imported by the published renderer SHALL be declared in `dependencies`
- **AND** it MUST NOT require root `openspec/` artifacts at runtime.

### Requirement: Structured Render Input

The starter renderer SHALL read generation inputs from structured YAML or JSON files and SHALL accept an optional extension selection list.

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

#### Scenario: Render input defaults to zero extensions

- **WHEN** a render input omits `extensions`
- **THEN** the effective extension selection SHALL be an empty list
- **AND** when it declares `extensions`, the value SHALL be a list of extension names validated by the extension contract.

#### Scenario: Extension selection is explicit

- **WHEN** a render input selects an extension
- **THEN** the selection SHALL identify an extension name declared or resolvable by the extension contract
- **AND** the selected declaration SHALL provide its version and source locator to the resolver
- **AND** the renderer SHALL not infer an extension from a selected variant.

#### Scenario: Placeholder values are not required as CLI flags

- **WHEN** the renderer is invoked for normal project generation via file mode
- **THEN** it SHALL NOT require placeholder values to be passed as individual command-line flags.

#### Scenario: CLI inline mode does not require a render input file

- **WHEN** the renderer is invoked without `--input` with optional `--output`, `--extensions`, and repeated `--set`
- **THEN** it SHALL generate the project without reading a YAML/JSON render input file
- **AND** it SHALL use the comma-separated `--extensions` value as the extension-name selection when provided
- **AND** it SHALL use an empty extension selection when the option is absent.

#### Scenario: File mode remains authoritative when input is present

- **WHEN** the renderer is invoked with `--input <path>` together with any of `--variant`, `--extensions`, `--output`, or `--set`
- **THEN** it SHALL read `output.path`, `variant`, `extensions`, and `placeholders` exclusively from the specified input file
- **AND** it SHALL ignore the concurrent `--variant`/`--extensions`/`--output`/`--set` values and emit a warning to stderr
- **AND** it SHALL NOT treat the presence of those extra flags as an error nor merge them into the file-provided values.

### Requirement: Variant Selection

The starter renderer SHALL support optional variant selection independently from optional extension selection.

#### Scenario: Neutral rendering is default

- **WHEN** no variant is selected
- **THEN** the renderer SHALL generate from the neutral template without applying any variant overlay.

#### Scenario: Input variant is supported

- **WHEN** the render input file declares `variant`
- **THEN** the renderer SHALL use that declared variant.

#### Scenario: CLI variant is supported

- **WHEN** the renderer is invoked without `--input` and with `--variant <id>` (CLI mode)
- **THEN** the renderer SHALL use the specified variant.

#### Scenario: Variant and extension selection are independent

- **WHEN** a render request declares a variant, extensions, both, or neither
- **THEN** variant resolution SHALL use the variant contract
- **AND** extension resolution SHALL use the extension contract
- **AND** selecting one SHALL not implicitly select the other.

#### Scenario: Variant conflict fails

- **WHEN** both the render input file and CLI declare variants
- **AND** the declared variants differ
- **THEN** the input file variant SHALL take precedence, the CLI variant SHALL be ignored with a warning, and rendering SHALL NOT fail due to a variant mismatch.

#### Scenario: Unknown variant fails

- **WHEN** the selected variant is not declared in `starter.yaml`
- **THEN** rendering MUST fail before generated files are written.

### Requirement: Template And Overlay Rendering

The starter renderer SHALL apply the neutral template, selected variant overlay, selected extension contributions, structured mutations, placeholders, and validation in a deterministic order.

#### Scenario: Neutral template is copied first

- **WHEN** rendering starts after metadata, input, variant, extension, and compatibility preflight succeeds
- **THEN** the renderer SHALL copy the directory declared by `starter.yaml` `template.path` into the generated output path.

#### Scenario: Selected overlay is applied before placeholders

- **WHEN** a selected variant declares an overlay path
- **THEN** the renderer SHALL apply the overlay after copying the neutral template
- **AND** it SHALL apply the overlay before any extension contribution.

#### Scenario: Selected extension contributions are applied after the variant

- **WHEN** one or more extensions resolve successfully
- **THEN** the renderer SHALL apply their file contributions after the selected variant overlay
- **AND** it SHALL apply them in the canonical order defined by the extension contract.

#### Scenario: Structured mutations are applied after extension files

- **WHEN** selected extensions declare supported structured mutations
- **THEN** the renderer SHALL apply those mutations after extension file contributions
- **AND** it SHALL apply them before placeholder rendering.

#### Scenario: Placeholders and validation are last

- **WHEN** all files and supported mutations have been applied
- **THEN** the renderer SHALL resolve placeholders
- **AND** it SHALL detect unresolved placeholders
- **AND** it SHALL run the declared validation expectations after the rendered result is complete.

#### Scenario: Overlay path is starter-root relative

- **WHEN** the renderer resolves a variant overlay or an extension contribution
- **THEN** a variant overlay path SHALL resolve relative to the starter repository root
- **AND** an extension contribution path SHALL resolve through the resolved extension artifact or provider contract
- **AND** the extension contract MUST NOT require an `extensions/<name>/` directory in this repository.

#### Scenario: Overlay file collisions replace files

- **WHEN** a variant overlay file path collides with a neutral template file path
- **THEN** the variant overlay file SHALL replace the neutral file as a full file.

#### Scenario: Extension file collisions are rejected

- **WHEN** an extension file contribution collides with an existing neutral, variant, or other extension file
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify the extension and colliding path.

### Requirement: Npx Invocation Parity

The renderer invoked via `npx` SHALL have identical no-extension and extension-selection semantics to the local `pnpm starter:render` invocation.

#### Scenario: Npx file mode

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.5.0 --input ./render-input.yaml`
- **THEN** the binary SHALL read the specified input file, resolve its `output.path`, apply its selected variant overlay and extension-name selection, and render placeholders exactly as `pnpm starter:render -- --input ./render-input.yaml` does.

#### Scenario: Npx CLI mode

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.5.0 --output ./my-project --set PROJECT_NAME="My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=My project" --set DEFAULT_PACKAGE_SCOPE=@my-project`
- **THEN** it SHALL render the neutral template to `./my-project` via CLI inline mode with an empty extension selection.

#### Scenario: Npx help

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@0.5.0 --help`
- **THEN** it SHALL print the same help as the local invocation and exit 0.

### Requirement: Render Input Examples

The starter repository SHALL provide examples for structured render inputs, including the zero-extension default.

#### Scenario: Neutral render input example exists

- **WHEN** the starter repository is inspected
- **THEN** `examples/render-input.neutral.yaml` SHALL exist.

#### Scenario: Neutral example stays variant-independent

- **WHEN** `examples/render-input.neutral.yaml` is inspected
- **THEN** it SHALL NOT select a concrete variant
- **AND** it SHALL declare `extensions: []`
- **AND** it SHALL NOT include variant-specific placeholders or a concrete extension selection.

## ADDED Requirements

### Requirement: CLI Extension Selection

The starter renderer SHALL support optional extension selection in CLI mode through a comma-separated list of extension names.

#### Scenario: Comma-separated extension names are accepted

- **WHEN** the renderer is invoked without `--input` and with `--extensions <name1,name2>`
- **THEN** it SHALL split the value into extension names
- **AND** it SHALL validate every name with the same extension-name validator used for the `starter.yaml` `extensions` field and structured render input
- **AND** it SHALL preserve the normalized name list for extension resolution.

#### Scenario: Invalid CLI extension list fails before writes

- **WHEN** `--extensions` has no value, an empty item, an invalid name, or a duplicate name
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify the malformed extension list or duplicate name.

#### Scenario: CLI extension selection is file-authoritative

- **WHEN** `--input <path>` is present together with `--extensions <name1,name2>`
- **THEN** the renderer SHALL ignore the CLI extension list
- **AND** it SHALL emit a warning to stderr
- **AND** it SHALL use only the input file's `extensions` value.

### Requirement: Render Pipeline Ordering

The starter renderer SHALL execute the render pipeline in a stable order that separates selection and compatibility checks from output writes.

#### Scenario: Complete pipeline order is observable from implementation

- **WHEN** the renderer processes a request
- **THEN** it SHALL load starter metadata
- **AND** parse and validate render input
- **AND** resolve the selected variant, if any
- **AND** resolve selected extensions
- **AND** validate compatibility, requirements, duplicate declarations, and contribution collisions
- **AND** render the neutral template
- **AND** apply the variant overlay
- **AND** apply extension contributions in deterministic order
- **AND** apply supported structured mutations
- **AND** resolve placeholders
- **AND** detect unresolved placeholders
- **AND** run validation.

#### Scenario: Preflight failures do not write output

- **WHEN** input, variant, extension, compatibility, duplicate, conflict, or required-placeholder validation fails before rendering
- **THEN** the renderer MUST fail before generated files are written.
