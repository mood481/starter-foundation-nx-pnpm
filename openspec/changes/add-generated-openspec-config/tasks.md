## Execution Plan

### Generated OpenSpec config

- [ ] Create `template/openspec/config.yaml`.
- [ ] Define generated-project `schema: spec-driven`.
- [ ] Add neutral generated-project context using project and starter placeholders.
- [ ] Add editable project-specific context prompts for domain, users, runtime stack, delivery constraints, and terminology.
- [ ] Add lightweight generated-project authoring rules for proposals.
- [ ] Add lightweight generated-project authoring rules for specs.
- [ ] Add lightweight generated-project authoring rules for designs.
- [ ] Add lightweight generated-project authoring rules for tasks.

### Local generated-project OpenSpec tooling

- [ ] Add `@fission-ai/openspec` `~1.4.0` to `template/package.json` dev dependencies.
- [ ] Add generated-project `ospec` script.
- [ ] Add generated-project `ospec:validate` script.
- [ ] Add generated-project `validate:spec` script.
- [ ] Update generated-project `validate` to run `pnpm validate:spec` before workspace checks.
- [ ] Update `template/pnpm-lock.yaml` for the added OpenSpec dependency.

### Specs and documentation

- [ ] Update `template/openspec/specs/sdd-layout/spec.md` to include generated `openspec/config.yaml`.
- [ ] Update `template/openspec/specs/quality-gates/spec.md` to include generated OpenSpec validation scripts.
- [ ] Update starter-repository `sdd-contract` and `quality-gates` through delta specs.
- [ ] Update generated-project documentation to mention `openspec/config.yaml` and local OpenSpec commands.
- [ ] Confirm no variant, overlay, or module-specific content is introduced.

## Validation

### OpenSpec validation

- [ ] Run `pnpm ospec validate add-generated-openspec-config --strict`.
- [ ] Run `pnpm ospec validate --all --strict`.

### Template validation

- [ ] Run `pnpm validate:template` to exercise `tools/scripts/validate-template-render.mjs` against the updated template.
- [ ] Confirm rendered `openspec/config.yaml` contains no unresolved placeholders.
- [ ] Confirm rendered generated-project `pnpm validate` runs local OpenSpec validation.
- [ ] Confirm generated-project OpenSpec content remains under `template/openspec/`.
- [ ] Confirm root starter-maintenance active changes are not copied into generated projects.
