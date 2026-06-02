# Validation

This document describes how to validate the foundation starter and its generated template.

## Starter Repository Validation

### OpenSpec Validation

Validate all OpenSpec artifacts:

```bash
pnpm ospec:validate
```

Validate the current change in strict mode:

```bash
pnpm ospec validate <change-id> --strict
```

### Constraint Validation

Confirm the following after implementation:

- No concrete variant directory exists (e.g., no `variants/mws/`).
- No variant-specific metadata file exists.
- No API, mobile, web, service, auth, eventing, storage, observability, or infrastructure module is added.
- Root `openspec/changes/` is not copied into `template/`.
- Generated-project OpenSpec content only uses `template/openspec/`.
- All references use `variant` and `overlay` terminology.
- No `flavour` metadata remains.

## Template Validation

### Structure Validation

- `starter.yaml` declares the expected contract fields.
- `template/` contains the expected directory structure.
- All importable OpenSpec specs exist under `template/openspec/specs/`.

### Rendered Output Validation

- The template can be copied to a clean directory.
- No unresolved double-underscore placeholders remain after rendering.
- `pnpm install` works in a generated copy.
- `pnpm validate` works in a generated copy.
- Nx can produce a project graph output.

### Running Template Validation

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm nx graph --file=tmp/nx-graph.json
```
