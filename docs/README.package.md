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

Create a render request, for example `render.yaml` with Node 26 (Current), pnpm 12, and Nx 23.3:

```yaml
mode: standalone
paths:
  root: ./my-project
placeholders:
  PROJECT_NAME: My Project
  PROJECT_SLUG: my-project
  PROJECT_DESCRIPTION: My Nx and pnpm workspace.
  DEFAULT_PACKAGE_SCOPE: "@my-project"
  NODE_VERSION: "26.12.0"
  NODE_VERSION_SINGLE: "26"
  PNPM_VERSION: "12.14.0"
  NX_VERSION: "^23.3.0"
```

`NX_VERSION` is the npm version specifier for the generated workspace's `nx`
dependency. Use a range such as `^23.3.0` or an exact version such as `23.3.0`.

For pnpm 11 with Node 24 LTS, replace the four version placeholders above with:

```yaml
  NODE_VERSION: "24.22.0"
  NODE_VERSION_SINGLE: "24"
  PNPM_VERSION: "11.28.5"
  NX_VERSION: "^23.3.0"
```

These combinations follow the [pnpm compatibility matrix](https://pnpm.io/installation/#compatibility), the [Nx Node.js requirements](https://nx.dev/docs/technologies/node/introduction#requirements), and [Nx 23.3's pnpm 12 support](https://nx.dev/blog/nx-23-3-release).

Run the package command with either client:

```bash
pnpm dlx @mood481/starter-foundation-nx-pnpm --input ./render.yaml --output ./my-project
npx --yes @mood481/starter-foundation-nx-pnpm --input ./render.yaml --output ./my-project
```

The command uses this package as the starter automatically. `--output` selects the destination; it overrides `paths.root` in the request.

To provide all values on the command line without a request file, use `--output` and repeatable `--set` arguments:

```bash
pnpm dlx @mood481/starter-foundation-nx-pnpm \
  --output ./my-project \
  --set 'PROJECT_NAME=My Project' \
  --set PROJECT_SLUG=my-project \
  --set 'PROJECT_DESCRIPTION=My Nx and pnpm workspace.' \
  --set DEFAULT_PACKAGE_SCOPE=@my-project \
  --set NODE_VERSION=26.12.0 \
  --set NODE_VERSION_SINGLE=26 \
  --set PNPM_VERSION=12.14.0 \
  --set 'NX_VERSION=^23.3.0'
```

To generate the `mws` variant, set `variant: mws` in the request and add `PROJECT_ID` to `placeholders`. You can also select it with `--variant mws`.
