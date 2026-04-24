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

# ISS-231: Read runId from state.json → resolve run-scoped paths
RUN_ID=$(python3 -c "
import json
try:
    s = json.load(open(r'$CASE_DIR/.casework/state.json', encoding='utf-8'))
    print(s.get('runId', ''))
except: print('')
" 2>/dev/null || echo "")

if [ -n "$RUN_ID" ]; then
  OUTPUT_BASE="$CASE_DIR/.casework/runs/$RUN_ID"
else
  OUTPUT_BASE="$CASE_DIR/.casework"
fi

case "$STEP" in
  data-refresh)
    # Backfill subtask deltas from data-refresh-output.json
    python3 -c "
import json, subprocess, sys, os
dr_path = os.path.join(r'$OUTPUT_BASE', 'data-refresh', 'data-refresh.json')
try:
    dr = json.load(open(dr_path, encoding='utf-8'))
except: exit(0)
rr = dr.get('refreshResults', {})
mapping = {
    'd365':          {'newEmails': rr.get('d365',{}).get('newEmails',0), 'newNotes': rr.get('d365',{}).get('newNotes',0)},
    'teams-search':  {'newChats': rr.get('teams',{}).get('newChats',0), 'newMessages': rr.get('teams',{}).get('newMessages',0)},
    'icm':           {'newEntries': rr.get('icm',{}).get('newEntries',0)},
    'onenote':       {'newPages': rr.get('onenote',{}).get('newPages',0), 'updatedPages': rr.get('onenote',{}).get('updatedPages',0)},
    'attachments':   {'downloaded': rr.get('attachments',{}).get('downloaded',0)},
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
# Resolve path via state.json runId
ep = None
cw = os.path.join(r'$CASE_DIR', '.casework')
try:
    s = json.load(open(os.path.join(cw, 'state.json'), encoding='utf-8'))
    rid = s.get('runId', '')
    if rid:
        p = os.path.join(cw, 'runs', rid, 'execution-plan.json')
        if os.path.exists(p): ep = p
except: pass
if not ep:
    p = os.path.join(cw, 'execution-plan.json')
    if os.path.exists(p): ep = p
if ep:
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
