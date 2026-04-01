#!/usr/bin/env bash
# queue-sorter.sh — Sort testQueue by impact priority (P0 first)
# Usage: bash tests/executors/queue-sorter.sh
#
# Reads tests/queues.json, sorts testQueue by impact field, writes back via state-writer.sh
# Items without impact field are treated as P3 (lowest priority)
# Within same priority, original order is preserved (stable sort)
#
# Output: QUEUE_SORT|success|<count> items sorted

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QUEUES_FILE="$SCRIPT_DIR/../queues.json"

if [[ ! -f "$QUEUES_FILE" ]]; then
  echo "QUEUE_SORT|error|queues.json not found"
  exit 1
fi

# Read current testQueue length
QUEUE_LENGTH=$(python3 -c "
import json, sys
with open('$QUEUES_FILE', 'r') as f:
    data = json.load(f)
q = data.get('testQueue', [])
print(len(q))
")

if [[ "$QUEUE_LENGTH" -le 1 ]]; then
  echo "QUEUE_SORT|skip|$QUEUE_LENGTH items (no sort needed)"
  exit 0
fi

# Sort by impact: P0 < P1 < P2 < P3 < missing
SORTED_QUEUE=$(python3 -c "
import json, sys

with open('$QUEUES_FILE', 'r') as f:
    data = json.load(f)
queue = data.get('testQueue', [])

priority_order = {'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3}

def sort_key(item):
    if isinstance(item, str):
        return 3  # string items (legacy) treated as P3
    impact = item.get('impact', 'P3')
    return priority_order.get(impact, 3)

queue.sort(key=sort_key)
print(json.dumps(queue))
")

# Write back via state-writer
echo "{\"testQueue\":$SORTED_QUEUE}" | bash "$SCRIPT_DIR/state-writer.sh" --target queues --merge

echo "QUEUE_SORT|success|$QUEUE_LENGTH items sorted"
