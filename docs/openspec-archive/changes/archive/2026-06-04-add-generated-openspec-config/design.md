## Context

The starter repository has its own `openspec/config.yaml` for maintaining the starter. Generated projects currently receive `template/openspec/specs/`, `template/openspec/changes/`, and `template/openspec/archive/`, but not a generated-project `openspec/config.yaml`.

The generated config must not copy the starter-maintenance context directly. It should establish a neutral OpenSpec baseline for the generated repository, leave project-specific context intentionally editable, and be usable through local generated-project package scripts.

## Goals / Non-Goals

Goals:

- Add generated-project OpenSpec configuration under `template/openspec/config.yaml`.
- Preserve the separation between starter-maintenance OpenSpec and generated-project OpenSpec.
- Use placeholders for generated project identity and starter provenance.
- Provide lightweight default authoring rules for generated-project OpenSpec artifacts.
- Leave domain-specific context open for generated-project maintainers.
- Add local OpenSpec CLI tooling to generated projects.

Non-goals:

- Do not introduce variants or overlays.
- Do not include `mws` assumptions.
- Do not make generated-project OpenSpec context domain-specific.
- Do not replace the root starter-maintenance OpenSpec config.
- Do not include local OpenCode/agent command packs in generated projects.

## Decisions

### Decision: Add config under `template/openspec/`

The generated-project config belongs at `template/openspec/config.yaml` so it becomes `openspec/config.yaml` after rendering.

Root `openspec/config.yaml` continues to govern the starter repository only.

### Decision: Use neutral context plus editable project sections

The generated config should include stable context such as project name, slug, description, starter id, starter version, and the foundation's Nx + pnpm + OpenSpec baseline.

It should also include explicit editable sections for maintainers to fill in after generation:

- domain context;
- users and stakeholders;
- runtime stack decisions;
- delivery, compliance, integration, or operational constraints;
- project-specific terminology.

### Decision: Keep default generated-project rules lighter than root rules

The root starter-maintenance rules are intentionally strict because they protect the starter contract. The generated-project default rules should be lighter and broadly applicable.

Default generated-project rules should require:

- clear proposal sections;
- requirements with scenarios;
- externally observable requirements;
- implementation details in design/tasks rather than specs;
- checkbox tasks;
- explicit validation tasks.

They should not include MWS-specific automation rules, variant-specific constraints, or root starter-maintenance boundaries.

### Decision: Add local OpenSpec package scripts

Generated projects should not depend on a globally installed OpenSpec CLI. Add `@fission-ai/openspec` `~1.4.0` to `template/package.json` and expose local scripts:

```json
{
  "scripts": {
    "ospec": "openspec",
    "ospec:validate": "openspec validate --all --strict",
    "validate:spec": "pnpm ospec:validate"
  }
}
```

JSON validation output remains available through the wrapper when needed:

```bash
pnpm ospec validate --all --strict --json
```

Generated-project `validate` should run spec validation before the existing workspace checks.

### Decision: Let `validate:template` cover config rendering

No special validator is needed for `template/openspec/config.yaml`. The existing root rendered-template validation script, `tools/scripts/validate-template-render.mjs`, is invoked by `pnpm validate:template`; it copies, renders, and scans all template files, so unresolved config placeholders fail the same way as other unresolved placeholders.

## Constraints

- Do not copy root active changes into generated projects.
- Do not make generated config variant-specific.
- Do not use `flavour` terminology.
- Do not require every generated project to be JavaScript or TypeScript beyond shared tooling.
- Do not add concrete module, application, service, API, auth, storage, observability, or infrastructure assumptions.
- Do not include OpenCode commands, skills, or other human-assistant tooling in generated projects.

## Repository Structure

Expected generated-template addition:

```txt
template/
└── openspec/
    ├── config.yaml
    ├── specs/
    ├── changes/
    └── archive/
```

## Template Structure

Rendered generated projects should have:

```txt
openspec/
├── config.yaml
├── specs/
├── changes/
└── archive/
```

## Rendering Model

The config uses the existing double-underscore placeholders. At minimum, it should support:

- `__PROJECT_NAME__`
- `__PROJECT_SLUG__`
- `__PROJECT_DESCRIPTION__`
- `__STARTER_ID__`
- `__STARTER_VERSION__`

Rendered-template validation must fail if any placeholder remains unresolved.

## Migration Plan

No existing generated repositories are migrated by this change. New generated projects receive the config after the change is implemented.

## Alternatives Considered

### Copy root `openspec/config.yaml`

Rejected because root config describes the starter repository, including starter boundaries and variant constraints. Generated projects need a related but separate context.

### Defer config until first variant

Rejected because the generated-project OpenSpec baseline is independent of variants and should exist for every generated project.

### Add config but no local OpenSpec dependency

Rejected because generated projects should be able to validate their OpenSpec artifacts without relying on global tooling.

### Keep generated context empty

Rejected because lightweight rules and provenance context provide immediate value, even when domain details remain open.

## Risks / Trade-offs

- Too much neutral context can feel like boilerplate -> keep context concise and editable.
- Too many rules can slow generated-project authoring -> keep rules lighter than root starter-maintenance rules.
- Future variants may want stricter config guidance -> handle that through the overlay contract and variant-specific full-file config replacement.
- Adding OpenSpec to generated projects increases install size -> acceptable because OpenSpec is the default SDD provider.

## Validation Strategy

- Run strict OpenSpec validation for the change and all specs.
- Run rendered-template validation with `pnpm validate:template`, which uses `tools/scripts/validate-template-render.mjs`.
- Confirm `template/openspec/config.yaml` renders with no unresolved placeholders.
- Confirm generated-project `pnpm validate` runs local OpenSpec strict validation.
- Confirm generated-project OpenSpec content remains under `template/openspec/`.
- Confirm no variant, overlay, or module-specific content is introduced.
