## Execution Plan

### Starter metadata

- [x] Confirm `add-starter-template-renderer` has been implemented before adding MWS-specific validation commands.
- [x] Update `starter.yaml` to declare the `mws` variant under `variants`.
- [x] Set `variants.mws.name` to a human-readable variant name.
- [x] Set `variants.mws.description` to explain the MWS foundation overlay purpose.
- [x] Set `variants.mws.overlay.path` to `variants/mws/overlay`.
- [x] Declare `PROJECT_ID` as an MWS variant required placeholder.
- [x] Add `pnpm validate:template:mws` as an MWS variant validation command.

### MWS overlay files

- [x] Create `variants/mws/overlay/mws.project.yaml`.
- [x] Include project identity placeholders in `mws.project.yaml`.
- [x] Include starter provenance in `mws.project.yaml`.
- [x] Include workspace, SDD, path, and lifecycle metadata in `mws.project.yaml`.
- [x] Create `variants/mws/overlay/docs/mws.md`.
- [x] Create `variants/mws/overlay/docs/mws-openspec.md`.
- [x] Document local human OpenSpec operation in `docs/mws-openspec.md`.
- [x] Document that local assistant command packs are not part of the generated template or MWS variant contract.
- [x] Create `variants/mws/overlay/openspec/config.yaml` as full-file replacement.
- [x] Add stricter MWS OpenSpec rules to `variants/mws/overlay/openspec/config.yaml`.
- [x] Create `variants/mws/overlay/openspec/specs/mws-project-lifecycle/spec.md`.
- [x] Ensure the overlay only adds files except for full-file replacement of `openspec/config.yaml`.

### MWS render input example

- [x] Create `examples/render-input.mws.yaml`.
- [x] Set `variant: mws` in `examples/render-input.mws.yaml`.
- [x] Include `output.path` in `examples/render-input.mws.yaml`.
- [x] Include `PROJECT_ID` in `examples/render-input.mws.yaml` placeholders.
- [x] Include base project placeholders in `examples/render-input.mws.yaml`: `PROJECT_NAME`, `PROJECT_SLUG`, `PROJECT_DESCRIPTION`, and `DEFAULT_PACKAGE_SCOPE`.

### Validation tooling

- [x] Update `package.json` with `validate:template:mws`.
- [x] Configure `validate:template:mws` to use `tools/scripts/validate-template-render.mjs --variant mws --input examples/render-input.mws.yaml`.
- [x] Confirm MWS validation uses the generic starter renderer semantics from `add-starter-template-renderer`.
- [x] Confirm `PROJECT_ID` is provided by the MWS render input example, not by a placeholder-specific CLI flag.
- [x] Confirm no MWS-specific renderer logic is added.
- [x] Confirm neutral template validation still runs without applying any variant overlay.

### Documentation and context

- [x] Update `README.md` to document the approved `mws` variant.
- [x] Update `README.md` to document rendering MWS through `pnpm starter:render -- --variant mws --input <file>`.
- [x] Update `VALIDATION.md` to distinguish neutral validation from MWS variant validation.
- [x] Update `openspec/config.yaml` context so concrete variants are allowed when introduced by approved changes.
- [x] Update `openspec/config.yaml` context so the neutral `template/` remains variant-independent.
- [x] Remove or reword validation guidance that says no concrete variant directory may ever exist.

### Specs

- [x] Update starter-repository specs through the `foundation-starter` delta spec.
- [x] Add the `mws-foundation-variant` delta spec.
- [x] Ensure generated-project MWS lifecycle expectations are defined in the overlay spec.

## Validation

### OpenSpec validation

- [x] Run `pnpm ospec validate add-mws-foundation-variant --strict`.
- [x] Run `pnpm ospec validate --all --strict`.
- [x] Run `pnpm validate:spec`.

### Neutral template validation

- [x] Run `pnpm validate:template`.
- [x] Confirm neutral rendered output does not include `mws.project.yaml`.
- [x] Confirm neutral rendered output does not include `docs/mws.md`.
- [x] Confirm neutral rendered output does not include `docs/mws-openspec.md`.
- [x] Confirm neutral rendered output does not include `openspec/specs/mws-project-lifecycle/spec.md`.

### MWS variant validation

- [x] Run `pnpm validate:template:mws`.
- [x] Confirm `examples/render-input.mws.yaml` selects `mws` and includes `PROJECT_ID`.
- [x] Confirm rendered MWS output includes `mws.project.yaml`.
- [x] Confirm rendered MWS output includes `docs/mws.md`.
- [x] Confirm rendered MWS output includes `docs/mws-openspec.md`.
- [x] Confirm rendered MWS output includes an MWS-specific `openspec/config.yaml`.
- [x] Confirm rendered MWS output includes `openspec/specs/mws-project-lifecycle/spec.md`.
- [x] Confirm rendered MWS output contains no unresolved double-underscore placeholders.
- [x] Confirm rendered `mws.project.yaml` contains rendered `PROJECT_ID`, project identity, starter provenance, and `variant: mws`.
- [x] Confirm rendered MWS `openspec/config.yaml` declares `schema: spec-driven`, retains project identity and starter provenance, and contains stricter MWS rules.
- [x] Confirm rendered MWS output starts with no active OpenSpec changes.

### Constraint validation

- [x] Confirm no MWS-specific files were added under neutral `template/`.
- [x] Confirm no application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability module was added.
- [x] Confirm generated `openspec/config.yaml` is replaced only through full-file MWS overlay semantics.
- [x] Confirm base neutral validations are not weakened by the MWS variant.
- [x] Confirm terminology uses `variant` and `overlay`, not `flavour`.
- [x] Confirm design constraints were respected.
