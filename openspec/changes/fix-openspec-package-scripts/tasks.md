## Execution Plan

### Root package scripts

- [x] Rename the root raw OpenSpec wrapper script from `openspec` to `ospec` in `package.json`.
- [x] Rename standalone OpenSpec helper scripts from `os:*` to `ospec:*` in `package.json`.
- [x] Keep only standalone helpers for list, list specs, strict validation, and strict validation JSON.
- [x] Remove `os:status`, `os:validate:change`, and `os:update` from `package.json`.
- [x] Update root `validate` to call `pnpm ospec:validate`.
- [x] Confirm no root `os:*` scripts or hardcoded change ids remain.

### Documentation references

- [x] Search active starter-repository documentation for old `os:*` or `pnpm openspec` references.
- [x] Update any active starter-repository references to use `ospec:*` helpers or `pnpm ospec <args>`.
- [x] Confirm generated-template files under `template/` are unchanged.

## Validation

### Script validation

- [x] Run `pnpm ospec:list`.
- [x] Run `pnpm ospec:list:specs`.
- [x] Run `pnpm ospec:validate`.
- [x] Run `pnpm ospec:validate:json`.
- [x] Run `pnpm ospec status --change fix-openspec-package-scripts`.
- [x] Run `pnpm ospec validate fix-openspec-package-scripts --strict`.
- [x] Run `pnpm validate`.

### Contract validation

- [x] Run `openspec validate fix-openspec-package-scripts --strict`.
- [x] Run `openspec validate --all --strict`.
- [x] Confirm the implementation satisfies the `quality-gates` delta spec.
- [x] Confirm no concrete variant or generated-template behaviour was introduced.
