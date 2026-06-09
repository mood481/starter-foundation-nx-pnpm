## Execution Plan

### Spec cleanup

- [x] 1.1 Remove the `Initial variant map remains empty` scenario from `foundation-starter` spec.
- [x] 1.2 Remove the `No concrete variant is introduced` scenario from `foundation-starter` spec.
- [x] 1.3 Reformulate the `Variant Overlay Contract` requirement description and scenarios to use established-contract language instead of future-conditional language.
- [x] 1.4 Change the `MWS variant is declared` scenario trigger from `WHEN this change is implemented` to `WHEN the starter repository is inspected`.
- [x] 1.5 Fill the TBD Purpose section in `mws-foundation-variant/spec.md`.
- [x] 1.6 Fill the TBD Purpose section in `starter-template-renderer/spec.md`.

### Repository cleanup

- [x] 2.1 Create `CHANGELOG.md` documenting all archived changes.

## Validation

- [x] 3.1 Verify `foundation-starter` spec has no TBD or `this change is implemented` references.
- [x] 3.2 Verify `mws-foundation-variant` spec has no TBD references.
- [x] 3.3 Verify `starter-template-renderer` spec has no TBD references.
- [x] 3.4 Verify `CHANGELOG.md` exists and lists all archived changes.
- [x] 3.5 Run `pnpm validate:spec`.
- [x] 3.6 Run `pnpm validate`.
- [x] 3.7 Run `pnpm validate:template:mws`.
- [x] 3.8 Confirm no generated-template files under `template/` are changed.