#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_PATH="$(dirname "$SCRIPT_DIR")/dashboard/node_modules" node "$SCRIPT_DIR/feature-map-writer.js" "$@"
