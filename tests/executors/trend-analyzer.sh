#!/usr/bin/env bash
# tests/executors/trend-analyzer.sh — Read round summaries, output structured trend JSON
# Usage: bash tests/executors/trend-analyzer.sh [num_rounds]  (default: 3)
# Output: JSON with round stats, trends, alerts, and discovery stats

source "$(dirname "$0")/common.sh"

NUM_ROUNDS="${1:-3}"

# ============================================================
# Resolve paths for node (convert POSIX /c/... to C:/...)
# ============================================================
node_path() {
  echo "$1" | sed 's|^/\([a-zA-Z]\)/|\1:/|'
}

STATE_FILE_NODE=$(node_path "$TESTS_ROOT/pipeline.json")
LEGACY_STATE_NODE=$(node_path "$TESTS_ROOT/state.json")
RESULTS_DIR_NODE=$(node_path "$RESULTS_DIR")
DISC_FILE_NODE=$(node_path "$TESTS_ROOT/discoveries.json")

# ============================================================
# Single node call does everything (efficient, no pipe issues)
# ============================================================
NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const fs = require('fs');
  const path = require('path');

  const pipelineFile = '${STATE_FILE_NODE}'.replace(/\\\\/g, '/');
  const legacyStateFile = '${LEGACY_STATE_NODE}'.replace(/\\\\/g, '/');
  const resultsDir = '${RESULTS_DIR_NODE}'.replace(/\\\\/g, '/');
  const discFile = '${DISC_FILE_NODE}'.replace(/\\\\/g, '/');
  const numRounds = parseInt('${NUM_ROUNDS}') || 3;

  // Read from pipeline.json (primary), fall back to state.json (legacy)
  let currentCycle = 0;
  if (fs.existsSync(pipelineFile)) {
    const pipeline = JSON.parse(fs.readFileSync(pipelineFile, 'utf8'));
    currentCycle = pipeline.cycle || 0;
  } else if (fs.existsSync(legacyStateFile)) {
    const state = JSON.parse(fs.readFileSync(legacyStateFile, 'utf8'));
    currentCycle = state.round || 0;
  } else {
    console.log(JSON.stringify({ error: 'pipeline.json not found' }));
    process.exit(0);
  }

  if (currentCycle <= 0) {
    console.log(JSON.stringify({ error: 'no cycles completed yet', rounds: [], trends: {}, alerts: [] }));
    process.exit(0);
  }

  // Collect round summaries (scan backward)
  const rounds = [];
  const passed = [];
  const failed = [];
  const fixed = [];
  const coverage = [];
  const greenRateArr = [];
  const regressionRateArr = [];
  const fixThroughputArr = [];
  const durations = [];

  let collected = 0;
  let checkRound = currentCycle;

  while (collected < numRounds && checkRound >= 0) {
    // Try cycle-* first (new), then round-* (backward compat)
    let summaryFile = path.join(resultsDir, 'cycle-' + checkRound + '-summary.json');
    if (!fs.existsSync(summaryFile)) {
      summaryFile = path.join(resultsDir, 'round-' + checkRound + '-summary.json');
    }
    if (fs.existsSync(summaryFile)) {
      try {
        const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
        const st = summary.stats || {};
        // Prepend (we scan backward, want chronological)
        rounds.unshift(summary.round || checkRound);
        passed.unshift(st.passed || 0);
        failed.unshift(st.failed || 0);
        fixed.unshift(st.fixed || 0);
        coverage.unshift(st.coverage || 0);
        greenRateArr.unshift(st.greenRate !== undefined ? st.greenRate : null);
        regressionRateArr.unshift(st.regressionRate !== undefined ? st.regressionRate : null);
        fixThroughputArr.unshift(st.fixThroughput !== undefined ? st.fixThroughput : null);
        durations.unshift(null); // duration not tracked in current summaries
        collected++;
      } catch (e) { /* skip corrupt summary */ }
    }
    checkRound--;
  }

  // Read discovery stats
  let discStats = { total: 0, verified: 0, regression: 0, regressionRate: 0 };
  if (fs.existsSync(discFile)) {
    try {
      const disc = JSON.parse(fs.readFileSync(discFile, 'utf8'));
      const s = disc.summary || {};
      const total = s.total || 0;
      const regression = s.regression || 0;
      discStats = {
        total,
        verified: s.verified || 0,
        regression,
        regressionRate: total > 0 ? parseFloat((regression / total).toFixed(2)) : 0
      };
    } catch (e) { /* skip */ }
  }

  // Compute trends
  function trend(arr) {
    const nums = arr.filter(v => v !== null);
    if (nums.length < 2) return 'insufficient_data';
    const first = nums[0];
    const last = nums[nums.length - 1];
    if (last > first) return 'increasing';
    if (last < first) return 'decreasing';
    return nums.every(v => v === first) ? 'flat' : 'fluctuating';
  }

  // Detect alerts
  const alerts = [];

  function checkFlat(name, arr) {
    const nums = arr.filter(v => v !== null);
    if (nums.length >= 3 && nums.every(v => v === nums[0])) {
      alerts.push({ type: 'flat_metric', metric: name, duration: nums.length, value: nums[0] });
    }
  }
  checkFlat('passed', passed);
  checkFlat('failed', failed);
  checkFlat('fixed', fixed);
  checkFlat('coverage', coverage);
  checkFlat('greenRate', greenRateArr);
  checkFlat('fixThroughput', fixThroughputArr);

  if (discStats.regressionRate > 0.5) {
    alerts.push({ type: 'high_regression_rate', rate: discStats.regressionRate, threshold: 0.5 });
  }

  const covNums = coverage.filter(v => v !== null);
  if (covNums.length >= 3 && covNums.every(v => v === covNums[0]) && covNums[0] > 0) {
    alerts.push({ type: 'coverage_plateau', value: covNums[0], duration: covNums.length });
  }

  if (covNums.length > 0 && covNums.every(v => v === 0)) {
    alerts.push({ type: 'zero_coverage', duration: covNums.length });
  }

  // ============================================================
  // Pre-computed conclusions (for supervisor fast-path)
  // ============================================================
  const covNums2 = coverage.filter(v => v !== null);
  const grNums = greenRateArr.filter(v => v !== null);
  const rrNums = regressionRateArr.filter(v => v !== null);
  const ftNums = fixThroughputArr.filter(v => v !== null);

  // Plateau: coverage flat 3+ rounds
  const plateau = covNums2.length >= 3 && covNums2.every(v => v === covNums2[0]);

  // Regression rate: latest value or from discoveries
  const latestRegressionRate = rrNums.length > 0 ? rrNums[rrNums.length - 1] : discStats.regressionRate;

  // Fix success rate: fixed / (fixed + still-failed) over recent rounds
  const totalFixed = fixed.reduce((a, b) => a + b, 0);
  const totalFailed = failed.reduce((a, b) => a + b, 0);
  const fixSuccessRate = (totalFixed + totalFailed) > 0
    ? parseFloat((totalFixed / (totalFixed + totalFailed)).toFixed(2))
    : null;

  // Scan precision: not directly measurable from summaries, use greenRate as proxy
  // High greenRate = SCAN finds real gaps that become passing tests
  const latestGreenRate = grNums.length > 0 ? grNums[grNums.length - 1] : null;
  const scanPrecision = latestGreenRate !== null
    ? (latestGreenRate > 80 ? 'high' : latestGreenRate > 50 ? 'medium' : 'low')
    : 'unknown';

  // Efficiency warning: round duration trending up (placeholder — durations not tracked yet)
  const efficiencyWarning = null;

  const conclusions = {
    plateau,
    plateauValue: plateau ? covNums2[0] : null,
    regressionRate: latestRegressionRate,
    regressionHigh: latestRegressionRate > 0.4,
    fixSuccessRate,
    fixQualityDeclining: ftNums.length >= 3 && trend(ftNums) === 'decreasing',
    scanPrecision,
    efficiencyWarning,
    coverageTrend: trend(coverage),
    latestCoverage: covNums2.length > 0 ? covNums2[covNums2.length - 1] : 0,
    latestGreenRate
  };

  const result = {
    rounds,
    passed,
    failed,
    fixed,
    coverage: coverage.map(v => v !== null ? v + '%' : null),
    greenRate: greenRateArr,
    regressionRate: regressionRateArr,
    fixThroughput: fixThroughputArr,
    trends: {
      passed: trend(passed),
      failed: trend(failed),
      fixed: trend(fixed),
      coverage: trend(coverage),
      greenRate: trend(greenRateArr),
      regressionRate: trend(regressionRateArr),
      fixThroughput: trend(fixThroughputArr)
    },
    alerts,
    roundDurations: durations,
    discoveryStats: discStats,
    conclusions
  };

  console.log(JSON.stringify(result, null, 2));
"
