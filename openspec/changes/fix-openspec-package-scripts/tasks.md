## Execution Plan

### Root package scripts

- [ ] Rename the root raw OpenSpec wrapper script from `openspec` to `ospec` in `package.json`.
- [ ] Rename standalone OpenSpec helper scripts from `os:*` to `ospec:*` in `package.json`.
- [ ] Keep only standalone helpers for list, list specs, strict validation, and strict validation JSON.
- [ ] Remove `os:status`, `os:validate:change`, and `os:update` from `package.json`.
- [ ] Update root `validate` to call `pnpm ospec:validate`.
- [ ] Confirm no root `os:*` scripts or hardcoded change ids remain.

### Documentation references

- [ ] Search active starter-repository documentation for old `os:*` or `pnpm openspec` references.
- [ ] Update any active starter-repository references to use `ospec:*` helpers or `pnpm ospec <args>`.
- [ ] Confirm generated-template files under `template/` are unchanged.

## Validation

### Script validation

- [ ] Run `pnpm ospec:list`.
- [ ] Run `pnpm ospec:list:specs`.
- [ ] Run `pnpm ospec:validate`.
- [ ] Run `pnpm ospec:validate:json`.
- [ ] Run `pnpm ospec status --change fix-openspec-package-scripts`.
- [ ] Run `pnpm ospec validate fix-openspec-package-scripts --strict`.
- [ ] Run `pnpm validate`.

### Contract validation

- [ ] Run `openspec validate fix-openspec-package-scripts --strict`.
- [ ] Run `openspec validate --all --strict`.
- [ ] Confirm the implementation satisfies the `quality-gates` delta spec.
- [ ] Confirm no concrete variant or generated-template behaviour was introduced.
