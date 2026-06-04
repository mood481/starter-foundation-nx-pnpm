# MWS Foundation

This repository was generated with the `mws` variant of `__STARTER_ID__` version `__STARTER_VERSION__`.

## Project Metadata

MWS foundation metadata is stored at the repository root in `mws.project.yaml`.

The metadata identifies:

- project id: `__PROJECT_ID__`
- project name: `__PROJECT_NAME__`
- project slug: `__PROJECT_SLUG__`
- selected variant: `mws`
- lifecycle phase: `foundation`

## Foundation Scope

The MWS variant adds foundation metadata, documentation, OpenSpec lifecycle expectations, and stricter OpenSpec authoring rules. It does not add applications, services, APIs, workers, packages, infrastructure, auth, storage, eventing, or observability modules.

Later MWS modules and capabilities should be added through dedicated module starters and OpenSpec changes.

## Rendering

The `mws` variant is selected by the starter renderer through structured render input. MWS-specific values such as `PROJECT_ID` are provided through the render input file, not through placeholder-specific command-line flags.
