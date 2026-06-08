## Why

Several canonical specs and repository files have stale or placeholder content after archiving recent changes. The `foundation-starter` spec contains scenarios that describe transitional states (empty variant map, no concrete variant) which contradict the current repository state where the `mws` variant is already declared. Two specs (`mws-foundation-variant` and `starter-template-renderer`) have TBD placeholder Purpose sections left from archiving. The README references `CHANGELOG.md` but it does not exist. These issues reduce spec coherence and make the repository harder to review.

## What Changes

- Remove obsolete `foundation-starter` scenarios that describe transitional states no longer accurate (`Initial variant map remains empty`, `No concrete variant is introduced`).
- Reformulate `foundation-starter` scenarios that use conditional "future variant" language to reflect the current established contract (variants can now be declared, overlays can exist, config replacement is established).
- Change the `MWS variant is declared` scenario trigger from `this change is implemented` to a stable `WHEN` clause.
- Fill in the TBD Purpose sections in `mws-foundation-variant/spec.md` and `starter-template-renderer/spec.md`.
- Create `CHANGELOG.md` documenting all archived changes.

## Capabilities

### New Capabilities

(None.)

### Modified Capabilities

- `foundation-starter`: remove obsolete transitional scenarios and reformulate variant overlay contract scenarios to reflect established contract.
- `mws-foundation-variant`: fill in TBD Purpose section.
- `starter-template-renderer`: fill in TBD Purpose section.

## Impact

- Affected starter-repository files: `CHANGELOG.md` (new), three spec files under `openspec/specs/`.
- Affected specs: `foundation-starter`, `mws-foundation-variant`, `starter-template-renderer`.
- No generated-template files under `template/` are affected.
- No validation behaviour changes.

## Out of Scope

- Do not add new capabilities, modules, or variants.
- Do not modify `starter.yaml`, `README.md`, or `VALIDATION.md`.
- Do not modify generated-project files or rendering logic.

## Risks

- Minimal risk: this change only coheres existing specs and adds a changelog. No structural or behavioural changes.
- Removing transitional scenarios from `foundation-starter` may affect reviewers who reference those scenarios as historical context, but they remain in git history.