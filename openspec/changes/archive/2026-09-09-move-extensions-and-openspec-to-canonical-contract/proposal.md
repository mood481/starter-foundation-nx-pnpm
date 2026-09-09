# Proposal: move-extensions-and-openspec-to-canonical-contract

## Why

This is the second half of the toolkit migration (companion to `adopt-canonical-starter-toolkit-runtime`). The canonical starter-toolkit now owns the render/validate runtime and the render-extension contract (`@mood481/starter-contracts` ships `render-extension.schema.json`), and extensions themselves will live in an external repository resolved through the canonical renderer. This starter no longer implements extension resolution/composition (that code was removed with the local renderer), yet its OpenSpec specs and repository docs still describe a repository-owned extension contract. At the same time OpenSpec was removed from the `mws` variant overlay (the WIP deleted `variants/mws/overlay/openspec/**` and `docs/mws-openspec.md`), and OpenSpec is now an optional external extension rather than a variant contribution or template baseline — so the `mws` variant spec, the `foundation-starter` contract spec, and `openspec/config.yaml` are stale. Nothing is lost: the retired contract remains in this repository's git history.

## What Changes

- Retire the repository `extension-contract` capability: all six requirements are removed and its spec deleted via `retire_capabilities: true`. Extension declaration/manifest/resolution/composition/structured-mutation is now owned by the toolkit render-extension contract and an external extension repository; this starter does not restate it.
- Coherentize the `mws` variant with OpenSpec-as-external-extension: remove the `MWS Generated OpenSpec Baseline` requirement and the OpenSpec-documentation scenarios of `MWS Generated Documentation`; the overlay ships only `mws.project.yaml` and `docs/mws.md`. Retarget render-input selection/validation scenarios to the canonical renderer and to `examples/render.mws.yaml`.
- Align `foundation-starter` to the canonical `starter.yaml` contract already in the repository: canonical fields (`schemaVersion`, `modes`, `defaultMode`, `template`, `variants`, `provides`), no repository extension-declaration block, `provides` lists only actually-provided capabilities, and a version-agnostic starter identity (no hard-coded release number).
- Refresh stale main-spec `Purpose` text (direct edits, not deltas): `foundation-starter` (drop "using the OpenSpec framework"), `mws-foundation-variant` (drop "OpenSpec baseline"), and `dependency-automation` (drop the template-lockfile expectation left by the prior change).
- Update `openspec/config.yaml` so its context/rules no longer present extensions/OpenSpec as repository-owned generation behavior and instead describe canonical-toolkit-owned contracts with SDD/extensions provided by external contributions.
- Documentation: remove repository extension-contract docs and `--extensions`/mws-OpenSpec references from `README.md`/`VALIDATION.md`; state that OpenSpec is an external extension and that variant/extension contracts are defined by the toolkit.
- No version bump: `adopt-canonical-starter-toolkit-runtime` already raises the package to `0.7.0` and both changes are applied together before the next tag, so this change adds no new release version or `CHANGELOG.md` version entry.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `extension-contract`: **retired** — all six requirements removed; spec deleted via `retire_capabilities: true`. Ownership moves to the toolkit render-extension contract and external extension repositories.
- `mws-foundation-variant`: remove the OpenSpec-baseline requirement and the OpenSpec-documentation scenarios; retarget selection/render/validation scenarios to the canonical renderer and renamed render input; add a mws-variant documentation requirement covering only `docs/mws.md`.
- `foundation-starter`: align the starter metadata and variant-declaration requirements to the canonical `starter.yaml` shape and to extension/OpenSpec externalization; remove hard-pinned release version.

### Out of Scope
- The runtime adoption itself (local-renderer deletion, delegation shim, real-install validation, `@mood481/starter-*@0.4.0` consumption, and the `starter-toolkit-integration` capability) — delivered by `adopt-canonical-starter-toolkit-runtime`.
- Implementing or bundling any concrete extension or OpenSpec content.

## Impact

- **Affects**: starter repository specs/docs/config and the `mws` variant overlay deliverables. The neutral `template/` is unchanged. No concrete variant or extension is introduced. No version bump here (companion change already carries `0.7.0`).
- **Spec impact**: deltas at `.../specs/extension-contract/spec.md` (REMOVED, retires), `.../specs/mws-foundation-variant/spec.md` (REMOVED + ADDED + MODIFIED), `.../specs/foundation-starter/spec.md` (MODIFIED); `retire_capabilities: true` deletes the `extension-contract` main spec at archive.
- **Starter-repository files**:
  - Modified specs: `openspec/specs/{extension-contract,mws-foundation-variant,foundation-starter}/spec.md` (via archive) plus direct `## Purpose` edits to `foundation-starter`, `mws-foundation-variant`, and `dependency-automation` main specs.
  - `openspec/config.yaml` — context/rules refresh.
  - `variants/mws/overlay/docs/mws.md` — drop OpenSpec lifecycle/authoring claims; `variants/mws/overlay/mws.project.yaml` — remove the `paths.sdd: openspec` entry (no SDD is provided by the variant).
  - `README.md`, `VALIDATION.md` — remove extension-contract/`--extensions`/mws-OpenSpec documentation.
  - `package.json`/`CHANGELOG.md` are **not** versioned by this change (release bump lives in `adopt-canonical-starter-toolkit-runtime` at `0.7.0`).
- **Generated template / variants**: only the `mws` overlay prose/metadata files change; the neutral `template/` and the approved-variant mechanism are otherwise unchanged.
- **Tooling / dependencies**: none new; consumes whatever `adopt-canonical-starter-toolkit-runtime` introduced.
- **Validation behaviour**: strict OpenSpec validation passes; the archive scenario-preservation rule is respected (MODIFIED blocks carry every existing scenario header forward); a neutral and an `mws` render still succeed via the canonical tooling, with the `mws` render producing `mws.project.yaml` + `docs/mws.md` and no `openspec/**`.
