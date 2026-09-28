## Execution Plan

### Renderer metadata and dependencies

- [x] Add the root dependency needed to parse YAML render inputs and `starter.yaml`.
- [x] Update `starter.yaml` `template.engine` to identify the starter-owned renderer.
- [x] Add `template.placeholders.required` for `PROJECT_NAME`, `PROJECT_SLUG`, `PROJECT_DESCRIPTION`, and `DEFAULT_PACKAGE_SCOPE`.
- [x] Add the root `starter:render` package script.
- [x] Update the root lockfile for any added starter-maintenance dependency.

### Generic renderer implementation

- [x] Create `tools/scripts/render-template.mjs`.
- [x] Parse `--input <path>` and default to `starter.render.yaml` when no input path is provided.
- [x] Parse optional `--variant <id>` without adding individual placeholder CLI flags.
- [x] Load YAML and JSON render input files.
- [x] Validate render input shape, including `output.path` and `placeholders`.
- [x] Resolve relative `output.path` values relative to the render input file directory.
- [x] Fail when the output path exists and is not empty.
- [x] Load `starter.yaml` metadata for template path, placeholder rules, variants, overlays, and variant-required placeholders.
- [x] Resolve the effective variant from input and CLI values.
- [x] Fail when input and CLI variants conflict.
- [x] Fail when the selected variant is not declared in `starter.yaml`.
- [x] Build the placeholder map from user input, starter-derived placeholders, and runtime-derived placeholders.
- [x] Fail before writing generated files when a base required placeholder is missing.
- [x] Fail before writing generated files when a selected variant required placeholder is missing.
- [x] Copy the neutral template into the generated output path.
- [x] Apply the selected variant overlay, if any, after copying the template and before placeholder rendering.
- [x] Replace colliding overlay files as full files.
- [x] Render double-underscore placeholders across generated output files.
- [x] Fail when unresolved double-underscore placeholders remain after rendering.
- [x] Confirm root starter-maintenance `openspec/changes/` is not copied into generated output.

### Examples and documentation

- [x] Create `examples/render-input.neutral.yaml`.
- [x] Ensure the neutral render input example does not select a concrete variant.
- [x] Update `README.md` with generic starter render usage.
- [x] Update `VALIDATION.md` to describe renderer-backed template validation.
- [x] Document default `starter.render.yaml`, explicit `--input`, and optional `--variant` usage.

### Validation integration

- [x] Refactor `tools/scripts/validate-template-render.mjs` to use the generic renderer semantics.
- [x] Keep `pnpm validate:template` rendering to a temporary directory.
- [x] Preserve generated-project `pnpm install --frozen-lockfile` validation.
- [x] Preserve generated-project `pnpm validate` validation.
- [x] Preserve generated-project Nx graph generation validation.
- [x] Preserve unresolved-placeholder scanner failure-path testing.
- [x] Confirm neutral template validation still applies no variant overlay.

## Validation

### OpenSpec validation

- [x] Run `pnpm ospec validate add-starter-template-renderer --strict`.
- [x] Run `pnpm ospec validate --all --strict`.
- [x] Run `pnpm validate:spec`.

### Renderer validation

- [x] Run `pnpm starter:render -- --input examples/render-input.neutral.yaml` into a temporary output path.
- [x] Run `pnpm starter:render` with a temporary `starter.render.yaml` input file.
- [x] Run the renderer with an equivalent JSON input file.
- [x] Confirm missing base required placeholders fail before generated files are written.
- [x] Confirm an unknown variant fails before generated files are written.
- [x] Confirm conflicting CLI and input variants fail before generated files are written.
- [x] Confirm unresolved placeholders fail after rendering.
- [x] Confirm a non-empty output path fails before generated files are written.

### Template validation

- [x] Run `pnpm validate:template`.
- [x] Run `TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER=1 pnpm validate:template` and confirm it fails for the injected placeholder.
- [x] Confirm rendered neutral output contains no unresolved placeholders.
- [x] Confirm rendered neutral output runs generated-project `pnpm validate`.
- [x] Confirm rendered neutral output can generate an Nx graph.

### Constraint validation

- [x] Confirm no files under `template/` were changed by this neutral renderer change.
- [x] Confirm no concrete variant directory was introduced.
- [x] Confirm no MWS-specific files, placeholders, metadata, examples, or validation commands were introduced.
- [x] Confirm no application, service, API, auth, storage, observability, infrastructure, or module starter behaviour was added.
- [x] Confirm docs and specs use `variant` and `overlay` terminology, not `flavour`.
- [x] Confirm design constraints were respected.
