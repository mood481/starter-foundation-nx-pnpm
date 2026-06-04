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

- No concrete variant directory exists (e.g., no `variants/mws/`).
- No `variants/` directory exists.
- No variant-specific metadata file exists.
- No API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- Root `openspec/changes/` is not copied into `template/`.
- Generated-project OpenSpec content only uses `template/openspec/`.
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

Inside a generated project, run:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm nx graph --file=tmp/nx-graph.json
```
