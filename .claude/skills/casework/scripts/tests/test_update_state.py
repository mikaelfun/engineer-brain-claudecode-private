#!/usr/bin/env python3
"""Tests for update-state.py — unified .casework/state.json writer."""
import json, os, sys, tempfile, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'update-state.py')

def run(case_dir, args: list[str]) -> dict:
    """Run update-state.py and return the resulting state.json."""
    cmd = [sys.executable, SCRIPT, '--case-dir', case_dir] + args
    r = subprocess.run(cmd, capture_output=True, text=True)
    assert r.returncode == 0, f"FAIL (exit {r.returncode}): {r.stderr}"
    state_path = os.path.join(case_dir, '.casework', 'state.json')
    assert os.path.exists(state_path), f"state.json not created at {state_path}"
    return json.load(open(state_path, encoding='utf-8'))


def test_main_step_active():
    """--step data-refresh --status active creates state.json with step active."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active'])
        assert s['currentStep'] == 'data-refresh'
        assert s['steps']['data-refresh']['status'] == 'active'
        assert 'startedAt' in s['steps']['data-refresh']
        assert s['steps']['assess']['status'] == 'pending'
        assert s['steps']['act']['status'] == 'pending'
        assert s['steps']['summarize']['status'] == 'pending'
        assert 'updatedAt' in s
    print('  ✓ main_step_active')


def test_main_step_completed():
    """Transitioning a step from active to completed sets completedAt and durationMs."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        s = run(td, ['--step', 'data-refresh', '--status', 'completed', '--duration-ms', '128701'])
        assert s['steps']['data-refresh']['status'] == 'completed'
        assert s['steps']['data-refresh']['durationMs'] == 128701
        assert 'completedAt' in s['steps']['data-refresh']
    print('  ✓ main_step_completed')


def test_step_transition_updates_current():
    """When assess becomes active, currentStep changes to assess."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'completed', '--duration-ms', '1000'])
        s = run(td, ['--step', 'assess', '--status', 'active'])
        assert s['currentStep'] == 'assess'
        assert s['steps']['data-refresh']['status'] == 'completed'
        assert s['steps']['assess']['status'] == 'active'
    print('  ✓ step_transition_updates_current')


def test_subtask_update():
    """--subtask d365 updates nested subtasks within data-refresh."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        s = run(td, ['--step', 'data-refresh', '--subtask', 'd365', '--status', 'completed', '--duration-ms', '50598'])
        subtasks = s['steps']['data-refresh']['subtasks']
        assert subtasks['d365']['status'] == 'completed'
        assert subtasks['d365']['durationMs'] == 50598
    print('  ✓ subtask_update')


def test_multiple_subtasks():
    """Multiple subtask updates accumulate."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        run(td, ['--step', 'data-refresh', '--subtask', 'd365', '--status', 'completed', '--duration-ms', '50000'])
        s = run(td, ['--step', 'data-refresh', '--subtask', 'teams', '--status', 'completed', '--duration-ms', '22000'])
        subtasks = s['steps']['data-refresh']['subtasks']
        assert subtasks['d365']['status'] == 'completed'
        assert subtasks['teams']['status'] == 'completed'
        assert subtasks['d365']['durationMs'] == 50000
        assert subtasks['teams']['durationMs'] == 22000
    print('  ✓ multiple_subtasks')


def test_action_update():
    """--action troubleshooter updates act step actions array."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        s = run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'active'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 1
        assert actions[0]['type'] == 'troubleshooter'
        assert actions[0]['status'] == 'active'
    print('  ✓ action_update')


def test_action_upsert():
    """Second call for same action type upserts, not appends."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'active'])
        s = run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'completed', '--duration-ms', '45000'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 1
        assert actions[0]['status'] == 'completed'
        assert actions[0]['durationMs'] == 45000
    print('  ✓ action_upsert')


def test_multiple_actions():
    """Multiple different actions in act step."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'act', '--status', 'active'])
        run(td, ['--step', 'act', '--action', 'troubleshooter', '--status', 'completed', '--duration-ms', '45000'])
        s = run(td, ['--step', 'act', '--action', 'email-drafter', '--status', 'active'])
        actions = s['steps']['act']['actions']
        assert len(actions) == 2
        assert actions[0]['type'] == 'troubleshooter'
        assert actions[0]['status'] == 'completed'
        assert actions[1]['type'] == 'email-drafter'
        assert actions[1]['status'] == 'active'
    print('  ✓ multiple_actions')


def test_result_annotation():
    """--result sets the result field on a step."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'assess', '--status', 'completed', '--result', 'pending-engineer'])
        state_path = os.path.join(td, '.casework', 'state.json')
        s = json.load(open(state_path, encoding='utf-8'))
        assert s['steps']['assess']['result'] == 'pending-engineer'
    print('  ✓ result_annotation')


def test_case_number():
    """--case-number is persisted."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active', '--case-number', '2601290030000748'])
        assert s['caseNumber'] == '2601290030000748'
    print('  ✓ case_number')


def test_atomic_write():
    """state.json is written atomically (no .tmp file left behind)."""
    with tempfile.TemporaryDirectory() as td:
        run(td, ['--step', 'data-refresh', '--status', 'active'])
        casework_dir = os.path.join(td, '.casework')
        files = os.listdir(casework_dir)
        tmp_files = [f for f in files if '.tmp' in f]
        assert len(tmp_files) == 0, f"Temp files left behind: {tmp_files}"
    print('  ✓ atomic_write')


def test_init_creates_all_steps():
    """First call creates all 4 main steps in state.json."""
    with tempfile.TemporaryDirectory() as td:
        s = run(td, ['--step', 'data-refresh', '--status', 'active'])
        assert set(s['steps'].keys()) == {'data-refresh', 'assess', 'act', 'summarize'}
    print('  ✓ init_creates_all_steps')


if __name__ == '__main__':
    print('=== update-state.py tests ===')
    test_main_step_active()
    test_main_step_completed()
    test_step_transition_updates_current()
    test_subtask_update()
    test_multiple_subtasks()
    test_action_update()
    test_action_upsert()
    test_multiple_actions()
    test_result_annotation()
    test_case_number()
    test_atomic_write()
    test_init_creates_all_steps()
    print('=== all 12 tests passed ===')
