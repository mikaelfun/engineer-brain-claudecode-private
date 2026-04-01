# Fix Report: error-handling-api-404

**Test ID:** error-handling-api-404
**Fix Type:** code_bug
**Description:** Fix test runner ignoring YAML assertions section expected values and auth:false flag — parse_yaml_assertions pre-reads status_code assertions, execute_step_with_assertion_check overrides default 200, auth:false sends empty token
**Modified Files:** tests/executors/api-runner.sh
**Fixed At:** 2026-03-30T22:53:20Z
**Recipe Used:** none

## What Was Fixed

Fix test runner ignoring YAML assertions section expected values and auth:false flag — parse_yaml_assertions pre-reads status_code assertions, execute_step_with_assertion_check overrides default 200, auth:false sends empty token

## Modified Files

- `tests/executors/api-runner.sh`

## Diff

### tests/executors/api-runner.sh
```diff
diff --git a/tests/executors/api-runner.sh b/tests/executors/api-runner.sh
index d0a6943..d4f644f 100644
--- a/tests/executors/api-runner.sh
+++ b/tests/executors/api-runner.sh
@@ -65,6 +65,118 @@ write_progress "$TEST_ID" "preflight" "Backend health check + JWT generation" "a
 # We parse the YAML by extracting structured data line by line.
 # For complex YAML, agents should use Node.js instead.
 
+# ============================================================
+# Pre-parse YAML assertions section
+# Extracts status_code assertions into a temp file for lookup.
+# Format: "METHOD /path|expected_status" per line.
+# ============================================================
+ASSERTIONS_MAP_FILE=""
+
+parse_yaml_assertions() {
+  ASSERTIONS_MAP_FILE=$(mktemp)
+  trap 'rm -f "${ASSERTIONS_MAP_FILE:-}"' EXIT
+
+  local in_assertions=false
+  local current_type=""
+  local current_target=""
+  local current_expected=""
+
+  while IFS= read -r line; do
+    line="${line//$''/}"
+
+    # Detect assertions section
+    if echo "$line" | grep -q "^assertions:"; then
+      in_assertions=true
+      continue
+    fi
+
+    # Detect end of assertions (next top-level key)
+    if $in_assertions && echo "$line" | grep -qE "^[a-z]"; then
+      in_assertions=false
+      # Save last entry
+      if [ "$current_type" = "status_code" ] && [ -n "$current_target" ] && [ -n "$current_expected" ]; then
+        echo "${current_target}|${current_expected}" >> "$ASSERTIONS_MAP_FILE"
+      fi
+      continue
+    fi
+
+    if ! $in_assertions; then
+      continue
+    fi
+
+    # New assertion entry (  - type: ...)
+    if echo "$line" | grep -q "^  - type:"; then
+      # Save previous entry
+      if [ "$current_type" = "status_code" ] && [ -n "$current_target" ] && [ -n "$current_expected" ]; then
+        echo "${current_target}|${current_expected}" >> "$ASSERTIONS_MAP_FILE"
+      fi
+      current_type=$(echo "$line" | sed 's/.*type: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/' | tr -d ' ')
+      current_target=""
+      current_expected=""
+      continue
+    fi
+
+    if echo "$line" | grep -q "target:"; then
+      current_target=$(echo "$line" | sed 's/.*target: *"\{0,1\}\([^"]*\)"\{0,1\}/\1/' | sed 's/ *$//')
+    fi
+
+    if echo "$line" | grep -q "expected:"; then
+      current_expected=$(echo "$line" | sed 's/.*expected: *\([0-9]*\).*/\1/' | tr -d ' ')
+    fi
+
+  done < "$TEST_FILE"
+
+  # Save last entry (if file ends inside assertions section, i.e., no trailing top-level key)
+  if $in_assertions && [ "$current_type" = "status_code" ] && [ -n "$current_target" ] && [ -n "$current_expected" ]; then
+    echo "${current_target}|${current_expected}" >> "$ASSERTIONS_MAP_FILE"
+  fi
+
+  if [ -s "$ASSERTIONS_MAP_FILE" ]; then
+    log_info "Parsed $(wc -l < "$ASSERTIONS_MAP_FILE" | tr -d ' ') status_code assertion(s) from YAML"
+  fi
+}
+
+# Look up expected status from pre-parsed assertions section.
+# Tries exact match first, then prefix match (handles targets like "GET /path (no auth)").
+lookup_assertion_expected() {
+  local action_name="$1"
+  if [ -n "${ASSERTIONS_MAP_FILE:-}" ] && [ -f "$ASSERTIONS_MAP_FILE" ] && [ -s "$ASSERTIONS_MAP_FILE" ]; then
+    local result
+    # Exact match
+    result=$(awk -F'|' -v key="$action_name" '$1 == key {print $2; exit}' "$ASSERTIONS_MAP_FILE")
+    if [ -n "$result" ]; then
+      echo "$result"
+      return
+    fi
+    # Prefix match: assertion target starts with action_name (e.g., "GET /path (no auth)")
+    result=$(awk -F'|' -v key="$action_name" 'index($1, key) == 1 {print $2; exit}' "$ASSERTIONS_MAP_FILE")
+    if [ -n "$result" ]; then
+      echo "$result"
+      return
+    fi
+  fi
+  echo ""
+}
+
+# Wrapper: apply assertion-defined expected status before executing a step.
+execute_step_with_assertion_check() {
+  local method="$1" url="$2" expected="$3" body="$4" safety="$5" auth="${6:-true}"
+  local action_name="$method $(echo "$url" | sed "s|$API_BASE||")"
+  local assertion_expected
+  assertion_expected=$(lookup_assertion_expected "$action_name")
+  if [ -n "$assertion_expected" ]; then
+    log_info "Assertion override: expected $expected → $assertion_expected (from YAML assertions)"
+    expected="$assertion_expected"
+  fi
+  # Pass empty token when auth is false
+  local step_token="$TOKEN"
+  if [ "$auth" = "false" ]; then
+    step_token=""
+    log_info "Auth disabled for this step (auth: false)"
+  fi
+  execute_api_step "$method" "$url" "$expected" "$body" "$safety" "$step_token"
+}
+
 parse_steps() {
   local in_steps=false
   local in_step=false
@@ -73,6 +185,7 @@ parse_steps() {
   local current_body=""
   local current_expected_status=""
   local current_safety=""
+  local current_auth="true"
   local step_count=0
   # Dynamic ID storage — populated by execute_api_step on successful responses
   CREATED_ISSUE_ID=""
@@ -93,7 +206,7 @@ parse_steps() {
       in_steps=false
       # Execute last step if pending
       if [ -n "$current_method" ] && [ -n "$current_url" ]; then
-        execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
+        execute_step_with_assertion_check "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety" "$current_auth"
         step_count=$((step_count + 1))
         current_method=""
         current_url=""
@@ -109,7 +222,7 @@ parse_steps() {
     if echo "$line" | grep -q "^  - action:"; then
       # Execute previous step if any
       if [ -n "$current_method" ] && [ -n "$current_url" ]; then
-        execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
+        execute_step_with_assertion_check "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety" "$current_auth"
         step_count=$((step_count + 1))
       fi
       current_method=""
@@ -117,6 +230,7 @@ parse_steps() {
       current_body=""
       current_expected_status="200"
       current_safety=""
+      current_auth="true"
       in_step=true
       continue
     fi
@@ -170,11 +284,20 @@ parse_steps() {
       current_safety=$(echo "$line" | sed 's/.*safety_check: *"\(.*\)"/\1/')
     fi
 
+    # Extract auth flag (defaults to true if not specified)
+    if echo "$line" | grep -q "auth:"; then
+      local auth_val
+      auth_val=$(echo "$line" | sed 's/.*auth: *\(.*\)/\1/' | tr -d ' "'"'"'')
+      if [ "$auth_val" = "false" ]; then
+        current_auth="false"
+      fi
+    fi
+
   done < "$TEST_FILE"
 
   # Execute last step
   if [ -n "$current_method" ] && [ -n "$current_url" ]; then
-    execute_api_step "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety"
+    execute_step_with_assertion_check "$current_method" "$current_url" "$current_expected_status" "$current_body" "$current_safety" "$current_auth"
     step_count=$((step_count + 1))
   fi
 
@@ -190,6 +313,7 @@ execute_api_step() {
   local expected_statuses="$3"
   local body="$4"
   local safety="$5"
+  local step_token="${6-$TOKEN}"  # Note: use ${6-...} not ${6:-...} so empty string is preserved (no auth)
 
   # Safety gate
   local action_name="$method $(echo "$url" | sed "s|$API_BASE||")"
@@ -207,7 +331,7 @@ execute_api_step() {
   fi
 
   # Execute request
-  http_request "$method" "$url" "$TOKEN" "$body"
+  http_request "$method" "$url" "$step_token" "$body"
 
   local assertion_name="$method $(echo "$url" | sed "s|$API_BASE||") → HTTP $HTTP_STATUS"
 
@@ -396,6 +520,9 @@ execute_crud_flow() {
 log_info "Starting test execution..."
 write_progress "$TEST_ID" "executing" "Running API test steps" "api"
 
+# Pre-parse YAML assertions section (status_code expected values)
+parse_yaml_assertions
+
 # Determine execution mode
 if grep -q "extract_id\|crud" "$TEST_FILE" 2>/dev/null; then
   execute_crud_test
```
