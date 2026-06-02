# Change: Add Foundation Template Contract

## Why

The starter repository needs a clear neutral contract before any project-specific variant or module starter is introduced.

New generated projects need a reliable foundation that can be created deterministically and then extended through later module starters and OpenSpec changes. The foundation must define the monorepo structure, Nx and pnpm expectations, OpenSpec layout, rendering boundaries, and validation rules without assuming any concrete variant.

This change affects both the starter repository and the generated template:

- the starter repository receives the metadata and documentation needed to maintain the starter;
- the generated template receives the importable baseline files and OpenSpec specs that become part of new repositories.

## What Changes

- Add the neutral `foundation-nx-pnpm` starter contract.
- Add root `starter.yaml` metadata for template path, rendering expectations, SDD layout, project rules, variants, and validations.
- Add the `template/` directory as the importable generated-project baseline.
- Add generated-project directories for `apps/`, `services/`, `packages/`, `tools/`, `docs/`, and `openspec/`.
- Add importable OpenSpec specs under `template/openspec/specs/`.
- Add base Nx and pnpm workspace files under `template/`.
- Add baseline documentation for generated project maintainers.
- Define the initial placeholder strategy using double-underscore placeholders.
- Define the neutral starter as variant-ready while keeping `variants` empty.
- Define validation expectations for the template and generated projects.

## Impact

Affected starter-repository files:

- `starter.yaml`
- `README.md`
- `VALIDATION.md`
- `CHANGELOG.md`
- root `openspec/` canonical specs after this change is archived

Affected generated-template files:

- `template/package.json`
- `template/pnpm-lock.yaml`
- `template/pnpm-workspace.yaml`
- `template/nx.json`
- `template/tsconfig.base.json`
- `template/eslint.config.mjs`
- `template/prettier.config.mjs`
- `template/.editorconfig`
- `template/.gitignore`
- `template/.npmrc`
- `template/.nvmrc`
- `template/README.md`
- `template/docs/*`
- `template/openspec/specs/*`

Affected specs:

- `foundation-starter`
- `foundation-template`
- `nx-workspace-contract`
- `quality-gates`
- `sdd-contract`

Affected tooling and validation behaviour:

- Generated projects are expected to use pnpm as package manager.
- Generated projects are expected to use Nx as workspace orchestrator.
- Generated projects are expected to expose common validation scripts.
- Generated projects are expected to keep OpenSpec under `openspec/`.
- Rendering is expected to fail when unresolved placeholders remain.

Dependency impact:

- This change defines the starter contract and generated template expectations.
- It does not require adding runtime application dependencies.
- It may require development dependencies in the generated template for Nx, TypeScript, linting, formatting, and validation.

## Out of Scope

- Do not introduce concrete variants.
- Do not add `variants/mws/` or any other variant directory.
- Do not add variant-specific metadata files.
- Do not add API, mobile, web, worker, or infrastructure modules.
- Do not add authentication, authorization, users, tenants, eventing, storage, observability, or CI/CD capabilities.
- Do not define the renderer implementation.
- Do not define module starters.
- Do not require all future projects to be JavaScript or TypeScript.

## Risks

- The generated-template structure becomes a long-lived contract, so incorrect path choices would affect all future module starters.
- The starter metadata may need migration if the renderer contract changes later.
- Nx project discovery for non-JavaScript projects may require explicit `project.json` files or future internal plugins.
- Placeholder conventions must remain simple enough for multiple renderer implementations.
- Introducing variants later must not break neutral-template compatibility.
