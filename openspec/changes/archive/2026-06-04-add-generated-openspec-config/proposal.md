## Why

Generated projects receive OpenSpec specs, changes, and archive directories, but they do not yet receive an OpenSpec configuration file or local OpenSpec CLI tooling.

Maintainers need generated projects to start with consistent, lightweight OpenSpec rules and be able to validate those rules locally, while leaving project-specific context open for the actual domain, users, runtime choices, and delivery constraints.

## What Changes

- Add `template/openspec/config.yaml` as importable generated-project OpenSpec configuration.
- Define `schema: spec-driven` for generated projects.
- Add neutral generated-project context with placeholders for project identity and starter provenance.
- Add explicit project-specific context sections that generated-project maintainers can complete after generation.
- Add default generated-project OpenSpec authoring rules that are lighter than the starter-maintenance root rules.
- Add `@fission-ai/openspec` `~1.4.0` as a generated-project development dependency.
- Add basic generated-project OpenSpec scripts: `ospec`, `ospec:validate`, and `validate:spec`.
- Include generated OpenSpec validation in generated-project `pnpm validate`.
- Cover the generated OpenSpec config through the existing root rendered-template validation script, `tools/scripts/validate-template-render.mjs`, so unresolved placeholders fail validation.
- Document the generated OpenSpec config and local OpenSpec commands in importable specs and generated-project docs.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `sdd-contract`: generated projects receive an importable OpenSpec config file and local OpenSpec CLI tooling.
- `quality-gates`: generated-project validation includes spec validation through local OpenSpec scripts.

## Impact

- Affected generated-template files: `template/openspec/config.yaml`, `template/package.json`, `template/pnpm-lock.yaml`, `template/openspec/specs/sdd-layout/spec.md`, `template/openspec/specs/quality-gates/spec.md`, and generated-project documentation.
- Affected starter-repository specs: `sdd-contract` and `quality-gates`.
- Affected validation behaviour: `pnpm validate:template` must render and scan `template/openspec/config.yaml` through `tools/scripts/validate-template-render.mjs`; generated-project validation must run local OpenSpec strict validation.

## Out of Scope

- Do not introduce concrete variants.
- Do not define an overlay mechanism.
- Do not add `mws` or any other variant.
- Do not add domain-specific application, service, API, auth, storage, observability, or infrastructure rules.
- Do not copy root starter-maintenance active changes into generated projects.
- Do not include OpenCode commands, skills, or other human-assistant tooling in the generated template.

## Risks

- A generated-project config that is too specific would constrain projects incorrectly.
- A generated-project config that is too vague would not improve consistency enough.
- Placeholder usage in config must remain compatible with the current double-underscore render contract.
- Adding OpenSpec as a generated-project dependency requires keeping `template/pnpm-lock.yaml` reproducible.
