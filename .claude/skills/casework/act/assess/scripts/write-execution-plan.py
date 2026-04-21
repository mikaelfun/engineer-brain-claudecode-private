#!/usr/bin/env python3
"""
Write `.casework/execution-plan.json` from LLM decision JSON.
Supports plans[] list — each phase (assess, reassess) appends an entry.
Top-level fields always reflect the latest plan for backward compatibility.

Usage:
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir>
  write-execution-plan.py --decision <decision.json> --case-dir <caseDir> --phase reassess
"""
import argparse, json, os, sys, time

VALID_STATUSES = {
    'pending-engineer', 'pending-customer', 'pending-pg',
    'researching', 'ready-to-close', 'resolved', 'closed',
}
VALID_ACTION_TYPES = {'troubleshooter', 'email-drafter', 'challenger', 'note-gap', 'labor-estimate'}
VALID_ROUTING = {'llm', 'rule-table', 'manual', 'reassess-llm'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--decision', required=True)
    ap.add_argument('--case-dir', required=True)
    ap.add_argument('--phase', default='assess', choices=['assess', 'reassess'])
    args = ap.parse_args()

    with open(args.decision, encoding='utf-8') as f:
        d = json.load(f)

    # Validate
    if d.get('actualStatus') and d['actualStatus'] not in VALID_STATUSES:
        print(f"ERROR|invalid actualStatus: {d.get('actualStatus')}", file=sys.stderr)
        sys.exit(2)
    routing = d.get('routingSource', 'reassess-llm' if args.phase == 'reassess' else 'llm')
    if routing not in VALID_ROUTING:
        print(f"ERROR|invalid routingSource: {routing}", file=sys.stderr)
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

    # ISS-231: Write to runs/{runId}/ directory (single source of truth)
    run_id = ''
    try:
        state_path = os.path.join(out_dir, 'state.json')
        if os.path.exists(state_path):
            with open(state_path, encoding='utf-8') as f:
                state = json.load(f)
            run_id = state.get('runId', '')
    except Exception:
        pass

    if run_id:
        run_dir = os.path.join(out_dir, 'runs', run_id)
        os.makedirs(run_dir, exist_ok=True)
        out_path = os.path.join(run_dir, 'execution-plan.json')
    else:
        # Fallback: no runId — write to .casework/ root
        out_path = os.path.join(out_dir, 'execution-plan.json')

    # Build plan entry
    plan_entry = {
        'phase': args.phase,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'actions': d.get('actions', []),
        'noActionReason': d.get('noActionReason'),
        'routingSource': routing,
    }

    if args.phase == 'assess':
        plan_entry['actualStatus'] = d['actualStatus']
        plan_entry['daysSinceLastContact'] = d.get('daysSinceLastContact', 0)
        plan_entry['statusReasoning'] = d.get('statusReasoning', '')
        if d.get('deferredActions'):
            plan_entry['deferredActions'] = d['deferredActions']
            plan_entry['deferReason'] = d.get('deferReason', '')

    if args.phase == 'reassess':
        if d.get('conclusion'):
            plan_entry['conclusion'] = d['conclusion']

    # Load existing or create new
    existing = None
    if os.path.exists(out_path):
        try:
            with open(out_path, encoding='utf-8') as f:
                existing = json.load(f)
        except (json.JSONDecodeError, OSError):
            existing = None

    if existing and 'plans' in existing:
        # Append to existing plans list
        existing['plans'].append(plan_entry)
        existing['currentPhase'] = args.phase
        # Update top-level for backward compat
        if d.get('actualStatus'):
            existing['actualStatus'] = d['actualStatus']
        if d.get('daysSinceLastContact') is not None:
            existing['daysSinceLastContact'] = d.get('daysSinceLastContact', 0)
        existing['actions'] = d.get('actions', [])
        existing['noActionReason'] = d.get('noActionReason')
        existing['routingSource'] = routing
        result = existing
    else:
        # First plan (assess) — create new structure
        result = {
            'caseNumber': d.get('caseNumber', existing.get('caseNumber', '') if existing else ''),
            'currentPhase': args.phase,
            'actualStatus': d.get('actualStatus', ''),
            'daysSinceLastContact': d.get('daysSinceLastContact', 0),
            'actions': d.get('actions', []),
            'noActionReason': d.get('noActionReason'),
            'routingSource': routing,
            'plans': [plan_entry],
        }

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    # Always maintain a copy at .casework/execution-plan.json (patrol polls this path)
    root_path = os.path.join(out_dir, 'execution-plan.json')
    if out_path != root_path:
        import shutil
        shutil.copy2(out_path, root_path)

    # Write reasoning + result to state.json for UI display (deterministic — no agent needed)
    reasoning = d.get('statusReasoning', '')
    if reasoning or d.get('actualStatus'):
        import subprocess
        cmd = [
            sys.executable,
            # act/assess/scripts/ → act/assess/ → act/ → casework/ → casework/scripts/update-state.py
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'scripts', 'update-state.py'),
            '--case-dir', args.case_dir,
            '--step', 'assess',
            '--status', 'completed',
            '--result', d.get('actualStatus', ''),
        ]
        if reasoning:
            cmd.extend(['--reasoning', reasoning[:200]])
        subprocess.run(cmd, check=False)

    plan_count = len(result['plans'])
    action_count = len(d.get('actions', []))
    print(f"PLAN_WRITTEN|path={out_path}|phase={args.phase}|plan#{plan_count}|actions={action_count}")

if __name__ == '__main__':
    main()
