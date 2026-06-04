## Execution Plan

### Starter metadata

- [ ] Confirm `add-starter-template-renderer` has been implemented before adding MWS-specific validation commands.
- [ ] Update `starter.yaml` to declare the `mws` variant under `variants`.
- [ ] Set `variants.mws.name` to a human-readable variant name.
- [ ] Set `variants.mws.description` to explain the MWS foundation overlay purpose.
- [ ] Set `variants.mws.overlay.path` to `variants/mws/overlay`.
- [ ] Declare `PROJECT_ID` as an MWS variant required placeholder.
- [ ] Add `pnpm validate:template:mws` as an MWS variant validation command.

### MWS overlay files

- [ ] Create `variants/mws/overlay/mws.project.yaml`.
- [ ] Include project identity placeholders in `mws.project.yaml`.
- [ ] Include starter provenance in `mws.project.yaml`.
- [ ] Include workspace, SDD, path, and lifecycle metadata in `mws.project.yaml`.
- [ ] Create `variants/mws/overlay/docs/mws.md`.
- [ ] Create `variants/mws/overlay/docs/mws-openspec.md`.
- [ ] Document local human OpenSpec operation in `docs/mws-openspec.md`.
- [ ] Document that local assistant command packs are not part of the generated template or MWS variant contract.
- [ ] Create `variants/mws/overlay/openspec/config.yaml` as full-file replacement.
- [ ] Add stricter MWS OpenSpec rules to `variants/mws/overlay/openspec/config.yaml`.
- [ ] Create `variants/mws/overlay/openspec/specs/mws-project-lifecycle/spec.md`.
- [ ] Ensure the overlay only adds files except for full-file replacement of `openspec/config.yaml`.

### MWS render input example

- [ ] Create `examples/render-input.mws.yaml`.
- [ ] Set `variant: mws` in `examples/render-input.mws.yaml`.
- [ ] Include `output.path` in `examples/render-input.mws.yaml`.
- [ ] Include `PROJECT_ID` in `examples/render-input.mws.yaml` placeholders.
- [ ] Include base project placeholders in `examples/render-input.mws.yaml`: `PROJECT_NAME`, `PROJECT_SLUG`, `PROJECT_DESCRIPTION`, and `DEFAULT_PACKAGE_SCOPE`.

### Validation tooling

- [ ] Update `package.json` with `validate:template:mws`.
- [ ] Configure `validate:template:mws` to use `tools/scripts/validate-template-render.mjs --variant mws --input examples/render-input.mws.yaml`.
- [ ] Confirm MWS validation uses the generic starter renderer semantics from `add-starter-template-renderer`.
- [ ] Confirm `PROJECT_ID` is provided by the MWS render input example, not by a placeholder-specific CLI flag.
- [ ] Confirm no MWS-specific renderer logic is added.
- [ ] Confirm neutral template validation still runs without applying any variant overlay.

### Documentation and context

- [ ] Update `README.md` to document the approved `mws` variant.
- [ ] Update `README.md` to document rendering MWS through `pnpm starter:render -- --variant mws --input <file>`.
- [ ] Update `VALIDATION.md` to distinguish neutral validation from MWS variant validation.
- [ ] Update `openspec/config.yaml` context so concrete variants are allowed when introduced by approved changes.
- [ ] Update `openspec/config.yaml` context so the neutral `template/` remains variant-independent.
- [ ] Remove or reword validation guidance that says no concrete variant directory may ever exist.

### Specs

- [ ] Update starter-repository specs through the `foundation-starter` delta spec.
- [ ] Add the `mws-foundation-variant` delta spec.
- [ ] Ensure generated-project MWS lifecycle expectations are defined in the overlay spec.

## Validation

### OpenSpec validation

- [ ] Run `pnpm ospec validate add-mws-foundation-variant --strict`.
- [ ] Run `pnpm ospec validate --all --strict`.
- [ ] Run `pnpm validate:spec`.

### Neutral template validation

- [ ] Run `pnpm validate:template`.
- [ ] Confirm neutral rendered output does not include `mws.project.yaml`.
- [ ] Confirm neutral rendered output does not include `docs/mws.md`.
- [ ] Confirm neutral rendered output does not include `docs/mws-openspec.md`.
- [ ] Confirm neutral rendered output does not include `openspec/specs/mws-project-lifecycle/spec.md`.

### MWS variant validation

- [ ] Run `pnpm validate:template:mws`.
- [ ] Confirm `examples/render-input.mws.yaml` selects `mws` and includes `PROJECT_ID`.
- [ ] Confirm rendered MWS output includes `mws.project.yaml`.
- [ ] Confirm rendered MWS output includes `docs/mws.md`.
- [ ] Confirm rendered MWS output includes `docs/mws-openspec.md`.
- [ ] Confirm rendered MWS output includes an MWS-specific `openspec/config.yaml`.
- [ ] Confirm rendered MWS output includes `openspec/specs/mws-project-lifecycle/spec.md`.
- [ ] Confirm rendered MWS output contains no unresolved double-underscore placeholders.
- [ ] Confirm rendered `mws.project.yaml` contains rendered `PROJECT_ID`, project identity, starter provenance, and `variant: mws`.
- [ ] Confirm rendered MWS `openspec/config.yaml` declares `schema: spec-driven`, retains project identity and starter provenance, and contains stricter MWS rules.
- [ ] Confirm rendered MWS output starts with no active OpenSpec changes.

### Constraint validation

- [ ] Confirm no MWS-specific files were added under neutral `template/`.
- [ ] Confirm no application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability module was added.
- [ ] Confirm generated `openspec/config.yaml` is replaced only through full-file MWS overlay semantics.
- [ ] Confirm base neutral validations are not weakened by the MWS variant.
- [ ] Confirm terminology uses `variant` and `overlay`, not `flavour`.
- [ ] Confirm design constraints were respected.
