# Validation

This document describes how to validate the foundation starter and its generated template.

## Starter Repository Validation

### Full Validation

Run full starter validation:

```bash
pnpm validate
```

This runs strict OpenSpec validation for the starter repository and validates a rendered copy of the neutral generated template.

### Spec Validation

Validate all OpenSpec artifacts:

```bash
pnpm validate:spec
```

`pnpm validate:spec` calls the local `ospec:validate` package script, which already enables `--all --strict`. Do not append another `--strict` or use `npx openspec`.

Validate the current change in strict mode:

```bash
pnpm ospec validate "<change-id>" --strict
```

If a direct executable invocation is required, use `pnpm exec openspec` so OpenSpec is resolved from local `node_modules`.

### Constraint Validation

Confirm the following after implementation:

- Concrete variant directories exist only for approved variants declared in `starter.yaml`.
- Variant-specific metadata files live outside the neutral `template/` and are applied through overlays.
- No API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- Root `openspec/changes/` is not copied into `template/` or generated outputs.
- Neutral generated output is SDD-neutral; selected variants or extensions own any generated SDD content.
- All references use `variant` and `overlay` terminology.
- No alternate variant metadata remains.

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
- The neutral template does not require an OpenSpec directory or provider.

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

It renders the neutral template with the canonical `@mood481/starter-renderer` (via `starter-render`), validates `starter.yaml` and the render request with the canonical `@mood481/starter-validator`, scans the rendered output for unresolved placeholders, runs a real `pnpm install` in the rendered project (there is no shipped template lockfile; the install produces the project's `pnpm-lock.yaml`), then runs generated-project `pnpm validate` and generates an Nx graph.

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

Rendering is delegated to the canonical `@mood481/starter-renderer` (`starter-render`). Render requests are canonical `render.yaml` documents declaring `mode`, optional `variant`/`extensions`, `paths`, and `placeholders`:

Render the neutral template:

```bash
starter-render --starter . --input examples/render.neutral.yaml --output ./my-project
```

Render the MWS variant (the request selects `variant: mws`):

```bash
starter-render --starter . --input examples/render.mws.yaml --output ./my-project
```

Equivalent convenience scripts render into each example's `paths.root`:

```bash
pnpm test:render
pnpm test:render:mws
```

Canonical render requests use explicit scalar placeholder values (placeholder keys omit double-underscore delimiters):

```yaml
mode: standalone

paths:
  root: ../my-project

placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: Generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
```

Missing required placeholders, unknown variants, unresolved extensions, non-empty output directories, and unresolved placeholders fail rendering before output writes where possible. Inline overrides (`--variant`, `--output`, repeatable `--set KEY=value`) follow the canonical `starter-render` CLI contract; when a request file is used, its fields govern.

The exported `starter-foundation-render` binary is a thin delegation shim to the canonical `starter-render`; verify it locally with the installed toolkit without any private-registry install:

```bash
node bin/starter-foundation-render.mjs --help
node bin/starter-foundation-render.mjs --input examples/render.neutral.yaml --output tmp/shim-check
```

Published-package packing and the Gitea consumer/`npx` checks (which need the `@mood481` scope mapping and a `package:read` `GITEA_TOKEN`) are covered in [docs/publishing.md](docs/publishing.md). OpenSpec remains root starter-maintenance tooling, invoked through the local `pnpm` commands above; it is not installed in a neutral generated project.

## Variant Validation

Validate the approved MWS variant render:

```bash
pnpm validate:template:mws
```

This renders the neutral template with `variants/mws/overlay/`, resolves MWS placeholders from `examples/render.mws.yaml`, installs generated dependencies, runs generated-project validation, and generates an Nx graph.

For MWS validation, confirm:

- `starter.yaml` declares `variants.mws`.
- `variants.mws.overlay.path` is `variants/mws/overlay`.
- `variants.mws.placeholders.required` includes `PROJECT_ID`.
- `examples/render.mws.yaml` selects `mws` and includes `PROJECT_ID`.
- Rendered output includes `mws.project.yaml`, `docs/mws.md`, `docs/mws-openspec.md`, and `openspec/specs/mws-project-lifecycle/spec.md`.
- Rendered output uses the MWS overlay's complete `openspec/config.yaml` contribution; the neutral template has no OpenSpec config to replace.

Inside a generated project, run (the first install produces the project's `pnpm-lock.yaml`; a later `--frozen-lockfile` install then reproduces from it):

```bash
pnpm install
pnpm validate
pnpm nx graph --file=tmp/nx-graph.json
```
