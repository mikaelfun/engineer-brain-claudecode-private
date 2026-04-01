# Fix Report: iss177-synthetic-adoption

**Test ID:** iss177-synthetic-adoption
**Fix Type:** code_bug
**Description:** Fixed e2e-runner: (1) execute_file_verification now calls verify_case_outputs even without case ID so file_exists/json_field assertions work; (2) Added registry_count_above assertion type; (3) Fixed 3-arg convention (test-id category round) to match verify-rerun.sh calling convention
**Modified Files:** tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-30T16:17:28Z
**Recipe Used:** none

## What Was Fixed

Fixed e2e-runner: (1) execute_file_verification now calls verify_case_outputs even without case ID so file_exists/json_field assertions work; (2) Added registry_count_above assertion type; (3) Fixed 3-arg convention (test-id category round) to match verify-rerun.sh calling convention

## Modified Files

- `tests/executors/e2e-runner.sh`

## Diff

### tests/executors/e2e-runner.sh
```diff
diff --git a/tests/executors/e2e-runner.sh b/tests/executors/e2e-runner.sh
index 186deae..0038f8a 100644
--- a/tests/executors/e2e-runner.sh
+++ b/tests/executors/e2e-runner.sh
@@ -19,8 +19,14 @@ source "$SCRIPT_DIR/common.sh"
 # ============================================================
 # Arguments
 # ============================================================
-TEST_ID="${1:?Usage: e2e-runner.sh <test-id> <round>}"
-ROUND="${2:-0}"
+TEST_ID="${1:?Usage: e2e-runner.sh <test-id> [category] <round>}"
+# Support both 2-arg (test-id round) and 3-arg (test-id category round) conventions
+# verify-rerun.sh passes 3 args: test-id category round
+if [ $# -ge 3 ]; then
+  ROUND="${3:-0}"
+else
+  ROUND="${2:-0}"
+fi
 
 TEST_FILE="$REGISTRY_DIR/workflow-e2e/${TEST_ID}.yaml"
 
@@ -614,7 +620,9 @@ execute_file_verification() {
   log_info "--- Executing file verification ---"
 
   if [ -z "$TEST_CASE_ID" ]; then
-    log_warn "No case ID — running assertion-only mode"
+    log_info "No case ID — running assertion-only mode"
+    # Still run verify_case_outputs with empty ID so file_exists/json_field assertions work
+    verify_case_outputs ""
     run_standalone_bash_assertions
   else
     verify_case_outputs "$TEST_CASE_ID"
@@ -803,6 +811,43 @@ verify_case_outputs() {
       fi
     fi
 
+    # registry_count_above assertions (check directory has more than N files/dirs)
+    if echo "$line" | grep -q "type: .registry_count_above"; then
+      local target=""
+      local expected=""
+      while IFS= read -r aline; do
+        aline="${aline//$''/}"
+        if echo "$aline" | grep -q "target:"; then
+          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
+        fi
+        if echo "$aline" | grep -q "expected:"; then
+          expected=$(echo "$aline" | sed 's/.*expected: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
+          break
+        fi
+        if echo "$aline" | grep -q "^  - type:"; then
+          break
+        fi
+      done
+
+      if [ -n "$target" ] && [ -d "$target" ]; then
+        validate_no_raw_placeholders "$target" "assertion:registry_count_above target" || true
+        local count
+        count=$(ls -1 "$target" 2>/dev/null | wc -l | tr -d ' ')
+        local threshold
+        threshold=$(echo "$expected" | tr -d '>')
+        if [ "$count" -gt "$threshold" ]; then
+          log_pass "Dir count: $(basename "$target") has $count entries (>$threshold)"
+          add_assertion "Dir count above $threshold: $(basename "$target")" "true" ">$threshold" "$count"
+        else
+          log_fail "Dir count: $(basename "$target") has $count entries (need >$threshold)"
+          add_assertion "Dir count above $threshold: $(basename "$target")" "false" ">$threshold" "$count"
+        fi
+      elif [ -n "$target" ]; then
+        log_fail "Directory not found: $target"
+        add_assertion "Dir count: $(basename "$target")" "false" ">$expected" "dir not found"
+      fi
+    fi
+
     # json_field assertions (check nested JSON field value)
     if echo "$line" | grep -q "type: .json_field"; then
       local target=""
```
