# Design: decouple-sdd-and-add-extension-contract

## Context

The starter repository currently has two intentionally different surfaces, but the neutral generated surface still carries OpenSpec content from the starter's earlier foundation contract. Root `openspec/` and its OpenSpec dependency, scripts, canonical specs, and active changes are required to maintain this repository. In contrast, `template/` is copied into generated projects and currently contains `template/openspec/`, an OpenSpec dependency, `ospec` scripts, and OpenSpec-specific validation and documentation.

The existing renderer at `tools/scripts/render-template.mjs` reads `starter.yaml`, selects an optional `mws` variant, copies `template/`, applies the variant overlay, resolves placeholders, and scans for unresolved placeholders. Variant overlays are repository-root-relative and may replace colliding files as complete files. The MWS overlay intentionally provides an OpenSpec baseline, so the MWS render is not the same surface as the neutral render.

The 0.5.0 change makes the unselected foundation neutral and introduces an extension boundary for future capabilities. The first implementation must not need a real extension or an npm resolver to prove the contract. It must, however, avoid an architecture that assumes all contributions are local overlays or that shared structured files can be replaced wholesale.

## Goals / Non-Goals

**Goals:**

- Make a neutral render a valid Nx + pnpm foundation with no required or bundled SDD implementation.
- Preserve root OpenSpec development and strict validation exactly as a starter-repository concern.
- Add an explicit, versionable `extensions` selection in render input with an empty default.
- Define a source-agnostic resolver boundary for future external extension artifacts.
- Define extension identity, compatibility, capability requirements, contributions, structured mutations, and validation expectations.
- Keep variant and extension concepts independent and preserve the existing MWS variant.
- Make extension resolution, compatibility checks, contribution order, collision handling, and mutation order deterministic.
- Keep existing renderer file mode, CLI mode, placeholder behaviour, output safety, and variant-only usage compatible when no extensions are selected.
- Target the next starter release as `0.5.0`.

**Non-Goals:**

- An OpenSpec extension, another SDD provider, or any production extension.
- npm or remote package resolution, an extension catalog service, package publication, or dependency solving.
- Arbitrary executable hooks, lifecycle management, rollback, uninstall, or extension graph orchestration.
- A generic JSON/YAML patch language.
- New variants, MWS-specific SDD policy, module installation, or `standalone` / `module` modes.

## Decisions

### Neutral template owns no SDD

Remove `template/openspec/` and all generated OpenSpec package, lockfile, validation, metadata, and documentation assumptions. The neutral template retains workspace quality gates, Nx, pnpm, multi-language guidance, placeholders, and documentation for the foundation. A selected contribution may add SDD content, but the unselected template does not.

Root `openspec/` is not part of this removal. Root `package.json`, root `pnpm-lock.yaml`, root `ospec:*` scripts, `.opencode/`, and root strict validation remain starter-maintenance infrastructure. The root `openspec/config.yaml` is updated only to stop describing `template/openspec/` as generated baseline content and to describe the neutral/variant/extension boundary accurately.

The root configuration update is part of this change's implementation scope, not a change to the OpenSpec workflow schema. Its context will state that `template/` is the neutral generated baseline, that generated SDD content is opt-in through an explicitly selected variant or extension, and that root `openspec/changes/` is never generated. The repository-boundary guidance will describe extension declarations and externally resolved artifacts without requiring a local extension directory. The generated-OpenSpec path rule will be narrowed to source paths that actually exist: neutral-template references use `template/openspec/` only when applicable, while variant or extension output references identify their owning overlay/artifact. The root `schema: spec-driven`, artifact rules, and strict validation commands remain unchanged.

### Starter metadata separates declarations from selections

The root `starter.yaml` will keep the existing variant map and add a deliberately empty extension declaration list:

```yaml
extensions: []
extensionGroups: {}
```

The field names and semantics are fixed for this change: `extensions` is a list of versioned extension declarations, and it is empty in 0.5.0; `extensionGroups` is an optional map and is empty when no group rule is declared; `provides` includes `extension-support`. A future declaration can reference an external artifact without placing it under this repository:

```yaml
extensions:
  - id: example-extension
    version: 1.0.0
    source: npm
    package: "@scope/example-extension"
```

The existing `mws` entry remains under `variants` and remains an overlay selection, not an extension. No future example above is added to the repository by this change.

Render input will use a list of extension names because a request selects zero or more declared extensions:

```yaml
variant: mws

extensions: []

output:
  path: ../tmp/project

placeholders:
  PROJECT_NAME: Example Project
  PROJECT_SLUG: example-project
  PROJECT_DESCRIPTION: Example generated foundation repository.
  DEFAULT_PACKAGE_SCOPE: "@example"
```

A future render input can select the external declaration by name:

```yaml
extensions:
  - example-extension
```

The declaration supplies the version and source locator to the resolver. The request itself therefore remains a stable list of names, and the CLI can use the same list shape. This does not declare that the repository resolves npm packages in 0.5.0.

### Extension resolution is an injected/provider boundary

The renderer will normalize the input list and call an extension resolver boundary with each selected name, its starter declaration when present, and the current starter context. A resolved manifest is the only object used by the composition stage. The default 0.5.0 resolver registry has no production extension provider and no bundled extension declaration. Therefore:

- an empty selection bypasses extension resolution and succeeds;
- a non-empty selection is validated as a name list and passed to the resolver boundary;
- an unresolved selection fails with its name and any available declaration/source details before the output directory is written;
- future package or catalog integrations can supply providers without requiring `extensions/<name>/` in this repository.

The resolver boundary is intentionally not a lifecycle hook. It resolves metadata and contribution sources; it does not execute arbitrary extension code, install dependencies, solve graphs, or mutate the destination. The shared extension-name validator is used for `starter.yaml` declaration IDs, structured render-input names, and comma-separated `--extensions` values. It accepts only `^[a-z0-9]+(?:-[a-z0-9]+)*$`, rejects empty entries and duplicates, and compares names case-sensitively.

### Extension manifests are small and declarative

A resolved manifest has the following conceptual fields:

```yaml
id: example-extension
version: 1.0.0
compatibility:
  starter: ">=0.5.0 <0.6.0"
  requires:
    capabilities: []
  variants:
    allow: []
    deny: []
group: optional-group-id
contributions:
  overlay:
    path: overlay
  mutations:
    packageJson:
      dependencies: {}
      devDependencies: {}
      scripts: {}
validations: []
```

This is a contract shape, not a file to add to the starter. `compatibility.requires.capabilities` is checked against starter `provides`. Optional variant constraints are generic allow/deny data and do not merge extension identity with variant identity. `group` is only checked against a group declared by the starter. `validations` are declarative, additive expectations for the generated result. Their minimum shape is a list of named validation commands or checks consumed by the post-render validation stage; they do not grant an extension arbitrary lifecycle hooks or execution during resolution.

### Contributions are add-only for extension files

Variant overlays retain their current semantics: a variant can add a file or replace a colliding file as a complete file. Extension file contributions are stricter to make composition safe:

- contribution paths are normalized relative to the resolved extension artifact;
- paths cannot escape the artifact root;
- an extension cannot contribute the root `package.json` as a file;
- an extension file may add a new path but cannot collide with the neutral template, selected variant, or another extension;
- collisions are collected during preflight and fail before any output file is written.

This avoids silently allowing a later extension to erase an earlier contribution. A future approved change can extend the contract for explicit replacement of a non-structured file without changing the default safety rule.

### Canonical order is independent of discovery order

After resolution, extensions are sorted by a stable canonical key composed of id, version, source kind, and source locator. Filesystem enumeration order, asynchronous resolver completion, and input list order do not determine application order. Duplicate extension ids are rejected before ordering, even if their source or versions differ. Group cardinality violations, compatibility failures, duplicate target paths, and structured mutation conflicts are also preflight errors.

### Structured mutations are limited to package metadata

The first mutation surface is an explicit `packageJson` section containing only `dependencies`, `devDependencies`, and `scripts` maps. Values are strings. The renderer reads the copied root `package.json`, adds the entries, preserves unrelated fields, and writes it back using the repository's existing JSON formatting convention.

Mutation aggregation happens in canonical extension order, but conflicting assignments do not use last-wins semantics. The same key assigned different values by different extensions fails with an error naming the key and extensions. An entry appearing in both dependencies and devDependencies is also a conflict. No JSON pointer, arbitrary path, array operation, or YAML patch language is introduced.

### Rendering pipeline is explicit

The implementation will preserve the existing parse and file/CLI mode behaviour, then use this pipeline:

```text
load starter.yaml and root package metadata
    |
parse and validate render input (extensions omitted -> [])
    |
resolve and validate selected variant
    |
resolve selected extensions through providers
    |
validate compatibility, groups, duplicates, and contribution conflicts
    |
copy neutral template
    |
apply selected variant overlay
    |
apply sorted extension file contributions
    |
apply sorted structured mutations
    |
resolve placeholders
    |
scan unresolved placeholders
    |
run base, variant, and extension validation expectations
```

All checks that can be performed before output writes happen before copying the template. Existing output safety still rejects a non-empty destination. Placeholder validation remains after all contributions and mutations so placeholders supplied by a future extension are handled by the same mechanism.

CLI mode supports `--extensions <name1,name2>`. The option is parsed into the same normalized extension-name list used by structured input and validated with the same name grammar as extension declarations. When `--input` is present, the file's `extensions` list is authoritative and the CLI option is ignored with the existing warning. When the option is absent, CLI mode creates an empty extension list, preserving existing no-extension behaviour.

### Variants remain separate

The `mws` variant remains in `variants/mws/overlay/`. Its OpenSpec config and lifecycle spec remain variant-provided. Because the neutral template no longer contains `openspec/config.yaml`, the MWS overlay is described and implemented as adding its own complete file rather than replacing a neutral file. No extension is inferred from MWS and no MWS-specific policy is added to the generic extension contract.

## Constraints

- The neutral generated template MUST be SDD-agnostic.
- Root OpenSpec used to develop the starter MUST remain intact and must not be copied into generated output.
- Extensions MUST remain independent from variants.
- `extensions: []` and an omitted extension list MUST be valid and equivalent.
- No concrete extension, including an OpenSpec extension, may be introduced.
- Extension application MUST be deterministic and preflight conflicts before writes.
- Extension sources MUST be able to resolve outside this repository; no `extensions/<name>/` layout is required.
- Whole-file replacement MUST NOT be the only way to modify shared structured configuration.
- The structured mutation model MUST stay limited and MUST NOT become a generic patch engine.
- Existing no-extension render behaviour remains compatible where possible.
- The design MUST leave room for future externally resolved and versioned extensions.
- The design MUST NOT introduce `standalone` / `module` mode semantics.
- Root OpenSpec scripts and dependency automation remain allowed and required for starter maintenance.
- Neutral template changes must not add API, mobile, web, service, auth, storage, eventing, observability, or infrastructure modules.

## Alternatives Considered

### Keep OpenSpec in the neutral template and document it as optional

Rejected. A dependency, scripts, directory, and validation gate are observable requirements, so documentation alone would not make the generated project SDD-agnostic.

### Make every SDD a built-in variant

Rejected. This would preserve the coupling in a different place and would not provide a generic composition mechanism for non-SDD capabilities. Existing MWS remains a variant because it is already an approved concrete variant, not because variants are the extension mechanism.

### Require all extensions to live under `extensions/<name>/`

Rejected. It blocks future external packages and catalogs and makes distribution a property of this repository rather than the extension contract.

### Apply extension overlays with last-wins replacement

Rejected. Deterministic ordering would make the winner predictable but would still allow an extension to silently erase shared or peer content. The initial contract uses add-only extension files and explicit conflict failure.

### Let extensions replace `package.json`

Rejected. Complete-file replacement loses unrelated foundation and peer-extension entries. The explicit package metadata mutation surface is safer and can grow without committing to a general patch language.

### Implement npm resolution in 0.5.0

Rejected. No real extension exists to exercise it, and remote resolution would add authentication, caching, integrity, installation, and failure-policy concerns outside this architectural change. The provider boundary is sufficient to keep the contract externally resolvable later.

### Add an implicit required SDD extension group

Rejected. The purpose of this change is to make SDD optional. Groups are an optional constraint mechanism; no `sdd` group or SDD selection is required.

## Risks / Trade-offs

- **Breaking generated output:** Unselected projects no longer have OpenSpec files or commands. This is intentional and must be called out in the 0.5.0 changelog and migration notes. Existing generated projects remain unchanged.
- **No successful non-empty extension render in 0.5.0:** With no production provider, selected extensions fail clearly. This is preferable to inventing a concrete extension and still proves the selection, validation, and resolver boundary without hidden local assumptions.
- **Provider contract incompleteness:** External package resolution details remain future work. Stable source/id/version fields and a provider boundary minimize the risk of locking the renderer to a repository-local layout.
- **Conflict rejection can require extension authors to coordinate:** Failing on file and mutation conflicts is stricter than last-wins composition but prevents order-dependent output corruption. Explicit future replacement rules can be added later.
- **MWS has OpenSpec while neutral output does not:** This distinction may surprise consumers. MWS documentation and the canonical variant spec must state that its SDD is selected variant content.
- **Mutation scope is intentionally narrow:** Extensions needing other structured files must wait for an approved contract extension rather than smuggling in arbitrary patches or replacing whole files.

## Validation Strategy

- Run `pnpm exec openspec validate --change "decouple-sdd-and-add-extension-contract" --strict` and the repository's all-artifacts strict validation through `pnpm validate:spec`.
- Inspect the root package scripts and dependency graph to confirm root OpenSpec remains available and generated OpenSpec is removed only from `template/`.
- Render the neutral example and inspect the complete output for no `openspec/` paths, OpenSpec dependency, `ospec` scripts, SDD-specific validation, or unresolved placeholders.
- Render with omitted extensions and explicit `extensions: []` and compare the resulting neutral outputs.
- Exercise `--extensions <name1,name2>` in CLI mode, including shared name validation, duplicate and empty-item failures, and file-authoritative ignore-with-warning behaviour when `--input` is present.
- Exercise synthetic in-memory extension manifests at the resolver/composer boundary without adding a production extension: unknown provider, incompatible starter, duplicate id, group cardinality, file collision, and mutation conflict failures must happen before output writes.
- Verify canonical ordering with the same synthetic manifests presented in different input and resolver completion orders.
- Render the existing variant-only MWS input and confirm the MWS overlay still supplies its OpenSpec content while the neutral render does not.
- Verify existing default input, explicit file input, CLI flags, output safety, placeholder, and unresolved-placeholder behaviour remains compatible when extensions are empty.
- Audit documentation and spec language for consistent distinction between `variant`, `overlay`, and `extension`, and confirm no `standalone` / `module` contract or concrete extension was introduced.

## Repository Structure

### Affected starter-repository paths

```text
starter.yaml                         # version 0.5.0, neutral metadata, extension defaults
openspec/config.yaml                 # root maintenance context updated for SDD-neutral template
tools/scripts/render-template.mjs    # extension parsing/resolution/composition pipeline
tools/scripts/validate-template-render.mjs
package.json                         # retain root OpenSpec, add/update 0.5 renderer metadata
pnpm-lock.yaml                       # retain root OpenSpec lock entries
README.md
VALIDATION.md
CHANGELOG.md
docs/renovate.md
examples/render-input.neutral.yaml
examples/render-input.mws.yaml
starter.render.yaml
scripts/update-template-lockfile.mjs # used to regenerate the neutral template lockfile
```

### Removed or changed generated-template paths

```text
template/openspec/                     # removed in full
template/package.json                  # remove OpenSpec dependency/scripts
template/pnpm-lock.yaml                # regenerate without OpenSpec packages
template/README.md
template/docs/development.md
template/docs/validation.md
template/docs/monorepo.md
```

### Unchanged boundaries

```text
openspec/                               # root starter-maintenance OpenSpec remains
variants/mws/overlay/                   # remains the approved MWS variant source
```

No `extensions/` directory is introduced. Future external providers may materialize artifacts elsewhere.

## Template Structure

After implementation, a neutral `template/` contains the workspace foundation:

```text
template/
├── apps/
├── services/
├── packages/
├── tools/
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── nx.json
└── ...
```

It does not contain `openspec/`, an SDD config, importable SDD specs, an SDD dependency, or SDD-specific scripts. The MWS render can add `openspec/` only because its selected variant overlay owns those files.

## Rendering Model

The normalized request has `variant` optional, `extensions` defaulting to an empty list, `output.path`, and `placeholders`. File mode remains authoritative when `--input` is present. CLI mode remains a no-input path for variant, output, and placeholder flags and uses an empty extension list in 0.5.0.

The renderer should keep selection/preflight separate from file writes:

1. Load starter metadata and root runtime metadata.
2. Parse and validate the YAML/JSON request.
3. Resolve the selected variant, if any.
4. Resolve every extension through the provider boundary.
5. Validate compatibility, capabilities, groups, duplicate ids, paths, and structured mutations.
6. Validate required placeholders and output safety.
7. Copy the neutral template.
8. Apply the selected variant overlay using existing full-file variant semantics.
9. Apply sorted extension file contributions using add-only extension semantics.
10. Apply sorted supported package metadata mutations.
11. Resolve placeholders across the complete output.
12. Fail if unresolved placeholders remain.
13. Run neutral, variant, and extension validation expectations.

The current renderer writes after required-placeholder and output checks but can be extended with a preflight materialization step. If a future resolver needs to download or unpack an artifact, that work remains outside the destination and is not a generated-project write.

## Extension Contract

The contract has three layers:

- **Selection:** structured render input and CLI input identify extension names only. The list is empty by default and is validated by the shared extension-name validator.
- **Declaration:** `starter.yaml` maps each available extension name to a versioned source declaration. The 0.5.0 list is empty; a future entry can point to an npm package or another external artifact.
- **Manifest:** the resolved artifact declares identity, compatibility, requirements, optional group, file/overlay contributions, structured mutations, and additive validation expectations.

The starter owns neither the extension artifact nor a mandatory catalog. A provider maps a selection to a manifest and an artifact root. The renderer validates manifest identity against the selection, validates starter capabilities and selected variant compatibility, then consumes only declarative contributions.

An extension may declare a group, but the group is constrained only when `starter.yaml` declares that group. A future SDD group can therefore express zero-or-one without making any SDD mandatory. No group is created by this change.

Extension file contributions use normalized relative paths and are add-only. The renderer preflights target paths against the neutral template, variant overlay, and peer extensions. The root `package.json` is reserved for structured mutations. Extension validation expectations run after rendering and are additive; they cannot disable neutral or variant checks.

## Structured Mutations

The initial structured mutation model is intentionally limited to the root package manifest:

```yaml
mutations:
  packageJson:
    dependencies:
      "@scope/example-runtime": "^1.0.0"
    devDependencies:
      "@scope/example-tool": "^1.0.0"
    scripts:
      example:run: "example-tool run"
```

The renderer parses the copied `package.json`, merges only those three maps, preserves all other keys, and writes valid JSON. Duplicate same-value assignments can be treated as idempotent; different assignments to one key, or assignment to the same package in both dependency maps, fail with a deterministic conflict. The mutation engine does not accept pointers, expressions, array operations, arbitrary nested keys, or full-file replacement.

## Migration Plan

This is a breaking starter release, not a migration of generated repositories. Existing generated projects keep their current OpenSpec files and scripts. New neutral renders at `0.5.0` stop receiving those files. Consumers that need an SDD must select an approved variant or a future extension explicitly.

Existing render inputs remain valid because an omitted `extensions` field is normalized to `[]`. The neutral and MWS example inputs gain explicit empty extension lists for clarity. Existing variant-only inputs continue to use `variant: mws`; the MWS overlay is updated as a standalone contribution because the neutral file it previously replaced is gone.

The release notes must identify the removal of implicit OpenSpec provisioning, the preserved root OpenSpec workflow, the new extension request field, and the fact that no concrete extension is bundled.

## Spec Mapping

| Artifact | Contract change |
| --- | --- |
| `foundation-starter` | Neutral metadata, root/generated separation, variant overlay semantics, and extension defaults remain distinct. |
| `foundation-template` | Neutral directory and generated output no longer require SDD content. |
| `sdd-contract` | Generated OpenSpec layout, configuration, specs, dependency, and scripts are removed. |
| `starter-template-renderer` | Render input, pipeline order, variant/extension separation, and deterministic composition are extended. |
| `extension-contract` | New versioned, source-agnostic extension declaration and composition contract. |
| `quality-gates` | Neutral template validation remains workspace-focused; generated OpenSpec validation is removed. |
| `dependency-automation` | Template lockfile and Renovate documentation no longer assume generated OpenSpec files. |
| `mws-foundation-variant` | Existing MWS OpenSpec config is provided as a complete variant file, not a neutral replacement. |
