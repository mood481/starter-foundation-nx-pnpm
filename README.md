# starter-foundation-nx-pnpm

Neutral foundation starter for strict Nx + pnpm multi-language monorepos.

## Overview

This starter defines a neutral, renderable foundation template for monorepos based on Nx and pnpm. It provides the monorepo structure, workspace configuration, and validation baseline without selecting an SDD provider. Approved variants and optional extensions may add contributions outside the neutral `template/`.

## Usage

The starter is consumed with the starter-owned renderer. The renderer reads structured YAML or JSON input in file mode, or accepts inline values in CLI mode. It copies the neutral `template/`, optionally applies a selected variant overlay and extensions, resolves double-underscore placeholders, and fails if unresolved placeholders remain.

Render with the root default input file, `starter.render.yaml`:

```bash
pnpm starter:render
```

Render with an explicit input file:

```bash
pnpm starter:render -- --input examples/render-input.neutral.yaml
```

Render in CLI mode without a render input file:

```bash
pnpm starter:render -- --output ./my-project --set PROJECT_NAME="My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=Generated foundation repository." --set DEFAULT_PACKAGE_SCOPE=@my-project
```

Optional capabilities are selected independently from variants. In CLI mode,
use a comma-separated list of extension names:

```bash
pnpm starter:render -- --extensions example-extension --output ./my-project --set PROJECT_NAME="My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=Generated foundation repository." --set DEFAULT_PACKAGE_SCOPE=@my-project
```

In CLI mode, `--output` is optional and defaults to `dist/` relative to the current directory. `--set` is repeatable, and values are preserved after the first `=`. Optional extensions use `--extensions <name1,name2>`. When `--input` is present, its `output.path`, `variant`, `extensions`, and `placeholders` are authoritative; concurrent `--variant`, `--extensions`, `--output`, and `--set` flags are ignored with a warning.

Render the approved MWS variant with inline values:

```bash
starter-foundation-render --variant mws --output ../tmp/rendered-mws-example --set PROJECT_ID=example-mws-foundation --set "PROJECT_NAME=Example MWS Foundation" --set PROJECT_SLUG=example-mws-foundation --set "PROJECT_DESCRIPTION=Example MWS-compatible foundation repository." --set DEFAULT_PACKAGE_SCOPE=@example-mws
```

The same published renderer can be invoked with `npx`:

```bash
npx @mood481/starter-foundation-nx-pnpm@<version> --variant mws --output ./my-project --set PROJECT_ID=my-project --set "PROJECT_NAME=My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=My project" --set DEFAULT_PACKAGE_SCOPE=@my-project
```

## Publishing

The renderer package is privately distributed through Gitea. Configure the
`@mood481` scope mapping and read token before using `npx`. Maintainers should
use `pnpm starter:publish`; the full publishing and GitHub Actions configuration
is documented in [docs/publishing.md](docs/publishing.md).

The neutral input shape is:

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

The renderer derives starter and runtime placeholders such as `STARTER_ID`, `STARTER_VERSION`, `NODE_VERSION`, and `PNPM_VERSION` from the starter repository metadata.

A future external extension can be declared without a repository-local
`extensions/` directory. This is documentation of the contract only; no such
extension is bundled in this release:

```yaml
extensions:
  - id: example-extension
    version: 1.0.0
    source: npm
    package: "@scope/example-extension"
```

## Repository Structure

```txt
.
├── .github/           # GitHub Actions workflows
├── openspec/          # Starter-maintenance SDD artifacts
├── template/          # Neutral generated-project baseline
├── docs/              # Starter-maintenance documentation
├── starter.yaml       # Starter contract metadata
├── starter.render.yaml # Default neutral render input
├── renovate.json      # Renovate dependency automation config
├── README.md          # This file
├── VALIDATION.md      # Validation instructions
└── CHANGELOG.md       # Change history
```

## Template Structure

The `template/` directory contains files that become part of generated projects:

```txt
template/
├── apps/              # Application projects
├── services/          # Backend services, APIs, workers
├── packages/          # Shared libraries and reusable packages
├── tools/             # Scripts, generators, automation
├── docs/              # Generated-project documentation
├── package.json       # Root workspace metadata
├── pnpm-workspace.yaml
├── nx.json            # Nx orchestration config
└── ...
```

## Prerequisites

- Node.js >= 22
- pnpm >= 10

## Getting Started

```bash
pnpm install
pnpm validate
```

## Variants

This starter is variant-ready. Variants are declared in `starter.yaml` under `variants`. Concrete variants are introduced through dedicated changes and live outside the neutral `template/`.

### MWS Variant

The approved `mws` variant adds MWS foundation metadata, generated-project MWS docs, an MWS lifecycle spec, and a stricter generated OpenSpec config through its overlay. OpenSpec is variant-provided for MWS and is not part of the neutral foundation.

Render the MWS variant with the generic starter renderer:

```bash
pnpm starter:render -- --input examples/render-input.mws.yaml
```

The MWS render input provides `PROJECT_ID` and the base project placeholders through structured YAML. The renderer applies `variants/mws/overlay/` before placeholder rendering.

Validate the MWS variant render:

```bash
pnpm validate:template:mws
```

### Variant Metadata Shape

A variant entry in `starter.yaml` uses a map keyed by kebab-case variant id. Each entry supports a human-readable name, a description, an optional overlay path, optional required placeholders, and optional additional validation commands:

```yaml
variants:
  example:
    name: Example Variant
    description: Example variant description.
    overlay:
      path: variants/example/overlay
    placeholders:
      required:
        - EXAMPLE_ID
    validations:
      - pnpm validate:template:example
```

### Overlay Paths

Overlay paths are relative to the starter repository root, not relative to `template/`. This keeps overlay sources separate from neutral generated-template files.

### Overlay Application Order

The conceptual render order is:

```txt
template/ base
    |
    v
variant overlay files, if selected
    |
    v
extension files and structured package mutations, if selected
    |
    v
placeholder rendering
    |
    v
validation
```

Variant overlay files may add or replace generated files as complete files. Extension files are add-only and conflicts fail before writes; extension package metadata uses the structured mutation contract. Validation must prove the effective rendered output is complete and contains no unresolved placeholders.

The renderer preflights metadata and input, resolves the variant, resolves and
checks extensions, then checks compatibility and contribution conflicts before
writing. It copies the neutral template, applies the variant overlay, applies
extension files in canonical order, applies package metadata mutations, resolves
placeholders, scans for unresolved placeholders, and runs additive validation.

Variant selection is an input to `pnpm starter:render`; variants do not require variant-specific renderers. A variant may be selected with `--variant <id>` or by declaring `variant: <id>` in the render input file. If `--input` is present, the file variant is authoritative and a concurrent CLI variant is ignored with a warning.

### Validation Contract

Future variants may declare additional validation commands. These validations are additive to the neutral starter validations — variants must not remove or weaken base validations unless a later approved change modifies the base validation contract.

### MWS Variant OpenSpec Content

The MWS overlay contributes `openspec/config.yaml` as a complete file because the neutral template has no OpenSpec config. It is an MWS variant contribution, not a neutral baseline and not an extension.

An overlay-provided `openspec/config.yaml` must preserve these base guarantees:
- Declare `schema: spec-driven`.
- Retain rendered project identity and starter provenance.
- Not copy starter-maintenance root context.
- Preserve or strengthen generated-project authoring and validation rules.
- Render without unresolved placeholders.
- Remain renderable through the same placeholder contract.
- Pass rendered-template and variant validation.

Variants may add stricter rules but must not weaken the base validation and safety guarantees.

### Local OpenSpec Commands

OpenSpec is installed locally in this starter. Use the package scripts for normal validation:

```bash
pnpm validate:spec
pnpm ospec:validate
```

To validate only the active change, use the local passthrough script:

```bash
pnpm ospec validate "add-starter-foundation-render-cli-and-npx" --strict
```

Do not use `npx openspec`; the `npx` commands above are only for the published renderer package.

## Dependency Automation

This starter repository uses Renovate to keep root `@fission-ai/openspec` maintenance tooling up to date: `patch` and `minor` updates automerge after regenerating the checked-in OpenSpec tooling, while `major` updates stay manual. See `docs/renovate.md` for how to activate Renovate on GitHub or on other Git servers.

## Terminology

- **variant**: The catalog-level option selected by a consumer.
- **overlay**: The technical file or rule layer applied on top of `template/`.
- **extension**: An independently selected, source-resolved capability contribution composed after the selected variant.
