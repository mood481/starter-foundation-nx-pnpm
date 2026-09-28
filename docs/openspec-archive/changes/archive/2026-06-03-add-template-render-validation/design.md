## Context

The starter repository currently validates OpenSpec artifacts through `pnpm ospec:validate`, and `starter.yaml` declares generated-project validation expectations.

Those expectations are not yet automated from the starter repository as a single rendered-template check. Manual validation previously proved the flow works, but future changes need a repeatable command that renders the neutral template into a temporary generated project and runs the generated-project checks.

## Goals / Non-Goals

Goals:

- Add a starter-repository command for end-to-end generated-template validation.
- Render the neutral template into a temporary directory using representative placeholder values.
- Fail if unresolved double-underscore placeholders remain in the rendered output.
- Run generated-project validation commands in the rendered output.
- Keep the implementation independent from a future production renderer.

Non-goals:

- Do not implement the real project generator or renderer.
- Do not introduce variants, overlays, modules, or application code.
- Do not change files under `template/` except for the explicit Nx telemetry and cloud defaults in `template/nx.json` and matching importable specs.
- Do not add external runtime dependencies for the validation script.

## Decisions

### Decision: Add a Node validation script

Add `tools/scripts/validate-template-render.mjs` at the starter repository root.

The script should use built-in Node modules only. It should copy `template/` to a temporary directory, replace known neutral placeholders, scan for unresolved placeholders, run generated-project commands, and clean up the temporary directory by default.

### Decision: Add `validate:template`

Add a root package script named `validate:template` that runs the Node validation script.

This keeps rendered-template validation directly runnable without hiding it behind OpenSpec-specific script names.

### Decision: Make root `validate` comprehensive

Update root `validate` to run `pnpm validate:spec && pnpm validate:template`.

Full validation is the default repository validation path.

### Decision: Add `validate:spec` for the simple path

Add root `validate:spec` as the OpenSpec-only validation script. It should run `pnpm ospec:validate`.

Maintainers can use `pnpm validate:spec` when they want the faster spec/change validation without rendering and installing the generated template.

### Decision: Use representative neutral placeholder values

The validation script should render placeholders from the current neutral contract, including project identity, Node version, pnpm version, starter id, and starter version.

The script validates that the neutral template is internally consistent. It does not validate every future variant or renderer implementation.

### Decision: Disable Nx telemetry and cloud prompts in generated projects

Set `analytics: false` and `neverConnectToCloud: true` in `template/nx.json` so generated projects do not prompt maintainers to share usage data and do not attempt to connect to Nx Cloud by default.

## Constraints

- Do not add concrete variant or overlay support in this change.
- Do not copy root `openspec/changes/` into generated output.
- Do not leave unresolved placeholders in the rendered output.
- Do not require global OpenSpec, global pnpm, or global Nx installations beyond the project-local commands already used by pnpm.
- Do not introduce dependencies solely for parsing or rendering.
- Do not enable Nx Cloud or Nx analytics in generated projects by default.

## Repository Structure

Expected starter-repository additions:

```txt
tools/
└── scripts/
    └── validate-template-render.mjs
```

The generated-template changes are limited to `template/nx.json` and the matching importable Nx workspace spec.

## Rendering Model

The validation render is intentionally simple:

- copy `template/` to a temporary directory;
- replace the known double-underscore placeholders with deterministic neutral values;
- scan all non-dependency generated files for unresolved `__[A-Z0-9_]+__` tokens;
- fail before installing dependencies if unresolved placeholders remain.

The script is a validation harness, not a renderer contract implementation.

## Alternatives Considered

### Shell script

Rejected because a Node script is more portable across local environments and can copy, render, scan, spawn commands, and clean up without extra dependencies.

### Only document the manual commands

Rejected because manual validation is easy to skip and does not protect future changes from regressions.

### Do not include template validation in root `validate`

Rejected as the default proposal because root `validate` should represent the complete starter validation. Maintainers can still run `pnpm validate:spec` for the faster OpenSpec-only path.

## Risks / Trade-offs

- Full validation is slower because it installs dependencies in a rendered temporary project -> keep `pnpm validate:spec` as the fast OpenSpec-only command.
- Temporary directory cleanup can make debugging harder -> allow an implementation option such as an environment variable to keep the rendered directory when needed.
- The validation render can drift from a future production renderer -> keep the script limited to current neutral placeholders and update it when the renderer contract changes.

## Validation Strategy

- Run `pnpm validate:spec`.
- Run `pnpm validate:template`.
- Run `pnpm validate`.
- Confirm the scanner failure path by intentionally injecting an unresolved placeholder after the validation render.
- Confirm no generated-template files or variant directories are introduced by the implementation.
