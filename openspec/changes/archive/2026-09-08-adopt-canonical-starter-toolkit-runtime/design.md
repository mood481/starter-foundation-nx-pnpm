## Context

See `proposal.md` — Why. The base WIP commit already migrated `starter.yaml` to the canonical `schemaVersion: 1` contract, renamed the render inputs to `examples/render.neutral.yaml` / `examples/render.mws.yaml`, removed `starter.render.yaml`, and switched the canonical toolkit to published `0.4.0` artifacts by role (`@mood481/starter-renderer` runtime dep; `@mood481/starter-contracts`/`starter-validator` devDeps; no `link:`, no `starter-cli`) with the resolved lockfile committed. This change finishes the runtime adoption (deleting the local renderer, delegating the binary, rewiring validation, dropping the shipped template lockfile, specs/docs) on top of that committed state; its verification is local (installed canonical CLIs, public-registry generated install, static manifest inspection) and needs no private Gitea token or remote write. Facts that shape the approach:

- The toolkit exposes `@mood481/starter-renderer` (`bin: starter-render`), `@mood481/starter-validator` (`bin: starter-validate`), and `@mood481/starter-contracts` (JSON Schemas). Renderer CLI: `starter-render --starter <root> [--input <root>/render.yaml] [--variant <id>] [--output <path>] [--set K=v...]`; `--starter` defaults to `.` and defaults `--input` to `<root>/render.yaml`. `starter-renderer` pulls `starter-contracts` and `starter-validator` transitively, so all three resolve from Gitea when the renderer is installed.
- The toolkit publishes its own higher baseline (Node ≥ 24 / pnpm ≥ 11). This starter intentionally keeps its current baseline (Node ≥ 22.22.2, pnpm ≥ 10) as an exception; the toolkit packages are consumed at their published `0.4.0` (a pre-`1.0.0` pin) through the existing `@mood481` scope mapping, which requires a documented `.npmrc` init and an exported read `GITEA_TOKEN` for install as well as for publishing.
- `tools/scripts/render-template.mjs` is the only entry point that imports the local extension machinery, and `validate-template-render.mjs` imports `renderTemplate` from it. The canonical renderer already performs render-time extension handling per the toolkit render-extension contract.
- The neutral template ships `template/pnpm-lock.yaml` and a placeholder-substituting generator (`tools/scripts/update-template-lockfile.mjs` → `template:update-lock`). Because the template's `package.json` uses placeholders, that generator substitutes values, installs, then restores placeholders. Since the final dependency set may change at render time (variant/overlay and future extension package additions), the shipped lock is a poor anchor; validation should instead perform a real install on the rendered result.
- `package-distribution` and `quality-gates` still name `pnpm starter:render` / "generic starter renderer" as the render entrypoint, and `foundation-template` / `dependency-automation` require a shipped template lockfile — all corrected here.

## Goals / Non-Goals

**Goals:**
- Delete the local render stack and make every repo render/validation path go through the canonical toolkit.
- Keep the `starter-foundation-render` binary working by delegating to `starter-render`.
- Consume the toolkit as published packages, not a local link.
- Drop the shipped template lockfile and its generator; base validation on a real install of the rendered project.

**Non-Goals:**
- Retiring the repository `extension-contract` capability or finishing extensions-to-external-repo wording, and OpenSpec-as-extension / MWS-variant coherence — both are the companion change, along with refreshing `openspec/config.yaml`.
- Publishing the toolkit packages themselves (done in `starter-toolkit`); this plan does not restate that as a task, precondition, or test.
- Bumping the starter's Node/pnpm baseline.

## Decisions

**D1 — Shim re-exports the canonical renderer rather than copying its logic.** Ship `bin/starter-foundation-render.mjs` that resolves this package's own starter root and execs `starter-render` with the forwarded args. Keeping the bin name preserves the existing `npx @mood481/starter-foundation-nx-pnpm … starter-foundation-render` contract from `package-distribution`; the shim never parses render semantics. *Alternative:* drop the bin and tell users to call `starter-render` directly — rejected because it breaks the published contract and README/spec parity scenarios.

**D2 — Validation keeps only starter-specific residual checks.** `validate-template-render.mjs` shells out to `starter-render` for the render and to `starter-validate --type starter|render` for contract checks, then keeps the unresolved-placeholder scan plus a real `pnpm install`, generated `pnpm validate`, and Nx graph. It must not import any deleted local module. *Alternative:* reimplement placeholder/pipeline logic locally to match the old script — rejected as re-duplicating the toolkit.

**D3 — Delete the local render + its private extension machinery together.** `render-template.mjs` plus `extension-composer/-resolver/-utils/-contract(.test).mjs` are removed in one step because the extension modules are reachable only from the deleted renderer; the canonical renderer handles extension selection. The repository-level `extension-contract` capability and any `starter.yaml`/docs extension text are retired in the companion change, so the runtime swap here does not strand code.

**D4 — Remove the shipped template lockfile and generator.** Delete `template/pnpm-lock.yaml` and `tools/scripts/update-template-lockfile.mjs`, and drop the `template:update-lock` script. Validation installs for real so the generated project ends with an install-produced lockfile. The affected contracts (`dependency-automation` removes the maintenance requirement; `foundation-template` and `quality-gates` stop asserting a shipped lock) are updated in this change to stay coherent. *Alternative:* keep a shipped lock updated by the generator — rejected because it cannot reflect render-time package changes and needs the fragile placeholder-substitution script.

**D5 — Rely on the committed `@mood481/starter-*@0.4.0` role split; verify locally only.** The dependency swap to published `0.4.0` (`starter-renderer` runtime dep; `starter-contracts`/`starter-validator` devDeps; no `starter-cli`) is already in the base commit with a resolved lockfile, so this change adds no swap, no lockfile regeneration, and no install-from-Gitea step. Verification is local and isolated: static manifest/lock inspection plus running the already-installed canonical CLIs. `docs/publishing.md` still documents the `.npmrc`+`GITEA_TOKEN` consumption init a fresh clone needs, as a setup reference (not executed by a task). *Alternative:* re-do the swap/lockfile here — rejected because it duplicates the committed base and would require the unavailable private Gitea token.

**D6 — Keep the starter's toolchain baseline.** No changes to `engines`, `packageManager`, or the publish workflow Node version. A local feasibility check runs the canonical CLIs under the pinned toolchain; any engine mismatch is surfaced to the operator, not auto-fixed by bumping. *Alternative:* raise to Node 24/pnpm 11 to match the toolkit — rejected as an explicit exception for this starter.

**D7 — Retire `starter-template-renderer` and introduce `starter-toolkit-integration`.** Rendering behavior is now a canonical-toolkit concern, so the capability is fully removed (via `retire_capabilities: true`), and the repo-facing obligations (dependency consumption, bin delegation, validation wiring, current-toolchain baseline, lockfile removal) move to a focused new capability.

**D8 — Version `0.7.0`, minor.** Adopting an external renderer and removing the local `starter:render`/template lockfile are feature-additive with consumer-visible changes, documented in `CHANGELOG.md`; reserve `1.0.0` for a later stable-contract decision.

## Risks / Trade-offs

- [Canonical CLIs under the pinned toolchain] The toolkit targets Node 24/pnpm 11 while this starter stays on Node 22/pnpm 10; a dependency's `engines` could warn or fail. → Accepted as an explicit exception; a local feasibility check runs `starter-render`/`starter-validate` under the pinned versions, and any mismatch is recorded (e.g. relax engine-strict for install) rather than forcing a baseline bump.
- [Renderer behavior drift] Delegating means the canonical CLI's flag surface governs `starter-foundation-render`. → Covered by the `starter-toolkit-integration` parity scenario and validated by comparing shim output to `starter-render` directly.
- [No shipped lock weakens pre-install determinism] The rendered project's dependency tree is resolved at install time, not pinned in the template. → Accepted and intentional (render can change dependencies); determinism is anchored in the install-produced generated lockfile, and the repo's own root lockfile is unchanged.
- [Cross-change window] After #1 merges and before the companion #2, `extension-contract` and `openspec/config.yaml` still describe capabilities/ownership whose local implementation was deleted. → Accepted: both land before the next tag; the spec/config are documentation, not runtime, and the extension runtime continues through the canonical renderer.

## Migration Plan

1. Land the code/manifest/spec/doc changes on top of the committed toolkit deps: delete the local render stack and the shipped template lockfile + generator, add the delegation shim, and rewire validation.
2. Run `pnpm starter:validate`, the rewritten `pnpm validate:template` and `pnpm validate:template:mws`, and the local shim check as local validations (already-installed canonical CLIs; the generated project's `pnpm install` uses the public registry).
3. Cut `v0.7.0` so the release workflow publishes the delegating package to `latest` (a deploy step with the token available, not a validation task in this change).
   **Rollback:** restore the deleted local `render-template.mjs`, extension modules, `template/pnpm-lock.yaml`, and `update-template-lockfile.mjs` from git history; the dependency state is untouched by this change.

## Open Questions

- None blocking. The toolkit pin is `0.4.0` (pre-`1.0.0`); bumping it to a `1.0.0` contract and mirroring the starter package version are separate future decisions that do not change these specs or tasks.
