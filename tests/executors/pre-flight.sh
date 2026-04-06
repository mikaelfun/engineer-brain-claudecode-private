#!/usr/bin/env bash
# tests/executors/pre-flight.sh — Combined Pre-flight Check for Test Supervisor
#
# Usage: bash tests/executors/pre-flight.sh
#
# Combines health-check, gate logic, and trend data into a single compact JSON.
# Designed to replace supervisor's 5+ separate file reads with one script call.
#
# Output: JSON to stdout with fields:
#   gate, gateReason, phase, round, maxRounds, health, staleSince,
#   queues, testQueueHead, fixQueueHead, paused, pendingDirectives,
#   coverage, trends, autoRepaired

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"
DIRECTIVES_FILE="$TESTS_ROOT/directives.json"
# Split state files (PIPELINE_FILE, QUEUES_FILE, STATS_FILE defined in common.sh)

# ============================================================
# Step 1: Auto-repair if state.json is corrupt
# ============================================================
AUTO_REPAIRED="false"

if [ ! -f "$STATE_FILE" ] && [ ! -f "$PIPELINE_FILE" ]; then
  cat << 'EOF'
{
  "gate": "error",
  "gateReason": "state files not found — test loop has not been initialized",
  "currentStage": "UNKNOWN",
  "cycle": 0,
  "maxCycles": 0,
  "health": "warning",
  "staleSince": null,
  "queues": { "test": 0, "fix": 0, "verify": 0, "regression": 0 },
  "testQueueHead": [],
  "fixQueueHead": [],
  "paused": false,
  "pendingDirectives": 0,
  "coverage": "0%",
  "trends": { "passedDelta": [], "failedDelta": [], "fixedDelta": [], "coverageTrend": "unknown" },
  "autoRepaired": false
}
EOF
  exit 0
fi

# Validate state.json is valid JSON (use env var — node can't handle POSIX paths directly)
if ! STATE_PATH="$STATE_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "JSON.parse(require('fs').readFileSync(process.env.STATE_PATH,'utf8'))" 2>/dev/null; then
  # Attempt auto-repair
  if bash "$SCRIPT_DIR/state-repair.sh" >/dev/null 2>&1; then
    AUTO_REPAIRED="true"
    # Re-check after repair
    if ! STATE_PATH="$STATE_FILE" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "JSON.parse(require('fs').readFileSync(process.env.STATE_PATH,'utf8'))" 2>/dev/null; then
      echo '{"gate":"error","gateReason":"state.json corrupt and repair failed","currentStage":"UNKNOWN","cycle":0,"maxCycles":0,"health":"warning","staleSince":null,"queues":{"test":0,"fix":0,"verify":0,"regression":0},"testQueueHead":[],"fixQueueHead":[],"paused":false,"pendingDirectives":0,"coverage":"0%","trends":{"passedDelta":[],"failedDelta":[],"fixedDelta":[],"coverageTrend":"unknown"},"autoRepaired":true}'
      exit 0
    fi
  else
    echo '{"gate":"error","gateReason":"state.json corrupt and state-repair.sh failed","currentStage":"UNKNOWN","cycle":0,"maxCycles":0,"health":"warning","staleSince":null,"queues":{"test":0,"fix":0,"verify":0,"regression":0},"testQueueHead":[],"fixQueueHead":[],"paused":false,"pendingDirectives":0,"coverage":"0%","trends":{"passedDelta":[],"failedDelta":[],"fixedDelta":[],"coverageTrend":"unknown"},"autoRepaired":false}'
    exit 0
  fi
fi

# ============================================================
# Step 2: Run health-check.sh for health data
# ============================================================
HEALTH_JSON=$(bash "$SCRIPT_DIR/health-check.sh" 2>/dev/null)
if [ -z "$HEALTH_JSON" ]; then
  echo '{"gate":"error","gateReason":"health-check.sh produced no output","currentStage":"UNKNOWN","cycle":0,"maxCycles":0,"health":"warning","staleSince":null,"queues":{"test":0,"fix":0,"verify":0,"regression":0},"testQueueHead":[],"fixQueueHead":[],"paused":false,"pendingDirectives":0,"coverage":"0%","trends":{"passedDelta":[],"failedDelta":[],"fixedDelta":[],"coverageTrend":"unknown"},"autoRepaired":'$AUTO_REPAIRED'}'
  exit 0
fi

# ============================================================
# Step 3: Compute gate + trends + queue heads via node
# ============================================================
PREFLIGHT_JSON=$(PIPELINE_PATH="$PIPELINE_FILE" QUEUES_PATH="$QUEUES_FILE" STATE_PATH="$STATE_FILE" DIRECTIVES_PATH="$DIRECTIVES_FILE" RESULTS_PATH="$RESULTS_DIR" AUTO_REPAIRED="$AUTO_REPAIRED" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');

// Parse inputs
const healthData = JSON.parse(process.argv[1]);
let autoRepaired = process.env.AUTO_REPAIRED === 'true';

// Read from split files (primary), fall back to state.json (legacy)
let currentStage, cycle, maxCycles, testQueue, fixQueue, verifyQueue, regressionQueue;
try {
  const pipeline = JSON.parse(fs.readFileSync(process.env.PIPELINE_PATH, 'utf8'));
  const queuesData = JSON.parse(fs.readFileSync(process.env.QUEUES_PATH, 'utf8'));
  currentStage = pipeline.currentStage || 'UNKNOWN';
  cycle = pipeline.cycle || 0;
  maxCycles = pipeline.maxCycles || 50;
  testQueue = queuesData.testQueue || [];
  fixQueue = queuesData.fixQueue || [];
  verifyQueue = queuesData.verifyQueue || [];
  regressionQueue = queuesData.regressionQueue || [];
  // ---- Stage staleness auto-repair ----
  // Detect stages whose completedAt predates the current cycle's SCAN start
  // (residual from previous cycle due to deep-merge not clearing temporal fields)
  const stages = pipeline.stages || {};
  const scanStart = stages.SCAN && stages.SCAN.startedAt ? new Date(stages.SCAN.startedAt).getTime() : 0;
  if (scanStart > 0) {
    const ORDERED = ['VALIDATE', 'FIX', 'VERIFY'];
    let repaired = false;
    for (const p of ORDERED) {
      const s = stages[p];
      if (s && s.status === 'pending' && s.completedAt) {
        const ct = new Date(s.completedAt).getTime();
        if (ct < scanStart) {
          // Stale data from previous cycle — clear temporal fields
          s.summary = null; s.startedAt = null; s.completedAt = null; s.duration_ms = null;
          repaired = true;
        }
      }
    }
    if (repaired) {
      // Write repaired stages back to pipeline.json
      pipeline.stages = stages;
      fs.writeFileSync(process.env.PIPELINE_PATH, JSON.stringify(pipeline, null, 2));
      autoRepaired = true;
    }
  }
} catch(e) {
  const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
  currentStage = state.phase || 'UNKNOWN';
  cycle = state.round || 0;
  maxCycles = state.maxRounds || 50;
  testQueue = state.testQueue || [];
  fixQueue = state.fixQueue || [];
  verifyQueue = state.verifyQueue || [];
  regressionQueue = state.regressionQueue || [];
}

// Read directives
let directives = { paused: false, directives: [] };
try {
  directives = JSON.parse(fs.readFileSync(process.env.DIRECTIVES_PATH, 'utf8'));
} catch(e) {}

const health = healthData.health || 'warning';
const staleSince = healthData.staleSince || null;
const paused = directives.paused || false;

// ---- Queue sizes ----
const queues = {
  test: testQueue.length,
  fix: fixQueue.length,
  verify: verifyQueue.length,
  regression: regressionQueue.length
};

// ---- Queue heads (first 3 items) ----
const testQueueHead = testQueue.slice(0, 3).map(t => typeof t === 'string' ? t : t.testId || t);
const fixQueueHead = fixQueue.slice(0, 3).map(t => ({
  testId: t.testId || t,
  category: t.category || 'unknown',
  priority: t.priority || 5
}));

// ---- Pending directives ----
const pendingDirectives = (directives.directives || [])
  .filter(d => d.status === 'pending').length;
const hasPendingResume = (directives.directives || [])
  .some(d => d.status === 'pending' && d.type === 'resume');

// ---- Gate logic ----
let gate = 'pass';
let gateReason = '';

// Check health errors first
if (healthData.error || health === 'error') {
  gate = 'error';
  gateReason = healthData.error || 'health-check reported error';
} else if (paused && !hasPendingResume) {
  gate = 'paused';
  gateReason = 'Loop paused by supervisor directive (no pending resume)';
} else if (currentStage === 'COMPLETE') {
  gate = 'complete';
  gateReason = 'Test loop complete (cycle ' + cycle + '/' + maxCycles + ')';
} else if (health === 'stuck') {
  // Try to detect if cleanup might help
  const stuckTests = (healthData.stuckTests || []);
  if (stuckTests.length > 0) {
    gate = 'stuck';
    gateReason = stuckTests.length + ' test(s) stuck with retryCount >= 3';
  }
}

// ---- Coverage ----
const coverage = healthData.coverage || '0%';

// ---- Trend data (from last 3 round summaries) ----
const resultsDir = process.env.RESULTS_PATH;
const passedDelta = [];
const failedDelta = [];
const fixedDelta = [];

// Scan for round summary files
const roundSummaries = [];
try {
  const files = fs.readdirSync(resultsDir)
    .filter(f => /^round-\\d+-summary\\.json\$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/round-(\\d+)/)[1]);
      const numB = parseInt(b.match(/round-(\\d+)/)[1]);
      return numA - numB;
    });
  // Take last 3
  const recent = files.slice(-3);
  for (const f of recent) {
    try {
      const summary = JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8'));
      const s = summary.stats || {};
      passedDelta.push(s.passed || 0);
      failedDelta.push(s.failed || 0);
      fixedDelta.push(s.fixed || 0);
      roundSummaries.push(summary);
    } catch(e) {}
  }
} catch(e) {}

// Coverage trend: compare last 2 summaries using corrected coverage values
let coverageTrend = 'unknown';
if (roundSummaries.length >= 2) {
  const prev = roundSummaries[roundSummaries.length - 2].stats || {};
  const curr = roundSummaries[roundSummaries.length - 1].stats || {};
  const prevCov = (prev.coverage || 0) / 100;
  const currCov = (curr.coverage || 0) / 100;
  if (currCov > prevCov + 0.02) coverageTrend = 'improving';
  else if (currCov < prevCov - 0.02) coverageTrend = 'declining';
  else coverageTrend = 'flat';
} else if (roundSummaries.length === 1) {
  coverageTrend = 'insufficient_data';
}

// ---- New metrics: greenRate, fixThroughput, regressionRate ----
// From latest round summary (which now includes these per-round metrics)
let latestGreenRate = null;
let latestRegressionRate = null;
let latestFixThroughput = null;
if (roundSummaries.length > 0) {
  const latest = roundSummaries[roundSummaries.length - 1].stats || {};
  latestGreenRate = latest.greenRate !== undefined ? latest.greenRate : null;
  latestRegressionRate = latest.regressionRate !== undefined ? latest.regressionRate : null;
  latestFixThroughput = latest.fixThroughput !== undefined ? latest.fixThroughput : null;
}
// Also read discoveries.json for live fixThroughput (more current than round summary)
const discFile = path.join(path.dirname(resultsDir), 'discoveries.json');
try {
  const disc = JSON.parse(fs.readFileSync(discFile, 'utf8'));
  const ds = disc.summary || {};
  const dt = ds.total || 0;
  const dv = ds.verified || 0;
  if (dt > 0) latestFixThroughput = Math.round(dv / dt * 100);
} catch(e) {}

// ---- Output ----
const output = {
  gate,
  gateReason: gateReason || undefined,
  currentStage,
  cycle,
  maxCycles,
  health,
  staleSince,
  queues,
  testQueueHead,
  fixQueueHead,
  paused,
  pendingDirectives,
  coverage,
  metrics: {
    greenRate: latestGreenRate,
    fixThroughput: latestFixThroughput,
    regressionRate: latestRegressionRate
  },
  trends: {
    passedDelta,
    failedDelta,
    fixedDelta,
    coverageTrend
  },
  autoRepaired
};

// Clean undefined fields
if (!output.gateReason) delete output.gateReason;

console.log(JSON.stringify(output));
" "$HEALTH_JSON" 2>/dev/null)

if [ -z "$PREFLIGHT_JSON" ]; then
  # Fallback: output health data with gate=error
  echo '{"gate":"error","gateReason":"pre-flight node computation failed","currentStage":"UNKNOWN","cycle":0,"maxCycles":0,"health":"warning","staleSince":null,"queues":{"test":0,"fix":0,"verify":0,"regression":0},"testQueueHead":[],"fixQueueHead":[],"paused":false,"pendingDirectives":0,"coverage":"0%","trends":{"passedDelta":[],"failedDelta":[],"fixedDelta":[],"coverageTrend":"unknown"},"autoRepaired":'$AUTO_REPAIRED'}'
  exit 0
fi

echo "$PREFLIGHT_JSON"
