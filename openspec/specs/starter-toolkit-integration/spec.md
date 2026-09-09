# starter-toolkit-integration Specification

## Purpose
Defines how this starter consumes and delegates to the canonical starter-toolkit runtime: depending on the published `@mood481/starter-*` packages by role (a runtime renderer plus dev-time contracts/validator), exposing an exported binary that delegates to the canonical renderer, and validating renders with the canonical validator and renderer (real install) while retaining only this starter's residual checks.

## Requirements

### Requirement: Canonical toolkit consumed as published packages by role

The starter repository SHALL depend on the canonical toolkit as published artifacts resolved through the existing `@mood481` scope mapping, and MUST NOT reference them through local `link:` or `workspace:` paths. `@mood481/starter-renderer` SHALL be a runtime dependency; `@mood481/starter-contracts` and `@mood481/starter-validator` SHALL be devDependencies; `@mood481/starter-cli` SHALL NOT be a dependency of this starter.

#### Scenario: Dependencies split by role and pinned

- **WHEN** `package.json` is inspected
- **THEN** `@mood481/starter-renderer` SHALL appear in `dependencies`
- **AND** `@mood481/starter-contracts` and `@mood481/starter-validator` SHALL appear in `devDependencies`
- **AND** none SHALL use a `link:` or `workspace:` protocol to the sibling toolkit checkout
- **AND** `@mood481/starter-cli` SHALL NOT be listed in either.

#### Scenario: Renderer brings the remaining toolkit packages transitively

- **WHEN** the runtime dependency tree is resolved for `@mood481/starter-renderer`
- **THEN** `@mood481/starter-contracts` and `@mood481/starter-validator` SHALL be available transitively as `@mood481`-scoped packages from the same mapping.

#### Scenario: Local renderer absent

- **WHEN** `tools/scripts` is inspected
- **THEN** `render-template.mjs` and the local render-time extension machinery SHALL NOT be present
- **AND** no repository script SHALL import a deleted local renderer.

### Requirement: Toolkit consumption is initialized for install

The starter repository SHALL document the initialization required to consume (install) the `@mood481`-scoped toolkit packages — copying `.npmrc.example` to `.npmrc` and exporting `GITEA_TOKEN` for a registry read — as a prerequisite for setup, not only for publishing.

#### Scenario: Consumption setup is documented

- **WHEN** the setup and publishing documentation is read by a maintainer who has not configured Gitea access
- **THEN** it SHALL present the `@mood481` scope mapping (from `.npmrc.example`) and the exported `GITEA_TOKEN` as required before `pnpm install` will resolve the toolkit packages
- **AND** it SHALL make clear this initialization applies to installation/consumption as well as to publishing.

#### Scenario: Reference file is committed without a secret

- **WHEN** `.npmrc.example` is inspected
- **THEN** it SHALL carry the `@mood481` scope mapping and a `${GITEA_TOKEN}` reference
- **AND** the real `.npmrc` with a literal token SHALL remain git-ignored.

### Requirement: Toolchain baseline stays at the current pinned versions

The starter SHALL keep its current toolchain baseline and MUST NOT bump `engines`, `packageManager`, or the publish workflow to the toolkit's higher Node/pnpm versions as part of adopting the runtime. The canonical CLIs SHALL be verified to run under the pinned toolchain as an isolated local check.

#### Scenario: No toolchain bump is introduced

- **WHEN** `package.json` `engines`, `packageManager`, and `.github/workflows/publish.yml` are inspected after the change
- **THEN** they SHALL remain at the starter's current Node and pnpm baseline
- **AND** the change MUST NOT alter them to match the toolkit's higher versions.

#### Scenario: Canonical CLIs are feasible locally

- **WHEN** the installed canonical `starter-render` and `starter-validate` are executed under the pinned toolchain
- **THEN** they SHALL run to completion
- **AND** any engine-version mismatch SHALL be recorded for the operator rather than silently forcing an upgrade.

### Requirement: Exported binary delegates to the canonical renderer

The package SHALL export `starter-foundation-render` as a thin shim that invokes the canonical `starter-render` against the installed package's own starter root (`starter.yaml`, `template/`, `variants/`) and forwards its arguments unchanged; the package MUST NOT re-implement rendering logic.

#### Scenario: Shim forwards to canonical renderer

- **WHEN** the installed `starter-foundation-render` runs with render arguments
- **THEN** the shim SHALL invoke `starter-render` with the package starter root
- **AND** the rendered output SHALL match invoking `starter-render` directly with the equivalent arguments.

#### Scenario: Shim is shipped

- **WHEN** the package is packed
- **THEN** the shim entry point SHALL be included in the published `files`
- **AND** `package.json` `bin.starter-foundation-render` SHALL point at the shim, not a deleted local renderer.

### Requirement: Starter validation uses canonical validator and renderer

The starter repository SHALL validate its contract documents with the canonical validator and produce renders with the canonical renderer, retaining only checks that are specific to this starter, and SHALL perform a real dependency install in the rendered project (no shipped template lockfile).

#### Scenario: Contract documents validated canonically

- **WHEN** the repository validates `starter.yaml` and the `render.yaml` examples
- **THEN** it SHALL use the canonical validator `--type starter` and `--type render`
- **AND** it MUST NOT re-implement contract structural validation owned by the toolkit.

#### Scenario: Rendered template validation renders and installs canonically

- **WHEN** `pnpm validate:template` runs
- **THEN** it SHALL render the neutral template through the canonical renderer
- **AND** it SHALL scan the generated output for unresolved placeholders
- **AND** it SHALL run a real `pnpm install` in the rendered project, after which the generated project's own `pnpm-lock.yaml` exists
- **AND** it SHALL run generated `pnpm validate` and an Nx graph.

### Requirement: Generated project lockfile is produced by install

The neutral template SHALL NOT ship a committed `pnpm-lock.yaml`, and the starter SHALL NOT provide a regenerate-template-lockfile mechanism; the generated project's lockfile is created by installing its resolved dependencies.

#### Scenario: Template ships no lockfile

- **WHEN** `template/` is inspected
- **THEN** `template/pnpm-lock.yaml` SHALL NOT exist
- **AND** `tools/scripts/update-template-lockfile.mjs` and the `template:update-lock` script SHALL NOT exist.

#### Scenario: Install creates the generated lockfile

- **WHEN** a rendered generated project is installed
- **THEN** `pnpm install` SHALL create `pnpm-lock.yaml` in the generated project
- **AND** a later `pnpm install --frozen-lockfile` SHALL be supported from that install-produced lockfile.
