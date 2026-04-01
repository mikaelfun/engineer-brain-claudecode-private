#!/usr/bin/env bash
# tests/executors/health-check.sh — Independent Health Diagnostic
#
# Usage: bash tests/executors/health-check.sh
#
# Reads: tests/pipeline.json, tests/queues.json, tests/stats.json (split state files)
#         tests/state.json (legacy fallback for phaseHistory)
#         tests/directives.json, tests/results/round-*-summary.json
# Outputs: Structured JSON to stdout (for test-supervisor consumption)
#
# Health determination:
#   stale   — last stageHistory entry > 30 minutes ago
#   stuck   — fixQueue has tests with retryCount >= 3
#   warning — fixQueue non-empty OR coverage < 30%
#   healthy — otherwise

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"
DIRECTIVES_FILE="$TESTS_ROOT/directives.json"
# Split state files (PIPELINE_FILE, QUEUES_FILE, STATS_FILE defined in common.sh)

# ============================================================
# Check prerequisites
# ============================================================
if [ ! -f "$PIPELINE_FILE" ] && [ ! -f "$STATE_FILE" ]; then
  cat << 'NOSTATE'
{
  "timestamp": "",
  "currentStage": "UNKNOWN",
  "cycle": 0,
  "maxCycles": 0,
  "health": "warning",
  "queueSizes": { "test": 0, "fix": 0, "verify": 0, "regression": 0 },
  "cumulative": { "passed": 0, "failed": 0, "fixed": 0, "skipped": 0 },
  "coverage": "0%",
  "lastActivity": null,
  "staleSince": null,
  "stuckTests": [],
  "warnings": ["state files not found — test loop has not been initialized"],
  "pendingDirectives": 0,
  "observabilityStatus": { "probesTotal": 0, "probesRun": 0, "probesPass": 0, "probesFail": 0, "staleCount": 0, "lastResults": {} }
}
NOSTATE
  exit 0
fi

# ============================================================
# Gather all data via single node invocation (performance)
# ============================================================
STATE_PATH="$STATE_FILE"
DIRECTIVES_PATH="$DIRECTIVES_FILE"
RESULTS_PATH="$RESULTS_DIR"

HEALTH_JSON=$(PIPELINE_PATH="$PIPELINE_FILE" QUEUES_PATH="$QUEUES_FILE" STATS_PATH="$STATS_FILE" STATE_PATH="$STATE_PATH" DIRECTIVES_PATH="$DIRECTIVES_PATH" RESULTS_PATH="$RESULTS_PATH" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');

// Read from split files (primary), fall back to state.json (legacy)
let currentStage, cycle, maxCycles, cumulativeStats, stageHistory, testQueueData, fixQueueData;
let pipelineStatus = 'idle';
let verifyQueueData, regressionQueueData, skipRegistryData, stagesData, currentTest;
let lastRoundAt, startedAt;
try {
  const pipeline = JSON.parse(fs.readFileSync(process.env.PIPELINE_PATH, 'utf8'));
  const queuesData = JSON.parse(fs.readFileSync(process.env.QUEUES_PATH, 'utf8'));
  const statsData = JSON.parse(fs.readFileSync(process.env.STATS_PATH, 'utf8'));
  currentStage = pipeline.currentStage || 'UNKNOWN';
  cycle = pipeline.cycle || 0;
  maxCycles = pipeline.maxCycles || 50;
  currentTest = pipeline.currentTest || '';
  stagesData = pipeline.stages || {};
  pipelineStatus = pipeline.pipelineStatus || 'idle';
  cumulativeStats = statsData.cumulative || {};
  testQueueData = queuesData.testQueue || [];
  fixQueueData = queuesData.fixQueue || [];
  verifyQueueData = queuesData.verifyQueue || [];
  regressionQueueData = queuesData.regressionQueue || [];
  skipRegistryData = queuesData.skipRegistry || [];
  // Legacy fields — read from state.json if available
  try {
    const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
    stageHistory = state.phaseHistory || [];
    lastRoundAt = state.lastRoundAt || null;
    startedAt = state.startedAt || null;
  } catch(e2) {
    stageHistory = [];
    lastRoundAt = null;
    startedAt = null;
  }
} catch(e) {
  // Full fallback to state.json (legacy)
  const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
  currentStage = state.phase || 'UNKNOWN';
  cycle = state.round || 0;
  maxCycles = state.maxRounds || 50;
  currentTest = state.currentTest || '';
  stagesData = state.stages || {};
  cumulativeStats = state.stats || {};
  testQueueData = state.testQueue || [];
  fixQueueData = state.fixQueue || [];
  verifyQueueData = state.verifyQueue || [];
  regressionQueueData = state.regressionQueue || [];
  skipRegistryData = state.skipRegistry || [];
  stageHistory = state.phaseHistory || [];
  lastRoundAt = state.lastRoundAt || null;
  startedAt = state.startedAt || null;
}

// Read directives.json (optional)
let directives = { version: 1, paused: false, directives: [] };
try {
  directives = JSON.parse(fs.readFileSync(process.env.DIRECTIVES_PATH, 'utf8'));
} catch(e) {}

const resultsDir = process.env.RESULTS_PATH;
const now = new Date();
const timestamp = now.toISOString();

// ---- Basic info ----
const passed = cumulativeStats.passed || 0;
const failed = cumulativeStats.failed || 0;
const fixed = cumulativeStats.fixed || 0;
const skipped = cumulativeStats.skipped || 0;
// Coverage = distinct testIds that ever passed / total test definitions in registry.
// Count registry YAML files as the true denominator (stats.totalTests may be stale).
const registryDir = path.join(path.dirname(resultsDir), 'registry');
let registryCount = 0;
try {
  const subdirs = fs.readdirSync(registryDir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  for (const sub of subdirs) {
    const files = fs.readdirSync(path.join(registryDir, sub))
      .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    registryCount += files.length;
  }
} catch(e) {}
const totalTests = registryCount || cumulativeStats.totalTests || 0;

// Scan all result files for unique passing testIds (not cumulative run counts).
const passingTestIds = new Set();
try {
  const allResults = fs.readdirSync(resultsDir)
    .filter(f => f.endsWith('.json') && !f.includes('summary') && !f.startsWith('.'));
  for (const rf of allResults) {
    try {
      const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
      if (res.status === 'pass' && res.testId) {
        passingTestIds.add(res.testId);
      }
    } catch(e) {}
  }
} catch(e) {}
const coveragePct = totalTests > 0
  ? (passingTestIds.size / totalTests * 100).toFixed(1)
  : '0.0';
const coverage = coveragePct + '%';

// ---- Queue sizes ----
const testQueue = testQueueData.length;
const fixQueue = fixQueueData.length;
const verifyQueue = verifyQueueData.length;
const regressionQueue = regressionQueueData.length;

// ---- Last activity ----
// Walk stageHistory backwards to find the most recent timestamp or completedAt.
// Also use state file mtime as a signal of recent writes (covers active SCAN/GENERATE).
let lastActivity = null;
for (let i = stageHistory.length - 1; i >= 0; i--) {
  const entry = stageHistory[i];
  const ts = entry.timestamp || entry.completedAt || null;
  if (ts) { lastActivity = ts; break; }
}
if (!lastActivity) lastActivity = lastRoundAt || startedAt || null;

// Also check pipeline.json stages for latest completedAt/startedAt
if (stagesData) {
  for (const stg of Object.values(stagesData)) {
    const ts = stg.completedAt || stg.startedAt || null;
    if (ts && (!lastActivity || new Date(ts) > new Date(lastActivity))) {
      lastActivity = ts;
    }
  }
}

// Also check state file mtime — if the file was written recently,
// the loop is active even if stageHistory hasn't been updated yet.
try {
  const pipelineMtime = fs.statSync(process.env.PIPELINE_PATH).mtime;
  if (!lastActivity || pipelineMtime > new Date(lastActivity)) {
    lastActivity = pipelineMtime.toISOString();
  }
} catch(e) {}
try {
  const stateMtime = fs.statSync(process.env.STATE_PATH).mtime;
  if (!lastActivity || stateMtime > new Date(lastActivity)) {
    lastActivity = stateMtime.toISOString();
  }
} catch(e) {}

// ---- Stuck tests (retryCount >= 3) ----
const stuckTests = fixQueueData
  .filter(t => (t.retryCount || 0) >= 3)
  .map(t => ({ testId: t.testId, retryCount: t.retryCount, reason: t.reason }));

// ---- Skip registry ----
// Read from queues.skipRegistry (maintained by test-loop) or reconstruct from result files.
let skipRegistry = [...skipRegistryData];
// Also scan result files for skip status entries not yet in registry
try {
  const skipFiles = fs.readdirSync(resultsDir)
    .filter(function(f) { return f.endsWith('.json') && f.indexOf('summary') === -1 && !f.startsWith('.'); });
  const knownSkipIds = new Set(skipRegistry.map(function(s) { return s.testId; }));
  for (const sf of skipFiles) {
    try {
      const res = JSON.parse(fs.readFileSync(path.join(resultsDir, sf), 'utf8'));
      if (res.status === 'skip' && res.testId && !knownSkipIds.has(res.testId)) {
        skipRegistry.push({
          testId: res.testId,
          reason: res.reason || res.skipReason || 'unknown',
          round: res.round || 0,
          reviewable: (res.reason || '').indexOf('safety') === -1
        });
        knownSkipIds.add(res.testId);
      }
    } catch(e) {}
  }
} catch(e) {}

// ---- Staleness check (30 min threshold) ----
// Raised from 20→30 min: casework verify runs can take 10-15 min with no phaseHistory update
let staleSince = null;
const STALE_THRESHOLD_MS = 30 * 60 * 1000;
if (lastActivity) {
  const lastTime = new Date(lastActivity).getTime();
  const elapsed = now.getTime() - lastTime;
  if (elapsed > STALE_THRESHOLD_MS) {
    staleSince = lastActivity;
  }
}

// ---- Warnings ----
const warnings = [];
if (directives.paused) {
  warnings.push('Loop is PAUSED by supervisor directive');
}
if (fixQueue > 0) {
  warnings.push('fixQueue has ' + fixQueue + ' test(s) pending repair');
}
const coverageNum = parseFloat(coveragePct);
if (coverageNum < 30 && totalTests > 0) {
  warnings.push('Coverage below 30% (' + coveragePct + '%)');
}
if (stuckTests.length > 0) {
  warnings.push(stuckTests.length + ' test(s) stuck (retryCount >= 3)');
}
if (staleSince) {
  warnings.push('No activity since ' + staleSince);
}

// ---- Health determination (moved after inProgress for correct ordering) ----
// Actual health is computed below, after inProgress is populated

// ---- Pending directives ----
const pendingDirectives = (directives.directives || [])
  .filter(d => d.status === 'pending').length;

// ---- Observability status ----
// Enumerate probe IDs from registry/observability/ directory
const obsDir = path.join(path.dirname(resultsDir), 'registry', 'observability');
const knownProbes = [];
try {
  const obsFiles = fs.readdirSync(obsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  for (const obsFile of obsFiles) {
    // Extract id from YAML file: line starting with 'id:'
    const content = fs.readFileSync(path.join(obsDir, obsFile), 'utf8');
    const lines = content.split(String.fromCharCode(10));
    let foundId = '';
    for (const line of lines) {
      if (line.startsWith('id:')) {
        foundId = line.substring(3).trim().replace(/^[\"']|[\"']$/g, '');
        break;
      }
    }
    knownProbes.push(foundId || obsFile.replace(/\\.ya?ml$/, ''));
  }
} catch(e) {}

// Read probe_schedule.interval_rounds from baselines.yaml
let probeInterval = 5;
try {
  const blPath = path.join(path.dirname(resultsDir), 'baselines.yaml');
  const blContent = fs.readFileSync(blPath, 'utf8');
  const blLines = blContent.split(String.fromCharCode(10));
  let inSection = false;
  for (const line of blLines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('probe_schedule:')) { inSection = true; continue; }
    if (inSection && /^[a-z]/.test(trimmed)) { inSection = false; }
    if (inSection && trimmed.startsWith('interval_rounds:')) {
      probeInterval = parseInt(trimmed.split(':')[1].trim()) || 5;
      break;
    }
  }
} catch(e) {}

let probesRun = 0;
let probesPass = 0;
let probesFail = 0;
let staleCount = 0;
const lastResults = {};

for (const probeId of knownProbes) {
  // Find the latest result file for this probe
  try {
    const files = fs.readdirSync(resultsDir)
      .filter(f => f.endsWith('-' + probeId + '.json'))
      .sort()
      .reverse();
    if (files.length > 0) {
      probesRun++;
      const result = JSON.parse(fs.readFileSync(path.join(resultsDir, files[0]), 'utf8'));
      const probeRound = result.round || 0;
      const isStale = (round - probeRound) > probeInterval;
      if (isStale) staleCount++;
      if (result.status === 'pass') probesPass++;
      else probesFail++;
      lastResults[probeId] = {
        round: probeRound,
        status: result.status,
        timestamp: result.timestamp,
        stale: isStale
      };
    }
  } catch(e) {}
}

// ---- In-Progress Tests (from .progress-*.json files + state.json.currentTest fallback) ----
const inProgress = [];
try {
  const progressFiles = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith('.progress-') && f.endsWith('.json'));
  for (const pf of progressFiles) {
    try {
      const prog = JSON.parse(fs.readFileSync(path.join(resultsDir, pf), 'utf8'));
      const progElapsed = prog.timestamp
        ? Math.round((now.getTime() - new Date(prog.timestamp).getTime()) / 1000)
        : prog.elapsed_s || 0;
      inProgress.push({
        testId: prog.testId,
        type: prog.type || '',
        step: prog.step,
        detail: prog.detail || '',
        elapsed_s: progElapsed
      });
    } catch(e) {}
  }
} catch(e) {}

// Fallback: if no .progress files but pipeline.currentTest is set,
// the main session is doing inline work (FIX analysis, agent spawn, etc.)
if (inProgress.length === 0 && currentTest) {
  // Estimate elapsed from last stageHistory entry timestamp
  let ctElapsed = 0;
  if (lastActivity) {
    ctElapsed = Math.round((now.getTime() - new Date(lastActivity).getTime()) / 1000);
  }
  inProgress.push({
    testId: currentTest,
    type: currentStage.toLowerCase(),
    step: currentStage.toLowerCase() + ':active',
    detail: 'Detected via pipeline.json.currentTest (no .progress file)',
    elapsed_s: ctElapsed
  });
}

if (inProgress.length > 0) {
  // If there are in-progress tests, we're not stale even if phaseHistory is old
  staleSince = null;
}

// Warn if any in-progress test exceeds 15 minutes
for (const ip of inProgress) {
  if (ip.elapsed_s > 900) {
    warnings.push('Test ' + ip.testId + ' running for ' + Math.round(ip.elapsed_s/60) + ' min (step: ' + ip.step + ')');
  }
}

// ---- Health determination ----
let health = 'healthy';
if (staleSince) {
  health = 'stale';
} else if (stuckTests.length > 0) {
  health = 'stuck';
} else if (inProgress.length > 0) {
  health = 'running';
} else if (warnings.length > 0) {
  health = 'warning';
}

// ---- Per-cycle stats (scan result files for current cycle) ----
const cycleStats = { passed: 0, failed: 0, fixed: 0, skipped: 0 };
try {
  const roundPrefix = cycle + '-';
  const resultFiles = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith(roundPrefix) && f.endsWith('.json') && !f.includes('summary'));
  for (const rf of resultFiles) {
    try {
      const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
      if (res.status === 'pass') cycleStats.passed++;
      else if (res.status === 'fail') cycleStats.failed++;
      else if (res.status === 'skip') cycleStats.skipped++;
    } catch(e) {}
  }
  // Fixed = tests that failed in earlier rounds but passed this round
  // Check if any passed tests in this round had previous failures
  for (const rf of resultFiles) {
    try {
      const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
      if (res.status === 'pass' && res.testId) {
        // Check if this test had a fix record
        const fixPath = path.join(resultsDir, 'fixes', res.testId + '-fix.md');
        if (fs.existsSync(fixPath)) cycleStats.fixed++;
      }
    } catch(e) {}
  }
} catch(e) {}

// ---- Previous cycle stats ----
const prevCycleStats = { passed: 0, failed: 0, fixed: 0, skipped: 0 };
if (cycle > 1) {
  try {
    const prevPrefix = (cycle - 1) + '-';
    const prevFiles = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith(prevPrefix) && f.endsWith('.json') && !f.includes('summary'));
    for (const rf of prevFiles) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass') prevCycleStats.passed++;
        else if (res.status === 'fail') prevCycleStats.failed++;
        else if (res.status === 'skip') prevCycleStats.skipped++;
      } catch(e) {}
    }
    for (const rf of prevFiles) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass' && res.testId) {
          const fixPath = path.join(resultsDir, 'fixes', res.testId + '-fix.md');
          if (fs.existsSync(fixPath)) prevCycleStats.fixed++;
        }
      } catch(e) {}
    }
  } catch(e) {}
}

// ---- Stages (aggregate from stageHistory for current cycle) ----
const PHASES_ORDER = ['SCAN', 'GENERATE', 'TEST', 'FIX', 'VERIFY'];
const stages = {};
for (const p of PHASES_ORDER) { stages[p] = { status: 'pending', summary: '' }; }

// Seed from pipeline.stages (baseline — always available even when stageHistory is sparse)
if (stagesData) {
  for (const p of PHASES_ORDER) {
    if (stagesData[p]) {
      stages[p] = Object.assign({}, stages[p], stagesData[p]);
    }
  }
}

// Collect phase entries for current cycle
const roundEntries = stageHistory.filter(e => {
  // Entries with explicit round/cycle field
  if (e.round === cycle || e.cycle === cycle) return true;
  // Entries without round field but belonging to this cycle's timeframe
  if (lastRoundAt && e.timestamp) {
    return new Date(e.timestamp) >= new Date(lastRoundAt);
  }
  return false;
});

// Also include entries that match the current cycle's phases even without round field
// by walking backwards from the end of stageHistory
const allRoundEntries = [];
for (let i = stageHistory.length - 1; i >= 0; i--) {
  const e = stageHistory[i];
  // Stop when we hit a cycle boundary (previous cycle's entries)
  if (e.round !== undefined && e.round < cycle) break;
  if (e.cycle !== undefined && e.cycle < cycle) break;
  // Also stop if entry's phase is later than current stage in a fresh cycle
  if (e.round === undefined && e.cycle === undefined && lastRoundAt && e.timestamp) {
    if (new Date(e.timestamp) < new Date(lastRoundAt)) break;
  }
  if (e.phase && PHASES_ORDER.includes(e.phase)) {
    allRoundEntries.unshift(e);
  }
}

// Merge: use allRoundEntries if roundEntries is sparse
const entries = allRoundEntries.length >= roundEntries.length ? allRoundEntries : roundEntries;

// SCAN summary
const scanEntries = entries.filter(e => e.phase === 'SCAN');
if (scanEntries.length > 0) {
  const last = scanEntries[scanEntries.length - 1];
  stages.SCAN.status = 'done';
  if (last.duration_ms) stages.SCAN.duration_ms = last.duration_ms;
  if (last.gaps !== undefined) {
    stages.SCAN.summary = last.gaps + ' issue gaps, ' + (last.regression_gaps || 0) + ' regression gaps';
  } else if (last.result) {
    // Extract key numbers from result text
    const m = last.result.match(/(\d+)\s*ISSUE_GAP/);
    const mr = last.result.match(/(\d+)\s*ISSUE_REGRESSION_GAP/);
    if (m) stages.SCAN.summary = (m[1]||0) + ' issue gaps' + (mr ? ', ' + mr[1] + ' regression gaps' : '');
    else stages.SCAN.summary = last.result.substring(0, 80);
  }
}

// GENERATE summary
const genEntries = entries.filter(e => e.phase === 'GENERATE');
if (genEntries.length > 0) {
  const last = genEntries[genEntries.length - 1];
  stages.GENERATE.status = 'done';
  if (last.duration_ms) stages.GENERATE.duration_ms = last.duration_ms;
  if (last.result) {
    const m = last.result.match(/(\d+)\s*new test/i);
    stages.GENERATE.summary = m ? m[1] + ' tests created' : last.result.substring(0, 80);
  }
}

// TEST summary (count pass/fail from entries)
const testPassCount = entries.filter(e => e.action === 'test_pass').length;
const testFailCount = entries.filter(e => e.action === 'test_fail').length;
const testComplete = entries.find(e => e.phase === 'TEST' && e.action === 'phase_complete');
if (testPassCount > 0 || testFailCount > 0 || testComplete) {
  // Use cycleStats as more accurate source (from result files)
  const tp = cycleStats.passed || testPassCount;
  const tf = cycleStats.failed || testFailCount;
  const total = tp + tf;
  const rate = total > 0 ? Math.round(tp / total * 100) : 0;
  stages.TEST.status = stages.TEST.status !== 'pending' ? stages.TEST.status : (currentStage === 'TEST' ? 'running' : 'pending');
  stages.TEST.summary = tp + ' pass, ' + tf + ' fail' + (total > 0 ? ' (' + rate + '%)' : '');
  if (testComplete && testComplete.timestamp && genEntries.length > 0) {
    const genLast = genEntries[genEntries.length - 1];
    if (genLast.timestamp) {
      stages.TEST.duration_ms = new Date(testComplete.timestamp).getTime() - new Date(genLast.timestamp).getTime();
    }
  }
}

// FIX summary
const fixEntries = entries.filter(e => e.currentStage === 'FIX');
const batchFix = fixEntries.find(e => e.action === 'batch-fix');
const fixPassEntries = fixEntries.filter(e => e.action === 'fix_pass' || e.action === 'fix_done');
const fixFailEntries = fixEntries.filter(e => e.action === 'fix_fail' || e.action === 'fix_skip');
let fixedCount = 0;
let unfixableCount = fixFailEntries.length;
if (batchFix) {
  fixedCount = batchFix.fixedTests || 0;
} else {
  fixedCount = fixPassEntries.length;
}
if (fixEntries.length > 0 || currentStage === 'FIX') {
  stages.FIX.status = stages.FIX.status !== 'pending' ? stages.FIX.status : (currentStage === 'FIX' ? 'running' : 'pending');
  const fixPending = (currentStage === 'FIX') ? fixQueue : 0;
  stages.FIX.summary = fixedCount + ' fixed, ' + unfixableCount + ' unfixable, ' + fixPending + ' pending';
}

// VERIFY summary
const verifyPassEntries = entries.filter(e => e.action === 'verify_pass');
const verifyFailEntries = entries.filter(e => e.action === 'verify_fail' || e.action === 'verify_regressed');
if (verifyPassEntries.length > 0 || verifyFailEntries.length > 0 || currentStage === 'VERIFY') {
  stages.VERIFY.status = stages.VERIFY.status !== 'pending' ? stages.VERIFY.status : (currentStage === 'VERIFY' ? 'running' : 'pending');
  const vPending = (currentStage === 'VERIFY') ? verifyQueue : 0;
  stages.VERIFY.summary = verifyPassEntries.length + ' verified, ' + verifyFailEntries.length + ' regressed, ' + vPending + ' pending';
}

// Mark current stage as running if not already done
if (stages[currentStage] && stages[currentStage].status === 'pending') {
  stages[currentStage].status = 'running';
}

// ---- Infer missing durations from consecutive phase timestamps ----
// Collect the earliest timestamp per phase (start) from entries
const phaseTimestamps = {};
for (const e of entries) {
  if (e.phase && e.timestamp) {
    if (!phaseTimestamps[e.phase]) {
      phaseTimestamps[e.phase] = { first: e.timestamp, last: e.timestamp };
    } else {
      if (e.timestamp < phaseTimestamps[e.phase].first) phaseTimestamps[e.phase].first = e.timestamp;
      if (e.timestamp > phaseTimestamps[e.phase].last) phaseTimestamps[e.phase].last = e.timestamp;
    }
  }
}
// For each phase without duration_ms, compute from: phase.first → nextPhase.first (or phase.last if no next)
for (let pi = 0; pi < PHASES_ORDER.length; pi++) {
  const p = PHASES_ORDER[pi];
  if (stages[p].status !== 'pending' && !stages[p].duration_ms && phaseTimestamps[p]) {
    // Find next phase that has a timestamp
    let endTs = null;
    for (let ni = pi + 1; ni < PHASES_ORDER.length; ni++) {
      if (phaseTimestamps[PHASES_ORDER[ni]]) {
        endTs = phaseTimestamps[PHASES_ORDER[ni]].first;
        break;
      }
    }
    // Also try: use lastRoundAt as SCAN start if SCAN has only one timestamp
    if (p === 'SCAN' && lastRoundAt) {
      const scanStart = new Date(lastRoundAt).getTime();
      const scanEnd = endTs ? new Date(endTs).getTime() : new Date(phaseTimestamps[p].last).getTime();
      if (scanEnd > scanStart) {
        stages[p].duration_ms = scanEnd - scanStart;
      }
    } else if (endTs) {
      const dur = new Date(endTs).getTime() - new Date(phaseTimestamps[p].first).getTime();
      if (dur > 0) stages[p].duration_ms = dur;
    }
  }
}

// Fix/Verify breakdowns
const fixBreakdown = {
  fixed: fixedCount,
  unfixable: unfixableCount,
  pending: (currentStage === 'FIX') ? fixQueue : 0,
  total: cycleStats.failed || (testFailCount + fixedCount)
};
const verifyBreakdown = {
  verified: verifyPassEntries.length,
  regressed: verifyFailEntries.length,
  pending: verifyQueue
};

// ---- Output ----
const output = {
  timestamp,
  currentStage,
  cycle,
  maxCycles,
  pipelineStatus,
  health,
  queueSizes: {
    test: testQueue,
    fix: fixQueue,
    verify: verifyQueue,
    regression: regressionQueue
  },
  cumulative: { passed, failed, fixed, skipped, unresolved: fixQueue },
  skipRegistry,
  cycleStats,
  prevCycleStats,
  coverage,
  lastActivity,
  staleSince,
  stuckTests,
  warnings,
  pendingDirectives,
  inProgress,
  stages,
  fixBreakdown,
  verifyBreakdown,
  observabilityStatus: {
    probesTotal: knownProbes.length,
    probesRun,
    probesPass,
    probesFail,
    staleCount,
    lastResults
  }
};

console.log(JSON.stringify(output, null, 2));
" 2>/dev/null)

if [ -z "$HEALTH_JSON" ]; then
  echo '{"error": "Failed to generate health report", "health": "warning"}'
  exit 1
fi

echo "$HEALTH_JSON"
