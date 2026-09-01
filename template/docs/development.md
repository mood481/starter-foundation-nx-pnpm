# Development Guide

## Prerequisites

- Node.js >= __NODE_VERSION__
- pnpm >= __PNPM_VERSION__

## Setup

Install dependencies:

```bash
pnpm install
```

## Common Tasks

### Linting

```bash
pnpm lint
```

Runs linting across all workspace projects using Nx.

### Type Checking

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

## Adding a New Project

1. Create the project directory under the appropriate path (`apps/`, `services/`, `packages/`, or `tools/`).
2. Add a `project.json` file for Nx registration.
3. Include required tags: `type:*` and `lang:*`.
4. Add required targets: `lint` and `test`.

The foundation does not prescribe an SDD provider or other capability. Add
capability-specific files and commands only through the approved integration
that owns them.

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

## Multi-Language Projects

Non-JavaScript projects (Python, Go, etc.) can be registered through `project.json` with command-based targets:

```json
{
  "name": "my-python-service",
  "sourceRoot": "services/my-python-service",
  "tags": ["type:service", "lang:python"],
  "targets": {
    "lint": { "command": "ruff check ." },
    "test": { "command": "pytest" }
  }
}
```
