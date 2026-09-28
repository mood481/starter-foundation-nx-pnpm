## Execution Plan

### Starter metadata contract

- [x] Confirm root `starter.yaml` keeps `variants: {}`.
- [x] Document the future variant metadata shape in root starter documentation.
- [x] Document that overlay paths are relative to the starter repository root.
- [x] Document that future variant validations are additive to base validations.
- [x] Document conceptual overlay order without implementing a renderer.
- [x] Document that overlay-provided `openspec/config.yaml` uses full-file replacement.
- [x] Document the guarantees required from overlay-provided `openspec/config.yaml`.

### Specs and validation docs

- [x] Update starter-repository specs through the `foundation-starter` delta spec.
- [x] Update root validation documentation with variant/overlay contract checks.
- [x] Confirm no generated-template files under `template/` are changed.
- [x] Confirm no concrete variant directory is created.

## Validation

### Contract validation

- [x] Run `pnpm ospec validate define-variant-overlay-contract --strict`.
- [x] Run `pnpm ospec validate --all --strict`.
- [x] Run `pnpm validate:spec`.
- [x] Confirm `starter.yaml` still declares `variants: {}`.
- [x] Confirm no `variants/` directory exists.
- [x] Confirm no `variants/mws/` directory exists.
- [x] Confirm all active starter documentation uses `variant` and `overlay` terminology, not `flavour`.
- [x] Confirm overlay OpenSpec config replacement semantics are documented as full-file replacement.
