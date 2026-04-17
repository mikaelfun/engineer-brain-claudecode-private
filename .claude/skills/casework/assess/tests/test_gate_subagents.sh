#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/gate-subagents.sh"
FX="$HERE/fixtures"

# Case 1: DELTA_EMPTY → spawn neither
out=$(bash "$SCRIPT" "$FX/data-refresh-output-delta-empty.json")
[ "$out" = "SPAWN_TEAMS=0 SPAWN_ONENOTE=0" ] || { echo "FAIL empty: got '$out'"; exit 1; }

# Case 2: Teams only → spawn teams
out=$(bash "$SCRIPT" "$FX/data-refresh-output-teams-only.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=0" ] || { echo "FAIL teams: got '$out'"; exit 1; }

# Case 3: Full delta incl onenote.updatedPages → spawn both
out=$(bash "$SCRIPT" "$FX/data-refresh-output-full.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=1" ] || { echo "FAIL full: got '$out'"; exit 1; }

echo "OK: all 3 gate-subagents tests pass"
