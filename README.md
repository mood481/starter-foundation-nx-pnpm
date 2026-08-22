# starter-foundation-nx-pnpm

Neutral foundation starter for strict Nx + pnpm multi-language monorepos.

## Overview

This starter defines a neutral, renderable foundation template for monorepos based on Nx and pnpm. It provides the monorepo structure, workspace configuration, OpenSpec SDD layout, and validation baseline. Approved variants may add overlays outside the neutral `template/`.

## Usage

The starter is consumed with the starter-owned renderer. The renderer reads structured YAML or JSON input, copies the neutral `template/`, optionally applies a selected variant overlay, resolves double-underscore placeholders, and fails if unresolved placeholders remain.

Render with the default input file, `starter.render.yaml`:

```bash
pnpm starter:render
```

Render with an explicit input file:

```bash
pnpm starter:render -- --input examples/render-input.neutral.yaml
```

Render with an optional variant:

```bash
pnpm starter:render -- --variant example --input ./starter.render.yaml
```

The neutral input shape is:

```yaml
output:
  path: ../my-project

placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: Generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
```

The renderer derives starter and runtime placeholders such as `STARTER_ID`, `STARTER_VERSION`, `NODE_VERSION`, and `PNPM_VERSION` from the starter repository metadata.

## Repository Structure

```txt
.
├── .github/           # GitHub Actions workflows
├── openspec/          # Starter-maintenance SDD artifacts
├── template/          # Importable generated-project baseline
├── docs/              # Starter-maintenance documentation
├── starter.yaml       # Starter contract metadata
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
├── openspec/          # Generated-project SDD specs
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

The approved `mws` variant adds MWS foundation metadata, generated-project MWS docs, an MWS lifecycle spec, and a stricter generated OpenSpec config through an overlay.

Render the MWS variant with the generic starter renderer:

```bash
pnpm starter:render -- --variant mws --input examples/render-input.mws.yaml
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
placeholder rendering
    |
    v
validation
```

Overlay files may add or replace generated files according to deterministic renderer semantics. Validation must prove the effective rendered output is complete and contains no unresolved placeholders.

Variant selection is an input to `pnpm starter:render`; variants do not require variant-specific renderers. A variant may be selected with `--variant <id>` or by declaring `variant: <id>` in the render input file. If both are provided, they must match.

### Validation Contract

Future variants may declare additional validation commands. These validations are additive to the neutral starter validations — variants must not remove or weaken base validations unless a later approved change modifies the base validation contract.

### OpenSpec Config Replacement

If an overlay contains `openspec/config.yaml`, it replaces the neutral generated `openspec/config.yaml` as a complete file. The replacement is a full-file replacement, not a YAML merge or partial override. This is deterministic and easy to review.

An overlay-provided `openspec/config.yaml` must preserve these base guarantees:
- Declare `schema: spec-driven`.
- Retain rendered project identity and starter provenance.
- Not copy starter-maintenance root context.
- Preserve or strengthen generated-project authoring and validation rules.
- Render without unresolved placeholders.
- Remain renderable through the same placeholder contract.
- Pass rendered-template and variant validation.

Variants may add stricter rules but must not weaken the base validation and safety guarantees.

## Dependency Automation

This starter repository uses Renovate to keep `@fission-ai/openspec` up to date: `patch` and `minor` updates automerge after regenerating the checked-in OpenSpec tooling, while `major` updates stay manual. See `docs/renovate.md` for how to activate Renovate on GitHub or on other Git servers.

## Terminology

- **variant**: The catalog-level option selected by a consumer.
- **overlay**: The technical file or rule layer applied on top of `template/`.
