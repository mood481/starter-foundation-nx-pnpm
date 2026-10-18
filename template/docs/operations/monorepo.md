# Monorepo operations

## Overview

This project uses a monorepo structure managed by pnpm workspaces and Nx orchestration.

## Directory layout

| Directory | Purpose |
| --- | --- |
| `apps/` | Application projects (frontends, CLIs) |
| `services/` | Backend services, APIs, workers |
| `packages/` | Shared libraries and reusable packages |
| `tools/` | Project-local scripts, generators, automation |
| `docs/` | Project documentation, including optional materialized development standards |

## Package manager

This project uses **pnpm** as the package manager.

- Workspace packages are declared in `pnpm-workspace.yaml`.
- Not every workspace directory requires a `package.json`.
- Build output directories (`dist/`, `build/`) are excluded from workspace matching.
- The root `.npmrc` maps the private `@mood481` scope to the Mood Gitea registry.
- A `GITEA_TOKEN` with package read access is required while private Mood packages are installed.

## Workspace orchestration

This project uses **Nx** for task orchestration.

### Target defaults

Common targets configured at the workspace level:

| Target | Cacheable | Depends On |
| --- | --- | --- |
| `lint` | Yes | - |
| `typecheck` | Yes | - |
| `test` | Yes | - |
| `build` | Yes | `^build` |

### Project registration

Each project should include a `project.json` file. Projects must declare:

- at least one `type:*` tag, such as `type:app`, `type:service` or `type:lib`;
- at least one `lang:*` tag, such as `lang:typescript`, `lang:python` or `lang:go`.

### Running tasks

```bash
pnpm nx run <project>:<target>
pnpm nx run-many --target=<target> --all
pnpm nx affected --target=<target>
```

### Project graph

```bash
pnpm nx graph
```

## Multi-language support

The workspace supports TypeScript, Python, Go and future approved runtimes through
Nx project registration and command-based targets where appropriate.

Shared development standards are optional project context. The foundation provides
the `dev-standards` tool but does not preselect rules or guides for languages or
capabilities that the generated workspace may never use.

The foundation is intentionally independent from any specific SDD provider.
