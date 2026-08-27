## 1. Renovate root-only configuration

- [ ] 1.1 Edit `renovate.json`: add a package rule `matchFileNames: ["template/package.json"], enabled: false` so Renovate never proposes template updates on GitHub; remove the template-specific rules (the non-OpenSpec disable and the OpenSpec re-enable with `updateLockFiles: false`); and remove the OpenSpec `postUpgradeTasks` block, because the hosted Renovate app blocks those commands via `allowedPostUpgradeCommands` and the OpenSpec-scope workflow already regenerates the tooling on `renovate/*` branches. Keep `enabledManagers: ["npm"]`, `dependencyDashboard: false`, `baseBranches: ["devel"]`, `gitIgnoredAuthors`, the root OpenSpec patch/minor automerge, and the pnpm major block. Verify with `npx --yes -p renovate renovate-config-validator renovate.json` (must report "Config validated successfully").

## 2. Simplify the OpenSpec-scope workflow

- [ ] 2.1 Edit `.github/workflows/openspec-scope.yml`: remove `template/package.json` and `template/pnpm-lock.yaml` from the `paths` trigger; remove the `template_changed` detection output; delete the "Regenerate template lockfile" step and the `template_changed` branch of the commit step. Keep OpenSpec tooling regeneration, the `renovate/*` branch commit, drift rejection, and validation gated on `changed` (root OpenSpec-relevant changes only). Verify the workflow YAML parses and the detection grep references only `package.json` (root), not `template/package.json`.

## 3. Local template lockfile script

- [ ] 3.1 Create `scripts/update-template-lockfile.mjs` that reads `pnpm`/`node` versions from the root `package.json`, substitutes the template placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) in `template/package.json`, runs `pnpm install --ignore-scripts` inside `template/`, then restores the placeholder `template/package.json`. Verify by running it: `template/pnpm-lock.yaml` is regenerated and `template/package.json` retains its placeholders (git status shows only `template/pnpm-lock.yaml` modified).
- [ ] 3.2 Add a `template:update-lock` script entry to the root `package.json` (e.g. `node scripts/update-template-lockfile.mjs`). Verify `pnpm template:update-lock` executes and regenerates the lockfile.

## 4. Documentation

- [ ] 4.1 Update `docs/renovate.md`: state that Renovate manages the root only and does not touch the template; document the `pnpm template:update-lock` workflow for regenerating `template/pnpm-lock.yaml`; note Renovate-via-Docker as a possible future optional alternative. Verify the file mentions both the root-only scope and the local script.

## 5. Validation

- [ ] 5.1 Run `npx --yes -p renovate renovate-config-validator renovate.json` and `pnpm ospec:validate` (or `openspec validate --all --strict`); both must pass. Verify the change is apply-ready with `openspec status --change renovate-root-only`.
