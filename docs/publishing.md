# Publishing

This document covers publishing the starter package and consuming it from the
organization's private Gitea npm registry. The published package exports
`starter-foundation-render` as a thin shim that delegates to the canonical
`@mood481/starter-renderer`, which is a runtime dependency; the toolkit
`@mood481/starter-contracts` and `@mood481/starter-validator` are devDependencies
used for local validation. All three are consumed from Gitea at their published
`0.4.0` versions, and the neutral `template/` no longer ships a lockfile. This is
a starter-maintenance document; root `openspec/` artifacts are never copied into
a generated project.

## Registry

The package is published to:

```text
https://git.mood481.es/api/packages/mood/npm/
```

The `@mood481` scope maps to that registry. Do not set a global `registry=`
value: unscoped dependencies such as `yaml` continue to resolve from the npm
public registry.

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

The repository-owned `pnpm publish:render` script is the only manual publish
entrypoint. It supplies the Gitea registry to `pnpm publish` and creates a
short-lived userconfig when `GITEA_TOKEN` is set. It prints the selected
package, registry, and channel, then stages a clean temporary package directory
so local dependency caches under `template/` cannot delay or contaminate the
package. An existing token-bearing `NPM_CONFIG_USERCONFIG` may be used instead.
The child publish process has a 120-second timeout; override it with
`PUBLISH_TIMEOUT_MS` when a slower network requires it.

Local and manual publishing requires a prerelease version. For example:

```bash
pnpm version prerelease --preid=devel --no-git-tag-version
read -r -s GITEA_TOKEN
export GITEA_TOKEN
pnpm publish:render
```

The channel policy is:

| Context | Version | Tag |
| --- | --- | --- |
| Local or manual | `x.y.z-devel.N` | `devel` |
| Local or manual | `x.y.z-alpha.N`, `x.y.z-beta.N`, `x.y.z-rc.N` | `next` |
| Release tag push | prerelease-free `x.y.z` | `latest` |

Local and manually dispatched runs cannot publish `latest`. A bare final
version or an unsupported prerelease identifier is rejected before upload.

The manifest remains registry-agnostic: it does not set
`publishConfig.registry`. Its existing `publishConfig.access` metadata does not
select the registry or provide authentication.

## GitHub Actions Configuration

The workflow lives at `.github/workflows/publish.yml` and calls the same
`pnpm publish:render` entrypoint used locally. It publishes to external Gitea,
not GitHub Packages.

Configure the repository before using it:

1. Create a Gitea PAT with `package:write`.
2. In the GitHub repository, open **Settings > Secrets and variables > Actions**.
3. Add a repository secret named `GITEA_TOKEN` containing that PAT.
4. Confirm the runner can reach `git.mood481.es`.

The workflow runs on pushed `v*` tags and can also be started with
`workflow_dispatch`. A pushed tag must exactly match the `package.json` version;
only that path receives release context and can publish a final version under
`latest`. A manually dispatched run must use an allowed prerelease version.

The workflow requests only the GitHub `contents: read` permission. The Gitea
PAT provides the package permission. The publish script converts the injected
secret into a short-lived runner userconfig and removes it after publishing.

Before enabling production releases, an operator may run the workflow against a
Gitea test owner and verify metadata, the tarball, and its distribution tag.
That smoke test requires a real PAT and is not needed to review or build the
workflow.

## Consuming the Package

With the `@mood481` mapping and a `package:read` token loaded:

```bash
npx @mood481/starter-foundation-nx-pnpm@<version> starter-foundation-render --help
```

The `starter-foundation-render` binary delegates to the canonical `starter-render`, so its behavior matches invoking `starter-render` directly. Because the package's runtime dependency `@mood481/starter-renderer` (and its transitive `@mood481/starter-contracts`/`starter-validator`) also resolve from the `@mood481` scope on Gitea, consumers need the mapping even for `npx`. Scoped packages are private; unscoped dependencies such as `yaml` and `ajv` still resolve from the public npm registry.

## Validation

Run the local checks before publishing:

```bash
pnpm validate
pnpm ospec validate "<change-id>" --strict
```

Confirm the published `files` ship `bin/starter-foundation-render.mjs` and do not
contain the removed local renderer, the extension machinery, or a
`template/pnpm-lock.yaml`.

For an actual Gitea smoke test (operator-only; needs a real token), use a test owner and a prerelease version. Get
metadata with `pnpm view`, inspect the `dist.tarball` URL with an authenticated
GET, and list the package contents with `tar -tzf`. Confirm that
`template/**/node_modules/**` is absent.
