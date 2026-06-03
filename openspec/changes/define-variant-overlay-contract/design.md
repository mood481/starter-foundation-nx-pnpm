## Context

The starter currently declares `variants: {}` and uses `variant` and `overlay` terminology, but the metadata contract for future variants is not formalized.

The next concrete variant may be `mws`, but this change deliberately defines only the neutral contract that such a future variant would use. The contract needs to cover generated `openspec/config.yaml` explicitly because variants may need stricter OpenSpec rules than the neutral template.

## Goals / Non-Goals

Goals:

- Define how variants are represented in `starter.yaml`.
- Define how overlays are referenced from variant metadata.
- Define overlay application order at a high level.
- Define deterministic full-file replacement semantics for generated `openspec/config.yaml`.
- Define validation expectations for future variants.
- Preserve the neutral foundation with no concrete variants.

Non-goals:

- Do not add `mws`.
- Do not add any `variants/` directory.
- Do not implement a renderer.
- Do not define YAML merge or patch semantics for OpenSpec config.
- Do not add modules or application capabilities.

## Decisions

### Decision: Keep `variants` as a map keyed by variant id

Future variants should be declared under `starter.yaml` as a map keyed by kebab-case variant id.

The current value remains empty:

```yaml
variants: {}
```

A future variant would use a shape like:

```yaml
variants:
  example:
    name: Example Variant
    description: Example variant description.
    overlay:
      path: variants/example/overlay
    validations:
      - pnpm validate:template:example
```

This example documents shape only; this change must not add such an entry.

### Decision: Use overlay paths relative to starter root

Overlay paths should be relative to the starter repository root, not relative to `template/`. This keeps overlay sources separate from neutral generated-template files.

### Decision: Apply overlays before placeholder rendering

The conceptual render order is:

```txt
template/ base
    │
    ▼
variant overlay files, if selected
    │
    ▼
placeholder rendering
    │
    ▼
validation
```

Overlay files may add or replace generated files according to deterministic renderer semantics. Validation must prove the effective rendered output is complete and contains no unresolved placeholders.

### Decision: Treat `openspec/config.yaml` replacement as full-file replacement

If an overlay contains `openspec/config.yaml`, it replaces the neutral generated `openspec/config.yaml` as a complete file.

Do not define YAML merge, patch, or partial override semantics. Full-file replacement is easier to validate, easier for deterministic automation, and easier for humans to review.

### Decision: Require overlay OpenSpec config to preserve base guarantees

An overlay-provided `openspec/config.yaml` must satisfy the generated-project OpenSpec config contract:

- declare `schema: spec-driven`;
- identify generated project context and starter provenance after rendering;
- avoid copying starter-maintenance root context;
- preserve neutral safety boundaries such as no unresolved placeholders and no root active changes imported into generated projects;
- preserve or strengthen authoring and validation rules;
- remain renderable through the same placeholder contract;
- validate through rendered-template or variant validation.

Variants may add stricter rules, especially for deterministic automation, but must not weaken the base validation and safety guarantees.

### Decision: Variants may add validation commands

Future variants may declare additional validation commands. They must not remove or weaken the base validations declared by the neutral starter unless a later approved change modifies the contract.

## Constraints

- `variants` remains empty in this change.
- No concrete variant directory is created.
- No `variants/mws/` directory is created.
- No variant-specific metadata file is created outside `starter.yaml`.
- Use `variant` and `overlay`, not `flavour`.
- Future variants must not require changing the neutral `template/` contract unless explicitly approved.
- Overlay-provided `openspec/config.yaml` files use full-file replacement, not merge semantics.

## Repository Structure

No new directory is created by this change.

Future variant directories, if approved, should use a structure like:

```txt
variants/
└── <variant-id>/
    └── overlay/
        └── ...generated files...
```

If a future variant provides a stricter OpenSpec config, it should use:

```txt
variants/
└── <variant-id>/
    └── overlay/
        └── openspec/
            └── config.yaml
```

## Rendering Model

This change defines metadata expectations, not renderer implementation.

The renderer contract should remain deterministic:

- choose neutral template;
- apply selected variant overlay if declared;
- replace any colliding generated file by the overlay file, including `openspec/config.yaml`;
- render placeholders;
- fail on unresolved placeholders;
- run base validations and variant validations.

## Migration Plan

No migration is required because no concrete variants exist yet.

If previous drafts use `flavour`, rename them to `variant` before future variant implementation.

## Alternatives Considered

### Define `mws` immediately

Rejected because a concrete variant should be reviewed independently after the neutral contract is clear.

### Put overlays under `template/`

Rejected because neutral template content and optional variant content should remain separate.

### Merge OpenSpec config YAML

Rejected because merge semantics introduce ambiguity around rule precedence and deletions. Full-file replacement is explicit and deterministic.

### Require every variant to have an overlay

Rejected because a future variant may be metadata-only or validation-only.

## Risks / Trade-offs

- Deferring generic renderer implementation leaves some details for later -> acceptable because this change defines metadata and validation expectations.
- Allowing metadata-only variants creates flexibility but requires validation to distinguish declared variants from overlay-backed variants.
- Full-file config replacement can duplicate neutral rules -> acceptable because it makes stricter variant config reviewable as one effective file.
- Keeping `variants` empty means the contract is not exercised by a concrete variant until a follow-up change.

## Validation Strategy

- Validate `starter.yaml` still declares `variants: {}`.
- Validate no `variants/` directory exists.
- Validate no `variants/mws/` directory exists.
- Validate docs/specs use `variant` and `overlay` terminology.
- Validate docs/specs describe full-file `openspec/config.yaml` replacement.
- Run strict OpenSpec validation.
- Run repository validation.
