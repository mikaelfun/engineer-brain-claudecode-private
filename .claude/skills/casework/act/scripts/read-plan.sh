#!/usr/bin/env bash
# read-plan.sh — Parse execution-plan.json → shell variables for act SKILL.md
# Supports both legacy flat format and new plans[] list format.
# Usage: eval $(bash read-plan.sh <case-dir>)
#    or: eval $(bash read-plan.sh <execution-plan.json>)   # legacy
# Outputs: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT,
#          ACTION_{i}_TYPE, ACTION_{i}_PRIORITY, ACTION_{i}_STATUS,
#          ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON, IR_FIRST,
#          NO_ACTION_REASON, HAS_DEFERRED, PLAN_PHASE, PLAN_COUNT
set -euo pipefail
ARG="${1:?usage: read-plan.sh <case-dir or execution-plan.json>}"

# Resolve: if arg is a directory (case-dir), find execution-plan.json via state.json runId
if [ -d "$ARG" ]; then
  CASE_DIR="$ARG"
  PLAN=$(python3 -c "
import json, os
cd = r'$CASE_DIR'
cw = os.path.join(cd, '.casework')
try:
    s = json.load(open(os.path.join(cw, 'state.json'), encoding='utf-8'))
    rid = s.get('runId', '')
    if rid:
        p = os.path.join(cw, 'runs', rid, 'execution-plan.json')
        if os.path.exists(p):
            print(p); raise SystemExit
except SystemExit: raise
except: pass
# fallback: .casework/execution-plan.json
p = os.path.join(cw, 'execution-plan.json')
print(p)
" 2>/dev/null)
else
  PLAN="$ARG"
fi

[ -f "$PLAN" ] || { echo "echo 'ERROR: plan not found: $PLAN'" >&2; exit 2; }

python3 - "$PLAN" <<'PYEOF'
import json, sys

d = json.load(open(sys.argv[1], encoding='utf-8'))

# Support plans[] list: read latest plan's actions
plans = d.get('plans', [])
plan_count = len(plans)

if plans:
    latest = plans[-1]
    actions = latest.get('actions', [])
    no_reason = latest.get('noActionReason') or ''
    plan_phase = latest.get('phase', 'assess')
    has_deferred = 1 if latest.get('deferredActions') else 0
else:
    # Legacy flat format
    actions = d.get('actions', [])
    no_reason = d.get('noActionReason') or ''
    plan_phase = 'assess'
    has_deferred = 0

cn = d.get('caseNumber', '')
status = d.get('actualStatus', 'researching')
days = d.get('daysSinceLastContact', 0)

# Sort by priority
actions.sort(key=lambda a: a.get('priority', 99))

# IR-first detection: pending-engineer + has both troubleshooter and email-drafter(initial-response)
types = {a['type'] for a in actions}
email_types = {a.get('emailType', '') for a in actions if a['type'] == 'email-drafter'}
ir_first = 1 if (status in ('new', 'pending-engineer')
                 and 'troubleshooter' in types
                 and 'email-drafter' in types
                 and 'initial-response' in email_types) else 0

print(f'CASE_NUMBER="{cn}"')
print(f'ACTUAL_STATUS="{status}"')
print(f'DAYS_SINCE={days}')
print(f'ACTION_COUNT={len(actions)}')
print(f'IR_FIRST={ir_first}')
print(f'NO_ACTION_REASON="{no_reason}"')
print(f'HAS_DEFERRED={has_deferred}')
print(f'PLAN_PHASE="{plan_phase}"')
print(f'PLAN_COUNT={plan_count}')

for i, a in enumerate(actions):
    print(f'ACTION_{i}_TYPE="{a["type"]}"')
    print(f'ACTION_{i}_PRIORITY={a.get("priority", 99)}')
    print(f'ACTION_{i}_STATUS="{a.get("status", "pending")}"')
    print(f'ACTION_{i}_EMAIL_TYPE="{a.get("emailType", "auto")}"')
    print(f'ACTION_{i}_DEPENDS_ON="{a.get("dependsOn", "")}"')
PYEOF
