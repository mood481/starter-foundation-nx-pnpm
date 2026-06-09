# Changelog

All notable changes to this project are documented in this file.

The format follows the change IDs tracked through OpenSpec. Each entry corresponds to an archived OpenSpec change.

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