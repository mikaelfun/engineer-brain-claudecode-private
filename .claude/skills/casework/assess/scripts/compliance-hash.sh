#!/usr/bin/env bash
# Extract Entitlement / SAP Code / Support Plan from case-info.md → sha256 first 8 hex chars.
# PRD §2.5: hash 作为 compliance cache key，字段变化即失效。
set -euo pipefail
CASE_INFO="${1:?usage: compliance-hash.sh <case-info.md>}"
[ -f "$CASE_INFO" ] || { echo "ERROR|missing|$CASE_INFO" >&2; exit 2; }

extract() {
  # Match "| Field | value |" rows (markdown table). Output raw value or empty.
  local field="$1"
  grep -iE "^\|\s*$field\s*\|" "$CASE_INFO" | head -1 \
    | sed -E 's/^\|[^|]+\|\s*([^|]*)\|.*$/\1/' | sed -E 's/^\s+|\s+$//g'
}

ENT=$(extract "Entitlement")
SAP=$(extract "SAP Code")
SP=$(extract "Support Plan")

# Emit 8-char prefix of sha256("Entitlement|SAP|SupportPlan")
printf '%s|%s|%s' "$ENT" "$SAP" "$SP" | sha256sum | cut -c1-8
