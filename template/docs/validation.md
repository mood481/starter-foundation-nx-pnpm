# Validation Guide

## Overview

This document describes the validation expectations for the generated project.

## Validation Commands

### Full Validation

```bash
pnpm validate
```

Runs the complete validation suite: linting, type checking, and testing.

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

After rendering, no unresolved double-underscore placeholders should remain. Scan for patterns like `__PLACEHOLDER_NAME__` in generated files.

## Neutral Boundary Validation

The generated project should not contain:

- Concrete variant directories
- Variant-specific metadata files
- Module-specific files (API, mobile, web, auth, etc.)
