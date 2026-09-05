# Validation Guide

## Overview

This document describes the validation expectations for the generated project.

## Validation Commands

### Full Validation

```bash
pnpm validate
```

Runs the complete workspace validation suite: linting, type checking, and testing.

### Individual Checks

```bash
pnpm lint        # Lint all projects
pnpm typecheck   # Type check all projects
pnpm test        # Test all projects
```

## Dependency Installation

Dependencies should install reproducibly:

```bash
pnpm install --frozen-lockfile
```

## Nx Project Graph

Nx should produce a valid project graph:

```bash
pnpm nx graph --file=tmp/nx-graph.json
```

## Placeholder Validation

After rendering, no unresolved double-underscore placeholders should remain. Scan generated files for double-underscore placeholder tokens.

## Neutral Boundary Validation

The neutral foundation should not contain:

- Concrete variant directories
- Variant-specific metadata files
- Module-specific files (API, mobile, web, auth, etc.)
- A concrete SDD provider, SDD configuration, or SDD-specific package script

An explicitly selected variant or extension may add its own additive
validation and capability-specific files.
