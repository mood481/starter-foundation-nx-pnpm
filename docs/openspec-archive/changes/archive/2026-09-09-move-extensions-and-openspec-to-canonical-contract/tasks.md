# Tasks: move-extensions-and-openspec-to-canonical-contract

## 1. Retire the repository extension contract

- [x] 1.1 Author `specs/extension-contract/spec.md` as `## REMOVED Requirements` for all six requirements (Reason + Migration) and confirm `.openspec.yaml` sets `retire_capabilities: true`; verify strict validation treats it as a whole-capability retire and the main spec is deleted at archive.
- [x] 1.2 Verify no surviving repository spec asserts the extension *implementation* (resolution/composition/structured-mutation); generic "external extension" mentions in `foundation-*`/`quality-gates`/`starter-toolkit-integration` may remain.

## 2. Coherentize the mws variant (OpenSpec is now an external extension)

- [x] 2.1 Author the `mws-foundation-variant` delta: `REMOVED` `MWS Generated OpenSpec Baseline` and `MWS Generated Documentation`; `ADDED` `MWS Generated Variant Documentation` (only `docs/mws.md`); `MODIFIED` `MWS Foundation Variant Overlay`, `MWS Variant Selection Input`, and `MWS Variant Render Validation` editing bodies only — every existing scenario header carried forward, retargeted to canonical `starter-render` / `examples/render.mws.yaml`, with overlay-file lists limited to `mws.project.yaml` + `docs/mws.md`; verify no scenario is silently dropped.
- [x] 2.2 Update `variants/mws/overlay/docs/mws.md` to drop the OpenSpec lifecycle/authoring claims and the placeholder-flags note; verify its wording matches the retained `MWS Generated Variant Documentation` scenarios.
- [x] 2.3 Remove the `paths.sdd: openspec` entry from `variants/mws/overlay/mws.project.yaml`; verify the overlay directory contains only `mws.project.yaml` and `docs/mws.md`.

## 3. Align foundation-starter to the canonical contract

- [x] 3.1 Author the `foundation-starter` `MODIFIED` delta: `Neutral Foundation Starter` (canonical identity, version owned by `package.json`), `Starter Metadata Contract` (schemaVersion/modes/defaultMode/template/placeholders/variants/provides, no extension block), and `Approved Variant Declaration` (`mws` validated by the `validate:template:mws` command); preserve every existing scenario header and verify strict validation passes and the on-disk `starter.yaml` satisfies the rewritten scenarios.
- [x] 3.2 Edit the `foundation-starter` main-spec `## Purpose` to remove "using the OpenSpec framework" and reference canonical-toolkit generation with optional external contributions.

## 4. Config and remaining stale Purposes

- [x] 4.1 Update `openspec/config.yaml` context/rules so render/validation contracts are canonical-toolkit-owned and extensions/OpenSpec are external contributions (never a repository-owned implementation, a neutral-template baseline, or a variant OpenSpec contribution); keep variant/overlay terminology and the JS/TS orchestration note; verify it does not restate retired contracts.
- [x] 4.2 Edit the stale main-spec `## Purpose` of `mws-foundation-variant` (drop "OpenSpec baseline") and of `dependency-automation` (drop the template-lockfile expectation left by the prior change).

## 5. Documentation

- [x] 5.1 Update `README.md` and `VALIDATION.md`: remove repository extension-contract/`--extensions` sections and any `docs/mws-openspec.md`/`render-input.*` references; state that OpenSpec/extensions are external contributions resolved by the canonical renderer; verify no dangling `--extensions`, `render-input.*`, or `mws-openspec` references remain. Do NOT change `package.json` version or add a `CHANGELOG.md` version entry (the `0.7.0` release in the companion change covers both).

## 6. Validation

- [x] 6.1 Run `pnpm validate:spec` (strict all) and confirm green; do not append another `--strict`.
- [x] 6.2 Pre-archive scan: for each `MODIFIED` requirement all existing scenario headers appear in the delta, no `ADDED` header collides with a surviving requirement, and only `extension-contract` is fully removed under `retire_capabilities`.
- [x] 6.3 Verify statically that no spec, `openspec/config.yaml`, or doc still asserts a repository-owned extension contract, an `mws`-provided OpenSpec baseline, or an OpenSpec path under `template/` or the `mws` overlay.
- [x] 6.4 After applying both changes in order, run `pnpm starter:validate`, `pnpm validate:template`, and `pnpm validate:template:mws` (canonical tooling): the neutral render contains no `openspec/**` and no `mws` files; the `mws` render contains `mws.project.yaml` + `docs/mws.md` and no `openspec/**`; neither render leaves unresolved placeholders.
