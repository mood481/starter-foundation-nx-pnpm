## Context

The starter repository already contains a renderable `template/`, a `starter.yaml` metadata file, and a validation script that renders a temporary copy of the neutral template.

Upcoming variants need deterministic overlay application, but the starter should not require consumers to reimplement the render model externally. The repository should own the productive renderer and expose it through a stable package script.

## Goals / Non-Goals

Goals:

- Add a generic starter-owned renderer for productive project generation.
- Keep the renderer independent from concrete variants.
- Read render inputs from structured YAML or JSON files instead of individual placeholder CLI flags.
- Support a default input file, `starter.render.yaml`, and an explicit `--input` override.
- Support optional variant selection through `--variant` or the input file.
- Use `starter.yaml` as the metadata source for template path, placeholder rules, variants, overlays, and required variant placeholders.
- Make rendered-template validation exercise the same render semantics as productive generation.

Non-goals:

- Do not introduce a concrete variant.
- Do not add MWS-specific inputs, metadata, examples, or validation commands.
- Do not add module selection or module starter behaviour.
- Do not make generated-project package installation part of the productive renderer by default.
- Do not migrate existing generated repositories.

## Decisions

### Decision: Add a generic productive renderer

Add a starter-maintenance renderer under:

```txt
tools/scripts/render-template.mjs
```

Expose it through the root package script:

```json
{
  "scripts": {
    "starter:render": "node tools/scripts/render-template.mjs"
  }
}
```

The renderer is a starter tool. Consumers and automation invoke it; they do not own overlay application, placeholder replacement, or unresolved-placeholder scanning.

### Decision: Use structured render input files

The renderer should read render inputs from YAML or JSON. YAML is the preferred format because the starter already uses YAML metadata; JSON is supported for automation-friendly producers.

Default invocation:

```bash
pnpm starter:render
```

The default command reads:

```txt
starter.render.yaml
```

Explicit input invocation:

```bash
pnpm starter:render -- --input ./inputs/project.render.yaml
```

Input files use placeholder names without double underscores:

```yaml
output:
  path: ../example-foundation

placeholders:
  PROJECT_NAME: Example Foundation
  PROJECT_SLUG: example-foundation
  PROJECT_DESCRIPTION: Example generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@example"
```

The renderer should not require every placeholder value as a command-line flag. This keeps the CLI stable as future placeholders and variants add inputs.

### Decision: Keep variant selection optional and declarative

The neutral render path is the default. A variant can be selected either in the input file:

```yaml
variant: example
```

or through the CLI:

```bash
pnpm starter:render -- --variant example
```

If both are provided, they must match. A conflict must fail before rendering. An unknown variant must fail before rendering.

### Decision: Derive starter and runtime placeholders automatically

Consumers should not have to provide starter-maintenance values that are already known by the repository.

The renderer should derive these placeholders automatically:

- `STARTER_ID` from `starter.yaml`.
- `STARTER_VERSION` from `starter.yaml` or root package metadata.
- `NODE_VERSION` from root package metadata or the current runtime.
- `PNPM_VERSION` from root package metadata.

Base user-provided placeholders should be declared in `starter.yaml` under `template.placeholders.required`:

```yaml
template:
  placeholders:
    required:
      - PROJECT_NAME
      - PROJECT_SLUG
      - PROJECT_DESCRIPTION
      - DEFAULT_PACKAGE_SCOPE
```

Variant-specific required placeholders remain declared under the selected variant entry, for example `variants.<id>.placeholders.required`.

### Decision: Declare the starter-owned renderer in metadata

Update `starter.yaml` so `template.engine` identifies the starter-owned renderer rather than a purely external generic renderer:

```yaml
template:
  engine: starter-renderer
```

The renderer still implements generic semantics; the metadata communicates that this repository provides the rendering entrypoint.

### Decision: Render order matches the overlay contract

The renderer should apply the same conceptual order defined by the variant overlay contract:

```txt
read starter.yaml + render input
        │
        ▼
copy template/ to output.path
        │
        ▼
apply selected variant overlay, if any
        │
        ▼
render placeholders
        │
        ▼
scan unresolved placeholders
```

Overlay paths are relative to the starter repository root. Overlay file collisions replace the destination file as a full file. If an overlay contains `openspec/config.yaml`, the renderer treats it as the same full-file replacement described by the overlay contract.

### Decision: Keep productive render validation lightweight

The productive renderer should always validate render completeness by checking required inputs, safe output handling, known variants, and unresolved placeholders.

It should not run `pnpm install`, generated-project `pnpm validate`, or Nx graph generation by default. Those checks remain the responsibility of starter validation commands and consumer workflows after generation.

### Decision: Reuse renderer semantics in template validation

`tools/scripts/validate-template-render.mjs` should call the same rendering logic or delegate to the generic renderer path instead of duplicating render semantics.

For validation, the script can create a temporary render input or override the output path internally so validation still renders into a temporary directory. After rendering, it should keep the existing generated-project checks:

- `pnpm install --frozen-lockfile`;
- `pnpm validate`;
- `pnpm nx graph --file=tmp/nx-graph.json`.

## Constraints

- Do not add concrete variants.
- Do not add MWS-specific examples, placeholders, files, metadata, or validation commands.
- Do not add files under `template/`.
- Do not copy root starter-maintenance `openspec/changes/` into generated outputs.
- Do not require consumers to pass placeholder values as individual CLI flags.
- Do not apply an overlay unless a declared variant is selected.
- Do not weaken the existing unresolved-placeholder failure behaviour.

## Repository Structure

Expected starter repository additions:

```txt
examples/
└── render-input.neutral.yaml

tools/
└── scripts/
    └── render-template.mjs
```

Expected starter repository updates:

```txt
package.json
pnpm-lock.yaml
starter.yaml
README.md
VALIDATION.md
tools/scripts/validate-template-render.mjs
```

## Rendering Model

The renderer resolves an effective render request from three sources:

```txt
starter.yaml metadata
        +
render input file
        +
optional CLI variant override
```

The resulting request contains:

- output path;
- optional selected variant;
- user-provided placeholders;
- derived starter/runtime placeholders;
- base required placeholders;
- selected variant required placeholders, if any.

Relative `output.path` values are resolved relative to the render input file directory. This keeps render inputs portable and self-contained.

The renderer must fail before writing generated files when required input is missing or the selected variant is invalid. It must fail after placeholder rendering when unresolved double-underscore placeholders remain.

## Migration Plan

No existing generated repositories are migrated.

The current validation script will be refactored to use the new renderer semantics. Existing `pnpm validate:template` behaviour remains available to starter maintainers.

## Alternatives Considered

### Keep rendering external to consumers

Rejected because each consumer would have to reimplement template copying, overlay precedence, placeholder rendering, and unresolved-placeholder checks. That would make behaviour drift likely.

### Pass placeholders as CLI flags

Rejected because the placeholder set is expected to grow as variants and future starters add inputs. Structured files keep the command stable and easier to automate.

### Only support JSON input

Rejected because YAML is already used for starter metadata and is easier for humans to edit. JSON remains supported for automation.

### Make productive rendering run full generated-project validation

Rejected for the default command because dependency installation can be slow and environment-sensitive. Render completeness is always validated; full generated-project validation remains available through validation workflows.

## Risks / Trade-offs

- YAML parsing adds a root starter dependency -> keep it in the starter repository only, not the generated template.
- Refactoring validation to share renderer semantics may temporarily make validation more complex -> keep a single rendering path to reduce long-term drift.
- Output path mistakes can overwrite user files -> fail on existing non-empty output directories unless a future approved change defines explicit overwrite semantics.
- Variant support in a neutral renderer could accidentally introduce variant assumptions -> validate that this change adds no concrete variant files or metadata.

## Validation Strategy

- Run strict OpenSpec validation for this change and all specs.
- Run root spec validation.
- Run neutral template validation through the renderer-backed validation path.
- Run the productive renderer with `examples/render-input.neutral.yaml` into a temporary output.
- Run the productive renderer with an equivalent JSON input in a temporary location.
- Confirm missing required placeholders fail.
- Confirm unknown variants fail.
- Confirm conflicting CLI/input variants fail.
- Confirm unresolved placeholders fail.
- Confirm no concrete variant files are introduced.
