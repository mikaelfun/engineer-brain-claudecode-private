#!/usr/bin/env python3
"""update-phase.py — Unified patrol phase transition writer.

Atomically writes patrol-progress.json + patrol-phase file.
Replaces inline python3 -c blocks scattered across SKILL.md.

Usage:
  python3 .claude/skills/patrol/scripts/update-phase.py \
    --patrol-dir {patrolDir} --phase discovering

  python3 .claude/skills/patrol/scripts/update-phase.py \
    --patrol-dir {patrolDir} --phase filtering --total-found 12

  python3 .claude/skills/patrol/scripts/update-phase.py \
    --patrol-dir {patrolDir} --phase processing \
    --changed-cases 5 --total-found 12 --skipped-count 7

  python3 .claude/skills/patrol/scripts/update-phase.py \
    --patrol-dir {patrolDir} --phase completed

Supported phases:
  starting, discovering, filtering, warming-up, processing, aggregating, completed, failed

Phase regression guard:
  Phases must only advance forward. If patrol-progress.json already shows a
  later phase than the requested phase, the phase field is kept unchanged but
  other fields (warmupStatus, etc.) are still merged. This prevents async
  warmup completion from reverting 'processing' back to 'warming-up'.

Optional fields (passed through to patrol-progress.json):
  --source          cli|webui
  --total-found     total active cases from D365
  --changed-cases   cases that passed filter
  --skipped-count   cases skipped by patrolSkipHours
  --case-list       comma-separated case numbers
  --warmup-status   token daemon status text
  --error           error message (for failed phase)
"""
import argparse, json, os, sys, time

# Ordered pipeline phases for regression guard
PIPELINE_ORDER = [
    'starting', 'discovering', 'filtering', 'warming-up',
    'processing', 'aggregating', 'completed', 'failed',
]


def main():
    ap = argparse.ArgumentParser(description='Update patrol phase')
    ap.add_argument('--patrol-dir', required=True, help='Path to patrol directory')
    ap.add_argument('--phase', required=True, help='Phase name')
    ap.add_argument('--source', default=None)
    ap.add_argument('--total-found', type=int, default=None)
    ap.add_argument('--changed-cases', type=int, default=None)
    ap.add_argument('--skipped-count', type=int, default=None)
    ap.add_argument('--case-list', default=None, help='Comma-separated case numbers')
    ap.add_argument('--warmup-status', default=None)
    ap.add_argument('--error', default=None)
    ap.add_argument('--processed-cases', type=int, default=None)
    ap.add_argument('--total-cases', type=int, default=None)
    ap.add_argument('--current-action', default=None)
    ap.add_argument('--archived-count', type=int, default=None)
    ap.add_argument('--transferred-count', type=int, default=None)
    args = ap.parse_args()

    patrol_dir = args.patrol_dir
    os.makedirs(patrol_dir, exist_ok=True)

    now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

    # ── Phase regression guard ──
    # Read existing progress to check if requested phase is a regression
    effective_phase = args.phase
    progress_path = os.path.join(patrol_dir, 'patrol-progress.json')
    regression_blocked = False
    try:
        if os.path.exists(progress_path):
            existing = json.load(open(progress_path, encoding='utf-8'))
            existing_phase = existing.get('phase', '')
            if existing_phase in PIPELINE_ORDER and effective_phase in PIPELINE_ORDER:
                existing_idx = PIPELINE_ORDER.index(existing_phase)
                requested_idx = PIPELINE_ORDER.index(effective_phase)
                if requested_idx < existing_idx:
                    # Regression! Keep existing phase, still merge other fields
                    effective_phase = existing_phase
                    regression_blocked = True
                    print(f'REGRESSION_BLOCKED|{args.phase}→{existing_phase}|{now}', file=sys.stderr)
    except Exception:
        pass  # Can't read existing progress — proceed normally

    # Build progress data
    data: dict = {
        'phase': effective_phase,
        'updatedAt': now,
    }

    # Optional fields — only include if provided
    if args.source is not None:
        data['source'] = args.source
    if args.total_found is not None:
        data['totalFound'] = args.total_found
    if args.changed_cases is not None:
        data['changedCases'] = args.changed_cases
    if args.skipped_count is not None:
        data['skippedCount'] = args.skipped_count
    if args.case_list is not None:
        data['caseList'] = [c.strip() for c in args.case_list.split(',') if c.strip()]
    if args.warmup_status is not None:
        data['warmupStatus'] = args.warmup_status
    if args.error is not None:
        data['error'] = args.error
    if args.processed_cases is not None:
        data['processedCases'] = args.processed_cases
    if args.total_cases is not None:
        data['totalCases'] = args.total_cases
    if args.current_action is not None:
        data['currentAction'] = args.current_action
    if args.archived_count is not None:
        data['archivedCount'] = args.archived_count
    if args.transferred_count is not None:
        data['transferredCount'] = args.transferred_count

    # Atomic write patrol-progress.json
    tmp_path = progress_path + '.tmp.' + str(os.getpid())
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp_path, progress_path)

    # Write patrol-phase file (simple text, used by some legacy consumers)
    # Only update if phase wasn't regressed
    phase_path = os.path.join(patrol_dir, 'patrol-phase')
    if not regression_blocked:
        with open(phase_path, 'w', encoding='utf-8') as f:
            f.write(effective_phase)

    print(f'PHASE|{effective_phase}|{now}')


if __name__ == '__main__':
    main()
