#!/bin/bash
set -e
echo "Running Type Check..."
npm run typecheck
echo "Running Build..."
npm run build
echo "Build Verified!"
