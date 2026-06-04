# __PROJECT_NAME__

__PROJECT_DESCRIPTION__

## Prerequisites

- Node.js >= __NODE_VERSION__
- pnpm >= __PNPM_VERSION__

## Getting Started

```bash
pnpm install
pnpm validate
```

## Workspace Structure

```txt
.
├── apps/              # Application projects
├── services/          # Backend services, APIs, workers
├── packages/          # Shared libraries and reusable packages
├── tools/             # Scripts, generators, automation
├── docs/              # Project documentation
└── openspec/          # SDD specs and changes
```

## Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm lint`       | Run linting across all projects      |
| `pnpm typecheck`  | Run type checking across all projects |
| `pnpm test`       | Run tests across all projects        |
| `pnpm build`      | Build all projects                   |
| `pnpm validate`   | Run full validation suite            |
| `pnpm ospec`      | Run local OpenSpec CLI               |
| `pnpm validate:spec` | Validate OpenSpec specs and changes |

## Adding a Project

Each project should include a `project.json` for Nx registration with at least:

- A `type:*` tag (e.g., `type:app`, `type:service`, `type:lib`)
- A `lang:*` tag (e.g., `lang:typescript`, `lang:python`, `lang:go`)

## SDD

This project uses [OpenSpec](https://openspec.dev) for spec-driven development.

- Specs live under `openspec/specs/`
- Changes live under `openspec/changes/`
- Archived changes live under `openspec/archive/`
- Configuration lives at `openspec/config.yaml`
