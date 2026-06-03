## Why

The foundation starter is variant-ready, but it does not yet define how future variants and overlays should be declared, located, applied, or validated.

Before adding a concrete variant such as `mws`, maintainers need a neutral contract that keeps variants predictable without coupling the foundation template to any specific variant. The contract must also make it explicit how a variant can replace generated `openspec/config.yaml` when it needs stricter rules.

## What Changes

- Define the neutral variant and overlay terminology as enforceable starter metadata contract.
- Extend the root `starter.yaml` contract to describe how future variants are declared.
- Define the expected shape of variant metadata, including optional overlay paths and validation commands.
- Define overlay path and precedence rules without creating a concrete overlay.
- Reserve explicit support for full-file replacement of generated `openspec/config.yaml` by overlays.
- Define the contract that any overlay-provided `openspec/config.yaml` must satisfy.
- Define validation expectations for future variants and overlays.
- Keep `variants` empty in this change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `foundation-starter`: define the future variant and overlay metadata contract while preserving neutral initial state.

## Impact

- Affected starter-repository files: `starter.yaml`, root documentation, and validation documentation.
- Affected specs: `foundation-starter`.
- Affected validation behaviour: future changes that add variants must satisfy the declared variant/overlay contract, including OpenSpec config replacement rules when applicable.
- Generated-template files under `template/` are not affected by this change.

## Out of Scope

- Do not add `mws` or any other concrete variant.
- Do not create `variants/` or any overlay directory.
- Do not add variant-specific generated files or metadata.
- Do not define a production renderer implementation.
- Do not define YAML merge semantics for `openspec/config.yaml`.
- Do not add application, service, API, auth, storage, observability, or infrastructure modules.

## Risks

- Defining the contract too narrowly could make future variants harder to express.
- Defining the contract too loosely could make variants inconsistent and hard to validate.
- Overlay precedence must remain simple enough for future renderers to implement deterministically.
- Full-file config replacement is simple and deterministic, but variants must be careful not to drop required base guarantees.
