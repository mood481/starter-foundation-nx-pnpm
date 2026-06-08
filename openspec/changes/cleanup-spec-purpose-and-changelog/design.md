## Context

After archiving several changes, the canonical specs have stale or placeholder content. The `foundation-starter` spec contains scenarios from the `define-variant-overlay-contract` change that describe transitional states (`variants: {}` empty, no concrete variant, no `variants/` directory) which contradict the current repository state where `mws` is a declared variant with an overlay directory. Two specs left TBD in their Purpose section from the archiving process. The README references a `CHANGELOG.md` that does not exist.

## Goals / Non-Goals

**Goals:**

- Remove transitional scenarios from `foundation-starter` that are no longer accurate.
- Reformulate variant overlay contract scenarios to use established-contract language instead of future-conditional language.
- Fill TBD Purpose sections in `mws-foundation-variant` and `starter-template-renderer`.
- Create `CHANGELOG.md` with all archived changes documented.

**Non-Goals:**

- Do not add new capabilities, modules, or variants.
- Do not modify `starter.yaml`, `README.md`, `VALIDATION.md`, or any generated-template files.
- Do not change validation commands or rendering behaviour.

## Decisions

### Decision: Remove two obsolete scenarios from foundation-starter

Remove `Initial variant map remains empty` and `No concrete variant is introduced` — they describe a transitional state that no longer applies now that the `mws` variant exists.

### Decision: Reformulate remaining Variant Overlay Contract scenarios

Change conditional "future variant"/"future overlay" language to present-tense established-contract language. The contract is no longer aspirational; it is now active.

### Decision: Change MWS variant declaration scenario trigger

The `MWS variant is declared` scenario says `WHEN this change is implemented`. Change to `WHEN the starter repository is inspected` for stability.

### Decision: Fill Purpose TBDs with descriptive summaries

Replace TBD Purpose placeholders with concise descriptions of each spec's scope.

### Decision: Create CHANGELOG.md

Document all archived changes in a changelog referenced by README.md.

## Constraints

- Do not modify `starter.yaml`.
- Do not modify generated-template files under `template/`.
- Do not modify `README.md` or `VALIDATION.md`.
- Do not add or remove spec requirements — only modify existing ones and fill placeholders.
- Use `variant` and `overlay` terminology; do not introduce `flavour`.

## Alternatives Considered

### Keep transitional scenarios with a note

Rejected because transitional scenarios that contradict the repository state reduce spec coherence and confuse reviewers.

### Add new scenarios instead of modifying existing ones

Rejected because the relevant requirement already exists; modifying is cleaner than adding duplicates.

## Risks / Trade-offs

- Removing scenarios changes the spec audit trail, but those scenarios describe a state that no longer exists. Git history preserves them.
- Minimal risk overall: no behavioural or structural changes.

## Validation Strategy

- Run `pnpm validate:spec` to confirm all specs pass strict validation.
- Run `pnpm validate` to confirm full validation still passes.
- Confirm no TBD sections remain in any main spec.
- Confirm `CHANGELOG.md` exists and documents all archived changes.
- Confirm the `MWS variant is declared` scenario uses a stable WHEN clause.