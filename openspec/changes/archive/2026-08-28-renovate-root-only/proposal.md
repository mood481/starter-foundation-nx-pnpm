## Why

Managing the template's dependencies through Renovate on GitHub proved fragile: the template's `package.json` uses placeholders (`__PNPM_VERSION__`, `__NODE_VERSION__`, `__PROJECT_SLUG__`, `__PROJECT_DESCRIPTION__`) that prevent Renovate from running `pnpm install`, which produced an `renovate/artifacts` "Artifact file update failure" and forced a bespoke workflow regeneration step. We are simplifying the flow: Renovate manages **only the repository root**, and the template is maintained locally by the maintainer with a small script. This removes the fragile automation, reduces CI complexity, and keeps the starter's dependency hygiene.

## What Changes

- **Renovate (root only)**: disable `template/package.json` entirely (`enabled: false`) so Renovate proposes updates only for the root (`package.json` + `pnpm-lock.yaml`). Remove the template-specific rules (non-OpenSpec disable and OpenSpec re-enable with `updateLockFiles: false`) — they are no longer needed.
- **GitHub workflow (`openspec-scope.yml`)**: remove `template/package.json` and `template/pnpm-lock.yaml` from the trigger `paths`; remove the `template_changed` detection output and the "Regenerate template lockfile" step. Keep OpenSpec tooling regeneration, the `renovate/*` branch commit, and the validation gated on root OpenSpec-relevant changes.
- **Local template lockfile script**: add a script that regenerates `template/pnpm-lock.yaml` by substituting the template placeholders from the root `package.json`, running `pnpm install --ignore-scripts` in `template/`, and restoring the placeholder `template/package.json`. Expose it as a pnpm script (e.g. `template:update-lock`).
- **Docs (`docs/renovate.md`)**: state that Renovate manages the root only; the template is updated manually via the script at the maintainer's discretion; note Renovate-via-Docker as a possible future alternative.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `dependency-automation`: narrow Renovate to the repository root; replace the GitHub-driven template lockfile automation with a local-script-based template lockfile maintenance; simplify the OpenSpec-scope workflow gate so it no longer references the template.

## Impact

- `renovate.json` — root-only scope, template excluded.
- `.github/workflows/openspec-scope.yml` — template removed from trigger paths, detection, and regeneration.
- New `scripts/update-template-lockfile.mjs` (or equivalent) and a `template:update-lock` pnpm script in `package.json`.
- `docs/renovate.md` — updated activation/maintenance guidance.
- Generated template `template/pnpm-lock.yaml` is now updated only by the local script (committed by the maintainer), not by CI or Renovate.

## Out of Scope

- Automated template dependency updates on GitHub (e.g. Renovate-via-Docker) — noted as a future optional alternative but not implemented here.
- Changing the OpenSpec tooling regeneration for root updates — unchanged.
- Variant overlays (`mws`) — unaffected.

## Risks

- The template's dependencies can drift from the root if the maintainer forgets to run the lockfile script after editing `template/package.json`. Mitigated by documentation and the script's simplicity. This affects the freshness of the generated project only, not the starter repository's CI.
