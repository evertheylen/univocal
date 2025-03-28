#!/bin/bash

# Stop at first error
set -e

# Build all typescript
pnpm -r exec tsc -b .

# Run all tests
pnpm -r test

# Publish!
pnpm -r publish --access public
