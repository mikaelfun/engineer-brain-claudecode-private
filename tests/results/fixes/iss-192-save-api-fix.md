# Fix Report: iss-192-save-api

**Test ID:** iss-192-save-api
**Fix Type:** framework_fix
**Description:** Fix check_page curl execution - remove duplicate '|| echo 000' causing HTTP status code duplication (shared fix with iss-192-copy-html-draft)
**Modified Files:** tests/executors/ui-runner.sh,tests/executors/common.sh
**Fixed At:** 2026-03-31T19:11:57Z
**Recipe Used:** none

## What Was Fixed

Fix check_page curl execution - remove duplicate '|| echo 000' causing HTTP status code duplication (shared fix with iss-192-copy-html-draft)

## Modified Files

- `tests/executors/ui-runner.sh`
- `tests/executors/common.sh`

## Diff

### tests/executors/ui-runner.sh
```diff
diff --git a/tests/executors/ui-runner.sh b/tests/executors/ui-runner.sh
index 1046926..57dabae 100644
--- a/tests/executors/ui-runner.sh
+++ b/tests/executors/ui-runner.sh
@@ -91,13 +91,27 @@ check_page() {
   local path="$1"
   local name="$2"
 
+  # Handle both absolute URLs and relative paths
+  local full_url
+  if [[ "$path" =~ ^https?:// ]]; then
+    # Already a full URL — use as-is
+    full_url="$path"
+  else
+    # Relative path — prepend FRONTEND_URL
+    full_url="${FRONTEND_URL}${path}"
+  fi
+
   local status
-  status=$(curl -sf -o /dev/null -w "%{http_code}" "${FRONTEND_URL}${path}" 2>/dev/null || echo "000")
+  status=$(curl -sf -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null)
+  # Fallback to "000" only if curl produced no output
+  if [ -z "$status" ]; then
+    status="000"
+  fi
   if [ "$status" = "200" ]; then
-    log_pass "Page loads: $name ($path) → $status"
+    log_pass "Page loads: $name ($full_url) → $status"
     add_assertion "Page loads: $name" "true" "200" "$status"
   else
-    log_fail "Page fails: $name ($path) → $status"
+    log_fail "Page fails: $name ($full_url) → $status"
     add_assertion "Page loads: $name" "false" "200" "$status"
   fi
 }
```

### tests/executors/common.sh
```diff
diff --git a/tests/executors/common.sh b/tests/executors/common.sh
index 8271f76..c36fd0b 100644
--- a/tests/executors/common.sh
+++ b/tests/executors/common.sh
@@ -56,7 +56,10 @@ generate_jwt() {
 # ============================================================
 check_backend() {
   local status
-  status=$(curl -sf -o /dev/null -w "%{http_code}" "$API_BASE/api/health" 2>/dev/null || echo "000")
+  status=$(curl -sf -o /dev/null -w "%{http_code}" "$API_BASE/api/health" 2>/dev/null)
+  if [ -z "$status" ]; then
+    status="000"
+  fi
   if [ "$status" = "200" ]; then
     return 0
   else
@@ -66,7 +69,10 @@ check_backend() {
 
 check_frontend() {
   local status
-  status=$(curl -sf -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
+  status=$(curl -sf -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
+  if [ -z "$status" ]; then
+    status="000"
+  fi
   if [ "$status" = "200" ]; then
     return 0
   else
```
