#!/usr/bin/env bash
# read-plan.sh — Parse execution-plan.json → shell variables for act SKILL.md
# Usage: eval $(bash read-plan.sh <execution-plan.json>)
# Outputs: CASE_NUMBER, ACTUAL_STATUS, DAYS_SINCE, ACTION_COUNT,
#          ACTION_{i}_TYPE, ACTION_{i}_PRIORITY, ACTION_{i}_STATUS,
#          ACTION_{i}_EMAIL_TYPE, ACTION_{i}_DEPENDS_ON, IR_FIRST, NO_ACTION_REASON
set -euo pipefail
PLAN="${1:?usage: read-plan.sh <execution-plan.json>}"
[ -f "$PLAN" ] || { echo "echo 'ERROR: plan not found: $PLAN'" >&2; exit 2; }

python3 - "$PLAN" <<'PYEOF'
import json, sys

d = json.load(open(sys.argv[1], encoding='utf-8'))
cn = d.get('caseNumber', '')
status = d.get('actualStatus', 'researching')
days = d.get('daysSinceLastContact', 0)
actions = d.get('actions', [])
no_reason = d.get('noActionReason') or ''

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

for i, a in enumerate(actions):
    print(f'ACTION_{i}_TYPE="{a["type"]}"')
    print(f'ACTION_{i}_PRIORITY={a.get("priority", 99)}')
    print(f'ACTION_{i}_STATUS="{a.get("status", "pending")}"')
    print(f'ACTION_{i}_EMAIL_TYPE="{a.get("emailType", "auto")}"')
    print(f'ACTION_{i}_DEPENDS_ON="{a.get("dependsOn", "")}"')
PYEOF
