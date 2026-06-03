## Execution Plan

### Starter metadata contract

- [ ] Confirm root `starter.yaml` keeps `variants: {}`.
- [ ] Document the future variant metadata shape in root starter documentation.
- [ ] Document that overlay paths are relative to the starter repository root.
- [ ] Document that future variant validations are additive to base validations.
- [ ] Document conceptual overlay order without implementing a renderer.
- [ ] Document that overlay-provided `openspec/config.yaml` uses full-file replacement.
- [ ] Document the guarantees required from overlay-provided `openspec/config.yaml`.

### Specs and validation docs

- [ ] Update starter-repository specs through the `foundation-starter` delta spec.
- [ ] Update root validation documentation with variant/overlay contract checks.
- [ ] Confirm no generated-template files under `template/` are changed.
- [ ] Confirm no concrete variant directory is created.

## Validation

### Contract validation

- [ ] Run `pnpm ospec validate define-variant-overlay-contract --strict`.
- [ ] Run `pnpm ospec validate --all --strict`.
- [ ] Run `pnpm validate:spec`.
- [ ] Confirm `starter.yaml` still declares `variants: {}`.
- [ ] Confirm no `variants/` directory exists.
- [ ] Confirm no `variants/mws/` directory exists.
- [ ] Confirm all active starter documentation uses `variant` and `overlay` terminology, not `flavour`.
- [ ] Confirm overlay OpenSpec config replacement semantics are documented as full-file replacement.
