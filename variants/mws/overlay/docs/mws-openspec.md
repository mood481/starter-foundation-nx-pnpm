# MWS OpenSpec Operation

This repository uses OpenSpec for spec-driven development. The MWS variant provides stricter local guidance so human changes remain reviewable and deterministic automation can reason about repository state.

## Local Commands

Use the local generated-project OpenSpec scripts:

```bash
pnpm ospec list
pnpm ospec list --specs
pnpm ospec validate --all --strict
pnpm validate:spec
pnpm validate
```

Use `pnpm ospec validate --all --strict --json` when JSON validation output is needed for automation or diagnostics.

## Human Workflow

For human-maintained changes:

- explore the problem and affected specs first;
- create or update OpenSpec proposal, design, specs, and tasks before implementation;
- keep implementation tasks explicit and verifiable;
- run `pnpm validate:spec` before implementation review;
- run `pnpm validate` before accepting a completed change.

## Automation Boundary

Local assistant command packs, interactive helpers, and local agent configuration are not part of the generated template or MWS variant contract.

MWS automation should use deterministic prompts, repository artifacts, structured metadata, and local package scripts. Repository state should be understandable without relying on local assistant-specific files.
