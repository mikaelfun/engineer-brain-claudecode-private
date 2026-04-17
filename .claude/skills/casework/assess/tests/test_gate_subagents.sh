#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/gate-subagents.sh"
FX="$HERE/fixtures"

# Case 1: DELTA_EMPTY → spawn neither, no degraded flags.
out=$(bash "$SCRIPT" "$FX/data-refresh-output-delta-empty.json")
[ "$out" = "SPAWN_TEAMS=0 SPAWN_ONENOTE=0 TEAMS_DEGRADED=0 ONENOTE_DEGRADED=0" ] \
  || { echo "FAIL empty: got '$out'"; exit 1; }

# Case 2: Teams only → spawn teams, no degraded.
out=$(bash "$SCRIPT" "$FX/data-refresh-output-teams-only.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=0 TEAMS_DEGRADED=0 ONENOTE_DEGRADED=0" ] \
  || { echo "FAIL teams: got '$out'"; exit 1; }

# Case 3: Full delta incl onenote.updatedPages → spawn both, no degraded.
out=$(bash "$SCRIPT" "$FX/data-refresh-output-full.json")
[ "$out" = "SPAWN_TEAMS=1 SPAWN_ONENOTE=1 TEAMS_DEGRADED=0 ONENOTE_DEGRADED=0" ] \
  || { echo "FAIL full: got '$out'"; exit 1; }

# Case 4 (T2.9.2): teams.status=FAILED with newMessages=0 must signal degraded, not silent skip.
# Before T2.9.2 this path returned SPAWN_TEAMS=0 indistinguishable from real DELTA_EMPTY.
out=$(bash "$SCRIPT" "$FX/data-refresh-output-teams-failed.json")
[ "$out" = "SPAWN_TEAMS=0 SPAWN_ONENOTE=1 TEAMS_DEGRADED=1 ONENOTE_DEGRADED=0" ] \
  || { echo "FAIL teams-failed: got '$out'"; exit 1; }

echo "OK: all 4 gate-subagents tests pass"
