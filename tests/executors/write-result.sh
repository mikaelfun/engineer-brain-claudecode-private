#!/usr/bin/env bash
# tests/executors/write-result.sh — Write test result from agent
#
# Usage: bash tests/executors/write-result.sh <round> <test-id> <status> <assertions-json> [error] [duration_ms]
# Example: bash tests/executors/write-result.sh 0 dashboard-navigation pass '[{"name":"nav","pass":true}]' null 5000
#
# Used by sub-agents after completing UI/visual tests via Playwright.
# Agents construct the assertions JSON and call this script to write results.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

ROUND="${1:?Usage: write-result.sh <round> <test-id> <status> <assertions-json> [error] [duration_ms]}"
TEST_ID="${2:?Missing test-id}"
STATUS="${3:?Missing status (pass|fail|skip)}"
ASSERTIONS="${4:?Missing assertions JSON}"
ERROR="${5:-null}"
DURATION="${6:-0}"

write_result "$ROUND" "$TEST_ID" "$STATUS" "$ASSERTIONS" "$ERROR" "$DURATION"
log_info "Result written for $TEST_ID: $STATUS"
