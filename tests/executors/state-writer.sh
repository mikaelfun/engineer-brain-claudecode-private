#!/usr/bin/env bash
# tests/executors/state-writer.sh — Atomic write utility for split state files
#
# Usage:
#   echo '{"currentStage":"TEST"}' | bash tests/executors/state-writer.sh --merge --target pipeline
#   echo '{"cumulative":{"passed":10}}' | bash tests/executors/state-writer.sh --merge --target stats
#   echo '{"phase":"FIX","round":5}' | bash tests/executors/state-writer.sh --merge   # auto-routes + translates old names
#   bash tests/executors/state-writer.sh --file /path/to/data.json --target queues
#
# Targets (split files):
#   pipeline   — cycle, maxCycles, currentStage, currentTest, stageProgress, stages
#   queues     — testQueue, fixQueue, verifyQueue, regressionQueue, gaps, inProgress, skipRegistry
#   stats      — cumulative, cycleStats, scanStrategy, observabilityStatus
#   supervisor — status, tick, active, step, reasoning, selfHealEvent, schedulerInterval, lastTickAt
#
# Arguments:
#   --target pipeline|queues|stats|supervisor  Write to specific file only
#   --merge                                    Shallow merge (deep merge for stages, cumulative)
#   --file <path>                              Read from file instead of stdin
#
# When --target is specified: read/write ONLY that file.
# When NO --target: auto-route fields to correct files based on field names.
# Old field names (round, phase, maxRounds, roundJourney, roundStats, runnerActive,
# runnerStep, phaseHistory, stats, phaseProgress) are auto-translated to new names.
#
# Side effects:
#   - Writes to the target split file(s) atomically
#   - Also updates state.json combined view (backward compat during transition)
#   - stageHistory entries are archived to tests/history/cycle-NNN/
#
# Exit codes: 0 = success, 1 = validation failed, 2 = write failed
# Output: STATE_WRITE|<status>|<detail>

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Arguments
# ============================================================
INPUT_FILE=""
MERGE_MODE="false"
TARGET=""
while [ $# -gt 0 ]; do
  case "${1}" in
    --file)
      INPUT_FILE="${2:-}"
      shift 2 || { echo "STATE_WRITE|failed|--file requires a path"; exit 1; }
      ;;
    --merge)
      MERGE_MODE="true"
      shift
      ;;
    --target)
      TARGET="${2:-}"
      shift 2 || { echo "STATE_WRITE|failed|--target requires a value"; exit 1; }
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
    echo "STATE_WRITE|failed|invalid target: $TARGET (expected: pipeline|queues|stats|supervisor)"
    exit 1
    ;;
esac

# ============================================================
# Read input into temp file (avoids stdin/pipe issues with node)
# ============================================================
TMP_INPUT=$(mktemp)
trap "rm -f '$TMP_INPUT' '$TMP_INPUT.stderr'" EXIT

if [ -n "$INPUT_FILE" ]; then
  if [ ! -f "$INPUT_FILE" ]; then
    echo "STATE_WRITE|failed|input file not found: $INPUT_FILE"
    exit 1
  fi
  cp "$INPUT_FILE" "$TMP_INPUT"
else
  # Read from stdin
  cat > "$TMP_INPUT"
fi

if [ ! -s "$TMP_INPUT" ]; then
  echo "STATE_WRITE|failed|empty input"
  exit 1
fi

# ============================================================
# Validate, route, merge/replace, atomic write via Node.js
# All paths passed via env vars (POSIX-safe for Git Bash).
# JS code uses double quotes; bash wrapper uses single quotes
# to prevent shell variable expansion inside the JS.
# ============================================================
WRITE_RESULT=$(TESTS_ROOT="$TESTS_ROOT" INPUT_PATH="$TMP_INPUT" MERGE="$MERGE_MODE" TARGET="$TARGET" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e '
var fs = require("fs");
var testsRoot = process.env.TESTS_ROOT;
var inputPath = process.env.INPUT_PATH;
var mergeMode = process.env.MERGE === "true";
var target = process.env.TARGET || "";

// ---- File paths ----
var FILES = {
  pipeline:   testsRoot + "/pipeline.json",
  queues:     testsRoot + "/queues.json",
  stats:      testsRoot + "/stats.json",
  supervisor: testsRoot + "/supervisor.json"
};
var stateFile  = testsRoot + "/state.json";
var historyDir = testsRoot + "/history";

// ---- Field routing: new field name -> target file ----
var ROUTING = {
  cycle:"pipeline", maxCycles:"pipeline", currentStage:"pipeline",
  currentTest:"pipeline", stageProgress:"pipeline", stages:"pipeline",
  testQueue:"queues", fixQueue:"queues", verifyQueue:"queues",
  regressionQueue:"queues", gaps:"queues", inProgress:"queues", skipRegistry:"queues",
  cumulative:"stats", cycleStats:"stats", scanStrategy:"stats", observabilityStatus:"stats",
  status:"supervisor", tick:"supervisor", active:"supervisor", step:"supervisor",
  reasoning:"supervisor", selfHealEvent:"supervisor", schedulerInterval:"supervisor", lastTickAt:"supervisor"
};

// ---- Old -> new field name translation ----
var RENAME = {
  round:"cycle", phase:"currentStage", maxRounds:"maxCycles",
  roundJourney:"stages", roundStats:"cycleStats", runnerActive:"active",
  runnerStep:"step", phaseHistory:"stageHistory", stats:"cumulative",
  phaseProgress:"stageProgress"
};

// ---- Step 1: Parse input ----
var parsed;
try { parsed = JSON.parse(fs.readFileSync(inputPath, "utf8")); }
catch(e) { console.log("INVALID|" + e.message); process.exit(1); }
if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
  console.log("INVALID|input must be a JSON object");
  process.exit(1);
}

// ---- Step 1b: Validate queue entry fields (defense against CLI flag corruption) ----
// Detects --fixId/--testId/--category etc. passed as field values
var CLI_FLAG_RE = /^--\w/;
var QUEUE_FIELD_KEYS = ["testId", "fixType", "category", "fixDescription", "recipeUsed", "reason", "source"];
var QUEUE_ARRAY_KEYS = ["testQueue", "fixQueue", "verifyQueue", "regressionQueue", "inProgress"];

function validateQueueEntries(obj) {
  QUEUE_ARRAY_KEYS.forEach(function(qk) {
    if (!Array.isArray(obj[qk])) return;
    obj[qk].forEach(function(entry, idx) {
      if (!entry || typeof entry !== "object") return;
      QUEUE_FIELD_KEYS.forEach(function(fk) {
        if (typeof entry[fk] === "string" && CLI_FLAG_RE.test(entry[fk])) {
          console.log("INVALID|queue " + qk + "[" + idx + "]." + fk + " contains CLI flag value: " + entry[fk] + " — rejecting write (positional arg parsing error?)");
          process.exit(1);
        }
      });
    });
  });
}
validateQueueEntries(parsed);

// ---- Step 2: Translate old field names, extract stageHistory ----
var translated = {};
var stageHistory = null;
Object.keys(parsed).forEach(function(key) {
  var newKey = RENAME[key] || key;
  if (newKey === "stageHistory") {
    stageHistory = parsed[key];
  } else {
    translated[newKey] = parsed[key];
  }
});

// ---- Helpers ----
function readJson(fp) {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch(e) { return null; }
}

function deepMerge(base, overlay) {
  var result = Object.assign({}, base, overlay);
  // Deep merge: stages (per-stage merge, like old roundJourney)
  if (overlay.stages && base.stages) {
    result.stages = Object.assign({}, base.stages);
    Object.keys(overlay.stages).forEach(function(k) {
      result.stages[k] = Object.assign({}, base.stages[k] || {}, overlay.stages[k]);
    });
  }
  // Deep merge: cumulative (like old stats)
  if (overlay.cumulative && base.cumulative) {
    result.cumulative = Object.assign({}, base.cumulative, overlay.cumulative);
  }
  // Deep merge: reasoning (preserve previous steps when adding new ones)
  // e.g. {observe:"A"} + {diagnose:"B"} → {observe:"A",diagnose:"B"}
  // But empty {} means explicit reset (supervisor session start)
  if (overlay.reasoning && base.reasoning && Object.keys(overlay.reasoning).length > 0) {
    result.reasoning = Object.assign({}, base.reasoning, overlay.reasoning);
  }
  return result;
}

function atomicWrite(fp, data) {
  var txt = JSON.stringify(data, null, 2) + "\n";
  var tmp = fp + ".write-tmp-" + process.pid;
  try {
    fs.writeFileSync(tmp, txt, "utf8");
    fs.renameSync(tmp, fp);
    return txt.length;
  } catch(e) {
    try { fs.unlinkSync(tmp); } catch(e2) {}
    throw e;
  }
}

// ---- Step 3: Route fields to target files ----
var updates = {};  // { pipeline: {...}, queues: {...}, ... }
if (target) {
  // --target specified: all fields go to that target
  updates[target] = translated;
} else {
  // Auto-route by field name
  Object.keys(translated).forEach(function(key) {
    var t = ROUTING[key];
    if (t) {
      if (!updates[t]) updates[t] = {};
      updates[t][key] = translated[key];
    } else {
      process.stderr.write("[WARN] state-writer: unknown field \"" + key + "\" skipped\n");
    }
  });
}

// ---- Step 4: Apply updates per target (merge/replace + truncation guard) ----
var totalBytes = 0;
var affected = [];
var autoMerged = false;
var finalStates = {};  // cache final state per target for state.json build

Object.keys(updates).forEach(function(t) {
  var fields = updates[t];
  var fp = FILES[t];
  if (!fp) { console.log("INVALID|unknown target: " + t); process.exit(1); }

  var current = readJson(fp);
  var final;

  if (mergeMode) {
    // Merge mode: overlay fields onto current
    final = current ? deepMerge(current, fields) : fields;
  } else {
    // Replace mode with truncation guard
    if (current) {
      var ck = Object.keys(current).length;
      var nk = Object.keys(fields).length;
      if (ck > 3 && nk < ck * 0.5) {
        autoMerged = true;
        var warn = "TRUNCATION_GUARD on " + t + ": " + ck + " -> " + nk + " fields. Auto-merge.";
        process.stderr.write("[WARN] " + warn + "\n");
        final = deepMerge(current, fields);
      } else {
        final = fields;
      }
    } else {
      final = fields;
    }
  }

  try { totalBytes += atomicWrite(fp, final); }
  catch(e) { console.log("WRITE_ERROR|" + t + ": " + e.message); process.exit(2); }
  finalStates[t] = final;
  affected.push(t);
});

// ---- Step 5: Handle stageHistory archiving ----
// empty [] = reset (no action), non-empty = append to history/cycle-NNN/
if (stageHistory && Array.isArray(stageHistory) && stageHistory.length > 0) {
  var pl = finalStates.pipeline || readJson(FILES.pipeline) || {};
  var cycle = pl.cycle || 0;
  var cDir = historyDir + "/cycle-" + String(cycle).padStart(3, "0");
  try { fs.mkdirSync(cDir, { recursive: true }); } catch(e) {}
  var archiveFile = cDir + "/stage-transitions.jsonl";
  var lines = stageHistory.map(function(entry) { return JSON.stringify(entry); }).join("\n") + "\n";
  fs.appendFileSync(archiveFile, lines, "utf8");
  affected.push("history");
}

// ---- Step 6: Build combined state.json (backward compat with old field names) ----
["pipeline", "queues", "stats", "supervisor"].forEach(function(t) {
  if (!finalStates[t]) finalStates[t] = readJson(FILES[t]) || {};
});
var p  = finalStates.pipeline;
var q  = finalStates.queues;
var s  = finalStates.stats;
var sv = finalStates.supervisor;

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

try { atomicWrite(stateFile, combined); }
catch(e) { process.stderr.write("[WARN] Failed to update state.json: " + e.message + "\n"); }

// ---- Output result ----
var mode = mergeMode ? "merge" : (autoMerged ? "auto-merge" : "replace");
console.log("OK|" + totalBytes + " bytes (" + mode + ", targets: " + affected.join(",") + ")");
' 2>"$TMP_INPUT.stderr")

# ============================================================
# Handle result
# ============================================================
WRITE_STATUS=$(echo "$WRITE_RESULT" | cut -d'|' -f1)
WRITE_DETAIL=$(echo "$WRITE_RESULT" | cut -d'|' -f2-)
STDERR_OUTPUT=""
[ -f "$TMP_INPUT.stderr" ] && STDERR_OUTPUT=$(cat "$TMP_INPUT.stderr") && rm -f "$TMP_INPUT.stderr"

case "$WRITE_STATUS" in
  OK)
    # Check if auto-merge was triggered → log warning + record learning
    if echo "$WRITE_DETAIL" | grep -q "auto-merge"; then
      log_warn "state-writer: truncation guard triggered — auto-downgraded to merge"
      [ -n "$STDERR_OUTPUT" ] && log_warn "$STDERR_OUTPUT"
      # Record learning for post-mortem (async, don't block)
      if [ -x "$SCRIPT_DIR/learnings-writer.sh" ]; then
        bash "$SCRIPT_DIR/learnings-writer.sh" \
          "state-truncation-automerge-$(date +%Y%m%d-%H%M%S)" \
          "test" \
          "Truncation guard auto-merged: a caller passed a partial state object in full-replace mode. $STDERR_OUTPUT" \
          "Auto-downgraded to merge. Caller should use --merge flag explicitly." 2>/dev/null &
      fi
      echo "STATE_WRITE|auto-merged|$WRITE_DETAIL"
    else
      echo "STATE_WRITE|success|$WRITE_DETAIL"
    fi
    exit 0
    ;;
  INVALID)
    log_fail "state-writer: validation failed: $WRITE_DETAIL"
    echo "STATE_WRITE|invalid|$WRITE_DETAIL"
    exit 1
    ;;
  WRITE_ERROR)
    log_fail "state-writer: write failed: $WRITE_DETAIL"
    echo "STATE_WRITE|write_error|$WRITE_DETAIL"
    exit 2
    ;;
  *)
    log_fail "state-writer: unexpected result: $WRITE_RESULT"
    [ -n "$STDERR_OUTPUT" ] && log_fail "stderr: $STDERR_OUTPUT"
    echo "STATE_WRITE|failed|unexpected"
    exit 1
    ;;
esac
