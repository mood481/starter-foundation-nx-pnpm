## Why

The starter currently validates OpenSpec artifacts, but it does not provide a single repository command that proves the `template/` directory can be rendered into a working generated project.

Maintainers need an automated validation path that catches unresolved placeholders, broken frozen installs, failing generated-project validation, and Nx graph issues before changes are archived.

## What Changes

- Add a root generated-template validation command for the starter repository.
- Add a small script that copies `template/` to a temporary directory, renders known neutral placeholders, scans for unresolved placeholders, and runs generated-project checks.
- Validate the rendered copy with `pnpm install --frozen-lockfile`, `pnpm validate`, and `pnpm nx graph --file=tmp/nx-graph.json`.
- Update root `validate` so full starter validation is the default and runs both strict OpenSpec validation and rendered-template validation.
- Add `validate:spec` as the simple OpenSpec-only validation command.
- Document how maintainers run full validation, spec-only validation, and template-only validation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `quality-gates`: add starter-repository requirements for rendered-template validation.

## Impact

- Affected starter-repository files: root `package.json`, root validation documentation, and a new validation script under `tools/scripts/`.
- Affected specs: `quality-gates`.
- Affected validation behaviour: root `validate` becomes more comprehensive and slower because it validates a rendered generated project; `validate:spec` remains the fast OpenSpec-only path.
- Generated-template files under `template/` are not changed by this proposal.

## Out of Scope

- Do not implement a production renderer.
- Do not introduce concrete variants or overlays.
- Do not add generated-project application, service, API, auth, storage, observability, or infrastructure modules.
- Do not change OpenSpec version or generated-template dependency versions.

## Risks

- Full validation will run dependency installation in a temporary generated project, so it is slower than OpenSpec-only validation.
- A scripted placeholder render uses representative neutral values; it validates the current placeholder contract but is not a substitute for a future full renderer implementation.
