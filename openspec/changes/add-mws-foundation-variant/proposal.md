## Why

The foundation starter is intended to be used independently, but also by project-generation systems through declared variants and overlays.

The neutral starter now provides the base Nx + pnpm monorepo template, while pending changes define generated OpenSpec configuration, the generic variant/overlay contract, and a starter-owned template renderer. The next step is to introduce the first concrete variant: `mws`.

The `mws` variant must let MWS generate a foundation repository that is immediately recognizable, traceable, and ready for later module starters and capability changes, without contaminating the neutral template or adding application/service modules prematurely.

## What Changes

- Declare the concrete `mws` variant in `starter.yaml`.
- Add a `variants/mws/overlay/` directory outside the neutral `template/`.
- Add MWS project metadata to generated repositories through the overlay.
- Add MWS generated-project documentation through the overlay.
- Add MWS OpenSpec operation documentation for human maintainers through the overlay.
- Add an importable generated-project spec for the MWS project lifecycle.
- Add an MWS-specific generated `openspec/config.yaml` through full-file overlay replacement with stricter rules than the neutral config.
- Add variant-specific placeholder requirements, including `PROJECT_ID`.
- Add an MWS structured render input example for the generic starter renderer.
- Add MWS variant render validation using the generic starter renderer.
- Update starter repository documentation and validation guidance to distinguish neutral-template checks from approved concrete variant checks.
- Update starter-maintenance context to allow concrete variants introduced by approved changes while keeping the neutral template variant-independent.

## Capabilities

### New Capabilities

- `mws-foundation-variant`: generated projects may be created with the MWS foundation variant and receive MWS metadata, docs, and lifecycle specs.

### Modified Capabilities

- `foundation-starter`: the starter now supports an approved concrete variant while preserving the neutral base template.

## Impact

- Affected starter-repository files: `starter.yaml`, `README.md`, `VALIDATION.md`, `openspec/config.yaml`, `examples/render-input.mws.yaml`, and package scripts.
- Affected generated-variant files: files under `variants/mws/overlay/`.
- Affected specs: `foundation-starter` and new `mws-foundation-variant`.
- Affected validation behaviour: repository validation must support both neutral template validation and `mws` variant overlay validation.
- Affected generated-template files under `template/`: none directly; the neutral template remains unchanged unless required by already-approved baseline changes.

## Out of Scope

- Do not add API, mobile, web, worker, service, or package modules.
- Do not add auth, users, tenants, eventing, storage, observability, infrastructure, CI/CD, or deployment capabilities.
- Do not implement MWS orchestration services.
- Do not add an MWS-specific renderer; use the generic starter renderer introduced by `add-starter-template-renderer`.
- Do not define YAML merge or partial override semantics for generated OpenSpec config; the MWS config uses the full-file replacement semantics defined by the overlay contract.
- Do not copy root starter-maintenance active changes into generated projects.

## Risks

- If the variant overlay becomes too broad, the foundation starter may start behaving like an application starter instead of a project foundation.
- If MWS metadata is too detailed, later MWS workflow changes may require unnecessary migrations.
- If overlay validation is not deterministic, generated repositories may differ between human and automated flows.
- If repository context still says concrete variants are forbidden, agents may incorrectly remove or avoid the approved `mws` variant.
- If MWS OpenSpec rules become too strict for human maintainers, local development may become harder; generated docs must explain the intended human workflow and available local tools.
