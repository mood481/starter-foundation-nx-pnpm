## Context

The starter repository uses `@fission-ai/openspec` for all SDD workflows and keeps generated assistant tooling (`.opencode/commands/`, `.opencode/skills/`, and potentially `.agents/skills/` when delivery is `both`) checked in. Every OpenSpec release requires a manual sequence: bump the dependency, regenerate the tooling with `openspec update`, and validate. The repository currently has no dependency automation and no CI.

A sibling project already solved this; its in-use files are kept locally under gitignored `tmp/` as examples to fix the definition on:

- `tmp/renovate.json`: Renovate config extending `config:recommended`, with a package rule that automerges `@fission-ai/openspec` updates and runs `postUpgradeTasks` to reconfigure the OpenSpec profile and regenerate tooling.
- `tmp/openspec-scope.yml`: a GitHub Actions workflow in use in that project that, on OpenSpec-scope pull requests, reinstalls, reconfigures the OpenSpec profile (OpenSpec config is global per machine, so CI runners must set it explicitly), regenerates tooling, rejects drift, and validates.

Constraints from the current repository state:

- The integration branch is `devel` (the example files target `devel`; the `devel` branch exists in this repository).
- Package scripts use the `ospec:` prefix convention (the example project used `openspec:update`).
- `openspec config` is global (`~/.config/openspec/config.json`), not checked in, so both Renovate post-upgrade tasks and CI must set profile/delivery/workflows explicitly before regenerating.
- The starter repo validates with `pnpm ospec:validate` (`openspec validate --all --strict`).

## Goals / Non-Goals

**Goals:**

- Renovate proposes `@fission-ai/openspec` updates automatically against `devel`.
- `patch` and `minor` OpenSpec updates automerge once required checks pass.
- `major` OpenSpec updates are proposed but never automerged.
- OpenSpec updates regenerate checked-in assistant tooling inside the Renovate PR when the Renovate installation allows post-upgrade tasks.
- A scoped GitHub Actions workflow proves that a PR's checked-in tooling matches what the pinned OpenSpec version generates, and runs strict OpenSpec validation.
- Documentation explains how to activate Renovate on GitHub and on other Git servers, including the repository settings and permissions automerge needs.
- The starter version moves to `0.2.0` and the CHANGELOG records the change.

**Non-Goals:**

- No Renovate configuration for `template/` or variants; generated projects are unaffected.
- No dependency updates performed by this change (the first OpenSpec update is left to Renovate).
- No automerge for dependencies other than `@fission-ai/openspec`.
- No CI auto-commit of regenerated tooling; the workflow fails on drift instead.
- No new npm dependencies (Renovate runs as an external service).

## Decisions

### Decision 1: Renovate runs as an external service configured by a root `renovate.json`

Renovate is not added as a devDependency. The repository only carries `renovate.json`; execution is provided by the Mend Renovate GitHub App, a self-hosted Renovate runner, or a scheduled CI job on other platforms. This keeps the dependency surface unchanged and matches how Renovate is designed to operate.

### Decision 2: Automerge policy is split by update type

The reference `tmp/renovate.json` automerges every `@fission-ai/openspec` update. This change hardens that policy with two explicit package rules:

- `matchPackageNames: ["@fission-ai/openspec"]` + `matchUpdateTypes: ["patch", "minor"]` → `automerge: true`, `automergeType: "pr"`, `platformAutomerge: true`, plus the tooling-regeneration `postUpgradeTasks`.
- `matchPackageNames: ["@fission-ai/openspec"]` + `matchUpdateTypes: ["major"]` → `automerge: false`, documented explicitly so the intent is reviewable in config.

Major OpenSpec releases can change CLI behaviour, config shape, or generated tooling layout, so a human must review them.

### Decision 3: Base branch is `devel`

The example files target `devel`, and this repository has adopted `devel` as its integration branch. `renovate.json` declares `baseBranches: ["devel"]` and the workflow triggers on pull requests to `devel`, keeping full fidelity with the example.

### Decision 4: Tooling regeneration goes through a new `ospec:update` script

The example runs `pnpm openspec:update`. This repository's convention (`quality-gates` spec) is the `ospec:` prefix for standalone OpenSpec helper scripts, so a new `ospec:update` script invoking `openspec update` is added to `package.json` and used by both `renovate.json` post-upgrade tasks and the CI workflow. The profile/delivery/workflows `config set` commands stay as explicit steps because OpenSpec config is global and never checked in.

The `config set` commands (including `config set workflows '<json-array>'`) are OpenSpec 1.10.0 commands: they only run in the Renovate post-update flow and the CI workflow, which operate with the updated OpenSpec version on the Renovate branch. They are kept verbatim from the example; they are NOT adjusted for the currently pinned CLI, because this change does not regenerate tooling nor run those commands locally.

### Decision 5: Post-upgrade tasks are scoped to generated tooling paths

`postUpgradeTasks.commands` reconfigure the OpenSpec profile and run `pnpm ospec:update`; `fileFilters` limit committed side effects to `.agents/skills/**`, `.opencode/commands/**`, and `.opencode/skills/**`, matching the reference. Dependency files (`package.json`, `pnpm-lock.yaml`) are managed by Renovate itself, not by post-upgrade tasks.

### Decision 6: The workflow is adapted from an in-use example and rejects drift instead of auto-committing

`tmp/openspec-scope.yml` is an example of a workflow in use in the sibling project. It is a reference, not a copy-paste target: the implementation SHALL create the workflow appropriate for this repository — trigger on OpenSpec-scope pull requests to `devel`, this repo's `ospec:` script names, and this repo's paths — following the example's shape: checkout, Node 22, corepack pnpm, `pnpm install --frozen-lockfile --ignore-scripts`, OpenSpec profile config, `pnpm ospec:update`, drift rejection, strict validation. Two adaptations over the example:

- Validation uses `pnpm ospec:validate` (this repo's script name).
- Drift detection uses `git status --porcelain` (scoped to the generated tooling paths first, then the whole tree) instead of `git diff --exit-code`, because `git diff` ignores untracked files and a regeneration that creates new files (for example a new `.agents/` directory) would otherwise pass silently.

The workflow's green status is what informs Renovate that a branch is ready for automerge. A Renovate branch carries the latest OpenSpec version, so the workflow is expected to pass there; if it fails, OpenSpec changed its tooling contract and maintainers must adapt the starter — that failure is intentional and is the only practical way to detect such contract changes. If Renovate could not run post-upgrade tasks, the workflow fails the same way and a maintainer regenerates locally and pushes; automerge then proceeds once checks pass.

### Decision 7: Documentation lives in `docs/renovate.md`, linked from `README.md`

The repository has no root `docs/` directory yet. Renovate activation has enough platform-specific content (GitHub app, GitHub Action/self-hosted, GitLab and other Git servers, required repository settings, the `allowedPostUpgradeCommands` caveat) to justify a dedicated file rather than a README subsection. `README.md` gains a short section linking to it and its repository-structure snippet gains the new root entries (`renovate.json`, `docs/`).

### Decision 8: Starter version bumps to `0.2.0` with a CHANGELOG entry

This change adds repository automation capability without breaking the starter contract, so it is a minor bump: `0.1.0` → `0.2.0` in `starter.yaml` and `package.json`, plus a `## 0.2.0` section in `CHANGELOG.md` with an `### add-renovate-automerge` entry, following the existing changelog convention of one section per change id.

## Repository Structure

New or modified starter-repository files:

```txt
.
├── .github/
│   └── workflows/
│       └── openspec-scope.yml   # new: OpenSpec-scope PR gate
├── docs/
│   └── renovate.md              # new: Renovate activation guide
├── renovate.json                # new: Renovate configuration
├── package.json                 # modified: ospec:update script, version 0.2.0
├── starter.yaml                 # modified: version 0.2.0
├── README.md                    # modified: Renovate section + structure
└── CHANGELOG.md                 # modified: 0.2.0 entry
```

No files under `template/` or `variants/` are added or modified.

## Constraints

- Agents MUST NOT update `@fission-ai/openspec` as part of this change; the lockfile stays on the current version.
- Agents MUST NOT add Renovate configuration to `template/` or any variant overlay.
- Agents MUST NOT add Renovate as an npm dependency.
- Agents MUST NOT enable automerge for `major` updates or for any package other than `@fission-ai/openspec`.
- Agents MUST NOT auto-commit from the CI workflow; it only validates and rejects drift.
- Agents MUST NOT attempt to synchronize `template/openspec/config.yaml` from Renovate post-upgrade tasks; it is user-owned config, not generated tooling.
- Agents MUST keep the `ospec:` script prefix convention and MUST NOT introduce an `os:` prefix.
- Agents MUST NOT regenerate checked-in OpenSpec assistant tooling as part of this change; tooling regeneration happens in the Renovate post-update flow.
- Agents MUST NOT run the OpenSpec profile `config set` commands locally to verify them; they are OpenSpec 1.10.0 commands executed in the Renovate/CI flow with the updated OpenSpec version.
- Agents MUST NOT weaken existing validation (`pnpm validate`, rendered-template validation) while adding the workflow.
- Terminology MUST remain `variant`/`overlay`; this change introduces neither.

## Alternatives Considered

- **Renovate as a devDependency run locally**: rejected; it couples updates to manual runs and adds a heavy dependency, defeating the purpose of automation.
- **GitHub Dependabot**: rejected; it cannot run the OpenSpec tooling-regeneration post-upgrade tasks and its automerge story would need extra automation anyway.
- **Automerge all update types including major**: rejected; major OpenSpec releases can change generated tooling and CLI behaviour and deserve human review.
- **CI auto-commits regenerated tooling back to the PR**: rejected for this change; failing on drift keeps the checked-in provenance explicit (either Renovate regenerated it or a maintainer did). Can be revisited later if hosted Renovate cannot run post-upgrade tasks.
- **README-only documentation**: rejected; multi-platform activation guidance is too long for the README and would dilute the starter usage docs.
- **Keep `baseBranches` unset**: rejected; declaring `["devel"]` is explicit and matches the example's explicit targeting, avoiding surprises if the default branch changes.

## Risks / Trade-offs

- Hosted Renovate app ignores `postUpgradeTasks` unless commands are allowlisted → the drift-guard workflow fails on those PRs and `docs/renovate.md` explains both the manual regeneration fallback and the self-hosted option with `allowedPostUpgradeCommands`.
- Platform automerge silently stalls when the repository has not enabled auto-merge or lacks compatible branch protection → `docs/renovate.md` lists the required GitHub settings.
- `git status --porcelain` drift checks are stricter than the example's `git diff` and could fail on unrelated dirty state → the workflow runs on clean CI checkouts, so the only possible drift comes from the regeneration steps.
- Pinning `baseBranches: ["devel"]` means the `devel` branch must exist and stay the integration branch → it does and is the adopted flow of this repository.
- A workflow failure on a Renovate branch means OpenSpec changed its tooling contract → intentional; it signals the follow-up starter change. Until the first Renovate OpenSpec update lands, human PRs touching the OpenSpec scope may also fail the profile step with the currently pinned CLI → accepted; the Renovate update resolves it, and real workflow validation is human review.
- A malicious or broken OpenSpec release could be automerged on patch/minor → mitigated by the workflow's strict validation and drift gate running before automerge; major releases stay manual.
- `template/openspec/config.yaml` is user-owned and not regenerated by `openspec update`, so it can drift from current OpenSpec guidance → `docs/renovate.md` documents it as a maintainer review step on each update, and template config improvements remain a separate OpenSpec change.

## Migration Plan

No file renames or metadata moves are required. Rollout steps:

1. Merge this change into `devel` (adds `renovate.json`, workflow, docs, scripts, version bump).
2. Activate Renovate for the repository following `docs/renovate.md` (install the GitHub app or configure a self-hosted runner) — a manual, human-performed step.
3. Enable the repository settings required for automerge (allow auto-merge; branch protection on `devel` requiring the OpenSpec-scope workflow for matching paths) — a manual, human-performed step.
4. Let Renovate open its onboarding/dependency dashboard and the first OpenSpec update PR; verify the workflow behaviour on that PR — human review, since part of the process depends on the installed app.

Rollback: disable Renovate for the repository and revert the change commit; no stateful migration exists.

## Validation Strategy

Agent-verifiable, local validation:

- `pnpm ospec:validate` passes for the change artifacts and all specs.
- `pnpm validate` passes unchanged (spec + rendered-template validation); no template files are touched.
- `renovate.json` parses as JSON, declares its `$schema`, and matches the documented decisions (`config:recommended`, dashboard, `baseBranches: ["devel"]`, patch/minor automerge rule, explicit major non-automerge rule, scoped post-upgrade task file filters, verbatim `config set` commands from the example).
- The workflow YAML parses and its script references (`ospec:update`, `ospec:validate`) exist in `package.json`.
- `git status` shows no changes under `.opencode/` or `.agents/` introduced by this change.
- `starter.yaml` and `package.json` both declare `0.2.0`, and `CHANGELOG.md` has a `0.2.0` entry.
- Terminology check: no `flavour` metadata, no variant-specific files introduced.

Out of agent reach: the actual behaviour of the workflow in CI and of Renovate post-upgrade tasks is validated by human review during the rollout steps (the app installation is manual and cannot be verified locally).
