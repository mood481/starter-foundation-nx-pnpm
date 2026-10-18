# Development operations

## Prerequisites

- Node.js >= __NODE_VERSION__
- pnpm >= __PNPM_VERSION__
- `GITEA_TOKEN` with package read access when installing private `@mood481` packages.

## Setup

Install dependencies:

```bash
pnpm install
```

## Common tasks

### Linting

```bash
pnpm lint
```

Runs linting across all workspace projects using Nx.

### Type checking

```bash
pnpm typecheck
```

Runs TypeScript type checking across all projects.

### Testing

```bash
pnpm test
```

Runs tests across all workspace projects.

### Building

```bash
pnpm build
```

Builds all projects. Builds respect dependency order through Nx.

## Development standards

`@mood481/dev-standards` is installed as a development dependency so the project can
adopt shared rules and guides when they are useful. The foundation does not materialize
a standards profile by default.

Inspect the available catalog:

```bash
pnpm exec dev-standards list
```

Install only the standards required by the project, for example:

```bash
pnpm exec dev-standards install devel quality ts-js nx-pnpm
```

After standards have been installed, use the tool directly:

```bash
pnpm exec dev-standards check
pnpm exec dev-standards update
```

The selected standards and their `docs/manifest.json` belong to the generated project.
They are not part of the foundation starter contract.

## Adding a new project

1. Create the project directory under the appropriate path (`apps/`, `services/`, `packages/`, or `tools/`).
2. Add a `project.json` file for Nx registration.
3. Include required tags: `type:*` and `lang:*`.
4. Add the targets required by that project.

The foundation does not prescribe an SDD provider or other optional capability. Add
capability-specific files and commands only through the integration that owns them.

Example `project.json`:

```json
{
  "name": "my-service",
  "sourceRoot": "services/my-service/src",
  "tags": ["type:service", "lang:typescript"],
  "targets": {
    "lint": { "command": "eslint src/" },
    "test": { "command": "vitest run" },
    "build": { "command": "tsc -p tsconfig.json" }
  }
}
```

## Multi-language projects

Non-JavaScript projects (Python, Go, etc.) can be registered through `project.json`
with command-based targets. Add language-specific development standards only when that
language is actually introduced into the workspace.
