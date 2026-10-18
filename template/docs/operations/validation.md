# Validation operations

## Overview

This document describes validation for the generated project.

## Full validation

```bash
pnpm validate
```

The baseline validation runs linting, type checking and tests across the workspace.

## Individual checks

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Development standards

The foundation includes `@mood481/dev-standards` as a tool but installs no rules or
guides by default. Therefore standards validation is not part of baseline
`pnpm validate`.

Once the project has materialized standards, validate them directly:

```bash
pnpm exec dev-standards check
```

Updating standards is also explicit:

```bash
pnpm exec dev-standards update
```

## Dependency installation

The first installation creates the generated project's lockfile:

```bash
pnpm install
```

Subsequent reproducibility checks can use:

```bash
pnpm install --frozen-lockfile
```

Private `@mood481` dependencies require `GITEA_TOKEN` with package read access.

## Nx project graph

Nx should produce a valid project graph:

```bash
pnpm nx graph --file=tmp/nx-graph.json
```

## Placeholder validation

The foundation renderer must leave no unresolved double-underscore placeholders in
generated files.

## Neutral boundary

The neutral foundation must not preselect:

- concrete application/service modules;
- a concrete SDD provider or SDD-specific configuration;
- a fixed set of development-standard rules or guides.

A project may adopt these capabilities explicitly after generation.
