## 1. Neutral Template Cleanup

- [x] 1.1 Remove `template/openspec/` and all importable generated OpenSpec specs/configuration, then audit every remaining `template/` path for OpenSpec, SDD, and `ospec` references; verify the removed paths are absent and the audit finds no forbidden neutral-template assumptions.
- [x] 1.2 Remove `@fission-ai/openspec` and generated `ospec`/`validate:spec` scripts from `template/package.json`, make `validate` workspace-focused, and regenerate `template/pnpm-lock.yaml` through the repository's local lockfile workflow; verify the template lockfile has no OpenSpec packages and frozen installation remains reproducible.
- [x] 1.3 Update `template/README.md` and `template/docs/{development,validation,monorepo}.md` to describe the SDD-neutral foundation, optional future capabilities, and the existing quality gates without implying a generated OpenSpec provider; verify documentation contains no mandatory generated OpenSpec workflow.

## 2. Starter Metadata And Root OpenSpec Boundary

- [x] 2.1 Update `starter.yaml` for release `0.5.0`: remove neutral `sdd`, `openspec-sdd`, and `paths.sdd` declarations; set `extensions: []`; add an optional empty extension-group map; preserve the `mws` variant map and its existing required placeholder and validation declaration; verify the parsed metadata exposes the exact empty list and no concrete extension.
- [x] 2.2 Update root `openspec/config.yaml` context and rules so root OpenSpec remains explicitly starter-maintenance-only while generated SDD content is described as opt-in variant/extension content; update the stale `template/openspec/` guidance and preserve root OpenSpec scripts, dependency, active changes, and strict validation rules; verify root OpenSpec commands and the no-copy boundary remain declared.

## 3. Extension Contract

- [x] 3.1 Define and validate normalized render-input extension-name selections with `extensions` omitted and `extensions: []` equivalent, define the same name grammar for `starter.yaml` and `--extensions`, and define version/source metadata on future declarations; verify shared parser fixtures cover comma-separated names, empty items, malformed names, and duplicates.
- [x] 3.2 Add the source-agnostic resolver/provider boundary and empty default registry; return a clear pre-write error for unresolved selections without adding a repository-local extension directory, npm resolver, or concrete extension; verify a synthetic provider can be injected in tests while the production registry remains empty.
- [x] 3.3 Implement manifest validation for identity, starter compatibility, required capabilities, optional variant constraints, optional group cardinality, declarative contributions, and additive validation expectations; verify invalid manifests fail with field-specific diagnostics.
- [x] 3.4 Implement deterministic extension ordering, duplicate-id rejection, normalized path checks, extension file collision rejection, and synthetic in-memory fixtures for successful empty composition and preflight failure cases; verify output writes do not start for every preflight failure.

## 4. Renderer And Composition

- [x] 4.1 Extend structured input parsing and renderer state so file mode reads `extensions`, CLI mode accepts `--extensions <name1,name2>`, and existing input-authoritative precedence, output safety, variant selection, and placeholder derivation remain compatible; verify `--input` ignores `--extensions` with a stderr warning and uses only file values.
- [x] 4.2 Refactor rendering into the documented preflight and application order: metadata/input, variant, extension resolution, compatibility, neutral copy, variant overlay, extension files, mutations, placeholders, unresolved scan, and validation; verify the order with an instrumented synthetic provider and no-extension regression tests.
- [x] 4.3 Apply resolved extension file contributions after the variant overlay in canonical order, keeping variant full-file replacement semantics separate from extension add-only semantics; verify ordering is independent of input order and filesystem enumeration.
- [x] 4.4 Update neutral and variant render validation plumbing so extension validation expectations are additive and the neutral validation path explicitly checks for forbidden SDD artifacts, dependencies, scripts, and paths; verify neutral and MWS validation use the correct contribution ownership.

## 5. Structured Mutations

- [x] 5.1 Implement the narrow `packageJson` mutation applier for `dependencies`, `devDependencies`, and `scripts`, preserving unrelated fields and applying mutations before placeholder rendering; verify the resulting JSON retains unrelated keys and resolves placeholders correctly.
- [x] 5.2 Preflight mutation conflicts, conflicts with existing values, cross-map dependency conflicts, unsupported paths, and attempts to overlay `package.json`; fail deterministically before output writes without introducing a generic patch engine; verify conflict diagnostics identify extensions and keys.

## 6. Documentation And Release

- [x] 6.1 Update root `README.md` with the 0.5 neutral boundary, `extensions: []` render-input shape, `--extensions <name1,name2>` CLI shape, future external-source example, pipeline order, and distinct `variant`/`overlay`/`extension` terminology; verify examples match the implemented precedence rules.
- [x] 6.2 Update `VALIDATION.md` and `docs/renovate.md` for neutral output checks, optional SDD provisioning, root-only OpenSpec maintenance, extension failure/composition checks, and local repository tooling commands; verify no generated-project OpenSpec assumption remains.
- [x] 6.3 Update `examples/render-input.neutral.yaml`, `examples/render-input.mws.yaml`, and `starter.render.yaml` with explicit empty extension lists where appropriate; document that no concrete extension is bundled; verify all examples parse with the shared extension-name validator.

## 7. Version / Release Metadata

- [x] 7.1 Bump starter release metadata consistently to `0.5.0` where the starter contract requires it and add a changelog entry describing the breaking removal of implicit generated OpenSpec, the new extension contract, and `--extensions`; verify package and starter versions agree.
- [x] 7.2 Regenerate and inspect root/template lockfile and package distribution metadata so root OpenSpec remains a development dependency, generated output has no OpenSpec dependency, and no root maintenance artifacts are published or rendered accidentally; verify package file boundaries and both lockfiles match their intended surfaces.

## 8. Validation

### Root Repository

- [x] 8.1 Verify root OpenSpec still works with repository-local commands, including strict all-artifact validation, root `ospec` helpers, and the root `pnpm validate` path; confirm `openspec/`, root dependency, and root scripts were not removed or weakened using the repository-declared pnpm scripts.

### Neutral and Variant Rendering

- [x] 8.2 Render the neutral template with omitted extensions and explicit `extensions: []`; verify both succeed, produce valid Nx + pnpm output, contain no `openspec/`, SDD artifacts, OpenSpec dependency, OpenSpec scripts, or SDD-specific validation, contain no unresolved placeholders, and contain no forbidden variant-specific files or assumptions.
- [x] 8.3 Render the existing variant-only MWS input and verify its overlay files, MWS OpenSpec baseline, required placeholders, and validation still work; verify `variants/mws/overlay/` remains outside `template/` and no MWS files appear in a neutral render.

### Extension Behaviour

- [x] 8.4 Verify `--extensions name1,name2` and structured `extensions` use the same name validator; unknown extensions fail clearly before writes; duplicate and conflicting extension declarations fail deterministically; optional group cardinality and compatibility failures identify their cause; extension ordering is identical across input/provider discovery order permutations.
- [x] 8.5 Verify synthetic extension contributions and mutations compose in the documented order, reject file and `package.json` replacement collisions, preserve unrelated package metadata, and reject conflicting dependency/devDependency/script assignments before writes; verify validation expectations remain additive and are not lifecycle hooks.

### Contract and Regression Gate

- [x] 8.6 Verify existing renderer CLI/input behaviour remains compatible when extensions are empty, including default and explicit input paths, `--extensions` precedence, file-authoritative flags and warning, variant-only rendering, output safety, required placeholders, unresolved-placeholder failure, and published package file boundaries.
- [x] 8.7 Run repository-local strict OpenSpec validation for this change and all artifacts, fix every validation error, and confirm every delta modifies or removes the corresponding obsolete canonical requirement rather than contradicting it; record the passing command output.
- [x] 8.8 Audit all design constraints: no concrete extension, no OpenSpec extension, no `standalone` / `module` mode, no unrelated modules, no required co-location, deterministic ordering, safe structured mutation boundary, preserved root OpenSpec support, and alignment with every applicable `openspec/config.yaml` rule; record the audit results.
- [x] 8.9 Review docs, specs, metadata, examples, and validation output for consistent `variant`, `overlay`, and `extension` terminology and confirm the `0.5.0` breaking boundary is stated clearly; verify no alternate terminology or unplanned capability was introduced.
