# Monorepo Guide

## Overview

This project uses a monorepo structure managed by pnpm workspaces and Nx orchestration.

## Directory Layout

| Directory    | Purpose                                        |
| ------------ | ---------------------------------------------- |
| `apps/`      | Application projects (frontends, CLIs)         |
| `services/`  | Backend services, APIs, workers                |
| `packages/`  | Shared libraries and reusable packages         |
| `tools/`     | Project-local scripts, generators, automation  |
| `docs/`      | Project documentation                          |

## Package Manager

This project uses **pnpm** as the package manager.

- Workspace packages are declared in `pnpm-workspace.yaml`.
- Not every workspace directory requires a `package.json`.
- Build output directories (`dist/`, `build/`) are excluded from workspace matching.

## Workspace Orchestration

This project uses **Nx** for task orchestration.

### Target Defaults

Common targets configured at the workspace level:

| Target       | Cacheable | Depends On  |
| ------------ | --------- | ----------- |
| `lint`       | Yes       | -           |
| `typecheck`  | Yes       | -           |
| `test`       | Yes       | -           |
| `build`      | Yes       | `^build`    |

### Project Registration

Each project should include a `project.json` file. Projects must declare:

- At least one `type:*` tag (e.g., `type:app`, `type:service`, `type:lib`)
- At least one `lang:*` tag (e.g., `lang:typescript`, `lang:python`, `lang:go`)

### Running Tasks

```bash
pnpm nx run <project>:<target>
pnpm nx run-many --target=<target> --all
pnpm nx affected --target=<target>
```

### Project Graph

```bash
pnpm nx graph
```

## Multi-Language Support

The workspace supports TypeScript, Python, Go, and future approved runtimes. Non-JavaScript projects use command-based Nx targets.

The foundation is intentionally independent from any specific SDD provider.
Optional development workflows are selected separately and must not be assumed
by the base workspace.
