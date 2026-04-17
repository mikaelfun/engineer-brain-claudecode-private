#!/usr/bin/env python3
"""patrol-progress.py — Render rich CLI progress table for patrol polling loop.

Reads .casework/events/*.json + execution-plan.json + pipeline-state.json
from each case directory to show substep-level progress.

Usage:
  python3 .claude/skills/patrol/scripts/patrol-progress.py \
    --cases-root ../data/cases \
    --cases 2601290030000748,2602130040001034 \
    --phases '{"2601290030000748":"gathering","2602130040001034":"executing"}' \
    [--patrol-start 2026-04-17T11:44:13Z]

Output: formatted progress table to stdout.
"""
import argparse, json, os, sys
from datetime import datetime, timezone
from pathlib import Path

SUBSTEP_ORDER = ['d365', 'teams', 'onenote', 'icm', 'attachments']
SUBSTEP_ICONS = {
    'd365': 'D365', 'teams': 'Teams', 'onenote': 'Note',
    'icm': 'ICM', 'attachments': 'Att',
}
PHASE_ICONS = {
    'gathering': '📥', 'plan-ready': '📋', 'executing': '🔧',
    'inspecting': '🔍', 'done': '✅', 'timeout': '⏰',
}
STATUS_MARKS = {
    'completed': '✓', 'active': '…', 'failed': '✗', 'skipped': '-',
}


def read_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def elapsed_str(seconds):
    if seconds is None:
        return ''
    s = int(seconds)
    if s < 60:
        return f'{s}s'
    return f'{s // 60}m{s % 60:02d}s'


def since_str(iso_start, now):
    """Seconds since iso_start."""
    try:
        start = datetime.fromisoformat(iso_start.replace('Z', '+00:00'))
        return int((now - start).total_seconds())
    except Exception:
        return None


def render_substeps(case_dir):
    """Read events/*.json, return substep status string."""
    events_dir = case_dir / '.casework' / 'events'
    parts = []
    for step in SUBSTEP_ORDER:
        ev = read_json(events_dir / f'{step}.json')
        if ev is None:
            parts.append(f'{SUBSTEP_ICONS.get(step, step)}:·')
            continue
        status = ev.get('status', 'unknown')
        dur = ev.get('durationMs')
        dur_s = f'{dur // 1000}s' if dur and dur > 0 else ''
        mark = STATUS_MARKS.get(status, '?')
        if status == 'completed' and dur_s:
            parts.append(f'{SUBSTEP_ICONS.get(step, step)}:{mark}{dur_s}')
        else:
            parts.append(f'{SUBSTEP_ICONS.get(step, step)}:{mark}')
    return ' | '.join(parts)


def render_pipeline(case_dir, phase):
    """Show act/summarize pipeline actions."""
    plan = read_json(case_dir / '.casework' / 'execution-plan.json')
    ps = read_json(case_dir / '.casework' / 'pipeline-state.json')
    parts = []

    if plan:
        actions = plan.get('actions', [])
        if not actions:
            parts.append('actions=0')
        else:
            for a in actions:
                t = a.get('type', '?')
                s = a.get('status', 'pending')
                parts.append(f'{t}:{STATUS_MARKS.get(s, s)}')

    if ps:
        cur = ps.get('currentStep', '')
        steps = ps.get('steps', {})
        for name, info in steps.items():
            st = info.get('status', '?')
            if st == 'completed':
                dur = None
                if info.get('startedAt') and info.get('completedAt'):
                    try:
                        s = datetime.fromisoformat(info['startedAt'].replace('Z', '+00:00'))
                        e = datetime.fromisoformat(info['completedAt'].replace('Z', '+00:00'))
                        dur = int((e - s).total_seconds())
                    except Exception:
                        pass
                parts.append(f'{name}:✓{elapsed_str(dur)}')
            elif name == cur:
                parts.append(f'{name}:…')

    return ' | '.join(parts) if parts else ''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cases-root', required=True)
    parser.add_argument('--cases', required=True, help='Comma-separated case numbers')
    parser.add_argument('--phases', required=True, help='JSON: {caseNumber: phase}')
    parser.add_argument('--patrol-start', default=None)
    args = parser.parse_args()

    cases_root = Path(args.cases_root)
    case_numbers = [c.strip() for c in args.cases.split(',') if c.strip()]
    phases = json.loads(args.phases)
    now = datetime.now(timezone.utc)

    patrol_elapsed = ''
    if args.patrol_start:
        secs = since_str(args.patrol_start, now)
        if secs is not None:
            patrol_elapsed = f' ({elapsed_str(secs)})'

    # Header
    ts = datetime.now().strftime('%H:%M:%S')
    print(f'━━━ Patrol Progress [{ts}]{patrol_elapsed} ━━━')
    print()

    # Stats
    stats = {'done': 0, 'inspecting': 0, 'executing': 0, 'gathering': 0, 'other': 0}

    for cn in case_numbers:
        phase = phases.get(cn, 'gathering')
        icon = PHASE_ICONS.get(phase, '❓')
        case_dir = cases_root / 'active' / cn
        short = f'...{cn[-4:]}'

        # Count
        bucket = phase if phase in stats else 'other'
        stats[bucket] = stats.get(bucket, 0) + 1

        # Line 1: case + phase
        line1 = f'  {icon} {short} — {phase}'

        # Line 2: substeps (for gathering) or pipeline (for executing/inspecting/done)
        if phase == 'gathering':
            substeps = render_substeps(case_dir)
            print(f'{line1}')
            if substeps:
                print(f'     {substeps}')
        elif phase in ('executing', 'inspecting', 'done'):
            pipeline = render_pipeline(case_dir, phase)
            dr = read_json(case_dir / '.casework' / 'events' / 'data-refresh.json')
            dr_dur = ''
            if dr and dr.get('durationMs'):
                dr_dur = f' dr:{dr["durationMs"] // 1000}s'
            print(f'{line1}{dr_dur}')
            if pipeline:
                print(f'     {pipeline}')
        else:
            print(f'{line1}')

    # Summary line
    print()
    summary_parts = []
    for k in ['done', 'inspecting', 'executing', 'gathering']:
        if stats[k] > 0:
            summary_parts.append(f'{PHASE_ICONS[k]}{stats[k]}')
    total = len(case_numbers)
    done = stats['done']
    print(f'📊 Done: {done}/{total} | {" ".join(summary_parts)}')


if __name__ == '__main__':
    main()
