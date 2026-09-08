## REMOVED Requirements

### Requirement: Template Dependency Lockfile Maintenance

**Reason**: The neutral template no longer ships a committed `pnpm-lock.yaml`, and the template can be extended during render (variant/overlay and extension package changes), so a pre-render committed lockfile is misleading and cannot stay accurate. The `template/package.json`-placeholder-substituting regenerate mechanism and its script are removed.

**Migration**: Dependency determinism moves to the generated project: validation performs a real `pnpm install` in the rendered project (see `starter-toolkit-integration` and the updated `quality-gates`/`foundation-template` requirements), which produces the generated `pnpm-lock.yaml`. Renovate continues not to manage `template/package.json`; the root repository lockfile is unaffected.
