# Fix Report: framework-fix-32b

**Test ID:** framework-fix-32b
**Fix Type:** framework_fix
**Description:** Added bash_output_contains and bash_output_not_contains assertion handlers to run_standalone_bash_assertions in e2e-runner.sh
**Modified Files:** tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-30T19:48:47Z
**Recipe Used:** none

## What Was Fixed

Added bash_output_contains and bash_output_not_contains assertion handlers to run_standalone_bash_assertions in e2e-runner.sh

## Modified Files

- `tests/executors/e2e-runner.sh`

## Diff

### tests/executors/e2e-runner.sh
```diff
diff --git a/tests/executors/e2e-runner.sh b/tests/executors/e2e-runner.sh
index 186deae..6645149 100644
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
 
@@ -558,12 +564,81 @@ _exec_bash_exit_zero_assertion() {
   fi
 }
 
+_exec_bash_output_contains_assertion() {
+  local target="$1"
+  local expected="$2"
+  local label="$3"
+  # Unescape YAML double-quoted string escapes
+  local cmd
+  cmd=$(echo "$target" | sed 's/\\/\/g' | sed 's/\"/"/g')
+  local expected_str
+  expected_str=$(echo "$expected" | sed 's/\\/\/g' | sed 's/\"/"/g')
+  # Fallback: python3 → python if python3 not available (Windows Git Bash)
+  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
+    cmd=$(echo "$cmd" | sed 's/python3/python/g')
+  fi
+  local actual_out
+  actual_out=$(eval "$cmd" 2>&1)
+  if echo "$actual_out" | grep -qF "$expected_str"; then
+    log_pass "$label"
+    add_assertion "$label" "true" "contains '$expected_str'" "contains '$expected_str'"
+  else
+    local tail_out
+    tail_out=$(echo "$actual_out" | tail -3 | tr '
' ' ')
+    log_fail "$label"
+    add_assertion "$label" "false" "contains '$expected_str'" "not found in output" "$tail_out"
+  fi
+}
+
+_exec_bash_output_not_contains_assertion() {
+  local target="$1"
+  local expected="$2"
+  local label="$3"
+  # Unescape YAML double-quoted string escapes
+  local cmd
+  cmd=$(echo "$target" | sed 's/\\/\/g' | sed 's/\"/"/g')
+  local expected_str
+  expected_str=$(echo "$expected" | sed 's/\\/\/g' | sed 's/\"/"/g')
+  # Fallback: python3 → python if python3 not available (Windows Git Bash)
+  if ! command -v python3 >/dev/null 2>&1 && command -v python >/dev/null 2>&1; then
+    cmd=$(echo "$cmd" | sed 's/python3/python/g')
+  fi
+  local actual_out
+  actual_out=$(eval "$cmd" 2>&1)
+  if echo "$actual_out" | grep -qF "$expected_str"; then
+    local matched_lines
+    matched_lines=$(echo "$actual_out" | grep -F "$expected_str" | tail -3 | tr '
' ' ')
+    log_fail "$label"
+    add_assertion "$label" "false" "not contains '$expected_str'" "found in output" "$matched_lines"
+  else
+    log_pass "$label"
+    add_assertion "$label" "true" "not contains '$expected_str'" "not contains '$expected_str'"
+  fi
+}
+
 run_standalone_bash_assertions() {
   local in_assertions=false
   local current_type=""
   local current_target=""
+  local current_expected=""
   local current_desc=""
 
+  # Helper: flush pending assertion
+  _flush_bash_assertion() {
+    if [ -z "$current_target" ]; then return; fi
+    case "$current_type" in
+      bash_exit_zero)
+        _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-$current_target}"
+        ;;
+      bash_output_contains)
+        _exec_bash_output_contains_assertion "$current_target" "$current_expected" "${current_desc:-$current_target}"
+        ;;
+      bash_output_not_contains)
+        _exec_bash_output_not_contains_assertion "$current_target" "$current_expected" "${current_desc:-$current_target}"
+        ;;
+    esac
+  }
+
   while IFS= read -r line; do
     line="${line//$''/}"
 
@@ -578,33 +653,37 @@ run_standalone_bash_assertions() {
     fi
     if ! $in_assertions; then continue; fi
 
-    # New assertion: "  - type: bash_exit_zero"
-    if echo "$line" | grep -q "  - type:.*bash_exit_zero"; then
+    # New assertion: "  - type: bash_*"
+    if echo "$line" | grep -q "  - type:.*bash_exit_zero\|  - type:.*bash_output_contains\|  - type:.*bash_output_not_contains"; then
       # Flush previous
-      if [ -n "$current_target" ] && [ "$current_type" = "bash_exit_zero" ]; then
-        _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-$current_target}"
-      fi
-      current_type="bash_exit_zero"
+      _flush_bash_assertion
+      # Extract type value
+      current_type=$(echo "$line" | sed 's/.*type: *"\{0,1\}//' | sed 's/"\{0,1\} *$//' | sed 's/ *#.*//' | tr -d ' ')
       current_target=""
+      current_expected=""
       current_desc=""
       continue
     fi
 
-    # Only collect fields for bash_exit_zero assertions
-    if [ "$current_type" != "bash_exit_zero" ]; then continue; fi
+    # Only collect fields for bash_* assertions
+    case "$current_type" in
+      bash_exit_zero|bash_output_contains|bash_output_not_contains) ;;
+      *) continue ;;
+    esac
 
     if echo "$line" | grep -q "^ *target:"; then
       current_target=$(echo "$line" | sed 's/.*target: *//' | sed 's/^"//' | sed 's/"$//' | sed 's/ *#.*//')
     fi
+    if echo "$line" | grep -q "^ *expected:"; then
+      current_expected=$(echo "$line" | sed 's/.*expected: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" | sed 's/ *#.*//')
+    fi
     if echo "$line" | grep -q "^ *description:"; then
       current_desc=$(echo "$line" | sed 's/.*description: *//' | sed "s/^'//" | sed "s/'$//" | sed 's/^"//' | sed 's/"$//')
     fi
   done < "$TEST_FILE"
 
   # Flush last assertion
-  if [ -n "$current_target" ] && [ "$current_type" = "bash_exit_zero" ]; then
-    _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-$current_target}"
-  fi
+  _flush_bash_assertion
 }
 
 # ============================================================
@@ -614,7 +693,9 @@ execute_file_verification() {
   log_info "--- Executing file verification ---"
 
   if [ -z "$TEST_CASE_ID" ]; then
-    log_warn "No case ID — running assertion-only mode"
+    log_info "No case ID — running assertion-only mode"
+    # Still run verify_case_outputs with empty ID so file_exists/json_field assertions work
+    verify_case_outputs ""
     run_standalone_bash_assertions
   else
     verify_case_outputs "$TEST_CASE_ID"
@@ -803,6 +884,43 @@ verify_case_outputs() {
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
@@ -854,6 +972,61 @@ verify_case_outputs() {
         esac
       fi
     fi
+
+    # json_field_enum assertions (check if field value is one of valid enum values)
+    if echo "$line" | grep -q "type: .json_field_enum"; then
+      local target=""
+      local field=""
+      local expected_arr=""
+      while IFS= read -r aline; do
+        aline="${aline//$''/}"
+        if echo "$aline" | grep -q "target:"; then
+          target=$(echo "$aline" | sed 's/.*target: *"\(.*\)"/\1/' | sed "s|{cases_root}|$CASES_ROOT|g" | sed "s|{test_case_id}|$case_id|g" | sed "s|{live_case_id}|$case_id|g" | sed "s|{case_dir}|$case_dir|g")
+        fi
+        if echo "$aline" | grep -q "field:"; then
+          field=$(echo "$aline" | sed 's/.*field: *"\{0,1\}\(.*\)"\{0,1\}/\1/' | sed 's/ *#.*//' | tr -d ' "')
+        fi
+        if echo "$aline" | grep -q "expected:"; then
+          # expected is a YAML array like ["idle", "running", "paused"]
+          expected_arr=$(echo "$aline" | sed 's/.*expected: *\[\(.*\)\]/\1/' | tr -d '"' | sed 's/,/ /g')
+          break
+        fi
+      done
+
+      if [ -n "$target" ] && [ -f "$target" ] && [ -n "$field" ]; then
+        validate_no_raw_placeholders "$target" "assertion:json_field_enum target" || true
+        local field_val=""
+        field_val=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
+          const d=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
+          const keys='${field}'.split('.');
+          let v=d;
+          for(const k of keys){v=v&&v[k];}
+          console.log(v!==undefined&&v!==null?JSON.stringify(v):'NULL');
+        " "$target" 2>/dev/null || echo "ERROR")
+
+        if [ "$field_val" = "NULL" ] || [ "$field_val" = "ERROR" ]; then
+          log_fail "JSON field $field is null/missing"
+          add_assertion "JSON field: $field in enum [${expected_arr}]" "false" "enum:${expected_arr}" "NULL"
+        else
+          # Strip quotes from field_val for comparison
+          local field_val_clean=$(echo "$field_val" | tr -d '"')
+          local found=false
+          for enum_val in $expected_arr; do
+            if [ "$field_val_clean" = "$enum_val" ]; then
+              found=true
+              break
+            fi
+          done
+          if [ "$found" = "true" ]; then
+            log_pass "JSON field $field = $field_val_clean (valid enum value)"
+            add_assertion "JSON field: $field in enum [${expected_arr}]" "true" "enum:${expected_arr}" "$field_val_clean"
+          else
+            log_fail "JSON field $field = $field_val_clean (not in valid enum: [${expected_arr}])"
+            add_assertion "JSON field: $field in enum [${expected_arr}]" "false" "enum:${expected_arr}" "$field_val_clean"
+          fi
+        fi
+      fi
+    fi
   done < "$TEST_FILE"
 }
 # ============================================================
```
