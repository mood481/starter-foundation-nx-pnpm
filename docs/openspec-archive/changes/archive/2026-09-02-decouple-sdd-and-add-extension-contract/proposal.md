# Proposal: decouple-sdd-and-add-extension-contract

## Why

The 0.4.0 foundation renders OpenSpec configuration, specs, dependencies, and validation scripts into every neutral generated project even though OpenSpec is only the SDD used to develop this starter repository. That coupling makes the neutral foundation less reusable and prevents future SDDs and other optional capabilities from being composed without changing the foundation itself.

The next `0.5.0` release should make the generated foundation SDD-agnostic and establish a small, source-agnostic extension contract that can be implemented by future external integrations.

## What Changes

- **BREAKING** Remove generated-project OpenSpec assumptions from the neutral `template/`, including `template/openspec/`, the OpenSpec dependency and scripts in `template/package.json`, OpenSpec lockfile entries, generated OpenSpec validation, OpenSpec paths, and documentation that presents OpenSpec as a neutral baseline.
- **BREAKING** Remove the neutral starter's `sdd` metadata, `openspec-sdd` capability, and `sdd: openspec` path declaration. Replace them with explicit `extensions: []` metadata and generic `extension-support` capability metadata.
- Keep root `openspec/`, the root OpenSpec dependency, root `ospec:*` scripts, and root OpenSpec validation intact because they maintain this starter repository.
- Update the canonical SDD-related requirements so obsolete generated-project OpenSpec requirements are removed, not contradicted by new requirements.
- Define a generic extension contract covering identity, version, source locator, compatibility and capability requirements, optional extension groups, contributed files or overlay content, narrow structured mutations, and additive validation expectations.
- Extend structured render input with `extensions`, defaulting to `[]`, while keeping variants and extensions as separate concepts and keeping existing file-mode and CLI-mode behaviour compatible when no extensions are selected.
- Add optional CLI extension selection through `--extensions <name1,name2>`, using the same extension-name validation as the equivalent starter metadata field. When `--input` is present, the CLI value is ignored with the existing file-authoritative warning.
- Refine the renderer contract to resolve and preflight selected extensions before writing output, apply variant overlays before extension contributions, apply extension contributions in canonical deterministic order, apply supported structured mutations, then resolve placeholders and validate the result.
- Make external resolution a provider boundary rather than a repository layout rule. No npm resolver, extension package, OpenSpec extension, or other concrete extension is introduced by this change.
- Reserve a deliberately narrow `package.json` mutation model for dependency, devDependency, and script additions so an extension does not need to replace the complete shared file.
- Preserve the existing `mws` variant as a variant. Its existing OpenSpec files remain variant-provided and are adapted only where the neutral template no longer contains an OpenSpec file to replace.
- Update starter documentation, validation guidance, release metadata, examples, and terminology for `variant`, `overlay`, and `extension`, targeting the `0.5.0` starter release.

## Capabilities

### New Capabilities

- `extension-contract`: Generic declaration, resolution, compatibility, composition, contribution, structured mutation, and validation contract for optional extensions.

### Modified Capabilities

- `foundation-starter`: Make starter metadata and starter/template separation SDD-agnostic while declaring extension defaults and preserving independent variants and overlays.
- `foundation-template`: Remove OpenSpec from the neutral template directory and define the generated foundation's SDD-neutral boundary.
- `sdd-contract` (retired): All five requirements are removed because they force OpenSpec layout, configuration, specs, dependency, or scripts into every generated project. The capability is retired and its spec deleted via `retire_capabilities: true`, superseded by `extension-contract` and by variant-provided OpenSpec (e.g. `mws`).
- `starter-template-renderer`: Add extension input, `--extensions` CLI selection, and deterministic extension-aware rendering while preserving zero-extension and existing variant behaviour.
- `quality-gates`: Remove generated-project OpenSpec validation from the neutral quality baseline while retaining starter-repository OpenSpec gates and workspace validation.
- `dependency-automation`: Generalize template lockfile maintenance and remove documentation requirements tied to a generated `template/openspec/config.yaml`.
- `mws-foundation-variant`: Adapt the existing MWS OpenSpec overlay contract from replacing a neutral OpenSpec config to providing its own full config.

## Impact

This affects both surfaces of the repository. The starter repository changes in `starter.yaml`, the root OpenSpec context, renderer and validation tooling, documentation, examples, release metadata, and the canonical specs. The generated-project surface changes in `template/`, its lockfile and docs, and the rendered output contract.

The generated neutral API changes from an implicitly OpenSpec-provisioned foundation to an Nx + pnpm foundation with `extensions: []` by default. Existing render requests that omit extensions remain valid. Requests selecting an extension require a resolvable extension descriptor and fail before output writes when the current resolver boundary cannot resolve it. Existing MWS renders continue to receive their OpenSpec content through the MWS variant overlay.

The change is breaking for consumers that relied on OpenSpec being present in an unselected neutral render, but it does not remove or weaken the starter repository's root OpenSpec development workflow. It also does not define `standalone` or `module` modes, add a module starter, or introduce a concrete extension.

## Out of Scope

- Implementing an OpenSpec extension or another SDD provider.
- Creating a `starter-extensions` repository or publishing an extension package.
- Implementing npm, remote, dependency-graph, rollback, uninstall, or lifecycle-hook machinery beyond the resolver boundary needed by the contract.
- Adding arbitrary executable extension hooks or a generic JSON/YAML patch engine.
- Changing the existing MWS SDD policy beyond adapting its overlay to the absence of a neutral OpenSpec base.
- Introducing `standalone` / `module` modes, module installation, application starters, services, APIs, mobile, web, auth, storage, infrastructure, or other unrelated capabilities.

## Risks

- Generated neutral projects lose an OpenSpec baseline, so consumers that require SDD must choose a future extension or an existing variant explicitly. The release documentation and validation must call out this breaking boundary.
- Extension composition can create file and structured-configuration conflicts. The contract mitigates this with preflight collision detection, canonical ordering, duplicate rejection, and conflict failure rather than implicit last-wins behaviour.
- External extension resolution can vary by distribution mechanism. The contract therefore uses a source locator and resolver interface without assuming `extensions/<name>/` or implementing a particular package registry.
- MWS remains an existing variant that provisions OpenSpec. Its overlay must be treated as a complete variant contribution, not as evidence that the neutral template has an SDD.
