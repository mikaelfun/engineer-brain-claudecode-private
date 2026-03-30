#!/usr/bin/env bash
# tests/executors/health-check.sh — Independent Health Diagnostic
#
# Usage: bash tests/executors/health-check.sh
#
# Reads: tests/state.json, tests/directives.json, tests/results/round-*-summary.json
# Outputs: Structured JSON to stdout (for test-supervisor consumption)
#
# Health determination:
#   stale   — last phaseHistory entry > 30 minutes ago
#   stuck   — fixQueue has tests with retryCount >= 3
#   warning — fixQueue non-empty OR coverage < 30%
#   healthy — otherwise

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

STATE_FILE="$TESTS_ROOT/state.json"
DIRECTIVES_FILE="$TESTS_ROOT/directives.json"

# ============================================================
# Check prerequisites
# ============================================================
if [ ! -f "$STATE_FILE" ]; then
  cat << 'NOSTATE'
{
  "timestamp": "",
  "phase": "UNKNOWN",
  "round": 0,
  "maxRounds": 0,
  "health": "warning",
  "queueSizes": { "test": 0, "fix": 0, "verify": 0, "regression": 0 },
  "stats": { "passed": 0, "failed": 0, "fixed": 0, "skipped": 0 },
  "coverage": "0%",
  "lastActivity": null,
  "staleSince": null,
  "stuckTests": [],
  "warnings": ["state.json not found — test loop has not been initialized"],
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

HEALTH_JSON=$(STATE_PATH="$STATE_PATH" DIRECTIVES_PATH="$DIRECTIVES_PATH" RESULTS_PATH="$RESULTS_PATH" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
const fs = require('fs');
const path = require('path');

// Read state.json
const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));

// Read directives.json (optional)
let directives = { version: 1, paused: false, directives: [] };
try {
  directives = JSON.parse(fs.readFileSync(process.env.DIRECTIVES_PATH, 'utf8'));
} catch(e) {}

const resultsDir = process.env.RESULTS_PATH;
const now = new Date();
const timestamp = now.toISOString();

// ---- Basic info ----
const phase = state.phase || 'UNKNOWN';
const round = state.round || 0;
const maxRounds = state.maxRounds || 50;
const stats = state.stats || {};
const passed = stats.passed || 0;
const failed = stats.failed || 0;
const fixed = stats.fixed || 0;
const skipped = stats.skipped || 0;
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
const totalTests = registryCount || stats.totalTests || 0;

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
const testQueue = (state.testQueue || []).length;
const fixQueue = (state.fixQueue || []).length;
const verifyQueue = (state.verifyQueue || []).length;
const regressionQueue = (state.regressionQueue || []).length;

// ---- Last activity ----
// Walk phaseHistory backwards to find the most recent timestamp or completedAt.
// Also use state.json file mtime as a signal of recent writes (covers active SCAN/GENERATE).
const phaseHistory = state.phaseHistory || [];
let lastActivity = null;
for (let i = phaseHistory.length - 1; i >= 0; i--) {
  const entry = phaseHistory[i];
  const ts = entry.timestamp || entry.completedAt || null;
  if (ts) { lastActivity = ts; break; }
}
if (!lastActivity) lastActivity = state.lastRoundAt || state.startedAt || null;

// Also check state.json file mtime — if the file was written recently,
// the loop is active even if phaseHistory hasn't been updated yet.
try {
  const stateMtime = fs.statSync(process.env.STATE_PATH).mtime;
  if (!lastActivity || stateMtime > new Date(lastActivity)) {
    lastActivity = stateMtime.toISOString();
  }
} catch(e) {}

// ---- Stuck tests (retryCount >= 3) ----
const stuckTests = (state.fixQueue || [])
  .filter(t => (t.retryCount || 0) >= 3)
  .map(t => ({ testId: t.testId, retryCount: t.retryCount, reason: t.reason }));

// ---- Skip registry ----
// Read from state.skipRegistry (maintained by test-loop) or reconstruct from result files.
let skipRegistry = state.skipRegistry || [];
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

// Fallback: if no .progress files but state.json.currentTest is set,
// the main session is doing inline work (FIX analysis, agent spawn, etc.)
const currentTest = state.currentTest || '';
if (inProgress.length === 0 && currentTest) {
  // Estimate elapsed from last phaseHistory entry timestamp
  let ctElapsed = 0;
  if (lastActivity) {
    ctElapsed = Math.round((now.getTime() - new Date(lastActivity).getTime()) / 1000);
  }
  inProgress.push({
    testId: currentTest,
    type: phase.toLowerCase(),
    step: phase.toLowerCase() + ':active',
    detail: 'Detected via state.json.currentTest (no .progress file)',
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

// ---- Per-round stats (scan result files for current round) ----
const roundStats = { passed: 0, failed: 0, fixed: 0, skipped: 0 };
try {
  const roundPrefix = round + '-';
  const resultFiles = fs.readdirSync(resultsDir)
    .filter(f => f.startsWith(roundPrefix) && f.endsWith('.json') && !f.includes('summary'));
  for (const rf of resultFiles) {
    try {
      const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
      if (res.status === 'pass') roundStats.passed++;
      else if (res.status === 'fail') roundStats.failed++;
      else if (res.status === 'skip') roundStats.skipped++;
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
        if (fs.existsSync(fixPath)) roundStats.fixed++;
      }
    } catch(e) {}
  }
} catch(e) {}

// ---- Previous round stats ----
const prevRoundStats = { passed: 0, failed: 0, fixed: 0, skipped: 0 };
if (round > 1) {
  try {
    const prevPrefix = (round - 1) + '-';
    const prevFiles = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith(prevPrefix) && f.endsWith('.json') && !f.includes('summary'));
    for (const rf of prevFiles) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass') prevRoundStats.passed++;
        else if (res.status === 'fail') prevRoundStats.failed++;
        else if (res.status === 'skip') prevRoundStats.skipped++;
      } catch(e) {}
    }
    for (const rf of prevFiles) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass' && res.testId) {
          const fixPath = path.join(resultsDir, 'fixes', res.testId + '-fix.md');
          if (fs.existsSync(fixPath)) prevRoundStats.fixed++;
        }
      } catch(e) {}
    }
  } catch(e) {}
}

// ---- Round Journey (aggregate from phaseHistory for current round) ----
const PHASES_ORDER = ['SCAN', 'GENERATE', 'TEST', 'FIX', 'VERIFY'];
const roundJourney = {};
for (const p of PHASES_ORDER) { roundJourney[p] = { status: 'pending', summary: '' }; }

// Seed from state.json.roundJourney (baseline — always available even when phaseHistory is sparse)
if (state.roundJourney) {
  for (const p of PHASES_ORDER) {
    if (state.roundJourney[p]) {
      roundJourney[p] = Object.assign({}, roundJourney[p], state.roundJourney[p]);
    }
  }
}

// Collect phase entries for current round
const roundEntries = phaseHistory.filter(e => {
  // Entries with explicit round field
  if (e.round === round) return true;
  // Entries without round field but belonging to this round's timeframe
  // Use lastRoundAt as the boundary
  if (state.lastRoundAt && e.timestamp) {
    return new Date(e.timestamp) >= new Date(state.lastRoundAt);
  }
  return false;
});

// Also include entries that match the current round's phases even without round field
// by walking backwards from the end of phaseHistory
const allRoundEntries = [];
for (let i = phaseHistory.length - 1; i >= 0; i--) {
  const e = phaseHistory[i];
  // Stop when we hit a round boundary (previous round's entries)
  if (e.round !== undefined && e.round < round) break;
  // Also stop if entry's phase is later than current phase in a fresh round
  // (indicates it belongs to previous round)
  if (e.round === undefined && state.lastRoundAt && e.timestamp) {
    if (new Date(e.timestamp) < new Date(state.lastRoundAt)) break;
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
  roundJourney.SCAN.status = 'done';
  if (last.duration_ms) roundJourney.SCAN.duration_ms = last.duration_ms;
  if (last.gaps !== undefined) {
    roundJourney.SCAN.summary = last.gaps + ' issue gaps, ' + (last.regression_gaps || 0) + ' regression gaps';
  } else if (last.result) {
    // Extract key numbers from result text
    const m = last.result.match(/(\d+)\s*ISSUE_GAP/);
    const mr = last.result.match(/(\d+)\s*ISSUE_REGRESSION_GAP/);
    if (m) roundJourney.SCAN.summary = (m[1]||0) + ' issue gaps' + (mr ? ', ' + mr[1] + ' regression gaps' : '');
    else roundJourney.SCAN.summary = last.result.substring(0, 80);
  }
}

// GENERATE summary
const genEntries = entries.filter(e => e.phase === 'GENERATE');
if (genEntries.length > 0) {
  const last = genEntries[genEntries.length - 1];
  roundJourney.GENERATE.status = 'done';
  if (last.duration_ms) roundJourney.GENERATE.duration_ms = last.duration_ms;
  if (last.result) {
    const m = last.result.match(/(\d+)\s*new test/i);
    roundJourney.GENERATE.summary = m ? m[1] + ' tests created' : last.result.substring(0, 80);
  }
}

// TEST summary (count pass/fail from entries)
const testPassCount = entries.filter(e => e.action === 'test_pass').length;
const testFailCount = entries.filter(e => e.action === 'test_fail').length;
const testComplete = entries.find(e => e.phase === 'TEST' && e.action === 'phase_complete');
if (testPassCount > 0 || testFailCount > 0 || testComplete) {
  // Use roundStats as more accurate source (from result files)
  const tp = roundStats.passed || testPassCount;
  const tf = roundStats.failed || testFailCount;
  const total = tp + tf;
  const rate = total > 0 ? Math.round(tp / total * 100) : 0;
  roundJourney.TEST.status = (phase === 'TEST') ? 'running' : 'done';
  roundJourney.TEST.summary = tp + ' pass, ' + tf + ' fail' + (total > 0 ? ' (' + rate + '%)' : '');
  if (testComplete && testComplete.timestamp && genEntries.length > 0) {
    const genLast = genEntries[genEntries.length - 1];
    if (genLast.timestamp) {
      roundJourney.TEST.duration_ms = new Date(testComplete.timestamp).getTime() - new Date(genLast.timestamp).getTime();
    }
  }
}

// FIX summary
const fixEntries = entries.filter(e => e.phase === 'FIX');
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
if (fixEntries.length > 0 || phase === 'FIX') {
  roundJourney.FIX.status = (phase === 'FIX') ? 'running' : 'done';
  const fixPending = (phase === 'FIX') ? fixQueue : 0;
  roundJourney.FIX.summary = fixedCount + ' fixed, ' + unfixableCount + ' unfixable, ' + fixPending + ' pending';
}

// VERIFY summary
const verifyPassEntries = entries.filter(e => e.action === 'verify_pass');
const verifyFailEntries = entries.filter(e => e.action === 'verify_fail' || e.action === 'verify_regressed');
if (verifyPassEntries.length > 0 || verifyFailEntries.length > 0 || phase === 'VERIFY') {
  roundJourney.VERIFY.status = (phase === 'VERIFY') ? 'running' : 'done';
  const vPending = (phase === 'VERIFY') ? verifyQueue : 0;
  roundJourney.VERIFY.summary = verifyPassEntries.length + ' verified, ' + verifyFailEntries.length + ' regressed, ' + vPending + ' pending';
}

// Mark current phase as running if not already done
if (roundJourney[phase] && roundJourney[phase].status === 'pending') {
  roundJourney[phase].status = 'running';
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
  if (roundJourney[p].status !== 'pending' && !roundJourney[p].duration_ms && phaseTimestamps[p]) {
    // Find next phase that has a timestamp
    let endTs = null;
    for (let ni = pi + 1; ni < PHASES_ORDER.length; ni++) {
      if (phaseTimestamps[PHASES_ORDER[ni]]) {
        endTs = phaseTimestamps[PHASES_ORDER[ni]].first;
        break;
      }
    }
    // Also try: use lastRoundAt as SCAN start if SCAN has only one timestamp
    if (p === 'SCAN' && state.lastRoundAt) {
      const scanStart = new Date(state.lastRoundAt).getTime();
      const scanEnd = endTs ? new Date(endTs).getTime() : new Date(phaseTimestamps[p].last).getTime();
      if (scanEnd > scanStart) {
        roundJourney[p].duration_ms = scanEnd - scanStart;
      }
    } else if (endTs) {
      const dur = new Date(endTs).getTime() - new Date(phaseTimestamps[p].first).getTime();
      if (dur > 0) roundJourney[p].duration_ms = dur;
    }
  }
}

// Fix/Verify breakdowns
const fixBreakdown = {
  fixed: fixedCount,
  unfixable: unfixableCount,
  pending: (phase === 'FIX') ? fixQueue : 0,
  total: roundStats.failed || (testFailCount + fixedCount)
};
const verifyBreakdown = {
  verified: verifyPassEntries.length,
  regressed: verifyFailEntries.length,
  pending: verifyQueue
};

// ---- Output ----
const output = {
  timestamp,
  phase,
  round,
  maxRounds,
  health,
  queueSizes: {
    test: testQueue,
    fix: fixQueue,
    verify: verifyQueue,
    regression: regressionQueue
  },
  stats: { passed, failed, fixed, skipped, unresolved: fixQueue },
  skipRegistry,
  roundStats,
  prevRoundStats,
  coverage,
  lastActivity,
  staleSince,
  stuckTests,
  warnings,
  pendingDirectives,
  inProgress,
  roundJourney,
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
