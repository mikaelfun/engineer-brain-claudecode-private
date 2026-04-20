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

  # Init with run type (ISS-231: creates runs/ directory)
  update-state.py --case-dir <dir> --init --run-type patrol
  update-state.py --case-dir <dir> --init --run-type casework
"""
import argparse
import json
import os
import sys
import time
from contextlib import contextmanager
from datetime import datetime

ALL_STEPS = ['start', 'data-refresh', 'assess', 'act', 'summarize']
VALID_RUN_TYPES = ['patrol', 'casework', 'step-data-refresh', 'step-assess', 'step-act', 'step-summarize']


def now_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def load_state(path):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def generate_run_id(run_type):
    """Generate runId: YYMMDD-HHMM_{type}"""
    return f"{datetime.now():%y%m%d-%H%M}_{run_type}"


def create_run_dir(casework_dir, run_id):
    """Create the run directory structure under .casework/runs/{runId}/"""
    run_dir = os.path.join(casework_dir, 'runs', run_id)
    for subdir in ['scripts', 'output', 'output/subtasks', 'agents']:
        os.makedirs(os.path.join(run_dir, subdir), exist_ok=True)
    return run_dir


def init_state(case_number='', run_id='', run_type=''):
    state = {
        'caseNumber': case_number,
        'updatedAt': now_iso(),
        'currentStep': '',
        'steps': {s: {'status': 'pending'} for s in ALL_STEPS},
    }
    if run_id:
        state['runId'] = run_id
    if run_type:
        state['runType'] = run_type
    return state


@contextmanager
def file_lock(lock_path, timeout=30):
    """Cross-platform file lock using a .lock file with PID.
    Prevents TOCTOU race conditions when multiple parallel processes
    (data-refresh subtasks) read-modify-write state.json concurrently.
    """
    deadline = time.monotonic() + timeout
    while True:
        try:
            # O_CREAT | O_EXCL: atomic create-or-fail (works on both NTFS and POSIX)
            fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            break
        except FileExistsError:
            # Check for stale lock (holder crashed)
            try:
                age = time.time() - os.path.getmtime(lock_path)
                if age > timeout:
                    os.remove(lock_path)
                    continue
            except OSError:
                pass
            if time.monotonic() > deadline:
                # Last resort: force-remove stale lock
                try:
                    os.remove(lock_path)
                except OSError:
                    pass
                raise TimeoutError(f'Could not acquire lock {lock_path} in {timeout}s')
            time.sleep(0.05)
    try:
        yield
    finally:
        try:
            os.remove(lock_path)
        except OSError:
            pass


def atomic_write(path, data):
    data['updatedAt'] = now_iso()
    tmp = f'{path}.tmp.{os.getpid()}'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser(description='Unified .casework/state.json writer')
    ap.add_argument('--case-dir', required=True, help='Case directory path')
    ap.add_argument('--init', action='store_true',
                    help='Reset all steps to pending (new casework session). Preserves caseNumber.')
    ap.add_argument('--run-type', default='', choices=[''] + VALID_RUN_TYPES,
                    help='Run type for --init: patrol|casework|step-*. Creates runs/{runId}/ directory.')
    ap.add_argument('--step', default='', help='Main step name (data-refresh, assess, act, summarize)')
    ap.add_argument('--status', default='', help='Status: pending|active|completed|failed|skipped')
    ap.add_argument('--subtask', default='', help='Subtask name within step (e.g. d365, teams)')
    ap.add_argument('--action', default='', help='Action type within act step (e.g. troubleshooter)')
    ap.add_argument('--duration-ms', type=int, default=None, help='Duration in milliseconds')
    ap.add_argument('--result', default='', help='Result annotation (e.g. pending-engineer)')
    ap.add_argument('--delta', default='', help='JSON delta data for subtask (e.g. \'{"emails":3,"notes":1}\')')
    ap.add_argument('--reasoning', default='', help='Reasoning text for step result')
    ap.add_argument('--detail', default='', help='Live detail text for action')
    ap.add_argument('--case-number', default='', help='Case number')
    args = ap.parse_args()

    casework_dir = os.path.join(args.case_dir, '.casework')
    os.makedirs(casework_dir, exist_ok=True)
    state_path = os.path.join(casework_dir, 'state.json')
    lock_path = state_path + '.lock'

    # All state mutations are done under file_lock to prevent TOCTOU race
    # conditions when multiple parallel subtasks (d365, teams, icm, onenote,
    # attachments) call update-state.py concurrently during data-refresh.
    with file_lock(lock_path):
        state = load_state(state_path)
        if state is None:
            state = init_state(args.case_number)
        elif args.case_number:
            state['caseNumber'] = args.case_number

        # --init: reset all steps to pending (new casework session)
        # Preserves caseNumber but wipes all step/substep/action state.
        # ISS-231: Also generates runId and creates runs/ directory.
        if args.init:
            case_num = state.get('caseNumber', args.case_number)
            run_type = args.run_type or 'casework'
            run_id = generate_run_id(run_type)
            state = init_state(case_num, run_id, run_type)
            # Create run directory structure
            create_run_dir(casework_dir, run_id)
            if not args.step:
                # --init without --step: just reset and exit
                atomic_write(state_path, state)
                print(f'STATE|init|case={case_num}|runId={run_id}')
                return

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
            if args.duration_ms is not None:
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
                        if args.status == 'active':
                            a['startedAt'] = now_iso()
                        elif args.status in ('completed', 'failed'):
                            a['completedAt'] = now_iso()
                            if args.duration_ms is not None:
                                a['durationMs'] = args.duration_ms
                            elif 'startedAt' in a:
                                try:
                                    s = datetime.strptime(a['startedAt'], '%Y-%m-%dT%H:%M:%SZ')
                                    e = datetime.strptime(a['completedAt'], '%Y-%m-%dT%H:%M:%SZ')
                                    a['durationMs'] = int((e - s).total_seconds() * 1000)
                                except (ValueError, KeyError):
                                    pass
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
                    if args.status == 'active':
                        new_action['startedAt'] = now_iso()
                if args.duration_ms is not None:
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
                if args.duration_ms is not None:
                    step_state['durationMs'] = args.duration_ms
                elif 'startedAt' in step_state:
                    # Auto-compute durationMs from startedAt if caller didn't provide it
                    try:
                        start_ts = datetime.strptime(step_state['startedAt'], '%Y-%m-%dT%H:%M:%SZ')
                        end_ts = datetime.strptime(step_state['completedAt'], '%Y-%m-%dT%H:%M:%SZ')
                        step_state['durationMs'] = int((end_ts - start_ts).total_seconds() * 1000)
                    except (ValueError, KeyError):
                        pass

        if args.result:
            step_state['result'] = args.result

        if args.reasoning:
            step_state['reasoning'] = args.reasoning

        state['steps'][step_key] = step_state
        atomic_write(state_path, state)
        print(f'STATE|step={step_key}|status={args.status}')


if __name__ == '__main__':
    main()
