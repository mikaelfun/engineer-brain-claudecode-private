#!/usr/bin/env bash
# generator.sh — Synthetic case data generator (thin wrapper → generator.js)
# Usage: generator.sh <profile-name> [seed]
# Output: tests/fixtures/synthetic/generated/syn-{profile}-{hash}/
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/generator.js" "$@"
