## Execution Plan

### Validation script

- [ ] Create root `tools/scripts/` if it does not exist.
- [ ] Create `tools/scripts/validate-template-render.mjs`.
- [ ] Implement template copy to a temporary generated-project directory.
- [ ] Implement deterministic replacement for current neutral placeholders.
- [ ] Implement unresolved placeholder scanning for generated files.
- [ ] Implement generated-project command execution for `pnpm install --frozen-lockfile`.
- [ ] Implement generated-project command execution for `pnpm validate`.
- [ ] Implement generated-project command execution for `pnpm nx graph --file=tmp/nx-graph.json`.
- [ ] Implement default cleanup of the temporary generated-project directory.
- [ ] Add a debug option to keep the temporary generated-project directory when needed.

### Package scripts and documentation

- [ ] Add root `template:validate` script.
- [ ] Add root `validate:spec` script that runs `pnpm ospec:validate`.
- [ ] Update root `validate` to run `pnpm ospec:validate && pnpm template:validate`.
- [ ] Update root `VALIDATION.md` with full validation, spec-only validation, and template-only validation commands.
- [ ] Confirm OpenSpec-only validation is available through `pnpm validate:spec`.

## Validation

### Script validation

- [ ] Run `pnpm validate:spec`.
- [ ] Run `pnpm template:validate`.
- [ ] Run `pnpm validate`.
- [ ] Confirm `pnpm template:validate` fails when an unresolved placeholder is intentionally present in a temporary rendered copy.

### Contract validation

- [ ] Run `pnpm ospec validate add-template-render-validation --strict`.
- [ ] Run `pnpm ospec validate --all --strict`.
- [ ] Confirm no generated-template files under `template/` were changed unless required to fix a discovered contract bug.
- [ ] Confirm no concrete variant, overlay, module, application, service, API, auth, storage, observability, or infrastructure behaviour was introduced.
