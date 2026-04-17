#!/usr/bin/env bash
# Read data-refresh-output.json → emit gate flags for parent assess skill.
# Gates per T2 plan:
#   SPAWN_TEAMS=1       iff refreshResults.teams.newMessages > 0
#   SPAWN_ONENOTE=1     iff refreshResults.onenote.newPages + updatedPages > 0
# Degraded flags per T2.9.2 (real-case smoke uncovered silent skip on FAILED):
#   TEAMS_DEGRADED=1    iff refreshResults.teams.status in {FAILED, TIMEOUT}
#   ONENOTE_DEGRADED=1  iff refreshResults.onenote.status in {FAILED, TIMEOUT}
# Parent skill should surface degraded sources in execution-plan.warnings so
# downstream LLM distinguishes "no teams signal" from "teams pipeline broken".
set -euo pipefail
INPUT="${1:?usage: gate-subagents.sh <data-refresh-output.json>}"
[ -f "$INPUT" ] || { echo "SPAWN_TEAMS=0 SPAWN_ONENOTE=0 TEAMS_DEGRADED=0 ONENOTE_DEGRADED=0"; exit 0; }

python3 - "$INPUT" <<'PYEOF'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
r = d.get('refreshResults', {}) or {}
t = r.get('teams', {}) or {}
o = r.get('onenote', {}) or {}

DEGRADED_STATES = {"FAILED", "TIMEOUT"}

spawn_t = 1 if int(t.get('newMessages', 0)) > 0 else 0
spawn_o = 1 if int(o.get('newPages', 0)) + int(o.get('updatedPages', 0)) > 0 else 0
deg_t   = 1 if str(t.get('status', '')).upper() in DEGRADED_STATES else 0
deg_o   = 1 if str(o.get('status', '')).upper() in DEGRADED_STATES else 0

print(f"SPAWN_TEAMS={spawn_t} SPAWN_ONENOTE={spawn_o} TEAMS_DEGRADED={deg_t} ONENOTE_DEGRADED={deg_o}")
PYEOF
