# Publishing

This document covers publishing the starter package and consuming it from the
organization's private Gitea npm registry. The published package exports
`starter-foundation-render` as a thin shim that delegates to the canonical
`@mood481/starter-renderer`, which is a runtime dependency; the toolkit
`@mood481/starter-contracts` and `@mood481/starter-validator` are devDependencies
used for local validation. All three are consumed from Gitea at the versions
declared in `package.json`, and the neutral `template/` no longer ships a lockfile. This is
a starter-maintenance document; the retired planning archive under
`docs/openspec-archive/` is never copied into
a generated project.

## Registry

The package is published to:

```text
https://git.mood481.es/api/packages/mood/npm/
```

The `@mood481` scope maps to that registry. Do not set a global `registry=`
value: unscoped dependencies such as `yaml` continue to resolve from the npm
public registry.

The package tarball uses [README.package.md](README.package.md) as its root
`README.md`. The repository root README remains the maintainer guide.

## Gitea Tokens

Create a Gitea Personal Access Token with the smallest required package scope:

- `package:write` for maintainers and the publish workflow.
- `package:read` for consumers.

Never commit a token. For local consumer configuration, copy
`.npmrc.example` to a loaded npm configuration location and provide
`GITEA_TOKEN` through the environment:

```bash
cp .npmrc.example ~/.npmrc
read -r -s GITEA_TOKEN
export GITEA_TOKEN
```

The package client loads the scope mapping from a project `.npmrc`, the user
`~/.npmrc`, an explicit `--userconfig` path, or, with the supported npm client,
the current directory's `.npmrc` even when that directory has no `package.json`.
Without a loaded `@mood481` mapping, npm/npx falls back to the public registry
and cannot find this private package.

## Local Publishing

The repository-owned `pnpm publish:render` script keeps `package.json` on a stable
base version such as `0.8.4`. Prerelease suffixes belong to the publication request,
not to the committed manifest.

For a local prerelease:

```bash
read -r -s GITEA_TOKEN
export GITEA_TOKEN
export PUBLISH_PRERELEASE=beta.1
NPM_CONFIG_USERCONFIG=.npmrc.example pnpm publish:render
```

The effective published version is derived in the temporary staging directory, so the
repository manifest remains `0.8.4` while the uploaded package can be
`0.8.4-beta.1`.

The channel policy is:

| Context | Effective version | Tag |
| --- | --- | --- |
| Tag `vX.Y.Z` | `X.Y.Z` | `latest` |
| Tag/manual `devel.N` | `X.Y.Z-devel.N` | `devel` |
| Tag/manual `alpha.N`, `beta.N`, `rc.N` | `X.Y.Z-...` | `next` |

A tag is valid when its stable `X.Y.Z` base exactly matches the stable version in
`package.json`. The prerelease suffix is intentionally ignored for that base-version
comparison.

The manifest remains registry-agnostic: it does not set
`publishConfig.registry`. Its existing `publishConfig.access` metadata does not
select the registry or provide authentication.

## GitHub Actions Configuration

The workflow lives at `.github/workflows/publish.yml` and calls the same
`pnpm publish:render` entrypoint used locally. Before pnpm executes that script,
the workflow exposes the repository `.npmrc.example` as `NPM_CONFIG_USERCONFIG`
so pnpm's dependency verification resolves private `@mood481` packages from
Gitea instead of the public npm registry. The publisher then creates its own
short-lived authenticated userconfig for the actual upload. It publishes to
external Gitea, not GitHub Packages.

Configure the repository before using it:

1. Create a Gitea PAT with `package:write`.
2. In the GitHub repository, open **Settings > Secrets and variables > Actions**.
3. Add a repository secret named `GITEA_TOKEN` containing that PAT.
4. Confirm the runner can reach `git.mood481.es`.

The workflow runs on pushed `v*` tags and can also be started with
`workflow_dispatch`. `package.json` always contains the stable `X.Y.Z` base.
A pushed `vX.Y.Z` tag publishes `latest`; `vX.Y.Z-devel.N` publishes `devel`;
and `vX.Y.Z-alpha.N`, `-beta.N`, or `-rc.N` publish `next`. In every case the
tag's stable base must equal the manifest version. Manual dispatch asks only for
the prerelease suffix and derives the effective version from the manifest base.

The workflow requests only the GitHub `contents: read` permission. The Gitea
PAT provides the package permission. The publish script converts the injected
secret into a short-lived runner userconfig and removes it after publishing.

Before enabling production releases, an operator may run the workflow against a
Gitea test owner and verify metadata, the tarball, and its distribution tag.
That smoke test requires a real PAT and is not needed to review or build the
workflow.

## Consuming the Package

With the `@mood481` mapping and a `package:read` token loaded, pass the
package directly to `npx` or `pnpm dlx`. Both clients select its sole `bin`
entry, `starter-foundation-render`. The arguments after the package name go
to that command.

```bash
npx --yes @mood481/starter-foundation-nx-pnpm@<version> --help
pnpm dlx @mood481/starter-foundation-nx-pnpm@<version> --help
```

Render examples (`--starter` is injected automatically against the installed
package root, so consumers only pass the render options):

```bash
npx --yes @mood481/starter-foundation-nx-pnpm@<version> --input ./render.yaml --output ./my-project
pnpm dlx @mood481/starter-foundation-nx-pnpm@<version> --input ./render.yaml --output ./my-project
npx --yes @mood481/starter-foundation-nx-pnpm@<version> --input ./render.yaml --output ./my-project --set PROJECT_NAME="My Project"
pnpm dlx @mood481/starter-foundation-nx-pnpm@<version> --variant mws --output ./my-project --set PROJECT_ID=my-project --set PROJECT_NAME="My Project"
```

The `starter-foundation-render` binary delegates to the canonical `starter-render` and resolves a relative `paths.root` in an input request from the caller's working directory. `--output` takes precedence. Because the package's runtime dependency `@mood481/starter-renderer` (and its transitive `@mood481/starter-contracts`/`starter-validator`) also resolve from the `@mood481` scope on Gitea, consumers need the mapping even for `npx`/`pnpm dlx`. Scoped packages are private; unscoped dependencies such as `yaml` and `ajv` still resolve from the public npm registry.

## Validation

Run the local checks before publishing:

```bash
pnpm validate
pnpm build
```

`pnpm build` (also available as `pnpm pack:render`) writes a local `.tgz` to
`dist/` using the same clean staging step as `publish:render`. It does not
require a publish token, apply release version gates, or contact Gitea. Inspect
the tarball and its root README before a release.

To exercise the tarball with `npx`, pass it through `--package` and name the
binary explicitly:

```bash
tarball="dist/mood481-starter-foundation-nx-pnpm-$(node -p "require('./package.json').version").tgz"
npx --yes --package="./$tarball" starter-foundation-render --help
```

The tarball is local, but npm still resolves this package's private runtime
dependencies from the configured Gitea registry.

Confirm the published `files` ship `bin/starter-foundation-render.mjs` and do not
contain the removed local renderer, the extension machinery, or a
`template/pnpm-lock.yaml`.

For an actual Gitea smoke test (operator-only; needs a real token), use a test owner and a prerelease version. Get
metadata with `pnpm view`, inspect the `dist.tarball` URL with an authenticated
GET, and list the package contents with `tar -tzf`. Confirm that
`template/**/node_modules/**` is absent.
