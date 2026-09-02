## REMOVED Requirements

### Requirement: OpenSpec Default Layout

**Reason**: OpenSpec is no longer the default SDD of a neutral generated project. SDD provisioning is optional and belongs to a selected variant or extension.

**Migration**: The neutral generated foundation no longer contains an `openspec/` tree. Existing generated repositories are not migrated by this change; future SDD integrations provide their own content through the extension or variant contract.

### Requirement: Importable Foundation Specs

**Reason**: Importable OpenSpec specs under `template/openspec/specs/` make a concrete SDD an implicit neutral capability.

**Migration**: Remove the generated OpenSpec baseline from `template/`. SDD-specific baseline specs must be supplied by an explicitly selected contribution.

### Requirement: Starter Changes Are Not Imported

**Reason**: The neutral template no longer provisions an OpenSpec changes directory. The broader safety rule that root starter-maintenance changes are never copied remains part of the starter renderer and separation contracts.

**Migration**: Retain root `openspec/changes/` for starter development, but validate the neutral output for absence of starter OpenSpec content rather than for an empty generated OpenSpec changes path.

### Requirement: Generated OpenSpec Configuration

**Reason**: A generated `template/openspec/config.yaml` would make OpenSpec an inherent generated-project capability.

**Migration**: Remove `template/openspec/config.yaml`. An explicitly selected variant or future extension may provide a complete SDD configuration as its own contribution.

### Requirement: Generated Local OpenSpec Tooling

**Reason**: OpenSpec dependencies and `ospec` scripts must not be required by a neutral generated project.

**Migration**: Remove the generated OpenSpec dependency and scripts from `template/package.json` and its lockfile. Keep root starter-repository OpenSpec tooling unchanged.
