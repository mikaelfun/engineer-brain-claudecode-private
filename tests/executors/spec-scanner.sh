#!/usr/bin/env bash
# tests/executors/spec-scanner.sh — Spec-Driven Test Gap Scanner
#
# Scans conductor/tracks/*/spec.md acceptance criteria and compares
# against existing test registry to find untested criteria.
#
# Usage: bash tests/executors/spec-scanner.sh
# Output: SPEC_SCAN|{gap_count}|{details}
#         Each gap: SPEC_GAP|{trackId}|{criterion}|{suggested_category}
#
# Only scans tracks with status "complete" or "in-progress" in metadata.json.
#
# Implementation: delegates to spec-scanner.js (Node.js) to avoid
# grep -qiF SIGABRT on Git Bash (MSYS2). Node.js loads all registry
# YAMLs into memory once for fast batch matching.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

log_info "=== Spec-Driven Test Gap Scanner ==="

# Delegate to Node.js implementation
exec node "$SCRIPT_DIR/spec-scanner.js"
