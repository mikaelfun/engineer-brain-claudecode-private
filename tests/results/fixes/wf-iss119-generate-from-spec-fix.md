# Fix Report: wf-iss119-generate-from-spec

**Test ID:** wf-iss119-generate-from-spec
**Fix Type:** code_bug
**Description:** Systemic: cases_root path resolution fixed in common.sh (PROJ_ROOT env var + to_posix_path). Backend required for final verification.
**Modified Files:** tests/executors/common.sh
**Fixed At:** 2026-03-29T19:46:52Z
**Recipe Used:** none

## What Was Fixed

Systemic: cases_root path resolution fixed in common.sh (PROJ_ROOT env var + to_posix_path). Backend required for final verification.

## Modified Files

- `tests/executors/common.sh`

## Diff

### tests/executors/common.sh
```diff
diff --git a/tests/executors/common.sh b/tests/executors/common.sh
index 0e27de6..3f83106 100644
--- a/tests/executors/common.sh
+++ b/tests/executors/common.sh
@@ -313,16 +313,18 @@ get_elapsed_ms() {
 read_yaml_value() {
   local file="$1"
   local key="$2"
-  grep "^  *${key}:" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '"'
+  grep "^[[:space:]]*${key}:" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*: *"\{0,1\}\(.*\)"\{0,1\}$/\1/' | tr -d '"'
 }
 
 # JSON path reader using node
 # Usage: read_json_path "file.json" "path.to.value"
+# Note: Uses env var to pass file path — POSIX paths in -e string literals
+#       get mangled on Windows (Git Bash MSYS2 adds C:\ prefix).
 read_json_path() {
   local file="$1"
   local path="$2"
-  NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-    const d = JSON.parse(require('fs').readFileSync('$file','utf8'));
+  JSON_READ_FILE="$file" NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
+    const d = JSON.parse(require('fs').readFileSync(process.env.JSON_READ_FILE,'utf8'));
     const keys = '${path}'.split('.');
     let v = d;
     for (const k of keys) { v = v && v[k]; }
@@ -348,6 +350,8 @@ poll_for_completion() {
   local poll_test_id="${5:-}"
   local elapsed=0
   local last_phase="polling"
+  local poll_start_epoch
+  poll_start_epoch=$(date +%s)
 
   log_info "Polling GET /api/case/$case_id/operation (interval=${interval}s, timeout=${timeout}s)..."
 
@@ -365,10 +369,17 @@ poll_for_completion() {
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
 
@@ -381,18 +392,17 @@ poll_for_completion() {
 
     # Check if operation is complete:
     # API returns { caseNumber, operation: ActiveOperation | null }
-    # - operation is null/undefined → no active operation → completed
-    # - operation is a non-null object → still running
-    # ActiveOperation has { caseNumber, operationType, startedAt } — NO status/active fields
+    # - "operation":null → no active operation → completed
+    # - "operation":{ → still running
+    # NOTE: Use grep instead of Node.js — /dev/stdin doesn't work in Git Bash
     local op_active=""
-    op_active=$(echo "$HTTP_BODY" | NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
-      const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
-      if (d.operation === null || d.operation === undefined) {
-        console.log('false');
-      } else {
-        console.log('true');
-      }
-    " 2>/dev/null || echo "unknown")
+    if echo "$HTTP_BODY" | grep -q '"operation":null'; then
+      op_active="false"
+    elif echo "$HTTP_BODY" | grep -q '"operation":{'; then
+      op_active="true"
+    else
+      op_active="unknown"
+    fi
 
     if [ "$op_active" = "false" ]; then
       log_pass "Operation completed (elapsed: ${elapsed}s)"
@@ -513,3 +523,201 @@ check_ratio() {
     else console.log('pass');
   " 2>/dev/null || echo "skip"
 }
+
+# ============================================================
+# Path Utilities — portable Windows→POSIX path conversion
+# ============================================================
+# Convert a path to POSIX format (handles Windows backslashes + drive letters).
+# Replaces the broken `sed 's|...|/\L\1|'` pattern (\L not supported on MSYS2/Git Bash).
+# Usage: posix_path=$(to_posix_path "$windows_or_relative_path")
+to_posix_path() {
+  local p="$1"
+  p="${p//\//}"  # Replace backslashes with forward slashes
+  if [[ "$p" =~ ^[A-Za-z]: ]]; then
+    local drive="${p:0:1}"
+    drive="${drive,,}"  # bash 4+ lowercase
+    p="/$drive${p:2}"
+  fi
+  echo "$p"
+}
+
+# ============================================================
+# Contract Mismatch Guard — detect unresolved {placeholder}s
+# ============================================================
+# Known placeholders used in YAML test definitions.
+# If any survive sed substitution, the runner reports CONTRACT_MISMATCH
+# instead of an opaque 404/timeout, so auto-heal can pinpoint the root cause.
+KNOWN_PLACEHOLDERS="test_case_id|live_case_id|cases_root|project_root|api_base|base_url|backup_dir|first_case_id|frontend_url|created_issue_id"
+
+# Validate that a value contains no raw {placeholder} tokens.
+# Usage: validate_no_raw_placeholders "$value" "context description"
+# Returns 0 if clean, 1 if raw placeholders found (also logs + adds assertion).
+validate_no_raw_placeholders() {
+  local value="$1"
+  local context="${2:-unknown}"
+  # Match any {lowercase_with_underscores} token
+  if echo "$value" | grep -qE '\{[a-z_]+\}'; then
+    local raw
+    raw=$(echo "$value" | grep -oE '\{[a-z_]+\}' | head -3 | tr '
' ',' | sed 's/,$//')
+    log_fail "CONTRACT_MISMATCH: Unresolved placeholder(s) $raw in $context"
+    add_assertion "No raw placeholders in $context" "false" "all resolved" "raw: $raw"
+    return 1
+  fi
+  return 0
+}
+
+# ============================================================
+# Data Source: resolve_case_dir()
+# ============================================================
+# Reads test definition's data_source field and returns the appropriate case directory.
+# - data_source=synthetic → calls generator.sh to create synthetic case
+# - data_source=live → picks from live-cases.yaml or env.yaml test_cases
+# - empty/missing → falls back to test_case_id (backward compatible)
+#
+# Usage: CASE_DIR=$(resolve_case_dir "$test_def_file")
+resolve_case_dir() {
+  local test_def="$1"
+  local data_source
+  data_source=$(read_yaml_value "$test_def" "data_source" 2>/dev/null || echo "")
+
+  case "$data_source" in
+    synthetic)
+      local profile
+      profile=$(read_yaml_value "$test_def" "synthetic_profile" 2>/dev/null || echo "normal")
+      if [[ "$profile" == "random" ]]; then
+        # Pick a random profile from profiles.yaml
+        local profiles_file="$TESTS_ROOT/fixtures/synthetic/profiles.yaml"
+        profile=$(grep -E "^  [a-z][a-z0-9-]+:$" "$profiles_file" | sed 's/://; s/^  //' | shuf -n1)
+      fi
+      local seed=$RANDOM
+      local gen_output
+      gen_output=$(bash "$TESTS_ROOT/fixtures/synthetic/generator.sh" "$profile" "$seed" 2>&1)
+      # Extract output directory from generator output
+      local gen_dir
+      gen_dir=$(echo "$gen_output" | grep "Generated synthetic case:" | sed 's/.*: //')
+      # Convert Windows path to POSIX if needed
+      gen_dir=$(to_posix_path "$gen_dir")
+      echo "$gen_dir"
+      ;;
+    live)
+      local pool
+      pool=$(read_yaml_value "$test_def" "live_pool" 2>/dev/null || echo "data_rich")
+      select_live_case "$pool"
+      ;;
+    *)
+      # Backward compatible: use test_case_id from definition
+      local case_id
+      case_id=$(read_yaml_value "$test_def" "test_case_id" 2>/dev/null || echo "")
+      if [[ -n "$case_id" ]]; then
+        local cases_root
+        cases_root=$(PROJ_ROOT="$PROJECT_ROOT" node -e "const c=JSON.parse(require('fs').readFileSync(process.env.PROJ_ROOT+'/config.json','utf8')); console.log(c.casesRoot||'')" 2>/dev/null)
+        cases_root=$(to_posix_path "$cases_root")
+        echo "${cases_root}/active/${case_id}"
+      else
+        echo ""
+      fi
+      ;;
+  esac
+}
+
+# ============================================================
+# Data Source: select_live_case()
+# ============================================================
+# Picks a random case ID from live-cases.yaml or falls back to env.yaml test_cases.
+# Usage: CASE_DIR=$(select_live_case "data_rich")
+select_live_case() {
+  local pool="${1:-data_rich}"
+  local live_cases_file="$TESTS_ROOT/fixtures/live-cases.yaml"
+  local cases_root
+  cases_root=$(PROJ_ROOT="$PROJECT_ROOT" node -e "const c=JSON.parse(require('fs').readFileSync(process.env.PROJ_ROOT+'/config.json','utf8')); console.log(c.casesRoot||'')" 2>/dev/null)
+  cases_root=$(to_posix_path "$cases_root")
+
+  if [[ -f "$live_cases_file" ]]; then
+    # Read case IDs from live-cases.yaml (under cases: section)
+    local case_id
+    case_id=$(grep "id:" "$live_cases_file" | sed 's/.*id: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/' | shuf -n1)
+    if [[ -n "$case_id" ]]; then
+      echo "${cases_root}/active/${case_id}"
+      return
+    fi
+  fi
+
+  # Fallback: read from env.yaml test_cases pool
+  local env_file="$TESTS_ROOT/env.yaml"
+  local case_id
+  case_id=$(node -e "
+    const fs = require('fs');
+    const yaml = fs.readFileSync('${env_file}', 'utf8');
+    const lines = yaml.split('
');
+    let inPool = false;
+    const ids = [];
+    for (const line of lines) {
+      if (line.trim().startsWith('${pool}:')) { inPool = true; continue; }
+      if (inPool && line.trim().startsWith('- id:')) {
+        ids.push(line.trim().replace(/.*id:\s*[\"']?/, '').replace(/[\"'].*/, ''));
+      }
+      if (inPool && /^  [a-z]/.test(line) && !line.trim().startsWith('-')) { inPool = false; }
+    }
+    if (ids.length > 0) console.log(ids[Math.floor(Math.random() * ids.length)]);
+  " 2>/dev/null)
+
+  if [[ -n "$case_id" ]]; then
+    echo "${cases_root}/active/${case_id}"
+  else
+    echo ""
+  fi
+}
+
+# ============================================================
+# Test-Loop Running State Detection
+# ============================================================
+# Check if test-loop is currently running (for conductor:verify concurrency safety)
+# Returns: 0 = running, 1 = idle
+# Detection: .progress-*.json files OR state.json.currentTest non-empty
+is_testloop_running() {
+  # Check 1: Any .progress-*.json files exist?
+  local progress_files
+  progress_files=$(ls "$RESULTS_DIR"/.progress-*.json 2>/dev/null | wc -l)
+  if [ "$progress_files" -gt 0 ]; then
+    return 0  # running
+  fi
+
+  # Check 2: state.json currentTest non-empty?
+  local state_file="$TESTS_ROOT/state.json"
+  if [ -f "$state_file" ]; then
+    local current_test
+    current_test=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
+      const s = JSON.parse(require('fs').readFileSync('${state_file}','utf8'));
+      console.log(s.currentTest || '');
+    " 2>/dev/null || echo "")
+    if [ -n "$current_test" ]; then
+      return 0  # running
+    fi
+  fi
+
+  return 1  # idle
+}
+
+# ============================================================
+# Data Source: cleanup_synthetic()
+# ============================================================
+# Cleans up generated/ directories, keeping the most recent 5.
+# Usage: cleanup_synthetic
+cleanup_synthetic() {
+  local gen_dir="$TESTS_ROOT/fixtures/synthetic/generated"
+  if [[ ! -d "$gen_dir" ]]; then
+    return 0
+  fi
+
+  local count
+  count=$(ls -d "$gen_dir"/syn-* 2>/dev/null | wc -l)
+  if [[ "$count" -le 5 ]]; then
+    return 0
+  fi
+
+  # Delete oldest directories, keep 5 most recent
+  ls -dt "$gen_dir"/syn-* 2>/dev/null | tail -n +6 | while read -r dir; do
+    rm -rf "$dir"
+    log_info "Cleaned up synthetic dir: $(basename "$dir")"
+  done
+}
```
