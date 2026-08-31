# Tasks: add-starter-foundation-render-cli-and-npx

## 1. Package distribution and npx entrypoint

- [x] 1.1 Update `package.json` `name` to `@mood481/starter-foundation-nx-pnpm`, `version` to `0.4.0`, `private: false`, `publishConfig: { "access": "public" }`, and move the existing `yaml` package to runtime `dependencies`; verify the manifest fields with a local Node assertion.
- [x] 1.2 Add `bin` entry `{ "starter-foundation-render": "tools/scripts/render-template.mjs" }` in `package.json`; verify the entry and local `pnpm starter:render` script both resolve the same renderer.
- [x] 1.3 Add `files` allowlist covering the renderer, validator, `starter.yaml`, `starter.render.yaml`, `template/**`, `variants/**/overlay/**`, `README.md`, `VALIDATION.md`, and `package.json`; verify with `npm pack --dry-run` that required runtime files are listed.
- [x] 1.4 Add `#!/usr/bin/env node` to `tools/scripts/render-template.mjs` and make it executable; verify the shebang and executable bit with local file inspection.
- [x] 1.5 Bump `starter.yaml` `version` to `0.4.0`, create root `starter.render.yaml` from `examples/render-input.neutral.yaml` with `output.path: dist/`, and regenerate the importer metadata with `pnpm install --lockfile-only`.
- [x] 1.6 Verify `pnpm-lock.yaml` records `yaml` under runtime dependencies and `pnpm install --frozen-lockfile` succeeds without changing unrelated files.

## 2. Renderer CLI extensions (`tools/scripts/render-template.mjs`)

- [x] 2.1 Extend `parseArgs()` to parse optional `--output <path>` via `readOptionValue`; fail with `Missing value for --output` only when the flag has no value.
- [x] 2.2 Extend `parseArgs()` to collect repeatable `--set <KEY=VALUE>` entries in order, validating `=` and non-empty keys while preserving the value verbatim after the first `=`.
- [x] 2.3 Add `parseSetArgs(sets)` returning `Map<string,string>` with key grammar `^[A-Z0-9_]+$`, rejection of any `__`, and last-wins duplicate handling; verify it with local Node assertions.
- [x] 2.4 Implement the explicit mode matrix: `--input` selects file mode, any inline flag without `--input` selects CLI mode, and no flags use `starter.render.yaml`; keep `outputPathOverride` as an internal validation override.
- [x] 2.5 Implement file-authoritative precedence: valid concurrent `--variant`/`--output`/`--set` flags emit one stderr warning and do not merge or override file values.
- [x] 2.6 Implement CLI mode using `dist/` when `--output` is absent, build placeholders from `--set` plus derived values, support declared variants generically, reuse the existing safety/rendering pipeline, and exclude local ignored directories from copied source content.
- [x] 2.7 Update `printHelp()` to list all flags, explain file versus CLI mode and the `dist/` fallback, document the local package script and published `npx @mood481/starter-foundation-nx-pnpm@0.4.0` form, and keep `renderTemplate({args})` compatible with `validate-template-render.mjs`.

## 3. Documentation and examples

- [x] 3.1 Update `README.md` Starter Rendering/Usage sections to document `--output`, repeatable `--set`, file-authoritative precedence, the `dist/` fallback, and both local and published renderer forms; use the exact requested MWS example.
- [x] 3.2 Update `VALIDATION.md` with CLI semantics, local OpenSpec command guidance, package validation, and published renderer checks; verify both existing example inputs remain valid file-mode inputs.
- [x] 3.3 Add the `0.4.0` CLI/`npx` entry to `CHANGELOG.md` and state the intentional file-mode variant-precedence change.

## 4. Validation

- [x] 4.1 Run `pnpm ospec validate "add-starter-foundation-render-cli-and-npx" --strict` and fix active-artifact errors; use `pnpm validate:spec` for the full local strict gate without appending another `--strict`.
- [x] 4.2 Verify `openspec/specs/dependency-automation/spec.md` has a non-placeholder English Purpose, the active delta is valid, `template/` is untouched, no new variant directory exists, and no alternate variant metadata or terminology was introduced.
- [x] 4.3 Verify `--help` and `-h` list all flags, describe both modes and `dist/`, exit 0 without writes, and match through `pnpm starter:render -- --help` and a clean consumer's local package binary.
- [x] 4.4 Verify legacy file mode with `pnpm starter:render -- --input examples/render-input.mws.yaml` and verify concurrent `--variant`, `--output`, and `--set` values warn and are ignored without changing the file-selected output.
- [x] 4.5 Verify CLI neutral mode with the complete `--set` example, no unresolved placeholders, and `dist/` fallback when `--output` is omitted.
- [x] 4.6 Verify CLI MWS mode with the exact requested example, compare content with a file-mode render in a separate clean directory, and confirm overlay files and placeholders match.
- [x] 4.7 Verify malformed `--set`, missing `--output` value, missing required placeholder, unknown variant, and non-empty output fail before writes; verify absent `--output` succeeds using `dist/`.
- [x] 4.8 Verify unresolved-placeholder failure, duplicate-key last-wins, and quoted `--set` values containing spaces, `@`, dots, and additional `=` characters.
- [x] 4.9 Run `pnpm validate:template` and `pnpm validate:template:mws`; validate direct CLI outputs with the generated project's local `pnpm install --frozen-lockfile`, `pnpm validate`, and `pnpm nx graph` where applicable, confirming local `node_modules` is not copied from the starter template.
- [x] 4.10 Verify package metadata, executable bit, shebang, and `npm pack --dry-run`; install the packed archive without devDependencies and verify the binary loads runtime `yaml` and prints help.
- [x] 4.11 Verify published-renderer parity with local `pnpm starter:render -- ...` using `npx --prefix <consumer-dir> --no-install starter-foundation-render ...` after installing the packed archive; this `npx` test is only for the renderer package, never for OpenSpec.
