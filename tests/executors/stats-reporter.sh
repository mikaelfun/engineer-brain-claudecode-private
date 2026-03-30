#!/usr/bin/env bash
# tests/executors/stats-reporter.sh — Generate round summary and stats
#
# Usage: bash tests/executors/stats-reporter.sh <round>
# Example: bash tests/executors/stats-reporter.sh 0
#
# Reads: tests/state.json, tests/registry/ (YAML count), tests/results/,
#        tests/discoveries.json (for fixThroughput)
# Writes: tests/results/round-{N}-summary.json
#         tests/stats.md (updated)
#         tests/discoveries.json (regenerated)
#
# Metrics computed:
#   totalTests     — registry YAML count (not state.stats.totalTests)
#   coverage       — unique ever-passed testIds / registryCount (unified with health-check.sh)
#   greenRate      — this round's pass / this round's total (per-round health, not cumulative)
#   regressionRate — prev-round passes that failed this round / prev-round pass count
#   fixThroughput  — verified discoveries / total discoveries
#
# Called at the end of each round (when phase transitions back to SCAN)
# or when maxRounds is reached.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

ROUND="${1:?Usage: stats-reporter.sh <round>}"
STATE_FILE="$TESTS_ROOT/state.json"

if [ ! -f "$STATE_FILE" ]; then
  log_fail "state.json not found"
  exit 1
fi

log_info "=== Stats Reporter ==="
log_info "Generating report for Round $ROUND"

# ============================================================
# Read state.json + compute all metrics via single node call
# ============================================================
# Uses registry YAML count as totalTests (fixes totalTests=0 bug).
# Coverage formula unified with health-check.sh:
#   unique ever-passed testIds / registryCount
STATS_JSON=$(STATE_PATH="$STATE_FILE" RESULTS_PATH="$RESULTS_DIR" TESTS_ROOT_PATH="$TESTS_ROOT" ROUND_NUM="$ROUND" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const path = require('path');
  const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
  const s = state.stats || {};
  const resultsDir = process.env.RESULTS_PATH;
  const testsRoot = process.env.TESTS_ROOT_PATH;
  const roundNum = parseInt(process.env.ROUND_NUM);

  // ---- totalTests: count registry YAML files (unified with health-check.sh) ----
  const registryDir = path.join(testsRoot, 'registry');
  let registryCount = 0;
  try {
    const subdirs = fs.readdirSync(registryDir, { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name);
    for (const sub of subdirs) {
      registryCount += fs.readdirSync(path.join(registryDir, sub))
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml')).length;
    }
  } catch(e) {}
  const totalTests = registryCount || 0;

  // ---- coverage: unique ever-passed testIds / registryCount (unified with health-check.sh) ----
  const passingTestIds = new Set();
  try {
    const allResults = fs.readdirSync(resultsDir)
      .filter(f => f.endsWith('.json') && !f.includes('summary') && !f.startsWith('.'));
    for (const rf of allResults) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass' && res.testId) passingTestIds.add(res.testId);
      } catch(e) {}
    }
  } catch(e) {}
  const coverage = totalTests > 0 ? Math.round(passingTestIds.size / totalTests * 100) : 0;

  // ---- greenRate: this round pass / this round total (per-round health, not cumulative) ----
  let roundPass = 0, roundFail = 0;
  try {
    const roundPrefix = roundNum + '-';
    const roundFiles = fs.readdirSync(resultsDir)
      .filter(f => f.startsWith(roundPrefix) && f.endsWith('.json') && !f.includes('summary'));
    for (const rf of roundFiles) {
      try {
        const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
        if (res.status === 'pass') roundPass++;
        else if (res.status === 'fail') roundFail++;
      } catch(e) {}
    }
  } catch(e) {}
  const roundTotal = roundPass + roundFail;
  const greenRate = roundTotal > 0 ? Math.round(roundPass / roundTotal * 100) : 0;

  // ---- regressionRate: prev-round passes that failed this round / prev-round pass count ----
  let prevRoundPass = 0, regressionFails = 0;
  if (roundNum > 0) {
    const prevPassIds = new Set();
    try {
      const prevPrefix = (roundNum - 1) + '-';
      const prevFiles = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith(prevPrefix) && f.endsWith('.json') && !f.includes('summary'));
      for (const rf of prevFiles) {
        try {
          const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
          if (res.status === 'pass' && res.testId) { prevPassIds.add(res.testId); prevRoundPass++; }
        } catch(e) {}
      }
    } catch(e) {}
    try {
      const currPrefix = roundNum + '-';
      const currFiles = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith(currPrefix) && f.endsWith('.json') && !f.includes('summary'));
      for (const rf of currFiles) {
        try {
          const res = JSON.parse(fs.readFileSync(path.join(resultsDir, rf), 'utf8'));
          if (res.status === 'fail' && res.testId && prevPassIds.has(res.testId)) regressionFails++;
        } catch(e) {}
      }
    } catch(e) {}
  }
  const regressionRate = prevRoundPass > 0 ? Math.round(regressionFails / prevRoundPass * 100) : 0;

  // ---- fixThroughput: from existing discoveries.json ----
  let fixVerified = 0, fixTotal = 0;
  const discFile = path.join(testsRoot, 'discoveries.json');
  try {
    const disc = JSON.parse(fs.readFileSync(discFile, 'utf8'));
    const ds = disc.summary || {};
    fixTotal = ds.total || 0;
    fixVerified = ds.verified || 0;
  } catch(e) {}
  const fixThroughput = fixTotal > 0 ? Math.round(fixVerified / fixTotal * 100) : 0;

  const passed = s.passed || 0;
  const failed = s.failed || 0;
  const fixed = s.fixed || 0;
  const skipped = s.skipped || 0;

  console.log(JSON.stringify({
    round: state.round,
    maxRounds: state.maxRounds,
    phase: state.phase,
    totalTests: totalTests,
    passed: passed,
    failed: failed,
    fixed: fixed,
    skipped: skipped,
    coverage: coverage,
    greenRate: greenRate,
    roundPass: roundPass,
    roundFail: roundFail,
    regressionRate: regressionRate,
    regressionFails: regressionFails,
    prevRoundPass: prevRoundPass,
    fixThroughput: fixThroughput,
    fixVerified: fixVerified,
    fixTotal: fixTotal,
    testQueueLen: (state.testQueue||[]).length,
    fixQueueLen: (state.fixQueue||[]).length,
    verifyQueueLen: (state.verifyQueue||[]).length,
    regressionQueueLen: (state.regressionQueue||[]).length,
    phaseHistoryLen: (state.phaseHistory||[]).length
  }));
" 2>/dev/null)

if [ -z "$STATS_JSON" ] || [ "$STATS_JSON" = "undefined" ]; then
  log_fail "Could not read state.json stats"
  exit 1
fi

# Parse values
TOTAL=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.totalTests)" 2>/dev/null)
PASSED=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.passed)" 2>/dev/null)
FAILED=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.failed)" 2>/dev/null)
FIXED=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.fixed)" 2>/dev/null)
SKIPPED=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.skipped)" 2>/dev/null)
COVERAGE=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.coverage)" 2>/dev/null)
MAX_ROUNDS=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.maxRounds)" 2>/dev/null)
PHASE=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.phase)" 2>/dev/null)
TQ_LEN=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.testQueueLen)" 2>/dev/null)
FQ_LEN=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.fixQueueLen)" 2>/dev/null)
GREEN_RATE=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.greenRate)" 2>/dev/null)
ROUND_PASS=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.roundPass)" 2>/dev/null)
ROUND_FAIL=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.roundFail)" 2>/dev/null)
REGRESSION_RATE=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.regressionRate)" 2>/dev/null)
FIX_THROUGHPUT=$(echo "$STATS_JSON" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.fixThroughput)" 2>/dev/null)

# ============================================================
# Write round summary JSON
# ============================================================
SUMMARY_FILE="$RESULTS_DIR/round-${ROUND}-summary.json"

cat > "$SUMMARY_FILE" << SUMMARY_EOF
{
  "round": $ROUND,
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "phase": "$PHASE",
  "stats": {
    "totalTests": $TOTAL,
    "passed": $PASSED,
    "failed": $FAILED,
    "fixed": $FIXED,
    "skipped": $SKIPPED,
    "coverage": $COVERAGE,
    "greenRate": $GREEN_RATE,
    "regressionRate": $REGRESSION_RATE,
    "fixThroughput": $FIX_THROUGHPUT
  },
  "roundStats": {
    "passed": $ROUND_PASS,
    "failed": $ROUND_FAIL
  },
  "queues": {
    "testQueue": $TQ_LEN,
    "fixQueue": $FQ_LEN
  }
}
SUMMARY_EOF

log_info "Round summary: $SUMMARY_FILE"

# ============================================================
# Update stats.md
# ============================================================
STATS_MD="$TESTS_ROOT/stats.md"

cat > "$STATS_MD" << STATS_EOF
# Test Framework Stats

**Updated:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Round:** $ROUND / $MAX_ROUNDS
**Phase:** $PHASE

## Cumulative Stats

| Metric | Count |
|--------|-------|
| Total Tests | $TOTAL |
| Passed | $PASSED |
| Failed | $FAILED |
| Fixed | $FIXED |
| Skipped | $SKIPPED |
| Coverage | ${COVERAGE}% |

## Round $ROUND Stats

| Metric | Value |
|--------|-------|
| Passed | $ROUND_PASS |
| Failed | $ROUND_FAIL |
| Green Rate | ${GREEN_RATE}% |
| Regression Rate | ${REGRESSION_RATE}% |

## Fix Pipeline

| Metric | Value |
|--------|-------|
| Fix Throughput | ${FIX_THROUGHPUT}% |

## Queues

| Queue | Count |
|-------|-------|
| Test Queue | $TQ_LEN |
| Fix Queue | $FQ_LEN |

## Recent Results

$(ls -t "$RESULTS_DIR"/*.json 2>/dev/null | head -10 | while read -r f; do
  fname=$(basename "$f")
  echo "- \`$fname\`"
done)

## Round History

$(ls "$RESULTS_DIR"/round-*-summary.json 2>/dev/null | while read -r f; do
  echo "- \`$(basename "$f")\`"
done)
STATS_EOF

log_info "Stats updated: $STATS_MD"

# ============================================================
# Generate discoveries.json (aggregate from fixes/ directory)
# ============================================================
DISCOVERIES_FILE="$TESTS_ROOT/discoveries.json"
FIXES_DIR="$RESULTS_DIR/fixes"

log_info "Generating discoveries.json from fixes/ directory..."

ROUND_VAL="$ROUND" FIXES_DIR_VAL="$FIXES_DIR" RESULTS_DIR_VAL="$RESULTS_DIR" DISCOVERIES_FILE_VAL="$DISCOVERIES_FILE" ISSUES_DIR_VAL="$PROJECT_ROOT/issues" \
NODE_PATH="$DASHBOARD_DIR/node_modules" node -e '
const fs = require("fs");
const path = require("path");

const fixesDir = process.env.FIXES_DIR_VAL;
const resultsDir = process.env.RESULTS_DIR_VAL;
const outFile = process.env.DISCOVERIES_FILE_VAL;
const round = parseInt(process.env.ROUND_VAL);
const issuesDir = process.env.ISSUES_DIR_VAL;

// Build testId → issueId lookup from issues/ directory
const issueByTestId = {};
if (fs.existsSync(issuesDir)) {
  const issueFiles = fs.readdirSync(issuesDir).filter(f => f.startsWith("ISS-") && f.endsWith(".json"));
  for (const f of issueFiles) {
    try {
      const issue = JSON.parse(fs.readFileSync(path.join(issuesDir, f), "utf8"));
      if (issue.discoveredBy === "test-loop" && issue.testId) {
        issueByTestId[issue.testId] = issue.id;
      }
    } catch (e) { /* skip malformed */ }
  }
}

// Scan all result files to find first-failed round per testId
const resultFiles = fs.readdirSync(resultsDir)
  .filter(f => /^\d+-[a-z].*\.json$/.test(f) && !f.startsWith("."))
  .sort();

const firstFail = {};   // testId → { round, assertion }
const firstPass = {};    // testId → round (after a fail)

for (const f of resultFiles) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(resultsDir, f), "utf8"));
    const tid = d.testId;
    if (!tid) continue;
    if (d.status === "fail" && !firstFail[tid]) {
      const failedAssert = (d.assertions || []).find(a => !a.pass);
      firstFail[tid] = {
        round: d.round,
        assertion: failedAssert ? failedAssert.name : "unknown"
      };
    }
    if (d.status === "pass" && firstFail[tid] && !firstPass[tid]) {
      firstPass[tid] = d.round;
    }
  } catch (e) { /* skip malformed */ }
}

// Scan fixes/ directory for lifecycle files
const discoveries = [];

if (fs.existsSync(fixesDir)) {
  const fixFiles = fs.readdirSync(fixesDir).filter(f => !f.includes("self-heal"));
  const testIds = new Set();
  for (const f of fixFiles) {
    const m = f.match(/^(.+?)-(analysis|fix|verify|regression)\.md$/);
    if (m) testIds.add(m[1]);
  }

  for (const testId of testIds) {
    const entry = {
      testId,
      foundRound: firstFail[testId] ? firstFail[testId].round : null,
      firstFailedAssertion: firstFail[testId] ? firstFail[testId].assertion : null,
      hasAnalysis: fs.existsSync(path.join(fixesDir, testId + "-analysis.md")),
      hasFix: fs.existsSync(path.join(fixesDir, testId + "-fix.md")),
      hasVerify: fs.existsSync(path.join(fixesDir, testId + "-verify.md")),
      hasRegression: fs.existsSync(path.join(fixesDir, testId + "-regression.md")),
      verifiedRound: firstPass[testId] || null,
      status: "unaddressed"
    };

    // Determine status
    if (entry.hasVerify) {
      try {
        const verifyContent = fs.readFileSync(path.join(fixesDir, testId + "-verify.md"), "utf8");
        const statusMatch = verifyContent.match(/Status:\s*(pass|fail)/i);
        if (statusMatch && statusMatch[1].toLowerCase() === "pass") {
          entry.status = "verified";
        } else {
          entry.status = "retry-needed";
        }
      } catch (e) { entry.status = "retry-needed"; }
    } else if (entry.hasFix) {
      entry.status = "fixed-unverified";
    } else if (entry.hasAnalysis) {
      entry.status = "diagnosed";
    }

    if (entry.hasRegression) {
      entry.status = "regression";
    }

    // Extract rootCause from analysis if available
    if (entry.hasAnalysis) {
      try {
        const analysis = fs.readFileSync(path.join(fixesDir, testId + "-analysis.md"), "utf8");
        const ftMatch = analysis.match(/Failure Type:\s*(.+)/);
        entry.rootCause = ftMatch ? ftMatch[1].trim() : null;
      } catch (e) { entry.rootCause = null; }
    } else {
      entry.rootCause = null;
    }

    // Link to Issue if test-loop created one for this testId
    entry.issueId = issueByTestId[testId] || null;

    discoveries.push(entry);
  }
}

// Also add testIds that failed but have NO fix records at all
for (const [testId, info] of Object.entries(firstFail)) {
  if (!discoveries.find(d => d.testId === testId)) {
    discoveries.push({
      testId,
      foundRound: info.round,
      firstFailedAssertion: info.assertion,
      hasAnalysis: false,
      hasFix: false,
      hasVerify: false,
      hasRegression: false,
      verifiedRound: firstPass[testId] || null,
      status: firstPass[testId] ? "verified" : "unaddressed",
      rootCause: null,
      issueId: issueByTestId[testId] || null
    });
  }
}

// Sort by foundRound then testId
discoveries.sort((a, b) => (a.foundRound || 99) - (b.foundRound || 99) || a.testId.localeCompare(b.testId));

// Summary counts
const summary = {
  total: discoveries.length,
  verified: discoveries.filter(d => d.status === "verified").length,
  fixedUnverified: discoveries.filter(d => d.status === "fixed-unverified").length,
  diagnosed: discoveries.filter(d => d.status === "diagnosed").length,
  retryNeeded: discoveries.filter(d => d.status === "retry-needed").length,
  regression: discoveries.filter(d => d.status === "regression").length,
  unaddressed: discoveries.filter(d => d.status === "unaddressed").length
};

const output = {
  version: 1,
  generatedAt: new Date().toISOString(),
  generatedByRound: round,
  summary,
  discoveries
};

fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + "\n");
console.log("DISCOVERIES|total=" + summary.total + "|verified=" + summary.verified + "|unaddressed=" + summary.unaddressed);
' 2>/dev/null || log_warn "discoveries.json generation failed (non-critical)"

log_info "Discoveries updated: $DISCOVERIES_FILE"

# ============================================================
# Output summary line
# ============================================================
echo "STATS|round=$ROUND|passed=$PASSED|failed=$FAILED|fixed=$FIXED|coverage=${COVERAGE}%|greenRate=${GREEN_RATE}%|regressionRate=${REGRESSION_RATE}%|fixThroughput=${FIX_THROUGHPUT}%"
