## ADDED Requirements

### Requirement: Extension Declaration Contract

The starter repository SHALL define a versionable contract for declaring and selecting zero or more optional extensions without coupling extension identity to a repository-local directory.

#### Scenario: Zero extensions is the default

- **WHEN** a render request omits `extensions` or declares `extensions: []`
- **THEN** the effective extension selection SHALL be empty
- **AND** rendering SHALL proceed without resolving or applying an extension.

#### Scenario: Starter metadata declares extension descriptors

- **WHEN** `starter.yaml` declares an extension entry
- **THEN** each entry SHALL declare an extension name/id matching the shared extension-name grammar
- **AND** it SHALL declare a semantic `version`
- **AND** it SHALL declare a `source` kind and source-specific locator data
- **AND** the contract SHALL support an npm-shaped declaration using `source: npm`, `package`, and `version` fields
- **AND** the contract MUST NOT require the source to be under `extensions/<name>/` in this repository.

#### Scenario: Render input selects declared extension names

- **WHEN** a render request declares `extensions`
- **THEN** the value SHALL be a list of extension names matching the shared extension-name grammar
- **AND** each name SHALL resolve through the corresponding starter declaration or configured external provider
- **AND** the selected declaration SHALL supply its version and source locator to the resolver.

#### Scenario: Extension-name validation is shared across input forms

- **WHEN** extension names are read from `starter.yaml`, structured render input, or `--extensions`
- **THEN** the same name grammar SHALL be used
- **AND** empty names, malformed names, and duplicate names MUST be rejected before rendering.

#### Scenario: Extension-name grammar is stable

- **WHEN** an extension name is validated
- **THEN** it SHALL match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- **AND** it SHALL be compared case-sensitively.

#### Scenario: Starter metadata has no bundled extension by default

- **WHEN** the 0.5.0 starter metadata is inspected
- **THEN** its `extensions` field SHALL be an empty list (`[]`)
- **AND** its extension-group map SHALL be empty unless a generic group rule is explicitly needed
- **AND** its `provides` list SHALL include `extension-support`
- **AND** no concrete extension descriptor or extension artifact SHALL be bundled.

### Requirement: Extension Manifest Contract

An extension manifest SHALL declare the information needed to validate and compose an optional capability.

#### Scenario: Extension identity and compatibility are declared

- **WHEN** an extension is resolved
- **THEN** its manifest SHALL declare `id` and `version`
- **AND** it SHALL declare compatibility with the foundation starter version
- **AND** it SHALL be able to declare required starter capabilities
- **AND** it SHALL be able to declare allowed or excluded variant ids without becoming a variant.

#### Scenario: Extension contributions are declared

- **WHEN** an extension is resolved
- **THEN** its manifest SHALL declare zero or more file or overlay contributions
- **AND** it SHALL declare zero or more supported structured mutations
- **AND** contribution paths SHALL be relative to the resolved extension artifact or provider-defined artifact root
- **AND** the manifest MUST NOT require physical co-location in the starter repository.

#### Scenario: Extension validation expectations are declared

- **WHEN** an extension is resolved
- **THEN** its manifest SHALL be able to declare validation expectations for the generated result
- **AND** those expectations SHALL be additive to neutral and variant validation
- **AND** they MUST NOT weaken base safety, placeholder, or workspace validation.

### Requirement: Extension Resolution And Compatibility

The renderer SHALL resolve selected extensions through a source-agnostic resolver boundary and validate their requirements before writing generated output.

#### Scenario: Resolver receives source information

- **WHEN** the renderer resolves a non-empty extension selection
- **THEN** it SHALL resolve each selected name to its declared id, version, source kind, and source locator
- **AND** it SHALL pass those values to a resolver/provider boundary
- **AND** the boundary SHALL be capable of obtaining an extension artifact from outside this starter repository
- **AND** the renderer SHALL not hardcode npm or another remote registry as the only provider.

#### Scenario: Unknown extension fails clearly

- **WHEN** no configured resolver can resolve a selected extension
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify the extension id, requested version, and source locator
- **AND** the error SHALL explain that no extension provider resolved the selection.

#### Scenario: Compatibility requirements are checked

- **WHEN** a selected extension resolves
- **THEN** the renderer SHALL validate its starter-version range against the current starter
- **AND** it SHALL validate required starter capabilities against `starter.yaml` `provides`
- **AND** it SHALL validate any declared variant allow or deny constraints against the selected variant
- **AND** an incompatible selection MUST fail before output writes.

#### Scenario: Extension groups are optional

- **WHEN** `starter.yaml` declares an extension group with a cardinality rule
- **THEN** the renderer SHALL enforce that rule for selected extensions in the group
- **AND** when no group is declared, the extension SHALL not be assigned an implicit group constraint
- **AND** no SDD group SHALL be required by the neutral foundation.

### Requirement: Extension Composition And Determinism

The renderer SHALL compose selected extensions deterministically and independently from variant selection.

#### Scenario: Extensions are canonically ordered

- **WHEN** multiple extensions resolve successfully
- **THEN** the renderer SHALL sort them by a stable canonical key beginning with extension id and including version and source locator
- **AND** the resulting contribution order SHALL not depend on filesystem enumeration order or resolver completion order.

#### Scenario: Duplicate extension declarations fail deterministically

- **WHEN** a render request declares the same extension id more than once
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify the duplicate id and each declaration
- **AND** the renderer SHALL not silently choose first-wins or last-wins semantics.

#### Scenario: Conflicting file contributions fail deterministically

- **WHEN** two extension contributions target the same generated file path
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify both extensions and the path
- **AND** an extension contribution MUST NOT replace a complete shared file implicitly.

#### Scenario: Extension contributions do not merge with variant identity

- **WHEN** a render request selects both a variant and extensions
- **THEN** the variant SHALL retain its variant identity and overlay semantics
- **AND** each extension SHALL retain its extension identity and manifest semantics
- **AND** no MWS-specific extension or SDD policy SHALL be inferred.

### Requirement: Structured Extension Mutations

The extension contract SHALL reserve a narrow structured mutation model for augmenting shared configuration without whole-file replacement.

#### Scenario: Package metadata mutations are explicit

- **WHEN** an extension needs to update the generated root `package.json`
- **THEN** it SHALL use a structured `packageJson` mutation section
- **AND** that section SHALL support `dependencies`, `devDependencies`, and `scripts` maps
- **AND** dependency values and script values SHALL be strings
- **AND** the extension SHALL not contribute `package.json` as a replacement file.

#### Scenario: Mutations are applied after files and before placeholders

- **WHEN** selected extensions declare valid package metadata mutations
- **THEN** the renderer SHALL parse the existing root `package.json`
- **AND** merge only the supported maps
- **AND** preserve unrelated package metadata
- **AND** write the resulting structured file before placeholder resolution.

#### Scenario: Mutation conflicts fail safely

- **WHEN** selected extensions assign different values to the same dependency, devDependency, or script key
- **THEN** rendering MUST fail before generated files are written
- **AND** the error SHALL identify the conflicting extensions and key
- **AND** the renderer SHALL not apply arbitrary last-wins mutation semantics.

#### Scenario: Generic patch languages are not required

- **WHEN** an extension declares structured mutations
- **THEN** the renderer SHALL reject unsupported mutation paths or arbitrary patch operations
- **AND** the initial contract MUST NOT require a generic JSON/YAML patch engine.

### Requirement: No Concrete Extension In This Change

The 0.5.0 change SHALL define the extension contract without implementing or bundling a production extension.

#### Scenario: No production extension is declared

- **WHEN** the starter repository and rendered neutral template are inspected
- **THEN** no concrete extension SHALL be declared in `starter.yaml`
- **AND** no extension artifact SHALL be added under `template/` or a repository-local extension directory
- **AND** no OpenSpec extension SHALL be introduced.

#### Scenario: Empty-extension rendering is fully supported

- **WHEN** a neutral render uses `extensions: []`
- **THEN** it SHALL follow the existing output safety, placeholder, and validation contract
- **AND** the absence of a production extension SHALL not make the empty-extension render invalid.
