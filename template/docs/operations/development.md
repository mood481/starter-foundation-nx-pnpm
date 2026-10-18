# Development operations

This document covers only the bootstrap behavior guaranteed by the foundation.
Project-specific development policy belongs to the generated project and may be
materialized from `@mood481/dev-standards`.

## Prerequisites

- Node.js >= __NODE_VERSION__
- pnpm >= __PNPM_VERSION__
- `GITEA_TOKEN` with package read access while private `@mood481` packages are installed.

## Setup

```bash
pnpm install
pnpm validate
```

The generated workspace starts with Nx and pnpm orchestration but no applications,
services or domain packages.

## Development standards

`@mood481/dev-standards` is available as a development dependency. The foundation
does not choose or materialize a rules/guides profile.

Inspect the catalog and install only the context appropriate for the project:

```bash
pnpm exec dev-standards list
pnpm exec dev-standards install <ids...>
```

After a project has materialized standards, manage them directly:

```bash
pnpm exec dev-standards check
pnpm exec dev-standards update
```

The resulting `docs/manifest.json`, managed standards and any project-owned
`docs/operations/` documents belong to the generated project, not to the
foundation starter.
