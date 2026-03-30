#!/usr/bin/env bash
# tests/executors/state-migrate.sh — Migrate state.json → split state files
#
# Usage:
#   bash tests/executors/state-migrate.sh              # migrate + keep state.json
#   bash tests/executors/state-migrate.sh --dry-run     # show what would be created
#
# Creates:
#   tests/pipeline.json   — core pipeline state (~20 lines)
#   tests/queues.json     — all queues + skip registry
#   tests/stats.json      — cumulative + cycle stats + observability
#   tests/supervisor.json — runner status + reasoning
#
# Field renames:
#   round → cycle, phase → currentStage, maxRounds → maxCycles
#   roundJourney → stages, roundStats → cycleStats
#   phaseHistory → stageHistory (archived to history/)
#   runnerActive → active, runnerStep → step

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STATE_FILE="$TESTS_ROOT/state.json"

DRY_RUN="false"
[ "${1:-}" = "--dry-run" ] && DRY_RUN="true"

if [ ! -f "$STATE_FILE" ]; then
  echo "MIGRATE|error|state.json not found at $STATE_FILE"
  exit 1
fi

# Use node for reliable JSON manipulation
DASHBOARD_DIR="$(cd "$TESTS_ROOT/../dashboard" && pwd)"

RESULT=$(TESTS_ROOT="$TESTS_ROOT" STATE_PATH="$STATE_FILE" DRY_RUN="$DRY_RUN" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');

const testsRoot = process.env.TESTS_ROOT;
const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
const dryRun = process.env.DRY_RUN === 'true';

// ============================================================
// 1. pipeline.json — core pipeline state
// ============================================================
const pipeline = {
  cycle: state.round || 0,
  maxCycles: state.maxRounds || 80,
  currentStage: state.phase || 'IDLE',
  currentTest: state.currentTest || '',
  stageProgress: state.phaseProgress || null,
  stages: {}
};

// Map roundJourney → stages
const rj = state.roundJourney || {};
for (const phase of ['SCAN', 'GENERATE', 'TEST', 'FIX', 'VERIFY']) {
  const entry = rj[phase] || {};
  pipeline.stages[phase] = {
    status: entry.status || 'pending',
    summary: entry.summary || '',
    duration_ms: entry.duration_ms || 0,
    startedAt: entry.startedAt || null,
    completedAt: entry.completedAt || null
  };
  // Carry over extra fields (verifyProcessed, etc.)
  for (const [k, v] of Object.entries(entry)) {
    if (!['status','summary','duration_ms','startedAt','completedAt'].includes(k)) {
      pipeline.stages[phase][k] = v;
    }
  }
}

// ============================================================
// 2. queues.json — all queues + skip registry
// ============================================================
const queues = {
  testQueue: state.testQueue || [],
  fixQueue: state.fixQueue || [],
  verifyQueue: state.verifyQueue || [],
  regressionQueue: state.regressionQueue || [],
  gaps: state.gaps || [],
  inProgress: state.inProgress || [],
  skipRegistry: state.skipRegistry || []
};

// ============================================================
// 3. stats.json — metrics + observability
// ============================================================
const stats = {
  cumulative: state.stats || { passed: 0, failed: 0, fixed: 0, skipped: 0 },
  cycleStats: state.roundStats || { passed: 0, failed: 0, fixed: 0, skipped: 0 },
  scanStrategy: state.scanStrategy || null,
  observabilityStatus: state.observabilityStatus || null
};

// ============================================================
// 4. supervisor.json — runner status + reasoning
// ============================================================
const supervisor = {
  status: state.status || 'idle',
  tick: 0,
  active: state.runnerActive || null,
  step: state.runnerStep || null,
  reasoning: {
    observe: null,
    diagnose: null,
    decide: null,
    act: null,
    reflect: null
  },
  selfHealEvent: null,
  schedulerInterval: null,
  lastTickAt: null
};

// ============================================================
// 5. Archive stageHistory (phaseHistory renamed)
// ============================================================
const stageHistory = (state.phaseHistory || []).map(entry => ({
  ...entry,
  stage: entry.phase,  // rename phase → stage
  cycle: entry.round   // rename round → cycle
}));

if (dryRun) {
  console.log(JSON.stringify({
    action: 'dry-run',
    pipeline: { lines: JSON.stringify(pipeline, null, 2).split('\\n').length },
    queues: { lines: JSON.stringify(queues, null, 2).split('\\n').length },
    stats: { lines: JSON.stringify(stats, null, 2).split('\\n').length },
    supervisor: { lines: JSON.stringify(supervisor, null, 2).split('\\n').length },
    stageHistory: { entries: stageHistory.length }
  }, null, 2));
  process.exit(0);
}

// ============================================================
// Write files atomically
// ============================================================
function atomicWrite(filepath, data) {
  const content = JSON.stringify(data, null, 2) + '\\n';
  const tmp = filepath + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filepath);
  return content.split('\\n').length;
}

const results = {};
results.pipeline = atomicWrite(path.join(testsRoot, 'pipeline.json'), pipeline);
results.queues = atomicWrite(path.join(testsRoot, 'queues.json'), queues);
results.stats = atomicWrite(path.join(testsRoot, 'stats.json'), stats);
results.supervisor = atomicWrite(path.join(testsRoot, 'supervisor.json'), supervisor);

// Archive stageHistory if non-empty
if (stageHistory.length > 0) {
  const cycle = pipeline.cycle;
  const histDir = path.join(testsRoot, 'history');
  if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });
  atomicWrite(path.join(histDir, 'cycle-' + String(cycle).padStart(3, '0') + '-history.json'), stageHistory);
  results.historyArchived = stageHistory.length;
}

console.log(JSON.stringify({
  action: 'migrated',
  files: results,
  stageHistoryArchived: stageHistory.length,
  note: 'state.json preserved for backward compat'
}, null, 2));
" 2>&1)

echo "$RESULT"

if echo "$RESULT" | grep -q '"action"'; then
  echo ""
  echo "MIGRATE|success|State files created"
else
  echo "MIGRATE|error|Migration failed"
  exit 1
fi
