#!/usr/bin/env python3
"""
Unified atomic writer for .casework/state.json.
Replaces: write-pipeline-state.sh, write-event.sh, update-pipeline-state.py.

Usage:
  # Main step transition
  update-state.py --case-dir <dir> --step data-refresh --status active
  update-state.py --case-dir <dir> --step data-refresh --status completed --duration-ms 128701

  # Substep (data-refresh subtasks, parallel)
  update-state.py --case-dir <dir> --step data-refresh --subtask d365 --status completed --duration-ms 50598

  # Action (act step actions, serial)
  update-state.py --case-dir <dir> --step act --action troubleshooter --status active
  update-state.py --case-dir <dir> --step act --action troubleshooter --status completed --duration-ms 45000

  # Result annotation
  update-state.py --case-dir <dir> --step assess --status completed --result pending-engineer

  # With case number
  update-state.py --case-dir <dir> --step data-refresh --status active --case-number 2601290030000748
"""
import argparse
import json
import os
import time

ALL_STEPS = ['start', 'data-refresh', 'assess', 'act', 'summarize']


def now_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def load_state(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def init_state(case_number=''):
    return {
        'caseNumber': case_number,
        'updatedAt': now_iso(),
        'currentStep': '',
        'steps': {s: {'status': 'pending'} for s in ALL_STEPS},
    }


def atomic_write(path, data):
    data['updatedAt'] = now_iso()
    tmp = f'{path}.tmp.{os.getpid()}'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser(description='Unified .casework/state.json writer')
    ap.add_argument('--case-dir', required=True, help='Case directory path')
    ap.add_argument('--step', default='', help='Main step name (data-refresh, assess, act, summarize)')
    ap.add_argument('--status', default='', help='Status: pending|active|completed|failed|skipped')
    ap.add_argument('--subtask', default='', help='Subtask name within step (e.g. d365, teams)')
    ap.add_argument('--action', default='', help='Action type within act step (e.g. troubleshooter)')
    ap.add_argument('--duration-ms', type=int, default=0, help='Duration in milliseconds')
    ap.add_argument('--result', default='', help='Result annotation (e.g. pending-engineer)')
    ap.add_argument('--delta', default='', help='JSON delta data for subtask (e.g. \'{"emails":3,"notes":1}\')')
    ap.add_argument('--reasoning', default='', help='Reasoning text for step result')
    ap.add_argument('--detail', default='', help='Live detail text for action')
    ap.add_argument('--case-number', default='', help='Case number')
    args = ap.parse_args()

    casework_dir = os.path.join(args.case_dir, '.casework')
    os.makedirs(casework_dir, exist_ok=True)
    state_path = os.path.join(casework_dir, 'state.json')

    state = load_state(state_path)
    if state is None:
        state = init_state(args.case_number)
    elif args.case_number:
        state['caseNumber'] = args.case_number

    # Ensure all steps exist (idempotent)
    for s in ALL_STEPS:
        if s not in state.get('steps', {}):
            state.setdefault('steps', {})[s] = {'status': 'pending'}

    # No step specified = read-only (just re-write to update timestamp)
    if not args.step:
        atomic_write(state_path, state)
        return

    step_key = args.step
    step_state = state['steps'].get(step_key, {})

    # Subtask update (within a step, e.g. data-refresh → d365)
    if args.subtask:
        subtasks = step_state.get('subtasks', {})
        sub = subtasks.get(args.subtask, {})
        if args.status:
            sub['status'] = args.status
        if args.duration_ms:
            sub['durationMs'] = args.duration_ms
        if args.delta:
            sub['delta'] = json.loads(args.delta)
        subtasks[args.subtask] = sub
        step_state['subtasks'] = subtasks
        state['steps'][step_key] = step_state
        atomic_write(state_path, state)
        print(f'STATE|step={step_key}|subtask={args.subtask}|status={args.status}')
        return

    # Action update (within act step, e.g. troubleshooter)
    if args.action:
        actions = step_state.get('actions', [])
        found = False
        for a in actions:
            if a.get('type') == args.action:
                if args.status:
                    a['status'] = args.status
                if args.duration_ms:
                    a['durationMs'] = args.duration_ms
                if args.detail:
                    a['detail'] = args.detail
                if args.result:
                    a['result'] = args.result
                found = True
                break
        if not found:
            new_action = {'type': args.action}
            if args.status:
                new_action['status'] = args.status
            if args.duration_ms:
                new_action['durationMs'] = args.duration_ms
            if args.detail:
                new_action['detail'] = args.detail
            if args.result:
                new_action['result'] = args.result
            actions.append(new_action)
        step_state['actions'] = actions
        state['steps'][step_key] = step_state
        atomic_write(state_path, state)
        print(f'STATE|step={step_key}|action={args.action}|status={args.status}')
        return

    # Main step status update
    if args.status:
        step_state['status'] = args.status
        if args.status == 'active':
            step_state['startedAt'] = now_iso()
            state['currentStep'] = step_key
        elif args.status in ('completed', 'failed'):
            step_state['completedAt'] = now_iso()
            if args.duration_ms:
                step_state['durationMs'] = args.duration_ms

    if args.result:
        step_state['result'] = args.result

    if args.reasoning:
        step_state['reasoning'] = args.reasoning

    state['steps'][step_key] = step_state
    atomic_write(state_path, state)
    print(f'STATE|step={step_key}|status={args.status}')


if __name__ == '__main__':
    main()
