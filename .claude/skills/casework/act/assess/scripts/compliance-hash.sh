#!/usr/bin/env bash
# Extract Service Level (from ## Entitlement subfield) + SAP row from case-info.md
# → sha256 first 8 hex chars.
# PRD §2.5: hash 作为 compliance cache key，字段变化即失效。
#
# T2.9.1: field names aligned with real case-info.md format:
#   - 'Service Level' (subfield under '## Entitlement' section, e.g. Premier/ProDirect)
#   - 'SAP' (top-level row, path-style string)
# (old schema 'Entitlement' / 'SAP Code' / 'Support Plan' never existed in production.)
set -euo pipefail
CASE_INFO="${1:?usage: compliance-hash.sh <case-info.md>}"
[ -f "$CASE_INFO" ] || { echo "ERROR|missing|$CASE_INFO" >&2; exit 2; }

extract() {
  # Match "| Field | value |" rows (markdown table, first hit).
  # Works for 2-col (| F | V |) and 3-col (| F | V | extra |) tables.
  local field="$1"
  grep -iE "^\|\s*$field\s*\|" "$CASE_INFO" | head -1 \
    | sed -E 's/^\|[^|]+\|\s*([^|]*)\|.*$/\1/' | sed -E 's/^\s+|\s+$//g'
}

SVC=$(extract "Service Level")
SAP=$(extract "SAP")

# Emit 8-char prefix of sha256("ServiceLevel|SAP"). Missing fields → empty → distinct hash still stable.
printf '%s|%s' "$SVC" "$SAP" | sha256sum | cut -c1-8
