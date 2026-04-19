#!/usr/bin/env bash
# finalize-state.sh — Backfill state.json from completed step output files
# Called by scripts at deterministic points, NOT by agent prompts.
#
# Usage: finalize-state.sh <case-dir> <step>
#   step: data-refresh | act
set -uo pipefail

CASE_DIR="${1:?case-dir required}"
STEP="${2:?step required}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
UPDATE_STATE="$SCRIPT_DIR/update-state.py"

case "$STEP" in
  data-refresh)
    # Backfill subtask deltas from data-refresh-output.json
    python3 -c "
import json, subprocess, sys, os
dr_path = os.path.join(r'$CASE_DIR', '.casework', 'output', 'data-refresh.json')
try:
    dr = json.load(open(dr_path, encoding='utf-8'))
except: exit(0)
rr = dr.get('refreshResults', {})
mapping = {
    'd365':        {'emails': rr.get('d365',{}).get('newEmails',0), 'notes': rr.get('d365',{}).get('newNotes',0)},
    'teams':       {'chats': rr.get('teams',{}).get('newChats',0), 'messages': rr.get('teams',{}).get('newMessages',0)},
    'icm':         {'discussions': rr.get('icm',{}).get('newEntries',0)},
    'onenote':     {'pages': rr.get('onenote',{}).get('newPages',0) + rr.get('onenote',{}).get('updatedPages',0)},
    'attachments': {'files': rr.get('attachments',{}).get('downloaded',0)},
}
for task, delta in mapping.items():
    if any(v > 0 for v in delta.values()):
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'data-refresh',
          '--subtask', task, '--delta', json.dumps(delta)], check=False)
" 2>/dev/null || true
    ;;

  act)
    # Backfill troubleshooter result from claims.json
    python3 -c "
import json, subprocess, sys, glob, os
claims = os.path.join(r'$CASE_DIR', '.casework', 'claims.json')
if os.path.exists(claims):
    try:
        c = json.load(open(claims, encoding='utf-8'))
        result = (c.get('summary') or c.get('rootCause') or 'Analysis complete')[:100]
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'act',
          '--action', 'troubleshooter', '--result', result], check=False)
    except: pass
# Backfill email-drafter result from latest draft
drafts = sorted(glob.glob(os.path.join(r'$CASE_DIR', 'drafts', '*.md')), key=os.path.getmtime, reverse=True)
if drafts:
    try:
        with open(drafts[0], encoding='utf-8') as f:
            subj = f.readline().strip().replace('#','').strip()
        subprocess.run([sys.executable, r'$UPDATE_STATE',
          '--case-dir', r'$CASE_DIR', '--step', 'act',
          '--action', 'email-drafter', '--result', 'Draft: ' + subj[:80]], check=False)
    except: pass
# Backfill reassess result from execution-plan.json plans[]
ep = os.path.join(r'$CASE_DIR', '.casework', 'execution-plan.json')
if os.path.exists(ep):
    try:
        plan = json.load(open(ep, encoding='utf-8'))
        plans = plan.get('plans', [])
        reassess_plan = next((p for p in plans if p.get('phase') == 'reassess'), None)
        if reassess_plan:
            conclusion = reassess_plan.get('conclusion', {})
            result = f\"{conclusion.get('type', '?')} → {conclusion.get('suggestedNextAction', '?')}\"
            subprocess.run([sys.executable, r'$UPDATE_STATE',
              '--case-dir', r'$CASE_DIR', '--step', 'act',
              '--action', 'reassess', '--result', result], check=False)
    except: pass
" 2>/dev/null || true
    ;;
esac
