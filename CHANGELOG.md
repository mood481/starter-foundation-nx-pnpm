# Changelog

All notable changes to this project are documented in this file.

The format follows the change IDs tracked through OpenSpec. Each entry corresponds to an archived OpenSpec change.

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
