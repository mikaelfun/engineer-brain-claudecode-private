#!/usr/bin/env bash
# Read data-refresh-output.json → emit gate flags for parent assess skill.
# Gates per T2 plan:
#   SPAWN_TEAMS=1   iff refreshResults.teams.newMessages > 0
#   SPAWN_ONENOTE=1 iff refreshResults.onenote.newPages + updatedPages > 0
set -euo pipefail
INPUT="${1:?usage: gate-subagents.sh <data-refresh-output.json>}"
[ -f "$INPUT" ] || { echo "SPAWN_TEAMS=0 SPAWN_ONENOTE=0"; exit 0; }

python3 - "$INPUT" <<'PYEOF'
import json, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
r = d.get('refreshResults', {})
t = r.get('teams', {}) or {}
o = r.get('onenote', {}) or {}
spawn_t = 1 if int(t.get('newMessages', 0)) > 0 else 0
spawn_o = 1 if int(o.get('newPages', 0)) + int(o.get('updatedPages', 0)) > 0 else 0
print(f"SPAWN_TEAMS={spawn_t} SPAWN_ONENOTE={spawn_o}")
PYEOF
