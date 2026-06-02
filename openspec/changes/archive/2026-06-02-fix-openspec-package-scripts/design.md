## Context

The root `package.json` exposes maintainer-facing OpenSpec scripts for this starter repository.

The current scripts use the `os:` prefix and include helpers that are not useful as standalone commands. `os:status` requires additional context, `os:validate:change` is hardcoded to `add-foundation-template-contract`, and these commands are not referenced elsewhere in the active project. The repository uses `@fission-ai/openspec` v1.4.0, so scripts must use command forms that are valid for that CLI version.

## Goals / Non-Goals

Goals:

- Rename the raw local OpenSpec wrapper from `openspec` to `ospec`.
- Rename useful standalone OpenSpec helpers from `os:*` to `ospec:*`.
- Keep scripts small and directly mapped to OpenSpec v1.4.0 commands that work without required extra arguments.
- Use the `ospec` wrapper for context-dependent commands such as status, single-change validation, archive, sync, or update.
- Keep `validate` as the repository-level validation entry point.

Non-goals:

- Do not change generated-template scripts under `template/`.
- Do not change the OpenSpec dependency version.
- Do not add custom wrapper scripts or new tooling.

## Decisions

### Decision: Use `ospec` as the raw CLI wrapper

The raw wrapper should be named `ospec` so every OpenSpec-related pnpm entry point uses the same naming convention and the project-local OpenSpec version is used.

Examples:

```bash
pnpm ospec status --change fix-openspec-package-scripts
pnpm ospec validate fix-openspec-package-scripts --strict
```

### Decision: Keep only standalone `ospec:*` helpers

`ospec` is explicit enough to distinguish OpenSpec helper scripts from operating-system abbreviations.

Dedicated helpers should only exist when they run successfully without extra arguments and are likely to be used repeatedly:

- `ospec:list`
- `ospec:list:specs`
- `ospec:validate`
- `ospec:validate:json`

### Decision: Do not keep single-change/status/update helpers

`status`, single-change validation, archive, sync, and update workflows are context-dependent. A wrapper helper is only justified if it adds behavior beyond forwarding arguments, such as validating, syncing, and archiving a named change in one command. This change does not add such behavior.

## Constraints

- Do not keep `os:*` OpenSpec helper scripts in root `package.json`.
- Do not keep a separate root `openspec` script after introducing `ospec`.
- Do not hardcode an active or archived change id in root package scripts.
- Do not add a dedicated helper for commands that require a change id or additional context unless the helper adds behavior beyond forwarding arguments.
- Do not affect generated-template files under `template/`.
- Do not introduce concrete variants.

## Alternatives Considered

### Keep `os:*`

Rejected because the prefix is ambiguous and the user explicitly identified it as confusing.

### Add a custom Node wrapper

Rejected because the change should stay minimal and OpenSpec v1.4.0 already supports validating a provided change id.

### Keep `ospec:validate:change`

Rejected for this reduced change because `pnpm ospec validate <change-id> --strict` is explicit, uses the local CLI, and avoids maintaining a script that only forwards arguments.

## Risks / Trade-offs

- Existing muscle memory or documentation may reference `os:*` scripts -> update root starter documentation if references exist.
- Commands such as status or change validation become slightly longer -> use the `pnpm ospec <args>` wrapper examples instead of dedicated scripts.

## Validation Strategy

- Run `pnpm ospec:list`.
- Run `pnpm ospec:list:specs`.
- Run `pnpm ospec:validate`.
- Run `pnpm ospec:validate:json`.
- Run `pnpm ospec status --change fix-openspec-package-scripts`.
- Run `pnpm ospec validate fix-openspec-package-scripts --strict`.
- Run `pnpm validate`.
