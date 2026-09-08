## REMOVED Requirements

### Requirement: Starter Render Command

**Reason**: The repository no longer ships its own render command; generation is performed by the canonical `@mood481/starter-renderer` (`starter-render`).

**Migration**: Invoke `starter-render` (or the package's `starter-foundation-render` shim that delegates to it) per the canonical toolkit contract; see `starter-toolkit-integration`.

### Requirement: Structured Render Input

**Reason**: Render-input document shape and validation are owned by `@mood481/starter-contracts` and validated by `@mood481/starter-validator`.

**Migration**: Author canonical `render.yaml` inputs and validate them with `starter-validate --type render`.

### Requirement: Variant Selection

**Reason**: Variant selection semantics are part of the canonical renderer contract, not this starter repository.

**Migration**: Select variants through the canonical `starter-render` CLI or `render.yaml`.

### Requirement: Placeholder Resolution

**Reason**: Placeholder resolution is implemented by the canonical renderer.

**Migration**: Rely on `starter-render` for scalar placeholder resolution per the canonical contract.

### Requirement: Template And Overlay Rendering

**Reason**: Template copying and overlay application are canonical renderer responsibilities.

**Migration**: The canonical renderer applies `template/` and the selected variant overlay.

### Requirement: Render Output Safety

**Reason**: Output-safety guarantees belong to the canonical renderer.

**Migration**: Canonical `starter-render` enforces output safety.

### Requirement: Render Input Examples

**Reason**: Example render inputs are governed by the canonical starter/toolkit contract and the companion extensions change.

**Migration**: Keep `examples/render.neutral.yaml` and `examples/render.mws.yaml` as canonical `render.yaml` inputs validated with `--type render`.

### Requirement: CLI Output Path

**Reason**: CLI `--output`/`--paths` handling is defined by the canonical renderer CLI.

**Migration**: Use the canonical `starter-render` output/path options.

### Requirement: CLI Placeholder Assignment

**Reason**: `--set` assignment semantics belong to the canonical renderer CLI.

**Migration**: Use canonical `starter-render --set KEY=value`.

### Requirement: Npx Invocation Parity

**Reason**: The local renderer being replaced is gone; parity is now between the package's delegation shim and the canonical renderer.

**Migration**: `starter-foundation-render` delegates to `starter-render`; parity is specified under `starter-toolkit-integration`.

### Requirement: CLI Inline Mode Rendering Contract

**Reason**: Inline CLI-mode rendering is a canonical renderer behavior.

**Migration**: Follow the canonical `starter-render` CLI contract.

### Requirement: CLI Extension Selection

**Reason**: Render-time extension selection is owned by the canonical renderer and the toolkit render-extension contract, not this repository.

**Migration**: Extension selection follows the canonical toolkit contract; repository extension ownership is retired in the companion change.

### Requirement: Render Pipeline Ordering

**Reason**: Template/overlay/extension/placeholder pipeline ordering is defined by the canonical renderer.

**Migration**: Follow the canonical renderer pipeline.
