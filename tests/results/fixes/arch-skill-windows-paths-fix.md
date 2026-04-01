# Fix Report: arch-skill-windows-paths

**Test ID:** arch-skill-windows-paths
**Fix Type:** code_bug
**Description:** Fixed e2e-runner.sh: added multi-line YAML command support + command_output target alias. Previous cycle used cached executor without YAML unescape fix.
**Modified Files:** tests/executors/e2e-runner.sh
**Fixed At:** 2026-03-31T20:51:35Z
**Recipe Used:** none

## What Was Fixed

Fixed e2e-runner.sh: added multi-line YAML command support + command_output target alias. Previous cycle used cached executor without YAML unescape fix.

## Modified Files

- `tests/executors/e2e-runner.sh`

## Diff

### tests/executors/e2e-runner.sh
```diff
diff --git a/tests/executors/e2e-runner.sh b/tests/executors/e2e-runner.sh
index 186deae..cdceb6b 100644
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
 
@@ -325,6 +331,12 @@ while IFS= read -r line; do
       WORKFLOW_TYPE="file-check"
     fi
   fi
+  if echo "$line" | grep -q "bash_command"; then
+    # bash_command steps: execute bash and capture output for assertion evaluation
+    if [ "$WORKFLOW_TYPE" = "unknown" ]; then
+      WORKFLOW_TYPE="bash-check"
+    fi
+  fi
   if echo "$line" | grep -q "run_api"; then
     WORKFLOW_TYPE="api"
     break
@@ -558,12 +570,81 @@ _exec_bash_exit_zero_assertion() {
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
 
@@ -578,43 +659,266 @@ run_standalone_bash_assertions() {
     fi
     if ! $in_assertions; then continue; fi
 
-    # New assertion: "  - type: bash_exit_zero"
-    if echo "$line" | grep -q "  - type:.*bash_exit_zero"; then
-      # Flush previous
-      if [ -n "$current_target" ] && [ "$current_type" = "bash_exit_zero" ]; then
-        _exec_bash_exit_zero_assertion "$current_target" "${current_desc:-$current_target}"
+    # New assertion: any "  - type:" line triggers flush+reset; only bash_* types start collection
+    if echo "$line" | grep -q "  - type:"; then
+      # Flush previous bash assertion (no-op if current_target is empty)
+      _flush_bash_assertion
+      # Only set current_type for bash_* assertion types; others → reset to "" to stop field collection
+      if echo "$line" | grep -q "bash_exit_zero\|bash_output_contains\|bash_output_not_contains"; then
+        current_type=$(echo "$line" | sed 's/.*type: *"\{0,1\}//' | sed 's/"\{0,1\} *$//' | sed 's/ *#.*//' | tr -d ' ')
+      else
+        current_type=""
       fi
-      current_type="bash_exit_zero"
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
 # File Verification (check existing outputs without running workflow)
 # ============================================================
+# ============================================================
+# Bash-Check Workflow: execute bash_command steps + evaluate text_gt/text_equals/text_contains assertions
+# ============================================================
+execute_bash_check_test() {
+  log_info "--- Executing bash-check workflow ---"
+  write_progress "$TEST_ID" "bash_check" "Running bash_command steps" "bash-check"
+
+  # === Phase 1: Execute bash_command steps and capture outputs ===
+  local step_index=0
+  local in_steps=false
+  local in_params=false
+  local current_command=""
+
+  # Declare associative-like storage using indexed arrays (bash 3 compat)
+  local step_outputs=""
+
+  while IFS= read -r line; do
+    line="${line//$''/}"
+
+    if echo "$line" | grep -q "^steps:"; then
+      in_steps=true
+      continue
+    fi
+    # Exit steps on next top-level key
+    if $in_steps && echo "$line" | grep -qE "^[a-zA-Z]"; then
+      in_steps=false
+      continue
+    fi
+    if ! $in_steps; then continue; fi
+
+    # New step entry
+    if echo "$line" | grep -q "  - action:.*bash_command"; then
+      # Execute previous command if pending
+      if [ -n "$current_command" ]; then
+        step_index=$((step_index + 1))
+        local step_result
+        # YAML unescape: \" → " and \ → \ (order: \" first to avoid double-processing)
+        local cmd_unescaped
+        cmd_unescaped=$(printf '%s' "$current_command" | sed 's/\"/"/g' | sed 's/\\/\/g')
+        # Write to temp file and execute via bash (avoids eval's pipe/quote interpretation issues)
+        local tmpfile
+        tmpfile=$(mktemp)
+        printf '%s
' "$cmd_unescaped" > "$tmpfile"
+        step_result=$(bash "$tmpfile" 2>&1) || true
+        rm -f "$tmpfile"
+        step_result=$(echo "$step_result" | tr -d '' | sed '/^$/d' | tail -1)
+        log_info "Step ${step_index} output: ${step_result}"
+        eval "STEP_OUTPUT_${step_index}=\"\$step_result\""
+        current_command=""
+      fi
+      in_params=false
+      continue
+    fi
+
+    # Enter params section
+    if echo "$line" | grep -q "params:"; then
+      in_params=true
+      continue
+    fi
+
+    # Read command from params (supports single-line and multi-line YAML block scalar |)
+    if $in_params && echo "$line" | grep -q "command:"; then
+      local cmd_value
+      cmd_value=$(echo "$line" | sed 's/.*command: *//' | sed 's/^"//' | sed 's/"$//')
+      if [ "$cmd_value" = "|" ] || [ "$cmd_value" = "|-" ]; then
+        # Multi-line YAML block scalar: read subsequent indented lines
+        current_command=""
+        local block_indent=""
+        while IFS= read -r bline; do
+          bline="${bline//$''/}"
+          # Detect indent level from first non-empty line
+          if [ -z "$block_indent" ]; then
+            if echo "$bline" | grep -qE "^[[:space:]]*$"; then continue; fi
+            block_indent=$(echo "$bline" | sed 's/[^ ].*//')
+          fi
+          # End of block: line with less or equal indent that's not blank
+          if [ -n "$bline" ] && ! echo "$bline" | grep -qE "^${block_indent}"; then
+            # Unread is not possible in bash, but this line belongs to next section
+            # We'll lose this line — acceptable since it's safety_check or next step
+            break
+          fi
+          # Strip the block indent prefix
+          local stripped
+          stripped=$(echo "$bline" | sed "s/^${block_indent}//")
+          if [ -n "$current_command" ]; then
+            current_command="${current_command}
+${stripped}"
+          else
+            current_command="$stripped"
+          fi
+        done
+      else
+        current_command="$cmd_value"
+      fi
+      in_params=false
+      continue
+    fi
+  done < "$TEST_FILE"
+
+  # Execute last pending command
+  if [ -n "$current_command" ]; then
+    step_index=$((step_index + 1))
+    local step_result
+    local cmd_unescaped
+    cmd_unescaped=$(printf '%s' "$current_command" | sed 's/\"/"/g' | sed 's/\\/\/g')
+    local tmpfile
+    tmpfile=$(mktemp)
+    printf '%s
' "$cmd_unescaped" > "$tmpfile"
+    step_result=$(bash "$tmpfile" 2>&1) || true
+    rm -f "$tmpfile"
+    step_result=$(echo "$step_result" | tr -d '' | sed '/^$/d' | tail -1)
+    log_info "Step ${step_index} output: ${step_result}"
+    eval "STEP_OUTPUT_${step_index}=\"\$step_result\""
+  fi
+
+  local total_steps=$step_index
+  log_info "Executed $total_steps bash_command steps"
+
+  # === Phase 2: Evaluate assertions referencing step outputs ===
+  write_progress "$TEST_ID" "asserting" "Evaluating assertions" "bash-check"
+
+  local in_assertions=false
+  local current_type=""
+  local current_target=""
+  local current_expected=""
+  local current_desc=""
+
+  _flush_bash_check_assertion() {
+    if [ -z "$current_type" ] || [ -z "$current_target" ]; then return; fi
+
+    # Resolve step output: "step1_output" → $STEP_OUTPUT_1, "command_output" → $STEP_OUTPUT_1 (alias for single-step tests)
+    local step_num
+    if [ "$current_target" = "command_output" ]; then
+      step_num="1"
+    else
+      step_num=$(echo "$current_target" | sed 's/step\([0-9]*\)_output/\1/')
+    fi
+    local actual_value=""
+    eval "actual_value=\"\$STEP_OUTPUT_${step_num}\""
+
+    case "$current_type" in
+      text_gt)
+        # Compare as integers: actual > expected
+        local actual_int=$(echo "$actual_value" | grep -o '[0-9]*' | head -1)
+        local expected_int=$(echo "$current_expected" | grep -o '[0-9]*' | head -1)
+        actual_int=${actual_int:-0}
+        expected_int=${expected_int:-0}
+        if [ "$actual_int" -gt "$expected_int" ] 2>/dev/null; then
+          log_pass "${current_desc:-text_gt} ($actual_int > $expected_int)"
+          add_assertion "${current_desc:-text_gt: $current_target}" "true" ">$expected_int" "$actual_int"
+        else
+          log_fail "${current_desc:-text_gt} ($actual_int <= $expected_int)"
+          add_assertion "${current_desc:-text_gt: $current_target}" "false" ">$expected_int" "$actual_int"
+        fi
+        ;;
+      text_equals)
+        if [ "$actual_value" = "$current_expected" ]; then
+          log_pass "${current_desc:-text_equals} ($actual_value == $current_expected)"
+          add_assertion "${current_desc:-text_equals: $current_target}" "true" "$current_expected" "$actual_value"
+        else
+          log_fail "${current_desc:-text_equals} ($actual_value != $current_expected)"
+          add_assertion "${current_desc:-text_equals: $current_target}" "false" "$current_expected" "$actual_value"
+        fi
+        ;;
+      text_contains)
+        if echo "$actual_value" | grep -q "$current_expected"; then
+          log_pass "${current_desc:-text_contains} (found: $current_expected)"
+          add_assertion "${current_desc:-text_contains: $current_target}" "true" "$current_expected" "found"
+        else
+          log_fail "${current_desc:-text_contains} (missing: $current_expected)"
+          add_assertion "${current_desc:-text_contains: $current_target}" "false" "$current_expected" "not found in: $actual_value"
+        fi
+        ;;
+    esac
+  }
+
+  while IFS= read -r line; do
+    line="${line//$''/}"
+
+    if echo "$line" | grep -q "^assertions:"; then
+      in_assertions=true
+      continue
+    fi
+    if $in_assertions && echo "$line" | grep -qE "^[a-zA-Z]"; then
+      break
+    fi
+    if ! $in_assertions; then continue; fi
+
+    # New assertion entry
+    if echo "$line" | grep -q "  - type:"; then
+      _flush_bash_check_assertion
+      current_type=$(echo "$line" | sed 's/.*type: *//' | sed 's/^"//' | sed 's/"$//' | tr -d ' ')
+      current_target=""
+      current_expected=""
+      current_desc=""
+      continue
+    fi
+
+    if echo "$line" | grep -q "^ *target:"; then
+      current_target=$(echo "$line" | sed 's/.*target: *//' | sed 's/^"//' | sed 's/"$//' | sed 's/ *#.*//')
+    fi
+    if echo "$line" | grep -q "^ *expected:"; then
+      current_expected=$(echo "$line" | sed 's/.*expected: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" | sed 's/ *#.*//')
+    fi
+    if echo "$line" | grep -q "^ *description:"; then
+      current_desc=$(echo "$line" | sed 's/.*description: *//' | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//" )
+    fi
+  done < "$TEST_FILE"
+
+  # Flush last assertion
+  _flush_bash_check_assertion
+}
+
 execute_file_verification() {
   log_info "--- Executing file verification ---"
 
   if [ -z "$TEST_CASE_ID" ]; then
-    log_warn "No case ID — running assertion-only mode"
+    log_info "No case ID — running assertion-only mode"
+    # Still run verify_case_outputs with empty ID so file_exists/json_field assertions work
+    verify_case_outputs ""
     run_standalone_bash_assertions
   else
     verify_case_outputs "$TEST_CASE_ID"
@@ -803,8 +1107,46 @@ verify_case_outputs() {
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
-    if echo "$line" | grep -q "type: .json_field"; then
+    # NOTE: use 'json_field"' pattern (with closing quote) to exclude json_field_enum from matching here
+    if echo "$line" | grep -q 'type: .json_field"'; then
       local target=""
       local field=""
       local expected=""
@@ -854,6 +1196,61 @@ verify_case_outputs() {
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
@@ -915,6 +1312,7 @@ case "$WORKFLOW_TYPE" in
                 run_standalone_bash_assertions
                 ;;
   api)          execute_api_workflow_test ;;
+  bash-check)   execute_bash_check_test ;;
   file-check|unknown) execute_file_verification ;;
 esac
 
@@ -925,11 +1323,17 @@ ELAPSED=$(get_elapsed_ms)
 OVERALL_STATUS="pass"
 if [ "$ASSERTIONS_FAILED" -gt 0 ]; then
   OVERALL_STATUS="fail"
+elif [ "$ASSERTION_COUNT" -eq 0 ]; then
+  # Phantom pass prevention: 0 assertions = no verification occurred → SKIP
+  OVERALL_STATUS="skip"
+  log_warn "No assertions executed — marking as skip (phantom pass prevention)"
 fi
 
 ERROR_VAL="null"
 if [ "$OVERALL_STATUS" = "fail" ]; then
   ERROR_VAL="\"$ASSERTIONS_FAILED of $ASSERTION_COUNT assertions failed\""
+elif [ "$OVERALL_STATUS" = "skip" ]; then
+  ERROR_VAL="\"no assertions executed (phantom pass prevention)\""
 fi
 
 write_result "$ROUND" "$TEST_ID" "$OVERALL_STATUS" "$ASSERTIONS_JSON" "$ERROR_VAL" "$ELAPSED"
```
