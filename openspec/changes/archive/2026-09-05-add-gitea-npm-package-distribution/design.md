## Context

The renderer package is already publication-ready (`name`, `version`, `bin`, `files`, runtime `dependencies`), but nothing has ever been uploaded, so the documented `npx` entrypoint 404s. Distribution will target the organization's private Gitea npm registry (`git.mood481.es`, owner `mood`), which the team already uses for other ecosystems and which is internet-reachable with private auth. See `proposal.md` — Why.

A pre-implementation spike against the live Gitea registry produced the facts this design encodes:

- The `@mood481/...` scoped metadata and its `0.5.0` tarball are served correctly (HTTP `200`); `curl` GET (not HEAD; Gitea rejects `HEAD` with `405`) downloads a valid gzip. The scoped-tarball `dist.tarball` defect reported for some Gitea versions does **not** affect this instance.
- A global install from the tarball links `starter-foundation-render → tools/scripts/render-template.mjs` with a correct `#!/usr/bin/env node` shebang and executable bit; running it prints help and exits 0.
- `npx -p @mood481/starter-foundation-nx-pnpm@<v> starter-foundation-render --help` and the bare `npx @mood481/starter-foundation-nx-pnpm@<v> --help` both work **only once the `@mood481`→Gitea scope mapping is actually loaded by npm**. When it is not, npm falls back to `registry.npmjs.org` and 404s, and npx then reports `starter-foundation-render: command not found`.
- The npm client used by the project (`10.9.7`) loads a scoped mapping from a project `.npmrc`, a user `~/.npmrc`, or an explicit `--userconfig`. It also honors a `.npmrc` in the current directory when no governing `package.json` exists, so documentation must not claim that a package file suppresses cwd configuration.

## Goals / Non-Goals

**Goals:**
- Codify one manual + one automated publish path that encode the Gitea target, so no operator or job remembers a `--registry`/`--userconfig`.
- Specify the exact consumer-side configuration that makes `npx`/`npm` resolve the scope from Gitea, and document it as a prerequisite.
- Keep the token out of the repo and out of committed files.
- Provide a reviewable GitHub Actions workflow and document its repository-secret configuration without requiring a live Actions execution during implementation.

**Non-Goals:**
- Any change to renderer CLI semantics, file-authoritative precedence, placeholder handling, `template/`, or variants/overlays.
- Public npm publication or making the Gitea org anonymous-read.
- Renaming the `bin` or the package (the `bin`/name mismatch is not the failure cause once resolution is correct).
- Multi-registry mirroring or a package proxy/cache (e.g. Verdaccio) beyond Gitea itself.
- Running GitHub Actions or mutating the production Gitea registry; the workflow configuration and the operator smoke-test procedure are delivered as repository artifacts and documentation.

## Decisions

**D1 — Publish via a repository-owned pnpm script, not per-command flags.** Add `starter:publish` to `package.json` scripts that runs `pnpm publish` with the Gitea registry and a userconfig path supplied through `NPM_CONFIG_USERCONFIG`, so both manual and CI invocation share one definition. *Alternative:* rely on `publishConfig.registry` in `package.json` — rejected because it bakes the private registry URL and `access` semantics into the published manifest and couples the artifact to one host; the team explicitly wants the manifest registry-agnostic.

**D2 — Registry target + scope come from configuration, not memory.** The repository publish entrypoint is the single source for the Gitea target; the workflow supplies credentials/context and invokes that entrypoint rather than reimplementing publication. The base URL and owner come from one documented source (env with a documented default). *Alternative:* document raw `pnpm publish --registry=... --userconfig=...` for humans to type — rejected: it is exactly the "someone must remember a flag" failure this change removes.

**D3 — Consumer resolution documented as an `.npmrc` mapping at a loaded location.** Docs state the scope must be mapped in a project `.npmrc`, a `~/.npmrc`, via `--userconfig`, or in the current directory's `.npmrc` when supported by the client. They also state that no global `registry=` override is set so `yaml` still resolves from npm public. This directly encodes the spike's root cause of the `command not found` symptom without asserting an incorrect package-file prerequisite. *Alternative:* instruct setting `registry=<gitea>` globally — rejected: it would break all unscoped installs.

**D4 — Credentials via secret injection / git-ignored local file.** CI authenticates with an Actions secret (`GITEA_TOKEN`, `package` write) surfaced as the npm `_authToken` through an ephemeral runner userconfig consumed by the shared publish entrypoint; local `.npmrc` files with real tokens are git-ignored and only placeholder-bearing `.npmrc.example` is committed. The workflow targets external Gitea, so it requests `contents: read` and does not request GitHub `packages: write`. *Alternative:* commit a token-bearing `.npmrc` or use GitHub Packages permissions for an external registry — rejected on security and scope grounds.

**D5 — Keep the capability separate from the renderer.** Distribution/resolution is specified as a new `package-distribution` capability. The existing `starter-template-renderer` contract remains behaviourally unchanged, but its release-bound package version and `npx` example literals must move from `0.5.0` to `0.6.0` when the package version is bumped; otherwise the canonical contract contradicts the release metadata. *Alternative:* extend the renderer requirements with distribution rules — rejected to avoid mixing a publishing concern into a rendering contract.

**D6 — Enforce the publish channel inside the shared `starter:publish` script via version + dist-tag.** The single pnpm publish script decides the channel from context and the version in `package.json`:
- Detect channel: a final (prerelease-free `x.y.z`) publish is allowed only when running inside the release workflow (e.g. `GITHUB_ACTIONS=true` triggered by a `v*` tag whose version equals `package.json`). Everywhere else (local/`workflow_dispatch` on a non-tag) the run is a *prerelease* publish.
- Gate the version: a prerelease run MUST have a prerelease identifier in the allowed set `devel | alpha | beta | rc`; a bare `x.y.z` outside the release workflow aborts before upload with a message telling the operator to bump with, e.g., `pnpm version prerelease --preid=devel --no-git-tag-version` (or a repo convenience wrapper). Non-allowed identifiers abort too.
- Split dist-tags: prerelease publishes go to a non-`latest` tag (`next` for `alpha|beta|rc`, `devel` for `devel`); only the release workflow publishes `x.y.z` to `latest`. Gitea supports npm-compatible dist-tags, and `pnpm publish --tag <t>` sets the initial tag, so consumers doing `@latest` never accidentally get a devel build.
The `package.json` version itself stays a normal semver and remains registry-agnostic (consistent with D1); no `publishConfig` changes are needed to express the channel.

*Alternative:* enforce via branch/tag protection only in Gitea or via two separate scripts with different hardcoded dist-tags — rejected: it either duplicates the publish definition (violating D1/D2) or pushes the rule onto infrastructure that cannot validate the local version string, so `latest` could still be overwritten by a manual final publish.

**D7 — Publishing detail lives in `docs/publishing.md`; README/VALIDATION keep only pointers, and the version goes to `0.6.0`.** `README.md` and `VALIDATION.md` already carry substantial rendering/validation content, so the full Gitea publish/consume procedure is authored once in `docs/publishing.md` (the established starter-maintenance docs location, alongside `docs/renovate.md`) and referenced by a short README **Publishing** section plus a one-line VALIDATION reference; this avoids duplicating the procedure across three files. `VALIDATION.md` is not otherwise restructured in this change (splitting it now is higher risk for limited benefit), but current-release references must not remain stale. The version bump is a minor `0.5.0 → 0.6.0` because the change is feature-additive (new `package-distribution` capability, publish tooling, and a new CI-only-release policy) and, by bumping `starter.yaml` in lockstep, it changes the derived `STARTER_VERSION` in rendered output — so it is not a patch. Version-bound literals in the canonical renderer contract are updated in lockstep while its rendering semantics remain unchanged. `package.json` and `starter.yaml` are versioned together to keep provenance consistent. *Alternative:* `0.5.1` — rejected as underselling an additive capability that also alters generated provenance.

**D8 — Exclude nested dependency directories from the pnpm package.** The root package's `files` allowlist contains `template/**`, and pnpm's pack implementation includes a nested `template/node_modules/` when one exists. Add an explicit `!template/**/node_modules/**` exclusion so local installs or validation caches cannot inflate or contaminate the published artifact. The publish entrypoint also stages a clean temporary package source without dependency directories before invoking pnpm, so the local cache is not traversed during publication. *Alternative:* rely on npm's implicit `node_modules` exclusion — rejected because pnpm does not preserve that result under the broad allowlist.

## Risks / Trade-offs

- [Version-gating relies on env context, not a secret] A developer could fake `GITHUB_ACTIONS=true` locally to publish a final `latest`. → Accepted as low-severity for an internal org registry: it is a guard-rail against mistakes, not an adversarial control; the release path remains the only one wired to the write-scoped secret, and a wrong `latest` is reversible by re-publishing the correct release or `pnpm dist-tag` retag.
- [Dist-tag drift on Gitea] If a prerelease were ever published to `latest`, consumers would pick it up. → Mitigated: prerelease publishes never pass `--tag latest`; validation asserts a `devel` publish did not move `latest`.

- [Private-by-design distribution] External or anonymous users cannot `npx` the package without the mapping + token. → Acceptable: consumers are internal (org `mood`); the README will state this is private distribution, not public npm.
- [Scope `@mood481` ≠ Gitea owner `mood`] Gitea may place the package under a different owner or reject publish depending on scope/owner rules. → Mitigated: spike published and consumed `@mood481/...` under owner `mood` successfully; the publish/validation tasks re-confirm on the release path and record the outcome.
- [Gitea reachable from GitHub runners] CI publish requires network access to `git.mood481.es`. → The documentation identifies this as an operational prerequisite and records an optional test-owner smoke test; building and reviewing the workflow does not require executing it.
- [Gitea tarball defect on other/older instances] The scoped `dist.tarball` bug exists in some versions. → Explicitly validated against this instance (HTTP 200); spec requirement "Published scoped tarball is retrievable" makes a regression a validation failure rather than a silent runtime 404.
- [Version drift in docs] Earlier docs cited `@0.4.0`/`@0.5.0` and this change bumps to `0.6.0`. → `docs/publishing.md` and the README example use `<version>` placeholders (with at most one concrete current-version example tied to `package.json`), and task 4.5 rejects stale numbers in newly authored content, so docs do not hard-pin a moving version.
- [pnpm package file expansion] A local `template/node_modules/` can be included or traversed by pnpm's broad `template/**` files pattern. → D8 excludes nested dependency directories in the manifest and the publish entrypoint stages a clean source before packaging.

## Migration Plan

1. Land the change (scripts, workflow, `.npmrc.example`, `.gitignore`, docs) with no registry mutation.
2. Provision a `GITEA_TOKEN` (package write) for the org `mood` and add it as a repository Actions secret following `docs/publishing.md`; optionally run the documented smoke test against a Gitea *test owner* before enabling production releases.
3. Exercise the **prerelease** path locally: after bumping to `0.6.0`, `pnpm starter:publish` with the version set to e.g. `0.6.0-devel.0` publishes to a test owner under the `devel` tag, and the same command against a bare `0.6.0` is verified to abort (no `latest`). A clean consumer with the documented loaded `.npmrc` then runs `npx @mood481/starter-foundation-nx-pnpm@0.6.0-devel.0 …` and renders identically to local.
4. Cut the **final** release from CI only: tag `v0.6.0` so the release workflow publishes `0.6.0` to `latest`; verify `@latest` resolves to the CI final version and the `devel` build is untouched.
   **Rollback:** unpublish the version from Gitea (`pnpm unpublish @mood481/starter-foundation-nx-pnpm@<v>` against the Gitea registry) or retag `latest` with `pnpm dist-tag`, and disable the workflow; the starter package code and renderer are unaffected by distribution changes, so no code rollback is needed.

## Open Questions

- Whether to mirror the same package to public npm later for external use — out of scope here and independently reversible; does not affect these specs or tasks.
