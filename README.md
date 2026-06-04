# starter-foundation-nx-pnpm

Neutral foundation starter for strict Nx + pnpm multi-language monorepos.

## Overview

This starter defines a neutral, renderable foundation template for monorepos based on Nx and pnpm. It provides the monorepo structure, workspace configuration, OpenSpec SDD layout, and validation baseline without assuming any concrete variant.

## Usage

The starter is consumed by rendering the `template/` directory into a new project. Placeholders using double-underscore syntax (e.g., `__PROJECT_SLUG__`) are resolved during rendering.

## Repository Structure

```txt
.
├── openspec/          # Starter-maintenance SDD artifacts
├── template/          # Importable generated-project baseline
├── starter.yaml       # Starter contract metadata
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

This starter is variant-ready. Variants are declared in `starter.yaml` under `variants`. The initial contract declares an empty variants map. Concrete variants (e.g., `mws`) are introduced through dedicated changes.

### Variant Metadata Shape

A future variant entry in `starter.yaml` uses a map keyed by kebab-case variant id. Each entry supports a human-readable name, a description, an optional overlay path, and optional additional validation commands:

```yaml
variants:
  example:
    name: Example Variant
    description: Example variant description.
    overlay:
      path: variants/example/overlay
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

## Terminology

- **variant**: The catalog-level option selected by a consumer.
- **overlay**: The technical file or rule layer applied on top of `template/`.
