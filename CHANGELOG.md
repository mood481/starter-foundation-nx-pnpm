# Changelog

All notable changes to this project are documented in this file.

Older entries follow change IDs from the former OpenSpec workflow, kept as a
retired read-only archive under `docs/openspec-archive/`.

## 0.8.2

Restore the generated `.gitignore` when npm installs the package tarball and
renames the bundled template file to `.npmignore`.

## 0.8.1

Resolve a relative `paths.root` in a render request from the caller's working
directory when using the package binary through `npx` or `pnpm dlx`. An explicit
`--output` still overrides it. Pin repository maintenance to Node.js 24.22.0
and pnpm 11.28.5, including the publish workflow.

## 0.8.0

BREAKING: Require `NX_VERSION` in render inputs and use it as the generated
workspace's `nx` dependency specifier. Existing inputs must add the placeholder.
Refresh the examples to Node 26, pnpm 12, and Nx 23.3; document a compatible
Node 24 LTS and pnpm 11 option and inline generation without a request file.

## 0.7.2

Provide a consumer-focused README in the published package and a local
`pnpm build` command to inspect the package tarball without publishing. Document
direct `npx` and `pnpm dlx` invocation of the package's sole binary.

## 0.7.0

### adopt-canonical-starter-toolkit-runtime

BREAKING: Adopt the canonical starter-toolkit runtime. The local renderer
(`tools/scripts/render-template.mjs`) and its render-time extension machinery are
removed; generation is delegated to `@mood481/starter-renderer` and contract
validation to `@mood481/starter-validator`. The exported `starter-foundation-render`
binary is now a thin shim that delegates to the canonical `starter-render`. The
neutral `template/` no longer ships a `pnpm-lock.yaml` and its placeholder-
substituting regeneration script is removed; a generated project's lockfile is
produced by a real `pnpm install` during validation. The toolkit packages are
consumed as published `0.4.0` artifacts by role (renderer runtime, contracts and
validator devDependencies); the starter toolchain baseline is intentionally left
unchanged. The `starter-template-renderer` capability is retired and a
`starter-toolkit-integration` capability added.

## 0.6.0

### add-gitea-npm-package-distribution

Distribute the renderer package through the private Gitea npm registry with a
repository-owned pnpm publish entrypoint, channel gating, GitHub Actions
publishing, scoped consumer configuration, and publishing documentation.

## 0.5.0

### decouple-sdd-and-add-extension-contract

BREAKING: Neutral generated projects no longer receive implicit OpenSpec files,
dependencies, scripts, or validation. Add an optional extension selection to
render input or use `--extensions <name1,name2>`; extension resolution is
source-agnostic and no concrete extension is bundled. The root starter keeps
its OpenSpec maintenance workflow, and the existing MWS variant continues to
provide its own OpenSpec overlay.

## 0.4.0

### add-starter-foundation-render-cli-and-npx

Add inline CLI rendering with `--output` and repeatable `--set` assignments, publish the renderer through the `starter-foundation-render` binary and `npx`, and make file-mode input authoritative when concurrent CLI flags are supplied.

## 0.3.0

### fix-renovate-scope

Refine Renovate automation for the starter repository: the OpenSpec-scope workflow now regenerates and commits the assistant tooling on `renovate/*` pull requests so patch/minor `@fission-ai/openspec` updates automerge end-to-end even when the hosted app ignores `postUpgradeTasks`; Renovate scope is narrowed to the root `package.json` and only `@fission-ai/openspec` inside `template/package.json` by disabling the `github-actions` and `nvm` managers and adding template package rules; the Dependency Dashboard is disabled while configuration-migration pull requests still auto-open; and `matchPackageNames` is migrated to `matchDepNames`.

## 0.2.0

### add-renovate-automerge

Add Renovate dependency automation for the starter repository: patch/minor `@fission-ai/openspec` updates automerge while major updates stay manual, OpenSpec assistant tooling is regenerated on update, an OpenSpec-scope GitHub Actions workflow rejects generated tooling drift and validates, and `docs/renovate.md` documents how to activate Renovate on GitHub and other Git servers.

## 0.1.0

### add-foundation-template-contract

Define the foundation template contract: starter metadata (`starter.yaml`), template directory structure, OpenSpec SDD layout, generated-project configuration, and baseline validation expectations.

### fix-openspec-package-scripts

Fix OpenSpec package scripts to use the correct `ospec:` prefix and ensure all helper scripts work from the starter repository root.

### add-template-render-validation

Add rendered-template validation that copies `template/`, resolves neutral placeholders, scans for unresolved placeholders, installs dependencies with a frozen lockfile, runs generated-project validation, and generates an Nx project graph.

### add-generated-openspec-config

Add generated-project OpenSpec configuration under `template/openspec/config.yaml` with spec-driven schema, rendered project placeholders, starter provenance, editable context prompts, and lightweight authoring rules.

### define-variant-overlay-contract

Define the neutral variant and overlay metadata contract: variant map shape, overlay paths relative to starter root, overlay application order, full-file `openspec/config.yaml` replacement semantics, overlay config guarantees, and additive variant validations. No concrete variant is introduced by this change.

### add-starter-template-renderer

Add a starter-owned generic renderer that reads structured YAML or JSON render input, resolves required and derived placeholders, supports variant selection through `--variant` or render input, applies overlay files before placeholder rendering, and fails on unresolved placeholders or unsafe output paths.

### add-mws-foundation-variant

Add the MWS foundation variant: `starter.yaml` declares the `mws` variant with overlay path, required `PROJECT_ID` placeholder, and MWS validation command. The overlay adds `mws.project.yaml`, MWS documentation, an MWS lifecycle spec, and a stricter MWS OpenSpec config as a full-file replacement.
