## MODIFIED Requirements

### Requirement: Internal consumers resolve the scoped package from Gitea

A consumer SHALL resolve `@mood481/starter-foundation-nx-pnpm` from the Gitea registry by mapping the `@mood481` scope to `https://git.mood481.es/api/packages/mood/npm/` in an `.npmrc` that the package client loads, while unscoped dependencies continue to resolve from the npm public registry.

#### Scenario: Consumer mapping is loaded by the client

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@<version> starter-foundation-render --help` with the `@mood481` scope mapped in a loaded `.npmrc` (project `.npmrc`, user `~/.npmrc`, explicit `--userconfig`, or the current directory's `.npmrc` under the supported npm client) and a `package` read token
- **THEN** the client SHALL install the package and its `@mood481/starter-renderer` runtime dependency (and the renderer's transitive `@mood481/starter-contracts`/`starter-validator`) from Gitea
- **AND** the invoked binary SHALL delegate to the canonical `starter-render` and print help / render identically to invoking `@mood481/starter-renderer` directly

#### Scenario: Unscoped dependencies resolve publicly

- **WHEN** the consumer installs the package and its dependency graph, which includes scoped `@mood481/starter-*` packages from Gitea and unscoped dependencies such as `yaml` and `ajv`
- **THEN** the scoped `@mood481/*` packages SHALL resolve from Gitea and the unscoped dependencies from the npm public registry
- **AND** the scoped mapping SHALL NOT redirect unscoped installs away from the public registry

#### Scenario: Missing mapping is a documented failure

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@<version>` with no loaded `@mood481` scope mapping
- **THEN** the client SHALL fall back to the public registry and fail to find the package
- **AND** the documentation SHALL present the scope mapping as a prerequisite, not an optional flag

### Requirement: Credential and secret hygiene

The starter repository MUST NOT commit any Gitea Personal Access Token, and SHALL document tokens as git-ignored or environment/secret-injected. Publishing requires a token with `package` write permission; consumption requires at least `package` read permission.

#### Scenario: Token-bearing npmrc is ignored

- **WHEN** a developer places a real token in a local `.npmrc`
- **THEN** that file (or its token line) SHALL be covered by `.gitignore`
- **AND** repository-committed `.npmrc` content SHALL carry only placeholders or non-secret registry mappings

#### Scenario: Renderer parity is preserved by distribution changes

- **WHEN** the package is consumed from Gitea instead of the public registry
- **THEN** the exported binary SHALL delegate to the canonical renderer
- **AND** distribution changes MUST NOT alter rendered output relative to invoking `@mood481/starter-renderer` (`starter-render`) directly
