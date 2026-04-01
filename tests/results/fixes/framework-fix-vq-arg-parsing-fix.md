# Fix Report: framework-fix-vq-arg-parsing

**Test ID:** framework-fix-vq-arg-parsing
**Fix Type:** framework_fix
**Description:** Add CLI flag validation to prevent verifyQueue corruption from LLM agents using named-flag syntax instead of positional args
**Modified Files:** tests/executors/fix-recorder.sh,tests/executors/state-writer.sh
**Fixed At:** 2026-03-31T22:37:51Z
**Recipe Used:** none

## What Was Fixed

Add CLI flag validation to prevent verifyQueue corruption from LLM agents using named-flag syntax instead of positional args

## Modified Files

- `tests/executors/fix-recorder.sh`
- `tests/executors/state-writer.sh`

## Diff

### tests/executors/fix-recorder.sh
```diff
diff --git a/tests/executors/fix-recorder.sh b/tests/executors/fix-recorder.sh
index 230a53d..24d1c8f 100644
--- a/tests/executors/fix-recorder.sh
+++ b/tests/executors/fix-recorder.sh
@@ -6,7 +6,7 @@
 #
 # Called by the FIX agent after applying a fix.
 # Records the fix to tests/results/fixes/{testId}-fix.md
-# Moves the test from fixQueue to verifyQueue in state.json
+# Moves the test from fixQueue to verifyQueue in queues.json
 #
 # fix-type: "code_bug" or "env_issue"
 # - code_bug: fix recorded to results/fixes/
@@ -26,7 +26,27 @@ DESCRIPTION="${3:?Missing fix description}"
 MODIFIED_FILES="${4:-}"
 RECIPE_USED="${5:-}"
 
-STATE_FILE="$TESTS_ROOT/state.json"
+# ============================================================
+# Input validation: detect CLI flags passed as positional args
+# (Defense against LLM agents using --fixId/--testId/--category
+#  named-flag syntax instead of positional args)
+# ============================================================
+_validate_not_flag() {
+  local name="$1" value="$2"
+  if [[ "$value" == --* ]]; then
+    log_fail "fix-recorder: $name looks like a CLI flag ('$value'), not a value."
+    log_fail "Usage: fix-recorder.sh <test-id> <fix-type> <description> [modified-files] [recipe-used]"
+    log_fail "All arguments are POSITIONAL. Do NOT use --fixId/--testId/--category flags."
+    echo "FIX_REJECTED|$value|cli_flag_as_value"
+    exit 1
+  fi
+}
+_validate_not_flag "test-id (arg 1)" "$TEST_ID"
+_validate_not_flag "fix-type (arg 2)" "$FIX_TYPE"
+_validate_not_flag "description (arg 3)" "$DESCRIPTION"
+[ -n "$MODIFIED_FILES" ] && _validate_not_flag "modified-files (arg 4)" "$MODIFIED_FILES"
+[ -n "$RECIPE_USED" ] && _validate_not_flag "recipe-used (arg 5)" "$RECIPE_USED"
+
 FIXES_DIR="$RESULTS_DIR/fixes"
 mkdir -p "$FIXES_DIR"
 
@@ -97,28 +117,28 @@ FIX_EOF
 log_info "Fix report written to: $FIX_FILE"
 
 # ============================================================
-# Update state.json: move from fixQueue to verifyQueue
+# Update queues.json: move from fixQueue to verifyQueue
 # ============================================================
-if [ -f "$STATE_FILE" ]; then
-  STATE_PATH="$STATE_FILE" FIX_TEST_ID="$TEST_ID" FIX_TYPE_VAL="$FIX_TYPE" FIX_DESC="$DESCRIPTION" RECIPE_USED="${RECIPE_USED:-}" \
+if [ -f "$QUEUES_FILE" ]; then
+  QUEUES_PATH="$QUEUES_FILE" FIX_TEST_ID="$TEST_ID" FIX_TYPE_VAL="$FIX_TYPE" FIX_DESC="$DESCRIPTION" RECIPE_USED="${RECIPE_USED:-}" \
   NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const fs = require('fs');
-    const state = JSON.parse(fs.readFileSync(process.env.STATE_PATH, 'utf8'));
+    const queues = JSON.parse(fs.readFileSync(process.env.QUEUES_PATH, 'utf8'));
 
     // Remove from fixQueue
     const testId = process.env.FIX_TEST_ID;
-    const fixIdx = state.fixQueue.findIndex(e => e.testId === testId);
+    const fixIdx = queues.fixQueue.findIndex(e => e.testId === testId);
     let retryCount = 0;
     if (fixIdx >= 0) {
-      retryCount = state.fixQueue[fixIdx].retryCount || 0;
-      state.fixQueue.splice(fixIdx, 1);
+      retryCount = queues.fixQueue[fixIdx].retryCount || 0;
+      queues.fixQueue.splice(fixIdx, 1);
     }
 
     // Add to verifyQueue
-    if (!state.verifyQueue) state.verifyQueue = [];
-    const existsInVerify = state.verifyQueue.some(e => e.testId === testId);
+    if (!queues.verifyQueue) queues.verifyQueue = [];
+    const existsInVerify = queues.verifyQueue.some(e => e.testId === testId);
     if (!existsInVerify) {
-      state.verifyQueue.push({
+      queues.verifyQueue.push({
         testId: testId,
         fixType: process.env.FIX_TYPE_VAL,
         fixDescription: process.env.FIX_DESC,
@@ -128,18 +148,18 @@ if [ -f "$STATE_FILE" ]; then
       });
     }
 
-    fs.writeFileSync(process.env.STATE_PATH, JSON.stringify(state, null, 2) + '\n');
+    fs.writeFileSync(process.env.QUEUES_PATH, JSON.stringify(queues, null, 2) + '\n');
     console.log('Moved ' + testId + ' from fixQueue to verifyQueue');
-    console.log('fixQueue: ' + state.fixQueue.length + ', verifyQueue: ' + state.verifyQueue.length);
+    console.log('fixQueue: ' + queues.fixQueue.length + ', verifyQueue: ' + queues.verifyQueue.length);
   " 2>/dev/null
 
   if [ $? -eq 0 ]; then
-    log_pass "state.json updated: $TEST_ID moved to verifyQueue"
+    log_pass "queues.json updated: $TEST_ID moved to verifyQueue"
   else
-    log_warn "Failed to update state.json"
+    log_warn "Failed to update queues.json"
   fi
 else
-  log_warn "state.json not found — skipping queue update"
+  log_warn "queues.json not found — skipping queue update"
 fi
 
 # ============================================================
```

### tests/executors/state-writer.sh
```diff
diff --git a/tests/executors/state-writer.sh b/tests/executors/state-writer.sh
index a5de59f..deab67d 100644
--- a/tests/executors/state-writer.sh
+++ b/tests/executors/state-writer.sh
@@ -145,6 +145,28 @@ if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
   process.exit(1);
 }
 
+// ---- Step 1b: Validate queue entry fields (defense against CLI flag corruption) ----
+// Detects --fixId/--testId/--category etc. passed as field values
+var CLI_FLAG_RE = /^--\w/;
+var QUEUE_FIELD_KEYS = ["testId", "fixType", "category", "fixDescription", "recipeUsed", "reason", "source"];
+var QUEUE_ARRAY_KEYS = ["testQueue", "fixQueue", "verifyQueue", "regressionQueue", "inProgress"];
+
+function validateQueueEntries(obj) {
+  QUEUE_ARRAY_KEYS.forEach(function(qk) {
+    if (!Array.isArray(obj[qk])) return;
+    obj[qk].forEach(function(entry, idx) {
+      if (!entry || typeof entry !== "object") return;
+      QUEUE_FIELD_KEYS.forEach(function(fk) {
+        if (typeof entry[fk] === "string" && CLI_FLAG_RE.test(entry[fk])) {
+          console.log("INVALID|queue " + qk + "[" + idx + "]." + fk + " contains CLI flag value: " + entry[fk] + " — rejecting write (positional arg parsing error?)");
+          process.exit(1);
+        }
+      });
+    });
+  });
+}
+validateQueueEntries(parsed);
+
 // ---- Step 2: Translate old field names, extract stageHistory ----
 var translated = {};
 var stageHistory = null;
```
