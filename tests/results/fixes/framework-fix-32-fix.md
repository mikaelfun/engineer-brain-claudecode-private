# Fix Report: framework-fix-32

**Test ID:** framework-fix-32
**Fix Type:** framework_fix
**Description:** fix-recorder.sh now reads queues.json instead of state.json for queue operations
**Modified Files:** tests/executors/fix-recorder.sh
**Fixed At:** 2026-03-30T20:28:43Z
**Recipe Used:** none

## What Was Fixed

fix-recorder.sh now reads queues.json instead of state.json for queue operations

## Modified Files

- `tests/executors/fix-recorder.sh`

## Diff

### tests/executors/fix-recorder.sh
```diff
diff --git a/tests/executors/fix-recorder.sh b/tests/executors/fix-recorder.sh
index 230a53d..6a472f6 100644
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
@@ -26,7 +26,6 @@ DESCRIPTION="${3:?Missing fix description}"
 MODIFIED_FILES="${4:-}"
 RECIPE_USED="${5:-}"
 
-STATE_FILE="$TESTS_ROOT/state.json"
 FIXES_DIR="$RESULTS_DIR/fixes"
 mkdir -p "$FIXES_DIR"
 
@@ -97,28 +96,28 @@ FIX_EOF
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
@@ -128,18 +127,18 @@ if [ -f "$STATE_FILE" ]; then
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
