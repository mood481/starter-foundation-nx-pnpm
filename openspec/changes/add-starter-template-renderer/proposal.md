## Why

The starter currently defines a renderable `template/` and variant overlay semantics, but it does not provide a productive starter-owned renderer for consumers or automation to invoke.

Maintainers and external systems need a stable, generic command that reads structured render inputs, applies the neutral template and any selected variant overlay, resolves placeholders, and validates the generated output without reimplementing starter semantics outside the repository.

## What Changes

- Add a generic starter template renderer owned by the starter repository.
- Add a root `starter:render` package script as the productive render entrypoint.
- Define a structured YAML/JSON render input contract with `output.path`, optional `variant`, and `placeholders`.
- Make `starter.render.yaml` the default input file and support `--input <path>` to select a specific YAML or JSON input.
- Support optional variant selection through `--variant <id>` or through the input file, with conflict detection when both are provided.
- Read `starter.yaml` to locate the neutral template, declared variants, overlay paths, variant-required placeholders, and placeholder behaviour.
- Apply the selected variant overlay, if any, before placeholder rendering.
- Derive starter/runtime placeholders from the starter repository so consumers do not have to provide starter id, starter version, Node version, or pnpm version.
- Fail deterministically on unknown variants, missing required inputs, output path problems, or unresolved placeholders.
- Add a neutral render input example under `examples/`.
- Refactor rendered-template validation expectations so validation exercises the same renderer semantics rather than a separate ad hoc render path.

## Capabilities

### New Capabilities

- `starter-template-renderer`: productive starter-owned template rendering, structured input files, optional variant selection, overlay application, placeholder resolution, and renderer examples.

### Modified Capabilities

- `quality-gates`: rendered-template validation should use the generic starter renderer semantics and continue validating the neutral generated output.

## Impact

- Affected starter-repository files: `package.json`, `tools/scripts/render-template.mjs`, `tools/scripts/validate-template-render.mjs`, `starter.yaml`, `README.md`, `VALIDATION.md`, and `examples/render-input.neutral.yaml`.
- Affected specs: new `starter-template-renderer` capability and updated `quality-gates` validation requirements.
- Affected validation behaviour: `pnpm validate:template` should render through the generic renderer path and then run generated-project validation checks.
- Affected generated-template files: none; this change must not alter files under `template/` except through future renderer output.

## Out of Scope

- Do not introduce a concrete variant.
- Do not add MWS-specific files, metadata, placeholders, examples, or validation commands.
- Do not add application, service, API, auth, storage, observability, infrastructure, or module starter behaviour.
- Do not define migration of existing generated repositories.
- Do not make consumers implement overlay or placeholder rendering outside the starter.

## Risks

- A renderer that diverges from validation would make validation less meaningful; validation must exercise the same rendering semantics.
- A CLI that encodes every placeholder as command-line flags would become unstable as inputs grow; structured YAML/JSON input keeps the command surface small.
- Output path handling must avoid accidental overwrites or writes to unintended locations.
- Variant support must stay generic so the renderer remains independent from future concrete variants.
