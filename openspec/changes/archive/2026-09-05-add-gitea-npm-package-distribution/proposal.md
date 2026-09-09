# Proposal: add-gitea-npm-package-distribution

## Why

The renderer package `@mood481/starter-foundation-nx-pnpm` is publishable (correct `name`, `bin`, `files`, and runtime `dependencies`), but it has never been distributed, so the documented `npx @mood481/starter-foundation-nx-pnpm ...` entrypoint resolves to nothing (npm public registry returns `404`). We do not want to publish to the public npm registry; we want to distribute and consume the package privately through the organization's existing Gitea instance (`git.mood481.es`, org `mood`), which already hosts other ecosystems.

A validation spike against the live Gitea registry confirmed the approach works end-to-end: the scoped package metadata and its `@scope/name` tarball are served correctly (HTTP `200`, no `dist.tarball` resolution bug), a global install links the `starter-foundation-render` bin, and `npx` runs it and renders. It also surfaced the real failure mode to design around: a scoped registry mapping is used only when it is present in configuration loaded by the package client. The supported locations are a project `.npmrc`, a user `~/.npmrc`, or an explicit `--userconfig`; the current npm client also honors a `.npmrc` in the current directory even when no `package.json` is present. Without a loaded mapping, the client falls back to npm public and 404s. This change codifies the distribution channel so neither humans nor automation have to remember registry flags.

## What Changes

- Introduce a `package-distribution` capability that defines how the starter-owned renderer package is published and privately consumed via Gitea's npm registry.
- Codify the publish path in the starter repository so the registry target is declared, not memorized: a repository-owned publish script in `package.json` (e.g. `starter:publish`) that invokes `pnpm publish`, plus a GitHub Actions workflow that calls that same entrypoint. Document the repository-secret and workflow configuration in `docs/publishing.md`; neither path relies on ad-hoc CLI flags.
- Keep `package.json` manifest fields registry-agnostic (no `publishConfig.registry` baked in); the target registry lives in the publish script and workflow step.
- Gate publish channel by version: local/manual publishes MUST carry an allowed prerelease identifier (`devel`, `alpha`, `beta`, or `rc`) and publish under a non-`latest` dist-tag; only the release workflow may publish a prerelease-free `x.y.z` version and move `latest`.
- Define the consumer resolution contract: internal consumers point the `@mood481` scope at `https://git.mood481.es/api/packages/mood/npm/` with a `package:read` token, and unscoped dependencies (e.g. `yaml`) continue to resolve from the npm public registry.
- Enforce secret hygiene: no Personal Access Token is committed; repository `.npmrc` handling for the token is git-ignored, and CI authenticates via an injected secret.
- Move the detailed publishing/consumption procedure into `docs/publishing.md` (starter-maintenance docs) and reference it from a short README pointer, keeping `README.md` and `VALIDATION.md` lean instead of inlining the full Gitea walkthrough; `README.md`/`VALIDATION.md` retain only concise usage/validation pointers.
- Bump the package and starter version to `0.6.0` (in lockstep `package.json` + `starter.yaml`) to reflect the new additive `package-distribution` capability, publish tooling, and the CI-only final-release policy.
- No changes to renderer behavior, CLI semantics, `template/`, variants, or overlays. The `npx` invocation parity requirement in `starter-template-renderer` remains satisfied; only the registry that `npx` resolves from changes.

## Capabilities

### New Capabilities
- `package-distribution`: governs publishing the renderer package to the Gitea npm registry, publish-channel gating by version/prerelease suffix and dist-tag, the scoped `.npmrc` resolution contract for internal consumers, credential/secret handling, and the automated publish workflow. Distribution target and resolution are specified here; rendering behavior is not.

### Modified Capabilities
- `starter-template-renderer`: update its version-bound package and `npx` examples from `0.5.0` to `0.6.0` so the canonical contract remains aligned with the release metadata. Renderer behaviour (CLI contract, file-authoritative precedence, `npx`/local parity, and publishable `bin`/`files`) is unchanged; registry and credential details remain implementation/documentation concerns.

## Impact

- **Affects**: starter repository only. `template/` files and `variants/**` are untouched; the only rendering-output effect is the derived `STARTER_VERSION` value changing with the `0.6.0` version bump.
- **Spec impact**: new delta at `openspec/changes/add-gitea-npm-package-distribution/specs/package-distribution/spec.md`; adds a canonical `package-distribution` spec when archived, and updates version-bound references in `openspec/specs/starter-template-renderer/spec.md` to match the `0.6.0` release.
- **Starter-repository files**:
  - `package.json` — add a repository-owned `starter:publish` script encoding the Gitea registry target, userconfig, and the publish-channel/version/dist-tag gate; use a `files` exclusion for nested `template/**/node_modules/**`; bump `version` to `0.6.0`; manifest `name`/`bin`/`files`/`publishConfig` remain registry-agnostic (no `publishConfig.registry`).
  - `starter.yaml` — bump `version` to `0.6.0` in lockstep with `package.json`.
  - `.npmrc` (root) and/or `.npmrc.example` — scoped registry mapping template for publish/consumer use; token never committed.
  - `.gitignore` — ensure any token-bearing `.npmrc` is ignored.
- `.github/workflows/` — new publish workflow triggered on a `v*` tag and available through `workflow_dispatch`, authenticating to external Gitea with a secret (`GITEA_TOKEN`) and running the repository publish script as the only final-`latest` path; it requests only `contents: read`, not GitHub Packages permissions.
- `docs/publishing.md` — new starter-maintenance doc holding the full Gitea publishing/consumption procedure (registry target, `.npmrc` scope-mapping prerequisite and npm-load-location rule, PAT scopes, `starter:publish`, repository-secret setup, workflow triggers, and the `devel|alpha|beta|rc` → `next`/`devel` vs CI `x.y.z` → `latest` channel policy).
  - `README.md` — concise **Publishing** pointer to `docs/publishing.md`; trimmed so it no longer inlines the full procedure.
  - `VALIDATION.md` — one-line reference to `docs/publishing.md` for published-package checks; existing render/`npx` validation text left in place.
  - `CHANGELOG.md` — record the `0.6.0` distribution change.
- **External systems**: requires a Gitea PAT (org `mood`) with `package` permission available for publishing (manual and CI secret), and network reachability of `https://git.mood481.es/api/packages/mood/npm/` from GitHub Actions runners (confirmed internet-reachable, private auth).
- **Tooling / dependencies**: no new runtime dependency; publishing uses the existing pnpm client against the Gitea npm-compatible registry. OpenSpec stays a local dev dependency.
- **Validation behaviour**: strict OpenSpec validation passes; the workflow YAML and its secret/tag guards are reviewed statically; a clean consumer with a loaded scoped `.npmrc` resolves `@mood481` from Gitea and runs `npx … starter-foundation-render` with results identical to local `pnpm starter:render`. A live GitHub Actions smoke test against a Gitea test owner is documented as an operator follow-up, not required to build the workflow.
- **Security**: tokens are provided via environment/secret injection or a git-ignored `.npmrc`; the change must never introduce a committed credential.
