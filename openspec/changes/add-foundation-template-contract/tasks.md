# Tasks: Add Foundation Template Contract

## Execution Plan

### Starter metadata

- [x] Create root `starter.yaml`.
- [x] Define starter id as `foundation-nx-pnpm`.
- [x] Define starter kind as `foundation`.
- [x] Define version as `0.1.0`.
- [x] Define `template.path` as `template`.
- [x] Define placeholder strategy with double-underscore syntax.
- [x] Define OpenSpec as the default SDD provider.
- [x] Define `variants` as an empty map.
- [x] Define provided capabilities.
- [x] Define canonical workspace paths.
- [x] Define project registration rules.
- [x] Define validation commands.

### Template structure

- [x] Create `template/`.
- [x] Create `template/apps/.gitkeep`.
- [x] Create `template/services/.gitkeep`.
- [x] Create `template/packages/.gitkeep`.
- [x] Create `template/tools/scripts/`.
- [x] Create `template/tools/nx/`.
- [x] Create `template/docs/`.
- [x] Create `template/openspec/specs/`.
- [x] Create `template/openspec/changes/.gitkeep`.
- [x] Create `template/openspec/archive/.gitkeep`.

### Workspace files

- [x] Create `template/package.json`.
- [x] Create `template/pnpm-workspace.yaml`.
- [x] Create `template/nx.json`.
- [x] Create `template/tsconfig.base.json`.
- [x] Create `template/eslint.config.mjs`.
- [x] Create `template/prettier.config.mjs`.
- [x] Create `template/.editorconfig`.
- [x] Create `template/.gitignore`.
- [x] Create `template/.npmrc`.
- [x] Create `template/.nvmrc`.

### Importable OpenSpec specs

- [x] Create `template/openspec/specs/project-foundation/spec.md`.
- [x] Create `template/openspec/specs/workspace-structure/spec.md`.
- [x] Create `template/openspec/specs/nx-workspace/spec.md`.
- [x] Create `template/openspec/specs/quality-gates/spec.md`.
- [x] Create `template/openspec/specs/sdd-layout/spec.md`.

### Documentation

- [x] Create root `VALIDATION.md`.
- [x] Update root `README.md` with starter purpose and usage.
- [x] Create `template/README.md`.
- [x] Create `template/docs/development.md`.
- [x] Create `template/docs/monorepo.md`.
- [x] Create `template/docs/validation.md`.

## Validation

### OpenSpec validation

- [x] Run `pnpm os:validate:change`.
- [x] Run `pnpm os:validate`.
- [x] Confirm the change passes strict OpenSpec validation.

### Constraint validation

- [x] Confirm no concrete variant directory is added.
- [x] Confirm no `variants/mws/` directory is added.
- [x] Confirm no variant-specific metadata file is added.
- [x] Confirm no API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- [x] Confirm root `openspec/changes/` is not copied into `template/`.
- [x] Confirm generated-project OpenSpec content only uses `template/openspec/`.
- [x] Confirm all references use `variant` and `overlay` terminology.
- [x] Confirm no `flavour` metadata remains.

### Template validation

- [x] Validate `starter.yaml` against the intended contract.
- [x] Validate the template can be copied to a clean directory.
- [x] Validate no unresolved placeholders remain after a rendered copy is produced.
- [x] Validate `pnpm install` works in a generated copy.
- [x] Validate `pnpm validate` works in a generated copy.
- [x] Validate Nx can produce a project graph output.

### Design validation

- [x] Confirm each design constraint is satisfied by the implementation.
- [x] Confirm repository structure matches the approved design.
- [x] Confirm template structure matches the approved design.
- [x] Confirm starter-repository spec IDs and generated-template spec IDs are intentionally mapped in `design.md`.
- [x] Confirm future variants and module starters remain possible without changing the neutral contract.
