## Execution Plan

### Renderer metadata and dependencies

- [ ] Add the root dependency needed to parse YAML render inputs and `starter.yaml`.
- [ ] Update `starter.yaml` `template.engine` to identify the starter-owned renderer.
- [ ] Add `template.placeholders.required` for `PROJECT_NAME`, `PROJECT_SLUG`, `PROJECT_DESCRIPTION`, and `DEFAULT_PACKAGE_SCOPE`.
- [ ] Add the root `starter:render` package script.
- [ ] Update the root lockfile for any added starter-maintenance dependency.

### Generic renderer implementation

- [ ] Create `tools/scripts/render-template.mjs`.
- [ ] Parse `--input <path>` and default to `starter.render.yaml` when no input path is provided.
- [ ] Parse optional `--variant <id>` without adding individual placeholder CLI flags.
- [ ] Load YAML and JSON render input files.
- [ ] Validate render input shape, including `output.path` and `placeholders`.
- [ ] Resolve relative `output.path` values relative to the render input file directory.
- [ ] Fail when the output path exists and is not empty.
- [ ] Load `starter.yaml` metadata for template path, placeholder rules, variants, overlays, and variant-required placeholders.
- [ ] Resolve the effective variant from input and CLI values.
- [ ] Fail when input and CLI variants conflict.
- [ ] Fail when the selected variant is not declared in `starter.yaml`.
- [ ] Build the placeholder map from user input, starter-derived placeholders, and runtime-derived placeholders.
- [ ] Fail before writing generated files when a base required placeholder is missing.
- [ ] Fail before writing generated files when a selected variant required placeholder is missing.
- [ ] Copy the neutral template into the generated output path.
- [ ] Apply the selected variant overlay, if any, after copying the template and before placeholder rendering.
- [ ] Replace colliding overlay files as full files.
- [ ] Render double-underscore placeholders across generated output files.
- [ ] Fail when unresolved double-underscore placeholders remain after rendering.
- [ ] Confirm root starter-maintenance `openspec/changes/` is not copied into generated output.

### Examples and documentation

- [ ] Create `examples/render-input.neutral.yaml`.
- [ ] Ensure the neutral render input example does not select a concrete variant.
- [ ] Update `README.md` with generic starter render usage.
- [ ] Update `VALIDATION.md` to describe renderer-backed template validation.
- [ ] Document default `starter.render.yaml`, explicit `--input`, and optional `--variant` usage.

### Validation integration

- [ ] Refactor `tools/scripts/validate-template-render.mjs` to use the generic renderer semantics.
- [ ] Keep `pnpm validate:template` rendering to a temporary directory.
- [ ] Preserve generated-project `pnpm install --frozen-lockfile` validation.
- [ ] Preserve generated-project `pnpm validate` validation.
- [ ] Preserve generated-project Nx graph generation validation.
- [ ] Preserve unresolved-placeholder scanner failure-path testing.
- [ ] Confirm neutral template validation still applies no variant overlay.

## Validation

### OpenSpec validation

- [ ] Run `pnpm ospec validate add-starter-template-renderer --strict`.
- [ ] Run `pnpm ospec validate --all --strict`.
- [ ] Run `pnpm validate:spec`.

### Renderer validation

- [ ] Run `pnpm starter:render -- --input examples/render-input.neutral.yaml` into a temporary output path.
- [ ] Run `pnpm starter:render` with a temporary `starter.render.yaml` input file.
- [ ] Run the renderer with an equivalent JSON input file.
- [ ] Confirm missing base required placeholders fail before generated files are written.
- [ ] Confirm an unknown variant fails before generated files are written.
- [ ] Confirm conflicting CLI and input variants fail before generated files are written.
- [ ] Confirm unresolved placeholders fail after rendering.
- [ ] Confirm a non-empty output path fails before generated files are written.

### Template validation

- [ ] Run `pnpm validate:template`.
- [ ] Run `TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER=1 pnpm validate:template` and confirm it fails for the injected placeholder.
- [ ] Confirm rendered neutral output contains no unresolved placeholders.
- [ ] Confirm rendered neutral output runs generated-project `pnpm validate`.
- [ ] Confirm rendered neutral output can generate an Nx graph.

### Constraint validation

- [ ] Confirm no files under `template/` were changed by this neutral renderer change.
- [ ] Confirm no concrete variant directory was introduced.
- [ ] Confirm no MWS-specific files, placeholders, metadata, examples, or validation commands were introduced.
- [ ] Confirm no application, service, API, auth, storage, observability, infrastructure, or module starter behaviour was added.
- [ ] Confirm docs and specs use `variant` and `overlay` terminology, not `flavour`.
- [ ] Confirm design constraints were respected.
