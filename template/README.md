# __PROJECT_NAME__

__PROJECT_DESCRIPTION__

## Prerequisites

- Node.js >= __NODE_VERSION__
- pnpm >= __PNPM_VERSION__

## Getting Started

The generated project resolves private `@mood481` packages from the Mood Gitea
registry. Export a package-read token before the first install:

```bash
export GITEA_TOKEN=<token>
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
└── docs/              # Project documentation
```

## Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm lint`       | Run linting across all projects      |
| `pnpm typecheck`  | Run type checking across all projects |
| `pnpm test`       | Run tests across all projects        |
| `pnpm build`      | Build all projects                   |
| `pnpm validate`   | Run full validation suite            |
| `pnpm nx graph`   | Generate the workspace project graph |

## Development Standards

`@mood481/dev-standards` is available as a development dependency, but the
foundation does not install a fixed rules/guides profile. Projects can adopt only the
standards they need:

```bash
pnpm exec dev-standards list
pnpm exec dev-standards install devel quality ts-js nx-pnpm
```

After materializing standards, use `pnpm exec dev-standards check` and
`pnpm exec dev-standards update` directly.

The foundation ships only minimal bootstrap notes under `docs/operations/`. Project-specific operational documentation is created by the consuming project as its real applications, services and workflows emerge.

## Adding a Project

Each project should include a `project.json` for Nx registration with at least:

- A `type:*` tag (e.g., `type:app`, `type:service`, `type:lib`)
- A `lang:*` tag (e.g., `lang:typescript`, `lang:python`, `lang:go`)

## Optional Capabilities

This foundation is SDD-neutral. It does not install or select a concrete
specification workflow by default. Consumers may add an approved SDD or other
capability through the starter's variant or extension contract.

The generated project contains only the Nx and pnpm workspace baseline. Any
capability-specific files and commands must be attributable to the selected
variant or extension that provided them.
