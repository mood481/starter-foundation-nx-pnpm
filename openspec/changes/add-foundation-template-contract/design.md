# Design: Foundation Template Contract

## Context

The foundation starter is a neutral monorepo template based on Nx and pnpm.

It must serve two related but separate concerns:

1. Maintaining the starter repository itself.
2. Creating generated project repositories from the importable `template/` directory.

The starter repository uses OpenSpec to define and evolve the starter. Generated projects also receive OpenSpec specs, but only the importable specs under `template/openspec/specs/`. Active root changes used to build the starter must not be imported into generated projects.

The foundation must remain neutral. Variant-specific adaptations are expected later, and the `mws` variant is one expected future variant, but no concrete variant is introduced by this change.

## Goals / Non-Goals

Goals:

- Define the neutral `foundation-nx-pnpm` starter contract.
- Define the `starter.yaml` metadata expected by humans, CLIs, and automation.
- Define the `template/` structure imported into generated repositories.
- Define OpenSpec as the default SDD provider under `openspec/`.
- Define Nx and pnpm conventions for generated monorepos.
- Define multi-language support boundaries.
- Define placeholder and validation expectations.
- Keep the neutral starter variant-ready without introducing a concrete variant.

Non-goals:

- Do not define a concrete variant.
- Do not implement a renderer.
- Do not introduce module starters.
- Do not add application, API, mobile, service, auth, eventing, storage, infrastructure, observability, or CI/CD capabilities.
- Do not require every generated project to use JavaScript or TypeScript for implementation.

## Decisions

### Decision: Use `variant` and `overlay` terminology

The catalog-level option selected by a consumer is called a `variant`.

The technical file or rule layer applied on top of `template/` is called an `overlay`.

This change declares the neutral starter as variant-ready, but keeps the initial `variants` map empty.

### Decision: Keep starter-maintenance OpenSpec separate from generated OpenSpec

Root `openspec/` is used to maintain the starter repository.

`template/openspec/` is copied into generated projects.

The generated project must not receive the root active changes used to build the starter.

### Decision: Use `template/` as the importable generated-project source

All files intended to become part of a generated repository live under `template/`.

Files outside `template/` describe, validate, document, or maintain the starter itself.

### Decision: Use Nx for task orchestration

Nx is the workspace orchestration layer for common tasks, project graph, caching, and future affected operations.

Future module starters should register projects through `project.json` unless a later approved convention replaces this rule.

### Decision: Use pnpm as the package manager

The generated project is initialized as a pnpm workspace through `pnpm-workspace.yaml`.

The presence of a pnpm workspace does not mean every project must be a JavaScript package.

### Decision: Support multi-language projects

The generated monorepo uses JavaScript/TypeScript tooling for orchestration, but it must support TypeScript, Python, Go, and future approved runtimes.

Non-JavaScript projects may be registered with Nx through explicit `project.json` files and command-based targets.

## Spec Mapping

This change defines starter-repository delta specs and generated-template importable specs.

Starter-repository delta specs:

- `foundation-starter`: defines starter identity, metadata, variant readiness, and repository-level boundaries.
- `foundation-template`: defines the importable template structure and generated-project expectations.
- `nx-workspace-contract`: defines Nx conventions required by generated projects and future module starters.
- `quality-gates`: defines validation requirements for the starter and generated template.
- `sdd-contract`: defines the SDD contract for the starter and the separation between starter-maintenance OpenSpec artifacts and generated-project OpenSpec artifacts.

Generated-template importable specs:

- `template/openspec/specs/project-foundation/spec.md`
- `template/openspec/specs/workspace-structure/spec.md`
- `template/openspec/specs/nx-workspace/spec.md`
- `template/openspec/specs/quality-gates/spec.md`
- `template/openspec/specs/sdd-layout/spec.md`

The names are not required to match one-to-one. Starter-repository specs describe the starter contract. Importable specs describe the generated project's initial canonical state.

## Constraints

Agents and implementers must not violate these constraints:

- Do not introduce concrete variants in this change.
- Do not create `variants/mws/` or any other variant directory.
- Do not add variant-specific metadata files.
- Do not copy root `openspec/changes/` into generated projects.
- Do not place generated-project OpenSpec specs outside `template/openspec/specs/`.
- Do not add application, API, mobile, service, auth, eventing, storage, observability, or infrastructure modules.
- Do not assume all generated workspace projects are JavaScript or TypeScript.
- Do not use `flavour` metadata; use `variant` and `overlay`.
- Do not leave unresolved placeholders in a rendered output.

## Repository Structure

The starter repository should use this high-level structure:

```txt
.
├── openspec/
│   ├── specs/
│   ├── changes/
│   └── archive/
├── template/
├── starter.yaml
├── README.md
├── VALIDATION.md
└── CHANGELOG.md
```

Root `openspec/` is used to maintain the starter itself.

## Template Structure

The `template/` directory contains generated-project content.

Expected structure:

```txt
template/
├── apps/
│   └── .gitkeep
├── services/
│   └── .gitkeep
├── packages/
│   └── .gitkeep
├── tools/
│   ├── scripts/
│   └── nx/
├── docs/
│   ├── development.md
│   ├── monorepo.md
│   └── validation.md
├── openspec/
│   ├── specs/
│   │   ├── project-foundation/
│   │   │   └── spec.md
│   │   ├── workspace-structure/
│   │   │   └── spec.md
│   │   ├── nx-workspace/
│   │   │   └── spec.md
│   │   ├── quality-gates/
│   │   │   └── spec.md
│   │   └── sdd-layout/
│   │       └── spec.md
│   ├── changes/
│   │   └── .gitkeep
│   └── archive/
│       └── .gitkeep
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nvmrc
├── eslint.config.mjs
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── prettier.config.mjs
├── tsconfig.base.json
└── README.md
```

## Rendering Model

The neutral starter defines a rendering contract but does not implement a renderer.

The initial placeholder convention uses double-underscore placeholders:

```txt
__PROJECT_NAME__
__PROJECT_SLUG__
__PROJECT_DESCRIPTION__
__DEFAULT_PACKAGE_SCOPE__
__NODE_VERSION__
__PNPM_VERSION__
__STARTER_ID__
__STARTER_VERSION__
```

A renderer must fail if unresolved placeholders remain after rendering.

Variants are declared separately from the neutral template. A future variant may define an overlay path, metadata, or additional validation rules through a dedicated change.

## Starter Metadata

The root `starter.yaml` file is the starter contract.

Initial shape:

```yaml
id: foundation-nx-pnpm
name: Foundation Nx pnpm Monorepo
kind: foundation
version: 0.1.0

template:
  path: template
  engine: generic-renderer
  placeholders:
    style: double-underscore
    failOnUnresolved: true

sdd:
  provider: openspec
  root: openspec
  importable:
    - template/openspec/specs

variants: {}

provides:
  - monorepo
  - nx-workspace
  - pnpm-workspace
  - openspec-sdd
  - quality-gates
  - multi-language-workspace

paths:
  apps: apps
  services: services
  packages: packages
  tools: tools
  docs: docs
  sdd: openspec

projectRules:
  configFile: project.json
  requiredTargets:
    - lint
    - test
  optionalTargets:
    - typecheck
    - build
    - e2e
    - serve
    - docker
  requiredTags:
    - type
    - lang

validations:
  - pnpm install --frozen-lockfile
  - pnpm validate
  - pnpm nx graph --file=tmp/nx-graph.json
```

## Workspace Model

The generated project contains `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "tools/*"
  - "!**/dist/**"
  - "!**/build/**"
```

Not every matched directory is required to contain a `package.json`.

Future module starters may add `package.json` for JavaScript/TypeScript projects, `pyproject.toml` for Python projects, `go.mod` for Go projects, or other runtime-specific metadata.

## Nx Model

The generated project uses Nx for orchestration.

Common target names:

- `lint`
- `typecheck`
- `test`
- `build`
- `e2e`
- `serve`
- `validate`
- `docker`

Each future project should define `project.json` unless a later approved convention replaces that rule.

Project tags should include at least:

- `type:*`
- `lang:*`

Examples:

```txt
type:app
lang:typescript

type:service
lang:python

type:service
lang:go
```

## Alternatives Considered

### GitHub Template only

Rejected as the primary contract because it is useful for human repository creation but does not define rendering, placeholder, validation, or variant semantics.

### Put OpenSpec directly at root of generated projects as `specs/` and `changes/`

Rejected because `openspec/` makes the SDD provider explicit and leaves room for future SDD providers.

### Make the first concrete variant part of the foundation

Rejected because the foundation must remain neutral and reusable.

### Require all projects to be JavaScript packages

Rejected because the generated monorepo must support Python, Go, and future runtimes.

## Risks / Trade-offs

- A strict starter contract improves automation but makes later contract migrations more visible.
- Supporting multiple languages through Nx may require explicit `project.json` files and command-based targets until internal plugins exist.
- Keeping variants out of the initial change delays variant-specific automation but protects the neutral foundation from early coupling.
- Using placeholders instead of a specific templating engine keeps renderer choice open but requires strong validation against unresolved values.

## Migration Plan

No existing generated-project files are migrated by this change.

If previous drafts or local files use `flavour` terminology, rename them to `variant` and `overlay` before implementation is considered complete.

If previous drafts use root `specs/` and `changes/` for generated projects, move those generated-project artifacts under `template/openspec/`.

## Validation Strategy

Validation should prove that:

- OpenSpec strict validation passes for the change.
- The repository contains the expected root starter-maintenance structure.
- The template contains the expected generated-project structure.
- `starter.yaml` declares `variants: {}` and no concrete variant.
- Generated-project OpenSpec artifacts live under `template/openspec/`.
- Root active changes are not importable generated-project content.
- No variant-specific files are introduced.
- Placeholder conventions are documented and unresolved placeholders can be detected.
- Nx and pnpm baseline files are present in `template/`.
