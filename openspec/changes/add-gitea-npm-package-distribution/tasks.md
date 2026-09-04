# Tasks: add-gitea-npm-package-distribution

## 1. Publish entrypoint and registry configuration

- [ ] 1.1 Add a single repository source for the Gitea npm target (base URL `https://git.mood481.es/api/packages/mood/npm/`, owner `mood`) as a documented default consumed by scripts; verify the value matches the URL used in docs and the workflow entrypoint with a local assertion.
- [ ] 1.2 Add a `starter:publish` script to `package.json` that runs `pnpm publish` for the scoped package against the configured Gitea registry using an env/userconfig token, requiring no operator-typed `--registry`; verify locally that the script assembles the repository-owned publish command and cannot select npmjs.
- [ ] 1.3 Keep the manifest registry-agnostic: verify after the change that `package.json` has no `publishConfig.registry` and that `publishConfig`/`access` handling is documented, not hardcoded to Gitea.
- [ ] 1.4 Verify locally that `starter:publish` exits non-zero before invoking `pnpm publish` when no token is present, so misconfiguration fails loudly rather than silently selecting the public registry.
- [ ] 1.5 Add publish-channel gating to `starter:publish`: allow a prerelease-free `x.y.z` only when run by the release workflow (e.g. `GITHUB_ACTIONS` on a matching `v*` tag) publishing to `latest`; otherwise require a prerelease identifier in `devel|alpha|beta|rc`, publish `devel` under the `devel` tag and `alpha|beta|rc` under `next`, and never move `latest`. Verify the channel plan with local unit tests and no registry access.

## 2. Consumer resolution configuration and secret hygiene

- [ ] 2.1 Add `.npmrc.example` with the `@mood481:registry=https://git.mood481.es/api/packages/mood/npm/` mapping and a placeholder `//git.mood481.es/api/packages/mood/npm/:_authToken=` line and no global `registry=`; verify the file content locally. External consumer resolution checks belong to the final documentation validation task.
- [ ] 2.2 Update `.gitignore` so a token-bearing local `.npmrc` is ignored while `.npmrc.example` stays tracked; verify with `git check-ignore` that `.npmrc` is ignored and `.npmrc.example` is not.
- [ ] 2.3 Verify no committed file carries a real token: scan tracked `.npmrc*` and workflow files for `:_authToken=` values that are not placeholders/env references.

## 3. Automated publish workflow (GitHub Actions → Gitea)

- [ ] 3.1 Add `.github/workflows/publish.yml` triggered by version tags (e.g. `v*`) and `workflow_dispatch`; set up Node and the repository's pnpm version, then call `pnpm starter:publish`; verify the YAML invokes the same repository entrypoint as the manual path and contains no second publish implementation.
- [ ] 3.2 Configure the workflow to inject the `GITEA_TOKEN` repository secret through the ephemeral userconfig/environment expected by the publish entrypoint; verify the workflow contains no token literal or committed credential and that the target remains the Gitea registry rather than GitHub Packages.
- [ ] 3.3 Set least-privilege GitHub Actions permissions to `contents: read` only; verify the workflow does not request `packages: write`, because the artifact is uploaded to external Gitea.
- [ ] 3.4 Make a tag-triggered release the only workflow path allowed to publish a prerelease-free version: guard that the `v*` tag matches `package.json`, pass release context to `starter:publish` for the `latest` tag, and ensure `workflow_dispatch` cannot publish `latest`; verify these guards by inspecting the workflow and its script invocation, without requiring a live Actions run.

## 4. Documentation and versioning

- [ ] 4.1 Author `docs/publishing.md` with the full Gitea publish/consume procedure: registry target, the `@mood481` `.npmrc` scope-mapping prerequisite and the package-client load locations (project `.npmrc`, `~/.npmrc`, `--userconfig`, and supported cwd `.npmrc` behavior), `package:read`/`package:write` PAT scopes, `pnpm starter:publish`, and the channel policy (`devel|alpha|beta|rc` -> `next`/`devel`, CI `x.y.z` -> `latest`) with the local bump command (e.g. `pnpm version prerelease --preid=devel --no-git-tag-version`); detail how to create the `GITEA_TOKEN` repository secret, how the workflow is triggered, and that Gitea reachability/live smoke testing is an operator follow-up; verify it reads standalone.
- [ ] 4.2 Replace the inline `npx @mood481/starter-foundation-nx-pnpm@0.5.0 ...` procedure blocks in `README.md` with one concise `npx` example and a short **Publishing** section pointing to `docs/publishing.md`; verify `README.md` no longer duplicates the publishing walkthrough and keeps its current length lean.
- [ ] 4.3 Add a one-line reference in `VALIDATION.md` to `docs/publishing.md` for published-package checks, without expanding its existing render/`npx` validation text; verify no new publishing procedure is inlined there.
- [ ] 4.4 Bump `package.json` and `starter.yaml` `version` to `0.6.0` in lockstep, add the `!template/**/node_modules/**` package-file exclusion, update version-bound package and `npx` examples in `openspec/specs/starter-template-renderer/spec.md` from `0.5.0` to `0.6.0`, and add the `0.6.0` `CHANGELOG.md` entry (distribution capability, publish scripts/CI, channel gating, docs moved to `docs/publishing.md`); verify both version fields match and that rendered `STARTER_VERSION` derives `0.6.0`.
- [ ] 4.5 Verify docs hygiene: the new `docs/publishing.md`/README never claim anonymous/public access or instruct committing a token, and use `<version>` placeholders or the new `0.6.0` rather than stale `0.4.0`/`0.5.0` in newly authored content. Version-bound literals in the canonical renderer spec are handled by 4.4; its rendering semantics remain out of scope.

## 5. Validation

- [ ] 5.1 Run `pnpm ospec validate "add-gitea-npm-package-distribution" --strict` and fix active-artifact errors; use `pnpm validate:spec` for the full local strict gate without appending another `--strict`.
- [ ] 5.2 Verify `template/` and `variants/**` are unchanged, and that any diff in `openspec/specs/starter-template-renderer/spec.md` is limited to the version-bound `0.5.0 -> 0.6.0` literals required by task 4.4; confirm no rendering, CLI, or variant behavior was introduced by distribution work.
- [ ] 5.3 Verify the external Gitea publishing and consumption procedure is documented in `docs/publishing.md` and linked from `VALIDATION.md`: registry metadata/tarball checks, `.npmrc` load locations, PAT scopes and `GITEA_TOKEN` setup, manual and Actions commands, scoped `npx` help/render checks, mixed Gitea/npm resolution, and channel/latest checks; verify the required content and links with local assertions only, without contacting Gitea or running GitHub Actions.
- [ ] 5.4 Verify secret hygiene locally: a run without a token fails before invoking `pnpm publish`, and tracked `.npmrc`/workflow files contain no real token or token-bearing log command.
- [ ] 5.5 Review the GitHub Actions workflow statically and verify its documented configuration covers the `GITEA_TOKEN` secret, PAT scope, trigger/tag rules, external Gitea target, least-privilege permissions, and optional test-owner smoke test; do not require executing GitHub Actions as part of this change.
