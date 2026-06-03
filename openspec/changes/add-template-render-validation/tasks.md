## Execution Plan

### Validation script

- [x] Create root `tools/scripts/` if it does not exist.
- [x] Create `tools/scripts/validate-template-render.mjs`.
- [x] Implement template copy to a temporary generated-project directory.
- [x] Implement deterministic replacement for current neutral placeholders.
- [x] Implement unresolved placeholder scanning for generated files.
- [x] Implement generated-project command execution for `pnpm install --frozen-lockfile`.
- [x] Implement generated-project command execution for `pnpm validate`.
- [x] Implement generated-project command execution for `pnpm nx graph --file=tmp/nx-graph.json`.
- [x] Implement default cleanup of the temporary generated-project directory.
- [x] Add a debug option to keep the temporary generated-project directory when needed.

### Package scripts and documentation

- [x] Add root `validate:template` script.
- [x] Add root `validate:spec` script that runs `pnpm ospec:validate`.
- [x] Update root `validate` to run `pnpm validate:spec && pnpm validate:template`.
- [x] Update root `VALIDATION.md` with full validation, spec-only validation, and template-only validation commands.
- [x] Confirm OpenSpec-only validation is available through `pnpm validate:spec`.
- [x] Add `analytics: false` to `template/nx.json`.
- [x] Add `neverConnectToCloud: true` to `template/nx.json`.
- [x] Update importable generated-template specs with Nx telemetry and cloud defaults.

## Validation

### Script validation

- [x] Run `pnpm validate:spec`.
- [x] Run `pnpm validate:template`.
- [x] Run `pnpm validate`.
- [x] Confirm `pnpm validate:template` fails when `TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER=1` injects an unresolved placeholder to test the scanner failure path.

### Contract validation

- [x] Run `pnpm ospec validate add-template-render-validation --strict`.
- [x] Run `pnpm ospec validate --all --strict`.
- [x] Confirm generated-template changes are limited to Nx telemetry/cloud defaults and matching importable specs.
- [x] Confirm no concrete variant, overlay, module, application, service, API, auth, storage, observability, or infrastructure behaviour was introduced.
