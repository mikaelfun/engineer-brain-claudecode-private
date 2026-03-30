#!/usr/bin/env bash
# tests/executors/state-reader.sh — Read utility for split state files
#
# Assembles full state from the 4 split files (pipeline.json, queues.json,
# stats.json, supervisor.json) and outputs JSON to stdout.
#
# Usage:
#   bash tests/executors/state-reader.sh                    # full assembled state (new field names)
#   bash tests/executors/state-reader.sh --target pipeline   # just pipeline.json
#   bash tests/executors/state-reader.sh --target queues     # just queues.json
#   bash tests/executors/state-reader.sh --compat            # full state with OLD field names
#
# Targets:
#   pipeline   — cycle, maxCycles, currentStage, currentTest, stageProgress, stages
#   queues     — testQueue, fixQueue, verifyQueue, regressionQueue, gaps, inProgress, skipRegistry
#   stats      — cumulative, cycleStats, scanStrategy, observabilityStatus
#   supervisor — status, tick, active, step, reasoning, selfHealEvent, schedulerInterval, lastTickAt
#
# --compat translates new field names back to old names:
#   cycle→round, currentStage→phase, maxCycles→maxRounds, stages→roundJourney,
#   cycleStats→roundStats, active→runnerActive, step→runnerStep,
#   cumulative→stats, stageProgress→phaseProgress
#
# Exit codes: 0 = success, 1 = error
# Output: JSON to stdout

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
TARGET=""
COMPAT="false"
while [ $# -gt 0 ]; do
  case "${1}" in
    --target)
      TARGET="${2:-}"
      shift 2 || { echo "Error: --target requires a value" >&2; exit 1; }
      ;;
    --compat)
      COMPAT="true"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Validate target
case "$TARGET" in
  pipeline|queues|stats|supervisor|"") ;;
  *)
    echo "Error: invalid target: $TARGET (expected: pipeline|queues|stats|supervisor)" >&2
    exit 1
    ;;
esac

# ============================================================
# Read and assemble via Node.js
# ============================================================
TESTS_ROOT="$TESTS_ROOT" TARGET="$TARGET" COMPAT="$COMPAT" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e '
var fs = require("fs");
var testsRoot = process.env.TESTS_ROOT;
var target = process.env.TARGET || "";
var compat = process.env.COMPAT === "true";

var FILES = {
  pipeline:   testsRoot + "/pipeline.json",
  queues:     testsRoot + "/queues.json",
  stats:      testsRoot + "/stats.json",
  supervisor: testsRoot + "/supervisor.json"
};

function readJson(fp) {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch(e) { return {}; }
}

// ---- Single target mode ----
if (target) {
  var fp = FILES[target];
  if (!fp) { process.stderr.write("Error: unknown target: " + target + "\n"); process.exit(1); }
  var data = readJson(fp);
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

// ---- Full assembled state ----
var p  = readJson(FILES.pipeline);
var q  = readJson(FILES.queues);
var s  = readJson(FILES.stats);
var sv = readJson(FILES.supervisor);

if (compat) {
  // Backward-compatible output with OLD field names
  var combined = {
    phase:               p.currentStage    || "IDLE",
    round:               p.cycle           || 0,
    stats:               s.cumulative      || {},
    maxRounds:           p.maxCycles       || 80,
    roundJourney:        p.stages          || {},
    testQueue:           q.testQueue       || [],
    fixQueue:            q.fixQueue        || [],
    verifyQueue:         q.verifyQueue     || [],
    regressionQueue:     q.regressionQueue || [],
    gaps:                q.gaps            || [],
    currentTest:         p.currentTest     || "",
    inProgress:          q.inProgress      || [],
    skipRegistry:        q.skipRegistry    || [],
    phaseHistory:        [],
    observabilityStatus: s.observabilityStatus || {},
    roundStats:          s.cycleStats      || {},
    scanStrategy:        s.scanStrategy    || {},
    runnerActive:        sv.active         || null,
    runnerStep:          sv.step           || null,
    phaseProgress:       p.stageProgress   || null,
    status:              sv.status         || "idle"
  };
  console.log(JSON.stringify(combined, null, 2));
} else {
  // New field names — merge all 4 files into one object
  // Order: pipeline first, then queues, stats, supervisor
  var assembled = {};
  // Pipeline
  assembled.cycle         = p.cycle         || 0;
  assembled.maxCycles     = p.maxCycles     || 80;
  assembled.currentStage  = p.currentStage  || "IDLE";
  assembled.currentTest   = p.currentTest   || "";
  assembled.stageProgress = p.stageProgress || null;
  assembled.stages        = p.stages        || {};
  // Queues
  assembled.testQueue       = q.testQueue       || [];
  assembled.fixQueue        = q.fixQueue        || [];
  assembled.verifyQueue     = q.verifyQueue     || [];
  assembled.regressionQueue = q.regressionQueue || [];
  assembled.gaps            = q.gaps            || [];
  assembled.inProgress      = q.inProgress      || [];
  assembled.skipRegistry    = q.skipRegistry    || [];
  // Stats
  assembled.cumulative          = s.cumulative          || {};
  assembled.cycleStats          = s.cycleStats          || {};
  assembled.scanStrategy        = s.scanStrategy        || {};
  assembled.observabilityStatus = s.observabilityStatus || {};
  // Supervisor
  assembled.status            = sv.status            || "idle";
  assembled.tick              = sv.tick              || 0;
  assembled.active            = sv.active            || null;
  assembled.step              = sv.step              || null;
  assembled.reasoning         = sv.reasoning         || {};
  assembled.selfHealEvent     = sv.selfHealEvent     || null;
  assembled.schedulerInterval = sv.schedulerInterval || null;
  assembled.lastTickAt        = sv.lastTickAt        || null;

  console.log(JSON.stringify(assembled, null, 2));
}
'
