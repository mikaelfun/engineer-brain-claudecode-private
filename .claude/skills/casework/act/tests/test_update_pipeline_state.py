#!/usr/bin/env python3
import json, os, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'scripts', 'update-pipeline-state.py')

def run(case_dir, step, status, extra_args=None):
    import subprocess
    cmd = [sys.executable, SCRIPT, '--case-dir', case_dir, '--step', step, '--status', status]
    if extra_args:
        cmd.extend(extra_args)
    r = subprocess.run(cmd, capture_output=True, text=True)
    assert r.returncode == 0, f"FAIL: {r.stderr}"
    return json.load(open(os.path.join(case_dir, '.casework', 'pipeline-state.json'), encoding='utf-8'))

def test_create_new():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        s = run(td, 'troubleshooter', 'running')
        assert s['steps']['troubleshooter']['status'] == 'running'
        assert s['currentStep'] == 'troubleshooter'
    print('  ✓ create_new')

def test_update_existing():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        s = run(td, 'troubleshooter', 'completed')
        assert s['steps']['troubleshooter']['status'] == 'completed'
        assert 'completedAt' in s['steps']['troubleshooter']
    print('  ✓ update_existing')

def test_current_step_tracks_running():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        s = run(td, 'email-drafter', 'running')
        assert s['currentStep'] == 'email-drafter'
    print('  ✓ current_step_tracks_running')

def test_completed_does_not_change_current():
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, '.casework'))
        run(td, 'troubleshooter', 'running')
        run(td, 'email-drafter', 'running')
        s = run(td, 'troubleshooter', 'completed')
        assert s['currentStep'] == 'email-drafter'
    print('  ✓ completed_preserves_current')

if __name__ == '__main__':
    print('=== update-pipeline-state tests ===')
    test_create_new()
    test_update_existing()
    test_current_step_tracks_running()
    test_completed_does_not_change_current()
    print('=== all passed ===')
