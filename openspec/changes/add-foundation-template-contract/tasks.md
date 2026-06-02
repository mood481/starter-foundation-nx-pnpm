# Tasks: Add Foundation Template Contract

## Execution Plan

### Starter metadata

- [ ] Create root `starter.yaml`.
- [ ] Define starter id as `foundation-nx-pnpm`.
- [ ] Define starter kind as `foundation`.
- [ ] Define version as `0.1.0`.
- [ ] Define `template.path` as `template`.
- [ ] Define placeholder strategy with double-underscore syntax.
- [ ] Define OpenSpec as the default SDD provider.
- [ ] Define `variants` as an empty map.
- [ ] Define provided capabilities.
- [ ] Define canonical workspace paths.
- [ ] Define project registration rules.
- [ ] Define validation commands.

### Template structure

- [ ] Create `template/`.
- [ ] Create `template/apps/.gitkeep`.
- [ ] Create `template/services/.gitkeep`.
- [ ] Create `template/packages/.gitkeep`.
- [ ] Create `template/tools/scripts/`.
- [ ] Create `template/tools/nx/`.
- [ ] Create `template/docs/`.
- [ ] Create `template/openspec/specs/`.
- [ ] Create `template/openspec/changes/.gitkeep`.
- [ ] Create `template/openspec/archive/.gitkeep`.

### Workspace files

- [ ] Create `template/package.json`.
- [ ] Create `template/pnpm-workspace.yaml`.
- [ ] Create `template/nx.json`.
- [ ] Create `template/tsconfig.base.json`.
- [ ] Create `template/eslint.config.mjs`.
- [ ] Create `template/prettier.config.mjs`.
- [ ] Create `template/.editorconfig`.
- [ ] Create `template/.gitignore`.
- [ ] Create `template/.npmrc`.
- [ ] Create `template/.nvmrc`.

### Importable OpenSpec specs

- [ ] Create `template/openspec/specs/project-foundation/spec.md`.
- [ ] Create `template/openspec/specs/workspace-structure/spec.md`.
- [ ] Create `template/openspec/specs/nx-workspace/spec.md`.
- [ ] Create `template/openspec/specs/quality-gates/spec.md`.
- [ ] Create `template/openspec/specs/sdd-layout/spec.md`.

### Documentation

- [ ] Create root `VALIDATION.md`.
- [ ] Update root `README.md` with starter purpose and usage.
- [ ] Create `template/README.md`.
- [ ] Create `template/docs/development.md`.
- [ ] Create `template/docs/monorepo.md`.
- [ ] Create `template/docs/validation.md`.

## Validation

### OpenSpec validation

- [ ] Run `pnpm os:validate:change`.
- [ ] Run `pnpm os:validate`.
- [ ] Confirm the change passes strict OpenSpec validation.

### Constraint validation

- [ ] Confirm no concrete variant directory is added.
- [ ] Confirm no `variants/mws/` directory is added.
- [ ] Confirm no variant-specific metadata file is added.
- [ ] Confirm no API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- [ ] Confirm root `openspec/changes/` is not copied into `template/`.
- [ ] Confirm generated-project OpenSpec content only uses `template/openspec/`.
- [ ] Confirm all references use `variant` and `overlay` terminology.
- [ ] Confirm no `flavour` metadata remains.

### Template validation

- [ ] Validate `starter.yaml` against the intended contract.
- [ ] Validate the template can be copied to a clean directory.
- [ ] Validate no unresolved placeholders remain after a rendered copy is produced.
- [ ] Validate `pnpm install` works in a generated copy.
- [ ] Validate `pnpm validate` works in a generated copy.
- [ ] Validate Nx can produce a project graph output.

### Design validation

- [ ] Confirm each design constraint is satisfied by the implementation.
- [ ] Confirm repository structure matches the approved design.
- [ ] Confirm template structure matches the approved design.
- [ ] Confirm starter-repository spec IDs and generated-template spec IDs are intentionally mapped in `design.md`.
- [ ] Confirm future variants and module starters remain possible without changing the neutral contract.
