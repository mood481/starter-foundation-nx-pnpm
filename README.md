# starter-foundation-nx-pnpm

Neutral foundation starter for strict Nx + pnpm multi-language monorepos.

## Overview

This starter defines a neutral, renderable foundation template for monorepos based on Nx and pnpm. It provides the monorepo structure, workspace configuration, and validation baseline without selecting an SDD provider. Rendering and validation are performed by the canonical starter-toolkit (`@mood481/starter-renderer` / `@mood481/starter-validator`); approved variants and optional extensions may add contributions outside the neutral `template/`.

## Usage

Generation is delegated to the canonical `@mood481/starter-renderer` CLI (`starter-render`). It reads a canonical render request (`mode`, `variant`, `extensions`, `paths`, `placeholders`), copies the neutral `template/`, applies an optional variant overlay, resolves placeholders, and fails on unresolved placeholders. The render and validation contracts are defined by the toolkit, not this repository.

Render from the repository root with an explicit request file:

```bash
starter-render --starter . --input examples/render.neutral.yaml --output ./my-project
```

Render the approved MWS variant (the request file selects `variant: mws`):

```bash
starter-render --starter . --input examples/render.mws.yaml --output ./my-project
```

Convenience scripts render using each example's `paths.root`:

```bash
pnpm test:render
pnpm test:render:mws
```

The package also ships `starter-foundation-render`, a thin binary that delegates to the canonical `starter-render` against the installed package's own starter root:

```bash
npx @mood481/starter-foundation-nx-pnpm@<version> starter-foundation-render --input examples/render.neutral.yaml --output ./my-project
```

See [docs/publishing.md](docs/publishing.md) for the private Gitea registry and the `@mood481` scope configuration required before `npx`.

The canonical render request shape is:

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

Render placeholders are explicit scalar values supplied in the request; the renderer does not derive values from files, the environment, or starter metadata. Starter provenance placeholders (for example `STARTER_ID`, `STARTER_VERSION`, `NODE_VERSION`, `PNPM_VERSION`) are provided in the request when the template references them.

## Publishing

The package is privately distributed through Gitea and delegates rendering to the canonical toolkit. Configure the `@mood481` scope mapping and read token before installing or using `npx`; maintainers publish with the repository `pnpm publish:render` entrypoint. The full publishing, channel-gating, and GitHub Actions configuration is documented in [docs/publishing.md](docs/publishing.md).

## Repository Structure

```txt
.
├── .github/           # GitHub Actions workflows
├── bin/               # Exported binary (delegates to canonical starter-render)
├── openspec/          # Starter-maintenance SDD artifacts
├── template/          # Neutral generated-project baseline (no shipped lockfile)
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
├── package.json       # Root workspace metadata
├── pnpm-workspace.yaml
├── nx.json            # Nx orchestration config
└── ...
```

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- Gitea access for the private `@mood481` scope (needed to install the canonical toolkit packages):

```bash
cp .npmrc.example .npmrc
export GITEA_TOKEN=<your read:package token>
```

`.npmrc.example` maps the `@mood481` scope to `https://git.mood481.es/api/packages/mood/npm/`; the real `.npmrc` is git-ignored and must never be committed.

## Getting Started

```bash
cp .npmrc.example .npmrc && export GITEA_TOKEN=<token>
pnpm install          # resolves @mood481/starter-* from Gitea, rest from npm public
pnpm validate
```

## Variants

This starter is variant-ready. Variants are declared in `starter.yaml` under `variants`. Concrete variants are introduced through dedicated changes and live outside the neutral `template/`.

### MWS Variant

The approved `mws` variant adds MWS foundation metadata and generated-project MWS documentation through its overlay. It does not add applications, services, APIs, workers, packages, infrastructure, auth, storage, eventing, or observability modules.

Render the MWS variant:

```bash
starter-render --starter . --input examples/render.mws.yaml --output ./my-project
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

The canonical render pipeline is:

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

Variant selection is an input to `starter-render`; variants do not require variant-specific renderers. A variant may be selected with `--variant <id>` or by declaring `variant: <id>` in the render request. When both are present, the canonical renderer's precedence rules apply.

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

OpenSpec is installed locally in this starter for repository maintenance. Use the package scripts for normal validation:

```bash
pnpm validate:spec
pnpm ospec:validate
```

To validate only the active change, use the local passthrough script:

```bash
pnpm ospec validate "<change-id>" --strict
```

Do not use `npx openspec`; OpenSpec is local starter-maintenance tooling, not part of the generated project.

## Dependency Automation

This starter repository uses Renovate to keep root `@fission-ai/openspec` maintenance tooling up to date: `patch` and `minor` updates automerge after regenerating the checked-in OpenSpec tooling, while `major` updates stay manual. See `docs/renovate.md` for how to activate Renovate on GitHub or on other Git servers.

## Terminology

- **variant**: The catalog-level option selected by a consumer.
- **overlay**: The technical file or rule layer applied on top of `template/`.
- **extension**: An independently selected, source-resolved capability contribution composed after the selected variant.
