#!/usr/bin/env bash
# tests/executors/learnings-writer.sh — Write env_issue fix to learnings.yaml
#
# Usage: bash tests/executors/learnings-writer.sh <id> <category> <problem> <solution>
# Example: bash tests/executors/learnings-writer.sh "port-mismatch" "env" "Dashboard port wrong" "Use 3010 not 3000"
#
# Appends a new entry to tests/learnings.yaml
# Only for env_issue fixes (code_bug fixes go to results/fixes/)
#
# The FIX agent calls this when it determines a failure was caused by
# an environment/configuration issue rather than a code bug.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
LEARNING_ID="${1:?Usage: learnings-writer.sh <id> <category> <problem> <solution>}"
CATEGORY="${2:?Missing category (env|playwright|agent|d365|test)}"
PROBLEM="${3:?Missing problem description}"
SOLUTION="${4:?Missing solution description}"
RESOLVED_AT="${5:-$(date -u +%Y-%m-%d)}"

LEARNINGS_FILE="$TESTS_ROOT/learnings.yaml"

if [ ! -f "$LEARNINGS_FILE" ]; then
  log_fail "learnings.yaml not found at $LEARNINGS_FILE"
  exit 1
fi

log_info "=== Learnings Writer ==="
log_info "ID: $LEARNING_ID"
log_info "Category: $CATEGORY"

# ============================================================
# Check for duplicate ID
# ============================================================
if grep -q "id: $LEARNING_ID" "$LEARNINGS_FILE" 2>/dev/null; then
  log_warn "Learning '$LEARNING_ID' already exists in learnings.yaml — skipping"
  echo "LEARNING_SKIP|$LEARNING_ID|duplicate"
  exit 0
fi

# ============================================================
# Determine which section to append to
# ============================================================
# Map category to section header comment
SECTION_HEADER=""
case "$CATEGORY" in
  env)
    SECTION_HEADER="# 环境问题"
    ;;
  playwright)
    SECTION_HEADER="# Playwright / 浏览器"
    ;;
  agent)
    SECTION_HEADER="# Agent / MCP"
    ;;
  d365)
    SECTION_HEADER="# D365 脚本"
    ;;
  test)
    SECTION_HEADER="# 测试流程"
    ;;
  *)
    SECTION_HEADER="# 测试流程"
    log_warn "Unknown category '$CATEGORY' — appending to test section"
    ;;
esac

# ============================================================
# Format the new entry
# ============================================================
# Escape pipe characters in solution for YAML multiline
ESCAPED_SOLUTION=$(echo "$SOLUTION" | sed 's/^/    /')

NEW_ENTRY="
- id: $LEARNING_ID
  category: $CATEGORY
  problem: \"$PROBLEM\"
  solution: |
$ESCAPED_SOLUTION
  resolved_at: \"$RESOLVED_AT\""

# ============================================================
# Append to file
# ============================================================
# Append at end of file (safe — new entries go at bottom)
echo "$NEW_ENTRY" >> "$LEARNINGS_FILE"

log_pass "Learning '$LEARNING_ID' appended to learnings.yaml"
log_info "Category: $CATEGORY"
log_info "Problem: $PROBLEM"

echo "LEARNING_WRITTEN|$LEARNING_ID|$CATEGORY"
