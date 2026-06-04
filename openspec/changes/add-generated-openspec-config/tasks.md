## Execution Plan

### Generated OpenSpec config

- [x] Create `template/openspec/config.yaml`.
- [x] Define generated-project `schema: spec-driven`.
- [x] Add neutral generated-project context using project and starter placeholders.
- [x] Add editable project-specific context prompts for domain, users, runtime stack, delivery constraints, and terminology.
- [x] Add lightweight generated-project authoring rules for proposals.
- [x] Add lightweight generated-project authoring rules for specs.
- [x] Add lightweight generated-project authoring rules for designs.
- [x] Add lightweight generated-project authoring rules for tasks.

### Local generated-project OpenSpec tooling

- [x] Add `@fission-ai/openspec` `~1.4.0` to `template/package.json` dev dependencies.
- [x] Add generated-project `ospec` script.
- [x] Add generated-project `ospec:validate` script.
- [x] Add generated-project `validate:spec` script.
- [x] Update generated-project `validate` to run `pnpm validate:spec` before workspace checks.
- [x] Update `template/pnpm-lock.yaml` for the added OpenSpec dependency.

### Specs and documentation

- [x] Update `template/openspec/specs/sdd-layout/spec.md` to include generated `openspec/config.yaml`.
- [x] Update `template/openspec/specs/quality-gates/spec.md` to include generated OpenSpec validation scripts.
- [x] Update starter-repository `sdd-contract` and `quality-gates` through delta specs.
- [x] Update generated-project documentation to mention `openspec/config.yaml` and local OpenSpec commands.
- [x] Confirm no variant, overlay, or module-specific content is introduced.

## Validation

### OpenSpec validation

- [x] Run `pnpm ospec validate add-generated-openspec-config --strict`.
- [x] Run `pnpm ospec validate --all --strict`.

### Template validation

- [x] Run `pnpm validate:template` to exercise `tools/scripts/validate-template-render.mjs` against the updated template.
- [x] Confirm rendered `openspec/config.yaml` contains no unresolved placeholders.
- [x] Confirm rendered generated-project `pnpm validate` runs local OpenSpec validation.
- [x] Confirm generated-project OpenSpec content remains under `template/openspec/`.
- [x] Confirm root starter-maintenance active changes are not copied into generated projects.
