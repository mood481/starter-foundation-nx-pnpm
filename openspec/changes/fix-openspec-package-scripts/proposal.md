## Why

The starter repository package scripts use the confusing `os:` prefix and include helpers that either require extra arguments or are hardcoded to an already archived change.

Maintainers need a clear local OpenSpec wrapper plus a small set of standalone helper scripts that work without extra context.

## What Changes

- Rename the raw local OpenSpec wrapper script from `openspec` to `ospec`.
- Rename standalone OpenSpec helper scripts from `os:*` to `ospec:*`.
- Keep only standalone helpers that work without required extra arguments: list changes, list specs, validate all strictly, and validate all strictly as JSON.
- Remove context-dependent or stale helpers such as status, single-change validation, and update; maintainers can run those through `pnpm ospec <args>`.
- Keep root `validate` delegated to the all-artifacts OpenSpec strict validation script.
- Verify the resulting scripts against OpenSpec v1.4.0.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `quality-gates`: add starter-repository OpenSpec package script requirements.

## Impact

- Affected starter-repository file: root `package.json`.
- Affected specs: `quality-gates`.
- Affected tooling and validation behaviour: maintainer-facing pnpm scripts for OpenSpec.
- Generated-template files under `template/` are not affected.

## Out of Scope

- Do not change the generated project template scripts.
- Do not upgrade or downgrade `@fission-ai/openspec`.
- Do not add renderer, variant, module, application, service, or infrastructure functionality.
- Do not introduce concrete variants.

## Risks

- Script names are maintainer-facing commands, so stale documentation or habits may still reference the old `os:*` prefix until updated.
