## REMOVED Requirements

### Requirement: Extension Declaration Contract

**Reason**: Extension declaration/selection is now defined by the canonical toolkit render-extension contract (`@mood481/starter-contracts`) and applied by `@mood481/starter-renderer`; this starter no longer owns or implements it, and `starter.yaml` carries no repository extension-declaration block.

**Migration**: Declare/select extensions through the toolkit render-extension contract and the canonical renderer; extension artifacts live in external repositories resolved at render time. The repository-local `starter.yaml` extension declarations are removed with this change.

### Requirement: Extension Manifest Contract

**Reason**: The extension manifest schema belongs to the toolkit (`render-extension.schema.json`), not to this starter repository.

**Migration**: Author extension manifests against the toolkit render-extension contract in the external extension repository.

### Requirement: Extension Resolution And Compatibility

**Reason**: Extension resolution, provider boundaries, and compatibility checks are performed by the canonical renderer, whose code was removed from this repository.

**Migration**: Rely on `@mood481/starter-renderer` resolution/composition; this starter provides no resolver boundary.

### Requirement: Extension Composition And Determinism

**Reason**: Deterministic composition, duplicate/conflict handling, and ordering are canonical-renderer responsibilities, not this starter's.

**Migration**: Composition and determinism guarantees are defined and enforced by the toolkit renderer.

### Requirement: Structured Extension Mutations

**Reason**: The structured `packageJson` mutation model is part of the toolkit render-extension contract and applied by the canonical renderer.

**Migration**: Express package-metadata mutations through the toolkit render-extension contract; this starter neither defines nor applies them.

### Requirement: No Concrete Extension In This Change

**Reason**: The repository no longer hosts an extension contract at all, so a "no concrete extension in this change" clause is moot here.

**Migration**: The "no bundled concrete extension/OpenSpec" guarantee is still covered by `foundation-template` (`SDD-Neutral Generated Foundation`) and the neutral render validation; the toolkit defines the extension contract.
