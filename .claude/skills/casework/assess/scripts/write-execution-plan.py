#!/usr/bin/env python3
"""
Write `.casework/execution-plan.json` from LLM decision JSON. Validates PRD §4.3 schema.

Usage:
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir>

Schema (PRD §4.3):
  { caseNumber, actualStatus, daysSinceLastContact, actions[], noActionReason, routingSource }
"""
import argparse, json, os, sys

VALID_STATUSES = {
    'pending-engineer', 'pending-customer', 'pending-pg',
    'researching', 'ready-to-close', 'resolved', 'closed',
}
VALID_ACTION_TYPES = {'troubleshooter', 'email-drafter', 'challenger', 'note-gap', 'labor-estimate'}
VALID_ROUTING = {'llm', 'rule-table', 'manual'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--decision', required=True)
    ap.add_argument('--case-dir', required=True)
    args = ap.parse_args()

    with open(args.decision, encoding='utf-8') as f:
        d = json.load(f)

    # Validate
    if d.get('actualStatus') not in VALID_STATUSES:
        print(f"ERROR|invalid actualStatus: {d.get('actualStatus')}", file=sys.stderr)
        sys.exit(2)
    if d.get('routingSource') not in VALID_ROUTING:
        print(f"ERROR|invalid routingSource: {d.get('routingSource')}", file=sys.stderr)
        sys.exit(2)
    for a in d.get('actions', []):
        if a.get('type') not in VALID_ACTION_TYPES:
            print(f"ERROR|invalid action type: {a.get('type')}", file=sys.stderr)
            sys.exit(2)
        if a.get('status') not in (None, 'pending', 'running', 'completed', 'failed'):
            print(f"ERROR|invalid action status: {a.get('status')}", file=sys.stderr)
            sys.exit(2)

    out_dir = os.path.join(args.case_dir, '.casework')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'execution-plan.json')

    plan = {
        'caseNumber': d['caseNumber'],
        'actualStatus': d['actualStatus'],
        'daysSinceLastContact': d.get('daysSinceLastContact', 0),
        'actions': d.get('actions', []),
        'noActionReason': d.get('noActionReason'),
        'routingSource': d['routingSource'],
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    print(f"PLAN_WRITTEN|path={out_path}|actions={len(plan['actions'])}")

if __name__ == '__main__':
    main()
