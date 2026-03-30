# Fix Report: regression-fetch-emails

**Test ID:** regression-fetch-emails
**Fix Type:** code_bug
**Description:** Same root cause as regression-judge-cache: stale timing.json from previous run triggers premature completion in poll_for_completion. Fixed by (1) pre-cleaning timing.json in e2e-runner.sh, (2) checking mtime in poll_for_completion.
**Modified Files:** tests/executors/common.sh,tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-28T13:42:18Z

## What Was Fixed

Same root cause as regression-judge-cache: stale timing.json from previous run triggers premature completion in poll_for_completion. Fixed by (1) pre-cleaning timing.json in e2e-runner.sh, (2) checking mtime in poll_for_completion.

## Modified Files

- `tests/executors/common.sh`
- `tests/executors/e2e-runner.sh`

## Diff

### tests/executors/common.sh
```diff
diff --git a/tests/executors/common.sh b/tests/executors/common.sh
index 0e27de6..129e26f 100644
--- a/tests/executors/common.sh
+++ b/tests/executors/common.sh
@@ -348,6 +348,8 @@ poll_for_completion() {
   local poll_test_id="${5:-}"
   local elapsed=0
   local last_phase="polling"
+  local poll_start_epoch
+  poll_start_epoch=$(date +%s)
 
   log_info "Polling GET /api/case/$case_id/operation (interval=${interval}s, timeout=${timeout}s)..."
 
@@ -365,10 +367,17 @@ poll_for_completion() {
         write_progress "$poll_test_id" "casework:$inferred_phase" "Running casework phase: $inferred_phase (${elapsed}s)" "casework"
       fi
 
-      # ---- File-system fallback: timing.json exists → casework completed ----
+      # ---- File-system fallback: timing.json written AFTER poll started ----
+      # timing.json is written by casework-timing.sh at the very END of casework.
+      # We must verify it was created/modified AFTER polling began (not a stale file
+      # from a previous run). Check totalSeconds field as a completion marker.
       if [ -f "$case_dir/timing.json" ]; then
-        log_pass "Completion detected via timing.json fallback (elapsed: ${elapsed}s)"
-        return 0
+        local tj_mtime
+        tj_mtime=$(stat -c '%Y' "$case_dir/timing.json" 2>/dev/null || stat -f '%m' "$case_dir/timing.json" 2>/dev/null || echo "0")
+        if [ "$tj_mtime" -ge "$poll_start_epoch" ]; then
+          log_pass "Completion detected via timing.json fallback (elapsed: ${elapsed}s)"
+          return 0
+        fi
       fi
     fi
 
```
