# MWS Foundation

This repository was generated with the `mws` variant of `starter-foundation-nx-pnpm` version `__VERSION__`.

## Project Metadata

MWS foundation metadata is stored at the repository root in `mws.project.yaml`.

The metadata identifies:

- project id: `__PROJECT_ID__`
- project name: `__PROJECT_NAME__`
- project slug: `__PROJECT_SLUG__`
- selected variant: `mws`
- lifecycle phase: `foundation`

## Foundation Scope

The `mws` variant contributes only MWS foundation metadata and MWS foundation documentation. It does not add applications, services, APIs, workers, packages, infrastructure, auth, storage, eventing, or observability modules, and it does not bundle or imply an OpenSpec/SDD baseline. Any SDD integration in a generated project comes from an explicitly selected external extension resolved through the canonical `@mood481/starter-renderer` under the toolkit render-extension contract; the variant itself makes no SDD assumption.

Later MWS modules and capabilities should be added through dedicated module starters, not by adding SDD content to the `mws` overlay.

## Rendering

The `mws` variant is selected by the canonical `starter-render` through the MWS render request (for example `examples/render.mws.yaml`). MWS-specific values such as `PROJECT_ID` are provided through the render request's placeholders, not through placeholder-specific command-line flags.
