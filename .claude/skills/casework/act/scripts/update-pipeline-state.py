#!/usr/bin/env python3
"""
Atomic upsert of .casework/pipeline-state.json.
Usage: update-pipeline-state.py --case-dir <dir> --step <name> --status <running|completed|failed>
       [--case-number <cn>] [--mode <full|patrol>] [--actions <json-array>]
"""
import argparse, json, os, time

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--case-dir', required=True)
    ap.add_argument('--step', required=True)
    ap.add_argument('--status', required=True, choices=['pending', 'running', 'completed', 'failed'])
    ap.add_argument('--case-number', default='')
    ap.add_argument('--mode', default='full')
    ap.add_argument('--actions', default='[]')
    args = ap.parse_args()

    path = os.path.join(args.case_dir, '.casework', 'pipeline-state.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)

    try:
        state = json.load(open(path, encoding='utf-8'))
    except (FileNotFoundError, json.JSONDecodeError):
        state = {
            'caseNumber': args.case_number,
            'mode': args.mode,
            'startedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'currentStep': '',
            'steps': {},
        }

    now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    step_state = state.get('steps', {}).get(args.step, {})

    if args.status == 'running':
        step_state['status'] = 'running'
        step_state['startedAt'] = now
        state['currentStep'] = args.step
    elif args.status == 'completed':
        step_state['status'] = 'completed'
        step_state['completedAt'] = now
    elif args.status == 'failed':
        step_state['status'] = 'failed'
        step_state['completedAt'] = now
        step_state['error'] = True

    state.setdefault('steps', {})[args.step] = step_state

    # Atomic write
    tmp = path + f'.tmp.{os.getpid()}'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)
    print(f'PIPELINE_STATE|step={args.step}|status={args.status}')

if __name__ == '__main__':
    main()
