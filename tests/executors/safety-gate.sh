#!/usr/bin/env bash
# tests/executors/safety-gate.sh — Safety Check Pre-Interceptor
#
# Usage: bash tests/executors/safety-gate.sh <category> <action>
# Returns: 0 = SAFE, 1 = BLOCKED, 2 = UNKNOWN
#
# Examples:
#   bash tests/executors/safety-gate.sh api "GET /api/health"    → 0 (SAFE)
#   bash tests/executors/safety-gate.sh api "POST /api/todo/:id/execute" → 1 (BLOCKED)
#   bash tests/executors/safety-gate.sh scripts "casework"        → 0 (SAFE)
#   bash tests/executors/safety-gate.sh scripts "add-note.ps1"    → 1 (BLOCKED)
#   bash tests/executors/safety-gate.sh ui "click_execute_todo"   → 1 (BLOCKED)
#   bash tests/executors/safety-gate.sh playwright "browser_snapshot" → 1 (BLOCKED)

set -u

PROJECT_ROOT="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain"
SAFETY_FILE="$PROJECT_ROOT/tests/safety.yaml"

CATEGORY="${1:?Usage: safety-gate.sh <category> <action>}"
ACTION="${2:?Missing action}"

if [ ! -f "$SAFETY_FILE" ]; then
  echo "UNKNOWN: safety.yaml not found"
  exit 2
fi

# ============================================================
# Approach: Use awk to extract actions from safe/blocked sections
# then grep to check if our action is listed.
# ============================================================

# Strip CRLF for parsing
CLEAN_SAFETY=$(tr -d '\r' < "$SAFETY_FILE")

# Extract blocked actions for this category
# Format in YAML: <category>:\n  blocked:\n    - action: "xxx"
BLOCKED_ACTIONS=$(echo "$CLEAN_SAFETY" | awk -v cat="${CATEGORY}:" '
  $0 ~ "^"cat { in_cat=1; next }
  in_cat && /^[a-z]/ { in_cat=0 }
  in_cat && /^  blocked:/ { in_blocked=1; in_safe=0; next }
  in_cat && /^  safe:/ { in_blocked=0; in_safe=1; next }
  in_cat && in_blocked && /action:/ {
    gsub(/.*action: *"/, ""); gsub(/".*/, ""); print
  }
')

SAFE_ACTIONS=$(echo "$CLEAN_SAFETY" | awk -v cat="${CATEGORY}:" '
  $0 ~ "^"cat { in_cat=1; next }
  in_cat && /^[a-z]/ { in_cat=0 }
  in_cat && /^  safe:/ { in_safe=1; in_blocked=0; next }
  in_cat && /^  blocked:/ { in_safe=0; in_blocked=1; next }
  in_cat && in_safe && /action:/ {
    gsub(/.*action: *"/, ""); gsub(/".*/, ""); print
  }
')

# ============================================================
# Check blocked first (takes priority)
# ============================================================
while IFS= read -r blocked; do
  [ -z "$blocked" ] && continue
  if [ "$blocked" = "$ACTION" ]; then
    echo "BLOCKED: $ACTION"
    exit 1
  fi
  # Parameterized route match (e.g., :id → match any value)
  if echo "$blocked" | grep -q ':'; then
    regex=$(echo "$blocked" | sed 's|:[a-zA-Z_]*|[^/]*|g')
    if echo "$ACTION" | grep -qE "^${regex}$"; then
      echo "BLOCKED: $ACTION (matches $blocked)"
      exit 1
    fi
  fi
done <<< "$BLOCKED_ACTIONS"

# ============================================================
# Check safe
# ============================================================
while IFS= read -r safe; do
  [ -z "$safe" ] && continue
  if [ "$safe" = "$ACTION" ]; then
    echo "SAFE: $ACTION"
    exit 0
  fi
  # Wildcard match
  if echo "$safe" | grep -q '\*'; then
    regex=$(echo "$safe" | sed 's/\*/.*/')
    if echo "$ACTION" | grep -qE "^${regex}$"; then
      echo "SAFE: $ACTION (matches $safe)"
      exit 0
    fi
  fi
  # Parameterized route match
  if echo "$safe" | grep -q ':'; then
    regex=$(echo "$safe" | sed 's|:[a-zA-Z_]*|[^/]*|g')
    if echo "$ACTION" | grep -qE "^${regex}$"; then
      echo "SAFE: $ACTION (matches $safe)"
      exit 0
    fi
  fi
  # Substring match for simple actions
  if [ "$safe" = "$ACTION" ] || echo "$ACTION" | grep -qF "$safe"; then
    echo "SAFE: $ACTION (matches $safe)"
    exit 0
  fi
done <<< "$SAFE_ACTIONS"

# Not found
echo "UNKNOWN: $CATEGORY/$ACTION not found in safety.yaml"
exit 2
