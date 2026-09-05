## Purpose

Defines how the starter-owned renderer package is published to and privately consumed from the organization's Gitea npm registry, including credential handling and consumer resolution, without altering renderer behavior.

## ADDED Requirements

### Requirement: Renderer package is distributed via the Gitea npm registry

The starter repository SHALL distribute the renderer package `@mood481/starter-foundation-nx-pnpm` through the organization's Gitea npm registry at `https://git.mood481.es/api/packages/mood/npm/` and MUST NOT rely on the public npm registry for that package.

#### Scenario: Publish targets Gitea

- **WHEN** the package is published through the repository-defined publish path
- **THEN** the artifact SHALL be uploaded to the Gitea npm registry for owner `mood`
- **AND** it MUST NOT be published to `registry.npmjs.org`

#### Scenario: Published scoped tarball is retrievable

- **WHEN** a client requests the package metadata and its `@mood481/starter-foundation-nx-pnpm` tarball from the Gitea registry
- **THEN** the registry SHALL serve the scoped package metadata
- **AND** the scoped tarball URL SHALL resolve with HTTP `200` and a valid gzip archive

### Requirement: Publish entrypoint is codified, not memorized

The starter repository SHALL provide a single documented pnpm publish entrypoint that encodes the registry target and credential source, so that neither manual publishers nor automation need to supply ad-hoc registry flags. The package manifest SHALL remain registry-agnostic.

#### Scenario: Repository publish command resolves the registry

- **WHEN** a maintainer runs the repository-defined publish command with a valid token available to the environment
- **THEN** the publish SHALL proceed against the Gitea registry without the operator passing a `--registry` or `--userconfig` override
- **AND** the package version and file set SHALL come from the existing publication-ready `package.json`

#### Scenario: Manifest stays registry-agnostic

- **WHEN** `package.json` is inspected
- **THEN** it SHALL NOT hardcode `publishConfig.registry` to Gitea
- **AND** the registry target SHALL be supplied by the publish entrypoint or its environment

### Requirement: Automated publish to Gitea

The starter repository SHALL provide an automated publish workflow that runs the repository publish entrypoint against Gitea, authenticating with an injected secret rather than a committed credential.

#### Scenario: CI publishes on a release trigger

- **WHEN** the publish workflow runs for a tagged version that is not yet present in the registry
- **THEN** it SHALL authenticate to the Gitea npm registry using a repository secret with `package` write permission
- **AND** it SHALL invoke the same publish entrypoint used for manual publishing

#### Scenario: CI authenticates without a committed token

- **WHEN** the workflow executes the publish step
- **THEN** the credential SHALL come from the runner's secret/env injection
- **AND** no token SHALL be read from any file committed to the repository

### Requirement: Internal consumers resolve the scoped package from Gitea

A consumer SHALL resolve `@mood481/starter-foundation-nx-pnpm` from the Gitea registry by mapping the `@mood481` scope to `https://git.mood481.es/api/packages/mood/npm/` in an `.npmrc` that the package client loads, while unscoped dependencies continue to resolve from the npm public registry.

#### Scenario: Consumer mapping is loaded by the client

- **WHEN** a consumer runs `npx @mood481/starter-foundation-nx-pnpm@<version> starter-foundation-render --help` with the `@mood481` scope mapped in a loaded `.npmrc` (project `.npmrc`, user `~/.npmrc`, explicit `--userconfig`, or the current directory's `.npmrc` under the supported npm client) and a `package` read token
- **THEN** the client SHALL install the package from Gitea
- **AND** the invoked binary SHALL print the same help and render identically to the local `pnpm starter:render` entrypoint

#### Scenario: Unscoped dependencies resolve publicly

- **WHEN** the consumer installs the scoped package whose runtime dependency `yaml` is not hosted on Gitea
- **THEN** `yaml` SHALL resolve from the npm public registry
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
- **THEN** the renderer's CLI contract, file-authoritative precedence, and `npx`/local output parity SHALL be unchanged

### Requirement: Final versions are published only from CI

The publish entrypoint SHALL publish a prerelease-free `x.y.z` version only when executed by the release workflow, and SHALL require a prerelease-suffixed version for any local or manual publish. Local and manual publishes MUST NOT update the `latest` distribution tag, so `latest` always resolves to a CI-produced final release.

#### Scenario: Local publish of a prerelease-free version is refused

- **WHEN** the publish entrypoint runs outside the release workflow against a version with no prerelease suffix
- **THEN** it MUST abort before any upload
- **AND** it SHALL instruct the operator to publish a prerelease version with an allowed identifier (`devel`, `alpha`, `beta`, or `rc`)

#### Scenario: Local publish requires an allowed prerelease identifier

- **WHEN** a maintainer runs the publish entrypoint locally with a version whose prerelease identifier is one of `devel`, `alpha`, `beta`, or `rc`
- **THEN** it SHALL publish that version under a non-`latest` distribution tag (e.g. `next` or `devel`)
- **AND** it MUST NOT move the `latest` tag

#### Scenario: Disallowed prerelease identifier is refused

- **WHEN** a local publish runs with a prerelease identifier outside `devel`, `alpha`, `beta`, or `rc`
- **THEN** the publish MUST abort before any upload

#### Scenario: Release workflow publishes final versions under latest

- **WHEN** the release workflow publishes a prerelease-free `x.y.z` version that matches its version tag
- **THEN** it SHALL publish to Gitea under the `latest` distribution tag

#### Scenario: Default resolution follows the latest final release

- **WHEN** a consumer installs `@mood481/starter-foundation-nx-pnpm@latest` from Gitea
- **THEN** the client SHALL receive the most recent CI-published prerelease-free version
- **AND** it SHALL NOT receive a local `devel`/`alpha`/`beta`/`rc` publish unless that exact version is requested
