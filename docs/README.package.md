# @mood481/starter-foundation-nx-pnpm

Generate an Nx and pnpm workspace from the Mood foundation starter. The package provides the `starter-foundation-render` command and a neutral template. The optional `mws` variant adds MWS foundation metadata and documentation.

## Requirements

- Node.js 22.22.2 or later and pnpm 10 or later.
- Access to the private `@mood481` packages on Gitea.

Configure the `@mood481` scope in your user npm configuration (`~/.npmrc`) and provide a Gitea token with package read access:

```ini
@mood481:registry=https://git.mood481.es/api/packages/mood/npm/
//git.mood481.es/api/packages/mood/npm/:_authToken=${GITEA_TOKEN}
```

```bash
read -r -s GITEA_TOKEN
export GITEA_TOKEN
```

## Generate a workspace

Create a render request, for example `render.yaml`:

```yaml
mode: standalone
paths:
  root: ./my-project
placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: My Nx and pnpm workspace.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
  NODE_VERSION: "24.20.0"
  NODE_VERSION_SINGLE: "24"
  PNPM_VERSION: "11.25.0"
```

Run the package command with either client:

```bash
pnpm dlx @mood481/starter-foundation-nx-pnpm --input ./render.yaml --output ./my-project
npx --yes @mood481/starter-foundation-nx-pnpm --input ./render.yaml --output ./my-project
```

The command uses this package as the starter automatically. `--output` selects the destination; it overrides `paths.root` in the request.

To generate the `mws` variant, set `variant: mws` in the request and add `PROJECT_ID` to `placeholders`. You can also select it with `--variant mws`.
