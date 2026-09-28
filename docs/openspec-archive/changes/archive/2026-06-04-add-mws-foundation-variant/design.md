## Context

The starter currently has a neutral `template/` and a `variants` map in `starter.yaml`. Three related changes are expected to land before or alongside this change:

- `add-generated-openspec-config`: generated projects receive `template/openspec/config.yaml`.
- `define-variant-overlay-contract`: variants and overlays are formally declared in the starter contract.
- `add-starter-template-renderer`: the starter provides the generic render entrypoint used by consumers and validation.

This change introduces the first concrete variant, `mws`, as an approved variant built on that contract.

The `mws` variant is a foundation-only adaptation. It should make a generated repository recognizable and traceable by MWS, while keeping application/service/module construction for later module starters and capability changes.

## Goals / Non-Goals

Goals:

- Add `mws` as the first concrete variant.
- Keep the neutral `template/` independent from MWS-specific files.
- Add MWS project metadata to generated repositories through an overlay.
- Add generated-project documentation for MWS usage.
- Add an importable generated-project spec that defines the MWS foundation lifecycle.
- Add an MWS structured render input example for the generic starter renderer.
- Add deterministic validation for rendering the `mws` variant.
- Update documentation and starter-maintenance context so approved variants are allowed outside `template/`.

Non-goals:

- Do not add domain, app, service, API, mobile, web, worker, or package modules.
- Do not add MWS orchestration runtime implementation.
- Do not add auth, user management, eventing, storage, observability, infrastructure, CI/CD, or deployment stack.
- Do not define MWS-specific module selection logic.
- Do not add an MWS-specific renderer or duplicate the generic starter renderer.
- Do not introduce config merge semantics for `openspec/config.yaml`; MWS uses full-file replacement.

## Decisions

### Decision: Declare `mws` in `starter.yaml`

The root `starter.yaml` should declare `mws` under `variants`.

Expected shape:

```yaml
variants:
  mws:
    name: MWS Foundation Variant
    description: MWS-compatible foundation overlay for generated monorepos.
    overlay:
      path: variants/mws/overlay
    placeholders:
      required:
        - PROJECT_ID
    validations:
      - pnpm validate:template:mws
```

The exact wording may vary, but the variant must declare its overlay path and its extra placeholder requirements.

### Decision: Select MWS through the generic starter renderer

MWS should not introduce a variant-specific renderer. Consumers and automation select the `mws` variant through the generic starter renderer introduced by `add-starter-template-renderer`.

Productive MWS render examples:

```bash
pnpm starter:render -- --variant mws --input ./starter.render.yaml
```

or, when the input file declares `variant: mws`:

```bash
pnpm starter:render -- --input ./starter.render.yaml
```

The renderer reads `starter.yaml`, resolves the selected `mws` variant, applies `variants/mws/overlay/`, renders placeholders from the structured input file, and fails if MWS-required placeholders such as `PROJECT_ID` are missing.

### Decision: Add an MWS render input example

The change should add:

```txt
examples/render-input.mws.yaml
```

Expected shape:

```yaml
variant: mws

output:
  path: ../example-mws-foundation

placeholders:
  PROJECT_ID: example-mws-foundation
  PROJECT_NAME: Example MWS Foundation
  PROJECT_SLUG: example-mws-foundation
  PROJECT_DESCRIPTION: Example MWS-compatible foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@example-mws"
```

The example documents that MWS-specific render inputs live in structured input files, not in placeholder-specific CLI flags.

### Decision: Keep MWS overlay outside `template/`

MWS-specific generated files should live under:

```txt
variants/mws/overlay/
```

This keeps the neutral generated template reusable by non-MWS consumers.

### Decision: Add `mws.project.yaml` to generated repositories

The MWS overlay should add a generated root metadata file:

```txt
variants/mws/overlay/mws.project.yaml
```

Rendered output:

```txt
mws.project.yaml
```

Expected content shape:

```yaml
schema: mws.project/v1
project:
  id: "__PROJECT_ID__"
  name: "__PROJECT_NAME__"
  slug: "__PROJECT_SLUG__"
  description: "__PROJECT_DESCRIPTION__"
starter:
  id: "__STARTER_ID__"
  version: "__STARTER_VERSION__"
  variant: mws
workspace:
  packageManager: pnpm
  orchestrator: nx
sdd:
  provider: openspec
  root: openspec
paths:
  apps: apps
  services: services
  packages: packages
  tools: tools
  docs: docs
  sdd: openspec
lifecycle:
  phase: foundation
  modules: []
```

The file should stay intentionally small. Later MWS flows may extend it through dedicated changes.

### Decision: Add MWS generated-project docs

The overlay should add:

```txt
variants/mws/overlay/docs/mws.md
```

Rendered output:

```txt
docs/mws.md
```

The document should explain that the repository was generated with the `mws` variant, where metadata lives, and how later MWS module starters or OpenSpec changes may extend the repository.

### Decision: Add MWS OpenSpec operation docs for humans

The overlay should add:

```txt
variants/mws/overlay/docs/mws-openspec.md
```

Rendered output:

```txt
docs/mws-openspec.md
```

This document should explain how human maintainers use the local generated-project OpenSpec CLI scripts for exploration, proposal, validation, and review. It should also state that local assistant command packs or interactive tooling are not part of the template or variant contract because MWS automation uses deterministic prompts and repository artifacts.

### Decision: Add MWS generated-project lifecycle spec

The overlay should add:

```txt
variants/mws/overlay/openspec/specs/mws-project-lifecycle/spec.md
```

Rendered output:

```txt
openspec/specs/mws-project-lifecycle/spec.md
```

This spec should define generated-project expectations only. It should not describe the implementation of MWS services.

### Decision: Replace generated `openspec/config.yaml` with stricter MWS config

The MWS overlay should add:

```txt
variants/mws/overlay/openspec/config.yaml
```

Rendered output:

```txt
openspec/config.yaml
```

This is a full-file replacement of the neutral generated OpenSpec config, using the replacement semantics defined by `define-variant-overlay-contract`. The replacement must:

- declare `schema: spec-driven`;
- retain rendered project identity and starter provenance;
- avoid copying starter-maintenance root context;
- preserve neutral generated-project safety and validation guarantees;
- add stricter MWS rules for deterministic automation and high-reliability implementation;
- leave human project/domain context editable where MWS does not know it;
- render with no unresolved placeholders.

### Decision: Validate MWS through the generic renderer path

MWS variant validation should use the renderer-backed template validation introduced by `add-starter-template-renderer`. This proves the same variant selection, overlay application, and placeholder semantics used for productive rendering.

Expected script:

```json
{
  "scripts": {
    "validate:template:mws": "node tools/scripts/validate-template-render.mjs --variant mws --input examples/render-input.mws.yaml"
  }
}
```

The validation logic should:

1. load the MWS render input example;
2. select the `mws` variant through the generic renderer;
3. copy `template/` into a temporary render directory;
4. apply `variants/mws/overlay/` over that directory;
5. render placeholders, including `__PROJECT_ID__`;
6. fail if unresolved placeholders remain;
7. run generated-project validation;
8. confirm MWS overlay files exist in the rendered output.

### Decision: Update starter-maintenance context

The root `openspec/config.yaml` currently describes a neutral starter boundary. Once `mws` is approved, the context should distinguish:

- neutral template boundaries;
- approved variant boundaries.

Concrete variants should be allowed only when introduced by an approved change and should live outside `template/`.

## Constraints

Agents must not violate these constraints:

- Do not add MWS-specific files under the neutral `template/` unless they are imported through `variants/mws/overlay/` during rendering.
- Do not add application, API, mobile, web, worker, service, package, infrastructure, auth, storage, eventing, or observability modules.
- Replace generated `openspec/config.yaml` only through the `variants/mws/overlay/openspec/config.yaml` full-file overlay.
- Do not use `flavour` terminology.
- Do not make the neutral template require the `mws` variant.
- Do not make MWS variant validation weaken base neutral validation.
- Do not add MWS-specific renderer logic; MWS selection must use the generic starter renderer.
- Do not copy root `openspec/changes/` from the starter repository into generated projects.

## Repository Structure

Expected starter repository additions:

```txt
examples/
└── render-input.mws.yaml

variants/
└── mws/
    └── overlay/
        ├── mws.project.yaml
        ├── docs/
        │   ├── mws.md
        │   └── mws-openspec.md
        └── openspec/
            ├── config.yaml
            └── specs/
                └── mws-project-lifecycle/
                    └── spec.md
```

Expected starter repository updates:

```txt
starter.yaml
README.md
VALIDATION.md
openspec/config.yaml
package.json
```

## Template Structure

The neutral `template/` structure should not be changed by this variant except for dependencies on already-approved baseline changes.

A generated project rendered with the `mws` variant should include:

```txt
mws.project.yaml
docs/mws.md
docs/mws-openspec.md
openspec/config.yaml
openspec/specs/mws-project-lifecycle/spec.md
```

A generated project rendered without a variant should not include those files.

## Rendering Model

The `mws` variant uses the generic starter renderer and the rendering order defined by the variant overlay contract:

```txt
starter:render / validate-template-render
    │
    ▼
starter.yaml + examples/render-input.mws.yaml
    │
    ▼
template/ base
    │
    ▼
variants/mws/overlay/ files
    │
    ▼
placeholder rendering
    │
    ▼
validation
```

Overlay file precedence should be deterministic. For this change, the generic renderer selects `mws`, applies the overlay, adds MWS files, and replaces `openspec/config.yaml` as a full file.

Variant-specific placeholders:

- input key `PROJECT_ID`, rendered as `__PROJECT_ID__`

Base placeholders still apply:

- input key `PROJECT_NAME`, rendered as `__PROJECT_NAME__`
- input key `PROJECT_SLUG`, rendered as `__PROJECT_SLUG__`
- input key `PROJECT_DESCRIPTION`, rendered as `__PROJECT_DESCRIPTION__`
- input key `DEFAULT_PACKAGE_SCOPE`, rendered as `__DEFAULT_PACKAGE_SCOPE__`
- derived key `NODE_VERSION`, rendered as `__NODE_VERSION__`
- derived key `PNPM_VERSION`, rendered as `__PNPM_VERSION__`
- derived key `STARTER_ID`, rendered as `__STARTER_ID__`
- derived key `STARTER_VERSION`, rendered as `__STARTER_VERSION__`

## Migration Plan

This change introduces a new variant and does not migrate existing generated repositories.

Existing neutral generated repositories remain valid. They may be manually adapted later if a separate migration change defines how to apply an approved variant to an existing repository.

If `define-variant-overlay-contract` has not been implemented yet, implement and archive it first or keep this change blocked until its contract is accepted.

If `add-generated-openspec-config` has not been implemented yet, implement it first so the MWS full-file config replacement has a neutral baseline contract to preserve and strengthen.

If `add-starter-template-renderer` has not been implemented yet, implement it first so MWS selection and validation use the generic starter-owned renderer rather than variant-specific render logic.

## Alternatives Considered

### Put MWS metadata in the neutral template

Rejected because the neutral template should remain independent from any concrete consumer or generation system.

### Create an MWS-specific starter repository

Rejected for now because the MWS variant is a thin foundation overlay. A separate repository would duplicate the neutral foundation and make updates harder.

### Add an MWS-specific renderer

Rejected because variant selection should be an input to the generic starter renderer. A separate MWS renderer would duplicate overlay and placeholder semantics and make validation drift more likely.

### Merge generated OpenSpec config for MWS

Rejected because merge semantics create ambiguous rule precedence. The MWS variant uses full-file replacement instead.

### Defer MWS variant until module starters exist

Rejected because MWS needs a traceable foundation repository before module starters are selected and applied.

## Risks / Trade-offs

- Adding the first concrete variant exercises the overlay contract and may reveal gaps in validation tooling.
- MWS metadata may evolve, so the initial schema should remain small and stable.
- Replacing OpenSpec config duplicates some neutral rules, but provides one reviewable effective MWS config with stricter automation guidance.
- Adding variant validation increases repository validation complexity, but improves confidence in generated outputs.
- MWS validation depends on the generic renderer change -> implement the renderer change first to avoid duplicating variant-specific render logic.

## Validation Strategy

- Run strict OpenSpec validation for this change and all specs.
- Run neutral template validation.
- Run MWS variant render validation.
- Confirm `starter.yaml` declares `variants.mws` with overlay path and validation command.
- Confirm `examples/render-input.mws.yaml` selects `mws` and includes `PROJECT_ID`.
- Confirm `variants/mws/overlay/` contains only foundation metadata, docs, and specs.
- Confirm neutral generated output does not include MWS files.
- Confirm MWS generated output includes `mws.project.yaml`, `docs/mws.md`, and `openspec/specs/mws-project-lifecycle/spec.md`.
- Confirm MWS generated output includes `docs/mws-openspec.md` and an MWS-specific `openspec/config.yaml`.
- Confirm rendered MWS `openspec/config.yaml` uses `schema: spec-driven`, retains project identity and starter provenance, and contains stricter MWS rules.
- Confirm rendered MWS output contains no unresolved placeholders.
- Confirm generated MWS output starts with no active OpenSpec changes.
