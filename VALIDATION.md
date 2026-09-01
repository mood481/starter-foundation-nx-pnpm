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
pnpm ospec validate "add-starter-foundation-render-cli-and-npx" --strict
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

Render a project from the starter with the root default `starter.render.yaml` input file:

```bash
pnpm starter:render
```

Render with an explicit YAML or JSON input file:

```bash
pnpm starter:render -- --input examples/render-input.neutral.yaml
```

Render a selected variant in file mode by declaring it in the input file:

```bash
pnpm starter:render -- --input examples/render-input.mws.yaml
```

Render inputs declare `extensions`, `output.path`, and `placeholders`. The extension list defaults to `[]`; placeholder keys omit double-underscore delimiters:

```yaml
extensions: []

output:
  path: ../my-project

placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: Generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
```

If `--input` is present, the input file's `output.path`, `variant`, `extensions`, and `placeholders` are authoritative. Concurrent `--variant`, `--extensions`, `--output`, and `--set` flags are ignored with a warning. Unknown variants, unresolved extensions, missing required placeholders, non-empty output directories, and unresolved placeholders fail rendering before output writes where possible.

Render in CLI mode without a YAML or JSON render input file:

```bash
pnpm starter:render -- --variant mws --output ../tmp/rendered-mws-example --set PROJECT_ID=example-mws-foundation --set "PROJECT_NAME=Example MWS Foundation" --set PROJECT_SLUG=example-mws-foundation --set "PROJECT_DESCRIPTION=Example MWS-compatible foundation repository." --set DEFAULT_PACKAGE_SCOPE=@example-mws
```

In CLI mode, `--output` defaults to `dist/` relative to the current directory. `--set` is repeatable and preserves values after the first `=`. The same published binary can be checked with:

Select future externally resolved extensions in CLI mode with the same
lowercase kebab-case name grammar used by structured input:

```bash
pnpm starter:render -- --extensions name1,name2 --output ../tmp/rendered-extension --set PROJECT_NAME="Extension Project" --set PROJECT_SLUG=extension-project --set "PROJECT_DESCRIPTION=Extension project" --set DEFAULT_PACKAGE_SCOPE=@extension
```

The 0.5.0 starter bundles no concrete extension. A selected extension must be
provided by a configured resolver and fails before output writes when no
provider resolves it. Extensions are composed after a selected variant; their
files are add-only, and package metadata changes are limited to structured
`dependencies`, `devDependencies`, and `scripts` additions. An extension may
be supplied by an external source declaration; it does not need to live under
an `extensions/` directory in this repository.

Install the packed renderer without development dependencies, then invoke its local `npx` binary:

```bash
PACKAGE_DIR=$(mktemp -d)
CONSUMER_DIR=$(mktemp -d)
ARCHIVE=$(npm pack --pack-destination "$PACKAGE_DIR" --silent)
npm install --ignore-scripts --omit=dev --prefix "$CONSUMER_DIR" "$PACKAGE_DIR/$ARCHIVE"
npx --prefix "$CONSUMER_DIR" --no-install starter-foundation-render --help
npx --prefix "$CONSUMER_DIR" --no-install starter-foundation-render --variant mws --output /tmp/npx-mws-render --set PROJECT_ID=npx-test --set "PROJECT_NAME=Npx Test" --set PROJECT_SLUG=npx-test --set "PROJECT_DESCRIPTION=Npx via local package" --set DEFAULT_PACKAGE_SCOPE=@npx-test
```

These `npx` commands validate the published renderer package. OpenSpec remains
root starter-maintenance tooling and is invoked through the local `pnpm`
commands above; it is not installed in a neutral generated project.

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
- Rendered output uses the MWS overlay's complete `openspec/config.yaml` contribution; the neutral template has no OpenSpec config to replace.

Inside a generated project, run:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm nx graph --file=tmp/nx-graph.json
```
