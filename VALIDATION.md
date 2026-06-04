# Validation

This document describes how to validate the foundation starter and its generated template.

## Starter Repository Validation

### Full Validation

Run full starter validation:

```bash
pnpm validate
```

This runs strict OpenSpec validation and validates a rendered copy of the generated template.

### Spec Validation

Validate all OpenSpec artifacts:

```bash
pnpm validate:spec
```

Validate the current change in strict mode:

```bash
pnpm ospec validate <change-id> --strict
```

### Constraint Validation

Confirm the following after implementation:

- Concrete variant directories exist only for approved variants declared in `starter.yaml`.
- Variant-specific metadata files live outside the neutral `template/` and are applied through overlays.
- No API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- Root `openspec/changes/` is not copied into `template/` or generated outputs.
- Neutral generated-project OpenSpec content only uses `template/openspec/`; variant-specific generated OpenSpec content lives in approved overlays.
- All references use `variant` and `overlay` terminology.
- No `flavour` metadata remains.

### Variant/Overlay Contract Validation

When adding or modifying a variant, confirm the following contract checks:

- Variant metadata is declared in `starter.yaml` as a map keyed by variant id.
- Overlay paths are relative to the starter repository root, not to `template/`.
- Overlay content lives outside `template/`.
- Overlay-provided `openspec/config.yaml` uses full-file replacement, not YAML merge or partial override.
- Overlay `openspec/config.yaml` declares `schema: spec-driven`, retains rendered project identity and starter provenance, and preserves or strengthens base validation rules.
- Variant validations are additive to the neutral starter validations.
- Documentation describes the conceptual overlay order (template base, overlay files, placeholder rendering, validation).

## Template Validation

### Structure Validation

- `starter.yaml` declares the expected contract fields.
- `template/` contains the expected directory structure.
- All importable OpenSpec specs exist under `template/openspec/specs/`.

### Rendered Output Validation

- The template can be copied to a clean directory.
- No unresolved double-underscore placeholders remain after rendering.
- `pnpm install` works in a generated copy.
- `pnpm validate` works in a generated copy.
- Nx can produce a project graph output.

### Running Template Validation

Validate a rendered copy of the template from the starter repository:

```bash
pnpm validate:template
```

This uses the same generic renderer semantics as `pnpm starter:render`: it copies `template/` to a temporary directory, resolves neutral placeholders, scans for unresolved placeholders, installs dependencies with a frozen lockfile, runs generated-project validation, and generates an Nx graph.

Neutral template validation does not apply variant overlays.

To keep the temporary rendered directory for debugging:

```bash
TEMPLATE_VALIDATE_KEEP_TEMP=1 pnpm validate:template
```

To verify the unresolved-placeholder scanner failure path:

```bash
TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER=1 pnpm validate:template
```

This intentionally injects an unresolved placeholder after the validation render. It verifies that the scanner fails the command before dependency installation; it does not simulate a complete production renderer failure.

## Starter Rendering

Render a project from the starter with the default `starter.render.yaml` input file:

```bash
pnpm starter:render
```

Render with an explicit YAML or JSON input file:

```bash
pnpm starter:render -- --input examples/render-input.neutral.yaml
```

Render with a selected variant:

```bash
pnpm starter:render -- --variant <variant-id> --input ./starter.render.yaml
```

Render inputs declare `output.path` and `placeholders`. Placeholder keys omit double-underscore delimiters:

```yaml
output:
  path: ../my-project

placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: Generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
```

If an input file declares `variant:` and `--variant` is also provided, both values must match. Unknown variants, missing required placeholders, non-empty output directories, and unresolved placeholders fail rendering.

## Variant Validation

Validate the approved MWS variant render:

```bash
pnpm validate:template:mws
```

This renders the neutral template with `variants/mws/overlay/`, resolves MWS placeholders from `examples/render-input.mws.yaml`, installs generated dependencies, runs generated-project validation, and generates an Nx graph.

For MWS validation, confirm:

- `starter.yaml` declares `variants.mws`.
- `variants.mws.overlay.path` is `variants/mws/overlay`.
- `variants.mws.placeholders.required` includes `PROJECT_ID`.
- `examples/render-input.mws.yaml` selects `mws` and includes `PROJECT_ID`.
- Rendered output includes `mws.project.yaml`, `docs/mws.md`, `docs/mws-openspec.md`, and `openspec/specs/mws-project-lifecycle/spec.md`.
- Rendered output uses the MWS full-file replacement for `openspec/config.yaml`.

Inside a generated project, run:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm nx graph --file=tmp/nx-graph.json
```
