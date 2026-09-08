# Tasks: adopt-canonical-starter-toolkit-runtime

## 1. Rely on the committed canonical toolkit runtime (verification only)

- [ ] 1.1 Verify the base commit's dependency state statically (no network): `package.json` has `@mood481/starter-renderer@0.4.0` in `dependencies`, `@mood481/starter-contracts@0.4.0` + `@mood481/starter-validator@0.4.0` in `devDependencies`, no `@mood481/starter-cli`, and no `link:`/`workspace:`; confirm the three are present under `node_modules/@mood481/` and `node_modules/.bin/starter-render`/`starter-validate` exist.
- [ ] 1.2 Run a local feasibility check of the **already-installed** canonical CLIs under the starter's current pinned toolchain (no baseline change, no reinstall): verify `starter-render --help` and `starter-validate --type starter starter.yaml` succeed from local `node_modules`, and record any `engines` warning without editing `engines`, `packageManager`, or the CI Node version.

## 2. Remove the local renderer and repoint the exported binary

- [ ] 2.1 Delete `tools/scripts/render-template.mjs` and the local extension machinery (`extension-composer.mjs`, `extension-resolver.mjs`, `extension-utils.mjs`, `extension-contract.mjs`, `extension-contract.test.mjs`); verify no remaining repo file imports any of them.
- [ ] 2.2 Remove the `old:render` script from `package.json`; verify no script references a local render entrypoint.
- [ ] 2.3 Add `bin/starter-foundation-render.mjs` that resolves the package's own starter root and execs `starter-render` with forwarded arguments; verify `node bin/starter-foundation-render.mjs --help` behaves like `starter-render`.
- [ ] 2.4 Repoint `package.json` `bin.starter-foundation-render` to the shim and add `bin/**` to `files`; verify `npm pack --dry-run` ships the shim and omits the deleted renderer.

## 3. Remove the shipped template lockfile and generator

- [ ] 3.1 Delete `template/pnpm-lock.yaml` and `tools/scripts/update-template-lockfile.mjs`, and remove the `template:update-lock` script plus any `files`/ignore references to them; verify neither path exists and nothing references the generator.

## 4. Rewire starter validation to canonical tooling

- [ ] 4.1 Rewrite `tools/scripts/validate-template-render.mjs` to render via canonical `starter-render` and validate `starter.yaml`/`render.*.yaml` via `starter-validate` (`--type starter`/`--type render`), then perform the unresolved-placeholder scan, a real `pnpm install`, generated `pnpm validate`, and `nx graph`; verify it no longer imports `render-template.mjs`.
- [ ] 4.2 Wire `validate:template` and `validate:template:mws` to the canonical starter root with `examples/render.neutral.yaml` / `examples/render.mws.yaml` and keep `starter:validate`; verify each exits 0 for the neutral and mws renders.
- [ ] 4.3 Verify the real install creates the rendered project's `pnpm-lock.yaml` and that a subsequent `pnpm install --frozen-lockfile` succeeds in that rendered project (public npm registry, read-only; no private Gitea token).

## 5. Update specs for this change

- [ ] 5.1 Retire `starter-template-renderer` with a `## REMOVED Requirements` delta listing all 13 requirements (Reason + Migration); verify `.openspec.yaml` sets `retire_capabilities: true` and the main spec is deleted at archive.
- [ ] 5.2 Author the `starter-toolkit-integration` spec delta (role-split published-package consumption, documented consumption initialization via `.npmrc`+`GITEA_TOKEN`, current toolchain baseline, binary delegation, canonical validation, lockfile produced by install); verify every requirement has scenarios and strict validation passes.
- [ ] 5.3 Modify `package-distribution` consumer/renderer-parity scenarios to reference the canonical renderer and shim; verify no scenario references the removed `pnpm starter:render`/local renderer.
- [ ] 5.4 Modify `quality-gates` `Deterministic Foundation Validation` and `Rendered Template Validation` to use the canonical render/validator and a real install; verify every existing scenario header in both requirements is carried forward (no dropped-scenario archive error).
- [ ] 5.5 Modify `foundation-template` `Workspace Configuration` so the template is not required to ship `pnpm-lock.yaml`; verify its existing scenario headers are preserved.
- [ ] 5.6 Remove `dependency-automation` `Template Dependency Lockfile Maintenance` via a `## REMOVED Requirements` delta with Reason + Migration; verify the capability keeps its other requirements (not emptied).

## 6. Documentation and versioning

- [ ] 6.1 Update `README.md` usage to the canonical flow (`pnpm test:render`/`starter-render`, or the `starter-foundation-render` shim via `npx`); remove `pnpm starter:render`, local CLI-mode/`--extensions` instructions now owned by the toolkit, and any shipped-template-lockfile mention; keep publishing depth in `docs/publishing.md`.
- [ ] 6.2 Update `VALIDATION.md` to the canonical commands (`starter:validate`, rewritten `validate:template`, `test:render`) and the real-install behavior; remove local-renderer and template-lockfile-regeneration steps.
- [ ] 6.3 Update `docs/publishing.md` to note the published package ships a canonical-render shim and consumes `@mood481/starter-renderer` (runtime) + `@mood481/starter-contracts`/`starter-validator` (dev) at `0.4.0` via the scope mapping, and that the template ships no lockfile.
- [ ] 6.4 Bump `package.json` to `0.7.0` and add a `0.7.0` `CHANGELOG.md` entry (BREAKING: local renderer and shipped template lockfile removed, canonical runtime adopted, bin delegates; toolchain intentionally unchanged); verify the version field and keep docs version-light.
- [ ] 6.5 Document the Gitea consumption initialization as a setup prerequisite in `README.md`/`VALIDATION.md`/`docs/publishing.md`: copy `.npmrc.example` to `.npmrc` and export `GITEA_TOKEN` (read) so `pnpm install` resolves the `@mood481/starter-*` packages; verify the docs state this is required for install/consumption, not only publishing, and that no literal token is committed (real `.npmrc` stays git-ignored).

## 7. Validation

- [ ] 7.1 Run `pnpm validate:spec` (strict all) and confirm it is green after the spec deltas; do not append another `--strict`.
- [ ] 7.2 Verify statically (no network): `package.json` has `@mood481/starter-renderer@0.4.0` in `dependencies`, `@mood481/starter-contracts@0.4.0` + `@mood481/starter-validator@0.4.0` in `devDependencies`, no `@mood481/starter-cli`, and no `link:`/`workspace:`; the local renderer/extension files and `template/pnpm-lock.yaml`/generator are gone; the consumption `.npmrc`+`GITEA_TOKEN` setup is documented; and no script or spec still references the removed `pnpm starter:render`, `template:update-lock`, or a shipped template lockfile.
- [ ] 7.3 Verify canonical validation locally with the already-installed canonical CLIs: `pnpm starter:validate`, `pnpm validate:template`, and `pnpm validate:template:mws` exit 0; renders contain no unresolved placeholders; the generated project's real `pnpm install` (public npm registry, read-only; no private Gitea token) produced its `pnpm-lock.yaml`; generated `pnpm validate` and `nx graph` succeed.
- [ ] 7.4 Verify shim behavior locally without any private-registry install: run `node bin/starter-foundation-render.mjs --help` and a neutral render (e.g. `node bin/starter-foundation-render.mjs --input examples/render.neutral.yaml --output tmp/shim-check`) so the shim execs the already-installed `starter-render` from local `node_modules`; verify output matches invoking `starter-render` directly, with no new variant/extension behavior. Do NOT `npm pack` and install the tarball — that would fetch `@mood481/*` from Gitea (private/network).
