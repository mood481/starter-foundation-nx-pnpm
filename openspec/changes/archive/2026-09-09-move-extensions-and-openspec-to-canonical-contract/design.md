## Context

See `proposal.md` — Why. This change assumes `adopt-canonical-starter-toolkit-runtime` has landed (local renderer/extension code deleted; `@mood481/starter-*@0.4.0` consumed; validation canonical). Facts that shape the approach:

- The WIP commit already moved `starter.yaml` to the canonical contract (no `extensions`/`extensionGroups` block; `provides` = workspace/nx/pnpm/multi-language) and removed OpenSpec from `variants/mws/overlay/` (only `mws.project.yaml` + `docs/mws.md` remain). It also renamed `examples/render-input.mws.yaml` → `examples/render.mws.yaml`.
- The toolkit ships `render-extension.schema.json`, so the render-extension contract already lives in `@mood481/starter-contracts`; extensions themselves will live in an external repository resolved by `@mood481/starter-renderer`.
- OpenSpec is now an optional external extension, so it is neither a `template/` baseline nor part of the `mws` variant.
- `mws.project.yaml` still carries a stray `paths.sdd: openspec`, and `variants/mws/overlay/docs/mws.md` still claims OpenSpec lifecycle/authoring rules — both contradict the above.
- Main-spec `Purpose` text in `foundation-starter` ("using the OpenSpec framework"), `mws-foundation-variant` ("OpenSpec baseline"), and `dependency-automation` (template-lockfile expectation left by the prior change) is stale. Purpose text is not changeable through a delta, so it is refreshed by direct main-spec edits.

## Goals / Non-Goals

**Goals:**
- Retire the repository-owned extension contract and point extensions at the toolkit render-extension contract / external repositories.
- Make the `mws` variant, the `foundation-starter` contract spec, and `openspec/config.yaml` coherent with canonical-toolkit generation and OpenSpec-as-external-extension.
- Keep every MODIFIED requirement's existing scenario headers so the archive does not drop scenarios.

**Non-Goals:**
- Any runtime adoption (that is `adopt-canonical-starter-toolkit-runtime`).
- Introducing or bundling a concrete extension or OpenSpec content.
- Modifying `template/` or the neutral render contract.

## Decisions

**D1 — Retire `extension-contract` wholesale.** All six requirements are REMOVED and the spec deleted via `retire_capabilities: true`. The behavior is defined by `@mood481/starter-contracts` render-extension schema and applied by the canonical renderer; history preserves the old text. *Alternative:* keep a slimmed "extension pointer" requirement here — rejected to avoid duplicating a contract that is not this repository's.

**D2 — Express OpenSpec removal so the archive never drops scenarios.** `MWS Generated OpenSpec Baseline` is deleted whole (`REMOVED`). `MWS Generated Documentation` mixes mws.md scenarios (keep) with two `docs/mws-openspec.md` scenarios (must go); since a MODIFIED block cannot silently drop a scenario header, this requirement is `REMOVED` and replaced by a new `ADDED` requirement `MWS Generated Variant Documentation` covering only `docs/mws.md`. The remaining `mws` requirements use MODIFIED with identical scenario headers, editing only bodies (OpenSpec-spec wording removed; `starter-render`/`examples/render.mws.yaml` retargeted). *Alternative:* rename scenarios in place — rejected; renaming is read as drop+add and aborts archive (the same rule hit the prior change).

**D3 — Align `foundation-starter` by rewriting bodies, keeping headers.** The canonical `starter.yaml` contract (schemaVersion/modes/defaultMode/template/placeholders/variants/provides, no extensions block) is captured by modifying `Neutral Foundation Starter`, `Starter Metadata Contract`, and `Approved Variant Declaration`. Version is de-pinned (owned by `package.json`) to stop the spec drifting each release. `Variant Overlay Contract` and `Starter Repository Separation` are left intact — their scenarios are generic/conditional and remain accurate.

**D4 — Refresh `openspec/config.yaml` and stale Purposes by direct edits.** `config.yaml` context/rules that frame render/extension/OpenSpec as repository-owned generation behavior are updated to say generation/validation is canonical-toolkit-owned and SDD/extensions come from external contributions. `## Purpose` lines in `foundation-starter`, `mws-foundation-variant`, and `dependency-automation` main specs are edited directly (delta changes cannot carry a Purpose). *Alternative:* leave them and let them rot — rejected; they mislead future changes.

**D5 — Drop `paths.sdd: openspec` from `mws.project.yaml`.** The variant provides no SDD; an SDD extension, if ever selected, owns its own paths. No spec scenario asserts the `sdd` key, so this is a coherence edit, not a spec change.

**D6 — No version bump in this change.** The `mws`-variant and extension-contract removals are consumer-visible, but `adopt-canonical-starter-toolkit-runtime` already raises the package to `0.7.0` and both changes are applied back-to-back before the next tag, so a second bump here would only create noise. The single `0.7.0` release (with its BREAKING notes in `CHANGELOG.md`) describes the combined outcome. *Alternative:* bump to `0.8.0` — rejected as an unnecessary intermediate version for changes that ship together.

## Risks / Trade-offs

- [Apply-order coupling] This change's spec coherence assumes `adopt-canonical-starter-toolkit-runtime` is applied first; otherwise the local extension code the removed contract describes still exists. → Sequenced deliberately; apply order is stated and each change validates independently.
- [Stale extension references linger] Other specs (`foundation-template`, `quality-gates`) mention "extension" generically. → Left as-is; they describe opt-in external contributions and stay valid under the toolkit contract.
- [Purpose edits are not delta-tracked] Direct main-spec Purpose edits are outside the change deltas and could conflict if another change edits the same Purpose. → Scoped to three clearly-stale Purposes; low contention.

## Migration Plan

1. Apply `adopt-canonical-starter-toolkit-runtime` first (its archive deletes the extension code and rewires validation).
2. Apply this change: archive retires `extension-contract`, rewrites `mws-foundation-variant`/`foundation-starter`, then apply direct `config.yaml` + Purpose edits, `mws.md`/`mws.project.yaml` cleanup, and README/VALIDATION doc removals (no version bump).
3. Re-run strict validation; a neutral render must contain no `openspec/**` and no `mws` files, and an `mws` render must contain `mws.project.yaml` + `docs/mws.md` and no `openspec/**`.
   **Rollback:** all removals (extension-contract spec, mws overlay docs, config lines) are recoverable from git history.

## Open Questions

- None blocking. Whether a first real extension repository is created (and where it is published) is future work independent of this change.
