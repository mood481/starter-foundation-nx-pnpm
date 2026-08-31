# Design: add-starter-foundation-render-cli-and-npx

## Context

The starter currently owns a generic renderer at `tools/scripts/render-template.mjs`. It is exposed locally as `pnpm starter:render -- --input <path> [--variant <id>]` and reads `starter.yaml` for template path, overlays, and required placeholders. Structured YAML/JSON input is the file-mode way to provide `output.path` and `placeholders`, with a root `starter.render.yaml` default input. Inline CLI mode provides those values without a render input file.

This works for checked-in configuration but creates friction for ad-hoc usage, CI automation, and `npx`-based workflows where creating a temporary YAML file is unnecessary overhead. The request defines a concrete ergonomic target:

```bash
starter-foundation-render \
  --variant mws \
  --output ../tmp/rendered-mws-example \
  --set PROJECT_ID=example-mws-foundation \
  --set "PROJECT_NAME=Example MWS Foundation" \
  --set PROJECT_SLUG=example-mws-foundation \
  --set "PROJECT_DESCRIPTION=Example MWS-compatible foundation repository." \
  --set DEFAULT_PACKAGE_SCOPE=@example-mws
```

and `npx @mood481/starter-foundation-nx-pnpm@0.4.0 --input ./render-input.mws.yaml` or the same `npx` with `--variant`/`--output`/`--set`. The renderer must support both file mode and inline CLI mode, keep file mode authoritative when `--input` is present, default CLI output to `dist/` when `--output` is absent, update `--help`, and become `npx`-invocable without affecting `template/` or introducing a new variant.

Stakeholders: starter maintainers, consumers rendering via local checkout, and consumers rendering via `npx` without a checkout. Constraints include preserving existing file-mode semantics, derived placeholders, overlay order, unresolved-placeholder failure, and output safety.

## Goals / Non-Goals

**Goals:**

- Add CLI inline mode to the owned renderer: `--output <path>` and repeatable `--set <KEY=VALUE>` (with `KEY` verbatim, value after first `=`).
- Keep `--input <filepath>` authoritative: when present, ignore concurrent `--variant`/`--output`/`--set` with a stderr warning and do not merge.
- Update `--help`/`-h` to document both modes and all five flags with examples matching the request.
- Make the renderer `npx`-invocable as `npx @mood481/starter-foundation-nx-pnpm@0.4.0 ...` with identical semantics to `pnpm starter:render -- ...`, via a `bin` entry `starter-foundation-render` (shebang + executable).
- Publishability: scoped name `@mood481/starter-foundation-nx-pnpm`, `version 0.4.0`, `private: false`, `publishConfig`, and `files` allowlist.
- Preserve generic variant handling, derived placeholders, overlay application, and safety checks for both modes.
- Update docs (`README.md`, `VALIDATION.md`) to illustrate CLI and `npx` usage.

**Non-Goals:**

- New variant, overlay, or `template/` content; changes to placeholder names/style.
- Interactive prompts, persistent `--set` storage, or config-file generation from CLI flags.
- Per-flag placeholder schema validation beyond missing-required and unresolved checks.
- Changing YAML/JSON file schema or adding new placeholder derivation logic.
- Migrating existing generated repositories.

## Decisions

### Decision: Two modes with file-authoritative precedence

Add a top-level mode branch inside `renderTemplate()`:

```txt
parseArgs() -> { input, variant, output, sets, help }
if help -> printHelp() and return
if input present:
  warn if variant/output/sets also present (stderr)
  use file path exclusively: readStructuredFile(input)
  output = resolveOutputPath(fileDir, file.output.path)
  placeholders = file.placeholders
  variant = file.variant (CLI variant ignored)
else if variant/output/sets present:
  // CLI mode
  parse --set list into placeholders
  output = output ? resolve(output) relative to cwd : resolve(cwd, 'dist')
  variant = parsed variant
else:
  // Legacy default file mode
  readStructuredFile(resolve(cwd, 'starter.render.yaml'))
```

Rationale: File mode is deterministic and cannot be partially overridden by CLI flags. Merging would be surprising and conflict with the previous variant-conflict contract. Ignoring with a warning is observable and preserves the file-provided values. The no-flag path remains the existing default file mode, while any inline flag selects CLI mode.

### Decision: Minimal extension to `parseArgs()`

Extend the existing `parseArgs` function (not a new parser library) to handle:

- `--output <path>`: readOptionValue, store `parsed.output`.
- `--set <KEY=VALUE>`: readOptionValue, validate `KEY=VALUE`, and push the original entry into `parsed.sets[]`. Support `--set=KEY=VALUE`? Out of scope: only space-separated `--set VALUE` is supported. `parseSetArgs()` preserves entry order and applies last-wins when building the placeholder map.
- `--help` stays boolean.

Keep unknown-option throw, update `printHelp()` to include new section:

```txt
Usage: starter-foundation-render [--input <path>] [--variant <id>] [--output <path>] [--set <KEY=VALUE> ...] [--help]
  or: pnpm starter:render -- [...]
  or: npx @mood481/starter-foundation-nx-pnpm@0.4.0 [...]
...
Examples:
  starter-foundation-render --input ./render-input.mws.yaml
  starter-foundation-render --variant mws --output ./my-project --set PROJECT_ID=my-project --set "PROJECT_NAME=My Project" ...
```

Rationale: Keeps change small and testable; reuses existing `readOptionValue` and error messages. Not introducing `yargs`/`commander` avoids new dependencies.

### Decision: Placeholder construction for CLI mode

Add helper `parseSetArgs(sets)` → `Map`:

- Split each entry at first `=`.
- Key: `entry.slice(0, eq)` trimmed. Validate `^[A-Z0-9_]+$` and reject any key containing `__`.
- Value: `entry.slice(eq+1)` verbatim (no trim, allows leading spaces? keep verbatim for quotes already stripped by shell).
- Convert the map with `Object.fromEntries()` for the existing `buildPlaceholderMap()` input shape, so CLI mode benefits from the same derived-placeholder and required-placeholder logic.

Rationale: Resolves `PROJECT_ID`, `PROJECT_NAME`, and future required placeholders exactly as file mode. Derived placeholders remain authoritative and overwrite any same-named CLI assignments.

### Decision: npx support via `bin` + shebang

- Add to `package.json`:
  ```json
  {
    "name": "@mood481/starter-foundation-nx-pnpm",
    "version": "0.4.0",
    "private": false,
    "bin": { "starter-foundation-render": "tools/scripts/render-template.mjs" },
    "files": ["tools/scripts/render-template.mjs", "tools/scripts/validate-template-render.mjs", "template/**", "variants/**/overlay/**", "starter.yaml", "starter.render.yaml", "README.md", "VALIDATION.md", "package.json"],
    "publishConfig": { "access": "public" }
  }
  ```
- Prepend `#!/usr/bin/env node` to `tools/scripts/render-template.mjs` and `chmod +x`.
- Keep `pnpm starter:render` as alias (`node tools/scripts/render-template.mjs`) so local workflow unchanged; `npx` resolves the same file via `bin`.

Rationale: `npx` requires a scoped publishable name and a `bin` entry. Using the existing ESM file avoids duplication. `files` allowlist ensures `starter.yaml`, the default render input, `template/`, and overlays are included. The renderer restores a packaged `.gitignore` when npm extracts it as `.npmignore`, preserving generated-project parity. The existing `yaml` package is a runtime dependency of the published binary. Alternative — separate CLI package — would diverge distribution.

### Decision: Keep renderer generic

No variant-specific branching in placeholder logic. Required placeholders are still computed as `starter.template.placeholders.required` + `selectedVariant.placeholders.required`. Both file and CLI modes share the same `validateVariant`, `buildPlaceholderMap`, `ensureOutputWritable`, `cp`, `renderDirectory`, `findUnresolvedPlaceholders` path. Variant overlay application stays after `template/` copy, before rendering.

Rationale: Preserves variant-agnostic invariant from `starter-template-renderer` spec.

## Constraints

- MUST NOT add or modify any file under `template/`; this is a neutral renderer change.
- MUST NOT introduce a new concrete variant or overlay directory.
- MUST NOT change placeholder delimiters `__...__`, placeholder style, or derived-placeholder derivation (`STARTER_ID`, `STARTER_VERSION`, `NODE_VERSION`, `PNPM_VERSION`).
- MUST NOT require a YAML/JSON render input file when CLI mode is used; `starter.yaml` remains required starter metadata.
- MUST ignore (with warning) `--variant`/`--output`/`--set` when `--input` is present; MUST NOT merge nor fail due to mismatch.
- MUST fail before writes on: unknown variant, malformed `--set`, missing required placeholders, non-empty output directory; `--output` remains optional and defaults to the existing output path when not provided.
- MUST fail after rendering on unresolved `__...__` placeholders.
- MUST keep `variant`/`overlay` terminology and MUST NOT introduce alternate variant metadata.
- MUST NOT add API/service/auth/storage/infra module starters.
- MUST NOT copy root `openspec/changes/` into generated output (existing check).
- `tools/scripts/render-template.mjs` MUST remain ESM and MUST NOT add a new package dependency; the existing `yaml` package MUST be available at runtime.

## Alternatives Considered

**Merge CLI flags into file input when `--input` is present (override):**

Rejected — violates the explicit requirement that file input cannot be overwritten by CLI; would also re-introduce `variant conflict` ambiguity and make file renders non-deterministic.

**Fail when `--input` is combined with any CLI flag:**

Rejected — too strict for scripting where a wrapper might always pass `--output` even when `--input` is set; warning+ignore is more forgiving and matches “se ignorarían”.

**Use a command-line library (`yargs`/`commander`):**

Rejected — adds dependency, changes error-message surface, and is unnecessary for five flags. Hand-rolled `parseArgs` is already tested and keeps the bundle small.

**Publish under unscoped name `starter-foundation-nx-pnpm`:**

Rejected — request explicitly uses `@mood481/starter-foundation-nx-pnpm`; scoped name also reduces collision risk and matches `publishConfig.access=public`.

**Create a separate `bin/starter-foundation-render` wrapper instead of shebang on `tools/scripts/render-template.mjs`:**

Considered. Wrapper adds indirection but may be cleaner for file publishing. Either is acceptable; we choose direct shebang on the existing file to minimize new files (wrapper would be trivial `#!/usr/bin/env node\nimport '../tools/scripts/render-template.mjs'`). Decision can be adjusted during implementation without spec impact.

## Risks / Trade-offs

- **Mode confusion / docs mismatch** → Mitigation: `printHelp` and `README.md`/`VALIDATION.md` both show file vs CLI mode side-by-side with copy-pasteable examples from the request.
- **Publishing breakage (`npx` 404 or missing `template/` at runtime)** → Mitigation: validate `package.json` `name`/`version`/`private`/`files`/`bin` and run `npm pack --dry-run` in validation; test `npx` resolution from a temp install (or `node` + `bin` path) and `chmod +x` check.
- **Shell quoting pitfalls for `--set "KEY=VALUE WITH SPACES"`** → Mitigation: document quoted form; parser keeps value verbatim after first `=`; tests cover quoted and unquoted cases.
- **Output path relativity difference (file-relative vs cwd-relative)** → Mitigation: `resolveOutputPath` for file mode vs `resolve(process.cwd(), output)` for CLI mode; CLI defaults to `dist/`. Both are validated by `ensureOutputWritable` (non-empty guard). Document clearly.
- **Derived placeholders shadow user-provided `NODE_VERSION` etc. via `--set`** → Accept trade-off: keep existing derived-over-user precedence so starter metadata remains authoritative; note in docs that setting derived keys via `--set` has no effect.
- **Ignoring flags in file mode may hide user errors** → Mitigation: emit warning to stderr (`Ignored --output/--set/--variant because --input is present`) so automation notices.
- **Help output drift** → Mitigation: add test that `--help` output contains `--input`, `--variant`, `--output`, `--set`, `--help` and both `npx` examples.

## Repository Structure

Effectively changed/affected starter-repository paths:

```txt
 package.json                     # name -> @mood481/starter-foundation-nx-pnpm, 0.4.0, private false, bin, files, publishConfig
 pnpm-lock.yaml                   # yaml is a runtime dependency
 starter.yaml                     # version -> 0.4.0
 starter.render.yaml              # default neutral file-mode input with output under dist/
 tools/scripts/render-template.mjs # parseArgs extended, mode selection, warning, CLI placeholders, help, shebang
 README.md                        # document --output/--set, file vs CLI mode, npx examples
 VALIDATION.md                    # document new invocation forms and local commands
 CHANGELOG.md                     # 0.4.0 entry
 openspec/specs/dependency-automation/spec.md # replace strict-validation Purpose placeholder
 openspec/changes/.../specs/...   # active renderer delta, applied when archived
```

Unchanged:

```txt
template/**                      # no modifications
variants/mws/overlay/**         # no modifications
 examples/render-input.*.yaml     # retained as explicit examples
```

## Rendering Model

```txt
pnpm starter:render -- --input ./a.yaml [--variant X --output Y --set K=V ...]
      │ input present? ──yes──> file mode
      │                         warn+ignore extra CLI flags
      │                         read fileDir/a.yaml
      │                         output = resolve(fileDir, file.output.path)
      │                         variant = file.variant
      │                         placeholders = file.placeholders
      ├─inline flags──> CLI mode
      │                  output = --output ? resolve(cwd, --output) : resolve(cwd, 'dist')
      │                  variant = --variant?
      │                  placeholders = Map from repeated --set
      │                                │
      │                                ▼
      │                       load starter.yaml + root package.json
      │                                │
      │                                ▼
      │                       buildPlaceholderMap(
      │                          userPlaceholders ∪ derived(NODE_VERSION, PNPM_VERSION, STARTER_ID, STARTER_VERSION)
      │                       )
      │                       validate required (base + variant) -> fail before writes if missing
      │                                │
      │                                ▼
      │                       ensureOutputWritable (fail if exists non-empty)
      │                       cp template/ -> output, excluding local ignored directories
      │                       cp overlay if variant selected -> output (full-file replace)
      │                       renderDirectory (replace __KEY__ -> value)
      │                       scan unresolved __.*__ -> fail if any
      └─no flags──> legacy file mode using starter.render.yaml
```

Both `pnpm starter:render --` and `npx @mood481/starter-foundation-nx-pnpm@0.4.0` resolve to the same `tools/scripts/render-template.mjs` logic (local package script vs published `bin` entry).

## Validation Strategy

- OpenSpec: `pnpm validate:spec` is the canonical all-artifacts strict gate; it expands to the local `pnpm ospec:validate` script. Validate only this change with `pnpm ospec validate "add-starter-foundation-render-cli-and-npx" --strict`. If a script is unavailable, use `pnpm exec openspec ...` so the executable still comes from local `node_modules`; never use `npx openspec`.
- Renderer unit-like checks (via `node tools/scripts/render-template.mjs` or its exported `parseArgs`/`renderTemplate`):
  - `--help` prints all flags and examples, exit 0.
  - File mode: `pnpm starter:render -- --input examples/render-input.mws.yaml` still works; with extra `--output`/`--set`/`--variant different` warns and ignores.
  - CLI mode neutral: a complete `--set` invocation succeeds and produces clean output; the same invocation without `--output` uses `dist/`.
  - CLI mode mws: `--variant mws --output /tmp/... --set PROJECT_ID=...` plus base placeholders succeeds; missing `PROJECT_ID` fails before writes; without `--output` it falls back to `dist/`.
  - Malformed `--set` (no `=`, empty key, `__KEY__`) fails.
  - `--output` with no value fails, but missing `--output` does not fail and uses default.
  - Non-empty output fails in both modes.
  - Unresolved placeholder scanner fails when `__UNRESOLVED__` injected.
  - `validate-template-render` backing the same renderer stays green (`pnpm validate:template`, `pnpm validate:template:mws`).
- Npx checks:
  - `package.json` `bin`, `name`, `version`, `private`, `files`, `publishConfig` assertions.
  - Executable bit (`ls -l tools/scripts/render-template.mjs` shows `x`).
  - Shebang line present.
  - Help via the direct bin path and a clean consumer install (`npx --prefix <consumer-dir> --no-install starter-foundation-render --help`) matches.
- Docs: verify `README.md`/`VALIDATION.md` contain the requested example invocations verbatim and use the local package scripts for OpenSpec.
- Terminology and constraint checks: no `template/` diff, no new variant dir, no alternate variant metadata or terminology in the change, `openspec/changes/` not copied.

## Migration Plan

No migration for existing generated projects.

For starter repository:

- Bump `package.json` `version` and `starter.yaml` `version` to `0.4.0` (breaking if considered SemVer — new feature; no existing consumer breakage because `private` was true and file mode stays compatible).
- Change `package.json` `name` to scoped `@mood481/starter-foundation-nx-pnpm` (requires `publishConfig.access=public`; local `pnpm install` still works — no repo-root import paths use `name`).
- Existing callers using `pnpm starter:render -- --input <path>` are unaffected (extra flags now warn+ignore rather than error on variant mismatch, documented as authoritative).
- Callers previously relying on `variant conflict fails` when mixing `--input variant A` + `--variant B` will now see a warning and file-mode success instead of failure; this is the intended new contract and must be communicated in `CHANGELOG.md`.
- Rollback: revert `package.json` name/private/bin/version and `tools/scripts/render-template.mjs` to previous tag; no data migration.
