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

## Terminology

- **variant**: The catalog-level option selected by a consumer.
- **overlay**: The technical file or rule layer applied on top of `template/`.
