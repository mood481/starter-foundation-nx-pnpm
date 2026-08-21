## Execution Plan

### Renovate configuration

- [ ] Create `renovate.json` at the starter repository root, based on the in-use example `tmp/renovate.json`.
- [ ] Declare the Renovate `$schema` and extend `config:recommended`.
- [ ] Enable `dependencyDashboard`.
- [ ] Set `baseBranches` to `["devel"]`, matching the example (the `devel` branch exists in this repository).
- [ ] Add a package rule for `@fission-ai/openspec` with `matchUpdateTypes: ["patch", "minor"]`, `automerge: true`, `automergeType: "pr"`, and `platformAutomerge: true`.
- [ ] Add `postUpgradeTasks` to the patch/minor rule: set OpenSpec `profile`, `delivery`, and `workflows` config with the example's commands verbatim, then run `pnpm ospec:update`, with `fileFilters` limited to `.agents/skills/**`, `.opencode/commands/**`, and `.opencode/skills/**`.
- [ ] Add an explicit package rule for `@fission-ai/openspec` with `matchUpdateTypes: ["major"]` and `automerge: false`.
- [ ] Confirm no other package is configured to automerge.

### Package scripts

- [ ] Add an `ospec:update` script to the root `package.json` that invokes the project-local OpenSpec CLI `update` command.
- [ ] Confirm the new script follows the `ospec:` prefix convention and no `os:` prefix is introduced.

### GitHub Actions workflow

- [ ] Create `.github/workflows/openspec-scope.yml`, adapting the in-use example `tmp/openspec-scope.yml` to this repository.
- [ ] Trigger the workflow on pull requests to `devel` touching `openspec/config.yaml`, `.agents/skills/**`, `.opencode/commands/**`, `.opencode/skills/**`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `renovate.json`, and the workflow file itself.
- [ ] Keep `permissions: contents: read`.
- [ ] Add steps: checkout, set up Node.js 22, enable corepack, and `pnpm install --frozen-lockfile --ignore-scripts`.
- [ ] Add a step that sets the OpenSpec `profile`, `delivery`, and `workflows` config explicitly with the example's commands verbatim (OpenSpec config is global and not checked in; the commands run with the updated OpenSpec version on Renovate branches).
- [ ] Add a step that regenerates tooling with `pnpm ospec:update`.
- [ ] Add a step that fails if `git status --porcelain -- .agents/skills .opencode/commands .opencode/skills` is not empty (catches modified and untracked generated tooling drift).
- [ ] Add a step that fails if `git status --porcelain` for the rest of the tree is not empty.
- [ ] Add a step that runs `pnpm ospec:validate`.
- [ ] Confirm the workflow has no step that commits or pushes.

### Documentation

- [ ] Create `docs/renovate.md`.
- [ ] Document GitHub activation: install the Mend Renovate GitHub App (or run Renovate as a GitHub Action / self-hosted runner).
- [ ] Document the repository settings required for automerge: allow auto-merge and branch protection on `devel` with the OpenSpec-scope workflow as a required check.
- [ ] Document activation on other Git servers (GitLab, Bitbucket, Azure DevOps, Gitea/Forgejo) through self-hosted or scheduled Renovate execution with a platform token.
- [ ] Document the post-upgrade tasks caveat: hosted Renovate ignores `postUpgradeTasks` unless commands are allowlisted (`allowedPostUpgradeCommands` on self-hosted runners), and the manual fallback is running the config steps plus `pnpm ospec:update` locally and pushing to the Renovate PR.
- [ ] Document that OpenSpec dependency updates do not touch `template/openspec/config.yaml` and that template config improvements follow as a separate maintainer change after reviewing the OpenSpec release notes.
- [ ] Document that a workflow failure on a Renovate branch means OpenSpec changed its tooling contract and must be addressed with a follow-up starter change, not by weakening the workflow.
- [ ] Document the optional manual config check `npx --yes -p renovate renovate-config-validator renovate.json`.
- [ ] Update `README.md` with a short Renovate section linking to `docs/renovate.md`.
- [ ] Update the `README.md` repository-structure snippet to include `renovate.json` and `docs/`.

### Version bump and changelog

- [ ] Bump `version` to `0.2.0` in `starter.yaml`.
- [ ] Bump `version` to `0.2.0` in `package.json`.
- [ ] Add a `## 0.2.0` section to `CHANGELOG.md` with an `### add-renovate-automerge` entry describing the change, following the existing per-change-id format.

## Validation

### OpenSpec validation

- [ ] Run `pnpm ospec validate add-renovate-automerge --strict`.
- [ ] Run `pnpm ospec:validate`.
- [ ] Run `pnpm validate:spec`.

### Configuration validation

- [ ] Confirm `renovate.json` parses as JSON and matches the documented decisions (`config:recommended`, dashboard, `baseBranches: ["devel"]`, patch/minor automerge rule, explicit major non-automerge rule, scoped post-upgrade task file filters, verbatim `config set` commands from the example).
- [ ] Run `npx --yes -p renovate renovate-config-validator renovate.json` and confirm it passes.
- [ ] Confirm the workflow YAML parses and every `pnpm` script it references exists in `package.json`.
- [ ] Confirm `starter.yaml` and `package.json` both declare `0.2.0` and `CHANGELOG.md` contains the `0.2.0` entry.

### Repository validation

- [ ] Run `pnpm validate` and confirm it passes unchanged.

### Constraint validation

- [ ] Confirm `@fission-ai/openspec` was not updated and the lockfile still pins the current version.
- [ ] Confirm no files under `template/` or `variants/` were added or modified.
- [ ] Confirm Renovate was not added as an npm dependency.
- [ ] Confirm no package other than `@fission-ai/openspec` is configured to automerge, and major updates are explicitly excluded.
- [ ] Confirm the Renovate documentation states that `template/openspec/config.yaml` is not synchronized by dependency updates and that improvements follow as a separate maintainer change.
- [ ] Confirm no files under `.opencode/` or `.agents/` were modified by this change (tooling regeneration belongs to the Renovate post-update flow).
- [ ] Confirm the workflow never commits or pushes.
- [ ] Confirm design constraints were respected.
- [ ] Confirm terminology consistency: `variant` and `overlay` are used, no `flavour` metadata is introduced.
