#!/usr/bin/env bash
# tests/executors/tick-archiver.sh — Archive supervisor reasoning to history
#
# Archives the current supervisor.json reasoning snapshot to
# tests/history/cycle-{NNN}/tick-{MM}.json after each supervisor tick,
# then increments the tick counter and resets reasoning fields.
#
# Usage:
#   bash tests/executors/tick-archiver.sh
#
# Behavior:
#   1. Read pipeline.json to get current cycle number
#   2. Read supervisor.json to get current tick + reasoning
#   3. Skip if reasoning is empty (all null) and no selfHealEvent
#   4. Create tests/history/cycle-{NNN}/tick-{MM}.json with full supervisor snapshot
#   5. Increment tick in supervisor.json
#   6. Reset reasoning fields to null, set lastTickAt
#
# Exit codes: 0 = success (or skip), 1 = error
# Output: ARCHIVE|<status>|<detail>

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# ============================================================
# Archive via Node.js (atomic reads/writes, POSIX paths via env)
# ============================================================
ARCHIVE_RESULT=$(TESTS_ROOT="$TESTS_ROOT" \
  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e '
var fs = require("fs");
var testsRoot = process.env.TESTS_ROOT;
var pipelineFile   = testsRoot + "/pipeline.json";
var supervisorFile = testsRoot + "/supervisor.json";
var historyDir     = testsRoot + "/history";

function readJson(fp) {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch(e) { return null; }
}

function atomicWrite(fp, data) {
  var txt = JSON.stringify(data, null, 2) + "\n";
  var tmp = fp + ".write-tmp-" + process.pid;
  try {
    fs.writeFileSync(tmp, txt, "utf8");
    fs.renameSync(tmp, fp);
  } catch(e) {
    try { fs.unlinkSync(tmp); } catch(e2) {}
    throw e;
  }
}

// Step 1: Read pipeline.json for current cycle
var pipeline = readJson(pipelineFile);
if (!pipeline) {
  console.log("ARCHIVE|skip|pipeline.json not found");
  process.exit(0);
}
var cycle = pipeline.cycle || 0;

// Step 2: Read supervisor.json for tick + reasoning
var supervisor = readJson(supervisorFile);
if (!supervisor) {
  console.log("ARCHIVE|skip|supervisor.json not found");
  process.exit(0);
}
var tick = supervisor.tick || 0;

// Step 3: Check if there is anything worth archiving
var reasoning = supervisor.reasoning || {};
var hasReasoning = Object.keys(reasoning).some(function(k) {
  return reasoning[k] !== null && reasoning[k] !== undefined;
});
if (!hasReasoning && !supervisor.selfHealEvent) {
  console.log("ARCHIVE|skip|no reasoning to archive (cycle=" + cycle + " tick=" + tick + ")");
  process.exit(0);
}

// Step 4: Create archive directory + file
var cycleDir = historyDir + "/cycle-" + String(cycle).padStart(3, "0");
try { fs.mkdirSync(cycleDir, { recursive: true }); } catch(e) {}

var tickFile = cycleDir + "/tick-" + String(tick).padStart(2, "0") + ".json";

var snapshot = {
  tick:           tick,
  cycle:          cycle,
  archivedAt:     new Date().toISOString(),
  status:         supervisor.status || "idle",
  step:           supervisor.step || null,
  reasoning:      reasoning,
  selfHealEvent:  supervisor.selfHealEvent || null
};

try { atomicWrite(tickFile, snapshot); }
catch(e) {
  console.log("ARCHIVE|error|failed to write " + tickFile + ": " + e.message);
  process.exit(1);
}

// Step 5: Increment tick and reset reasoning in supervisor.json
supervisor.tick = tick + 1;
supervisor.reasoning = {
  observe:  null,
  diagnose: null,
  decide:   null,
  act:      null,
  reflect:  null
};
supervisor.lastTickAt = new Date().toISOString();
// Note: selfHealEvent is NOT reset here — only reasoning fields are reset.
// selfHealEvent is cleared explicitly by the supervisor when acknowledged.

try { atomicWrite(supervisorFile, supervisor); }
catch(e) {
  console.log("ARCHIVE|error|archived tick but failed to update supervisor: " + e.message);
  process.exit(1);
}

console.log("ARCHIVE|ok|cycle=" + cycle + " tick=" + tick + " archived to " + tickFile);
' 2>&1)

# ============================================================
# Report result
# ============================================================
ARCHIVE_STATUS=$(echo "$ARCHIVE_RESULT" | head -1 | cut -d'|' -f2)

case "$ARCHIVE_STATUS" in
  ok)
    log_info "tick-archiver: $(echo "$ARCHIVE_RESULT" | cut -d'|' -f3)"
    echo "$ARCHIVE_RESULT"
    exit 0
    ;;
  skip)
    log_info "tick-archiver: $(echo "$ARCHIVE_RESULT" | cut -d'|' -f3)"
    echo "$ARCHIVE_RESULT"
    exit 0
    ;;
  error)
    log_fail "tick-archiver: $(echo "$ARCHIVE_RESULT" | cut -d'|' -f3)"
    echo "$ARCHIVE_RESULT"
    exit 1
    ;;
  *)
    log_fail "tick-archiver: unexpected output: $ARCHIVE_RESULT"
    echo "ARCHIVE|error|unexpected output"
    exit 1
    ;;
esac
