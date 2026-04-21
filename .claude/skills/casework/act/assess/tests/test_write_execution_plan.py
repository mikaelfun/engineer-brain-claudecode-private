#!/usr/bin/env python3
"""Tests write-execution-plan.py — verifies PRD §4.3 schema."""
import json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, '..', 'scripts', 'write-execution-plan.py')

def run(decision, case_dir):
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump(decision, f)
        dec_path = f.name
    subprocess.check_call([sys.executable, SCRIPT,
                           '--decision', dec_path,
                           '--case-dir', case_dir])
    with open(os.path.join(case_dir, '.casework', 'execution-plan.json')) as f:
        return json.load(f)

def test_full_schema():
    with tempfile.TemporaryDirectory() as cd:
        plan = run({
            'caseNumber': 'T1',
            'actualStatus': 'pending-engineer',
            'daysSinceLastContact': 3,
            'actions': [
                {'type': 'troubleshooter', 'priority': 1, 'status': 'pending'},
            ],
            'noActionReason': None,
            'routingSource': 'llm',
        }, cd)
        assert plan['caseNumber'] == 'T1'
        assert plan['actualStatus'] == 'pending-engineer'
        assert plan['daysSinceLastContact'] == 3
        assert plan['actions'][0]['type'] == 'troubleshooter'
        assert plan['noActionReason'] is None
        assert plan['routingSource'] == 'llm'

def test_delta_empty_path():
    with tempfile.TemporaryDirectory() as cd:
        plan = run({
            'caseNumber': 'T2',
            'actualStatus': 'pending-customer',
            'daysSinceLastContact': 1,
            'actions': [],
            'noActionReason': 'DELTA_EMPTY — no new data, reusing meta',
            'routingSource': 'rule-table',
        }, cd)
        assert plan['actions'] == []
        assert 'DELTA_EMPTY' in plan['noActionReason']

def test_rejects_invalid_status():
    with tempfile.TemporaryDirectory() as cd:
        try:
            run({'caseNumber':'T3','actualStatus':'bogus','daysSinceLastContact':0,
                 'actions':[],'noActionReason':None,'routingSource':'llm'}, cd)
            print('FAIL: should reject bogus status'); sys.exit(1)
        except subprocess.CalledProcessError:
            pass  # expected

if __name__ == '__main__':
    test_full_schema()
    test_delta_empty_path()
    test_rejects_invalid_status()
    print('OK: all 3 write-execution-plan tests pass')
