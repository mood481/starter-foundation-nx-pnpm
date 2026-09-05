# Proposal: add-starter-foundation-render-cli-and-npx

## Why

The current `starter-foundation-render` renderer (`tools/scripts/render-template.mjs` exposed as `pnpm starter:render`) requires a structured YAML/JSON input file for every invocation. This forces consumers and automation to create a temporary `starter.render.yaml` (or equivalent) even for straightforward renders, adding friction for simple usage, CI jobs, and `npx`-based workflows where inline parameters would be more ergonomic.

To lower that friction and align with the requested examples, the renderer needs an inline CLI mode (`--variant`/`--output`/`--set`) for simple invocations and automation, alongside a publishable `npx` entrypoint (`npx @mood481/starter-foundation-nx-pnpm@0.4.0 ...`) that exposes the same contract without requiring a local checkout.

## What Changes

- Extend the starter-owned renderer CLI (`tools/scripts/render-template.mjs`) to support:
  - `--output <path>` — optionally overrides/sets the generated project destination. When `--input` is used this argument is ignored (see input-authoritative rule). In CLI mode it overrides the `dist/` default when provided.
  - `--set <KEY=VALUE>` — repeatable `KEY=VALUE` assignment for placeholder values (`PROJECT_ID`, `PROJECT_NAME`, `PROJECT_SLUG`, `PROJECT_DESCRIPTION`, `DEFAULT_PACKAGE_SCOPE`, and any future required placeholders). Values after the first `=` are taken verbatim, supporting quoted values with spaces.
  - Updated `--help`/`-h` output documenting all options (`--input`, `--variant`, `--output`, `--set`, `--help`) and both invocation modes with examples.
- Define two mutually exclusive invocation modes with deterministic precedence:
  - **File mode** (`--input <filepath>` present): the YAML/JSON file is authoritative. `output.path`, `variant`, and `placeholders` come exclusively from the file; any concurrent `--variant`/`--output`/`--set` arguments are ignored and a warning is emitted. This preserves the existing structured-input contract and avoids partial-override ambiguity.
  - **CLI mode** (`--input` absent and at least one inline flag present): `output.path` comes from `--output` when provided, otherwise defaults to `dist/`; `variant` optionally comes from `--variant`, and placeholder values come from repeated `--set`. Missing required placeholders fail before writes; derived placeholders (`STARTER_ID`, `STARTER_VERSION`, `NODE_VERSION`, `PNPM_VERSION`) remain derived.
- Preserve the no-flag file-mode behaviour through the root `starter.render.yaml` default input, and add equivalent validation for CLI mode (malformed `--set`, missing required placeholders, non-empty output, unresolved placeholders).
- Add `npx` support for the same renderer:
  - Add a `bin` entry `starter-foundation-render` pointing to `tools/scripts/render-template.mjs` (with `#!/usr/bin/env node` shebang and executable permission).
  - Make the package publishable under the scoped name `@mood481/starter-foundation-nx-pnpm` (update `package.json` `name`, set `private: false`, add `publishConfig`, `files`, runtime `dependencies`, `engines`, and bump version to `0.4.0`), so both examples work:
    - `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --input ./render-input.mws.yaml`
    - `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --variant mws --output ./my-project --set PROJECT_ID=my-project ...`
  - Keep `pnpm starter:render -- ...` as the local-workspace entrypoint with identical argument semantics.
- Update documentation (`README.md`, `VALIDATION.md`, `CHANGELOG.md`) and starter render examples to illustrate both modes and the `npx` form.
- Add the root `starter.render.yaml` default input, based on `examples/render-input.neutral.yaml`, with its default output under `dist/`.
- No changes to `template/` generated-project files or to the neutral template baseline; no new concrete variant is introduced.

## Capabilities

### New Capabilities
- None — this change extends an existing renderer contract rather than introducing an independent capability.

### Modified Capabilities
- `starter-template-renderer`: extend the renderer contract with `--output` and `--set` CLI arguments, file-authoritative precedence when `--input` is present, updated `--help`, and `npx` executable support.

## Impact

- **Affects**: starter repository only. Generated `template/` files are not changed (rendered output will reflect CLI-provided values at generation time, but the template source is untouched).
- **Spec impact**: the active delta at `openspec/changes/add-starter-foundation-render-cli-and-npx/specs/starter-template-renderer/spec.md`; it updates the canonical renderer spec when the change is archived.
- **Starter-repository files**:
  - `tools/scripts/render-template.mjs` — argument parsing, input-authoritative precedence, CLI-mode placeholder construction, help text.
  - `package.json` — `name` → `@mood481/starter-foundation-nx-pnpm`, `version` → `0.4.0`, `private: false`, `bin: { "starter-foundation-render": "tools/scripts/render-template.mjs" }`, `files`, `publishConfig`, and runtime `dependencies`.
  - `starter.yaml` — bump `version` to `0.4.0` to match package.
  - `README.md` / `VALIDATION.md` — document `--output`, `--set`, both modes, and `npx` invocation.
  - `starter.render.yaml` — default neutral render input based on `examples/render-input.neutral.yaml`.
  - `examples/` — retain existing YAML examples.
  - `CHANGELOG.md` — add the `0.4.0` entry.
  - `pnpm-lock.yaml` — reflect `yaml` as a runtime dependency.
  - `openspec/specs/dependency-automation/spec.md` — replace the pre-existing placeholder Purpose required by strict validation; no dependency-automation behaviour changes.
- **Generated-template files**: none under `template/`.
- **Tooling / dependencies**: no new package is introduced; existing `yaml` is moved to runtime `dependencies` because the published binary imports it. OpenSpec remains a local development dependency.
- **Validation behaviour**: strict OpenSpec validation must pass; neutral and MWS render paths must continue to pass; new CLI-mode renders (neutral and `mws` with `--set`) must produce clean output with no unresolved placeholders; `npx` binary must be invocable and its help must advertise the new flags.

## Out of Scope

- Introducing a new concrete variant or overlay.
- Changing placeholder names, placeholder style, or derived-placeholder logic.
- Adding API, service, auth, storage, observability, or module-starter behaviour.
- Migrating existing generated repositories.
- Adding interactive prompts or `--set` persistence to a file; `--set` values are ephemeral CLI inputs only.

## Risks

- **Mode confusion**: supporting both file and CLI inputs can cause ambiguity about precedence. Mitigated by making `--input` strictly authoritative and warning when other flags are ignored, matching the requirement that file inputs cannot be overridden by CLI.
- **Placeholder injection**: free-form `--set` values could include shell-sensitive content. The renderer treats values verbatim after the first `=` and applies the same missing-required and unresolved-placeholder checks as file mode.
- **Publishability**: changing `private`/`name`/`bin` impacts npm publishing and `npx` resolution. A missing `files` allowlist or incorrect `bin` path would break `npx` invocations; the change must verify the binary is executable and resolves correctly from a clean install.
- **Output safety**: CLI `--output` paths are resolved relative to `process.cwd()` (vs file-mode relative to input file). Both modes must still refuse non-empty existing directories and refuse unsafe paths.

## Open Questions

None — the CLI syntax (`--output`, `--set KEY=VALUE` repeatable) and `npx` form are fixed by the request.
