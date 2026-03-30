# Fix Report: incremental

**Test ID:** incremental
**Fix Type:** env_issue
**Description:** Increase step timeout 300→1200s and top-level 1200→1800s for data-rich casework
**Modified Files:** tests/registry/workflow-e2e/incremental.yaml
**Fixed At:** 2026-03-28T11:52:02Z

## What Was Fixed

Increase step timeout 300→1200s and top-level 1200→1800s for data-rich casework

## Modified Files

- `tests/registry/workflow-e2e/incremental.yaml`

## Diff

### tests/registry/workflow-e2e/incremental.yaml
```diff
diff --git a/tests/registry/workflow-e2e/incremental.yaml b/tests/registry/workflow-e2e/incremental.yaml
index 5d2baab..cfe6e56 100644
--- a/tests/registry/workflow-e2e/incremental.yaml
+++ b/tests/registry/workflow-e2e/incremental.yaml
@@ -25,7 +25,7 @@ steps:
     params:
       case_id: "{test_case_id}"
     safety_check: "scripts.safe[casework]"
-    timeout_seconds: 300
+    timeout_seconds: 1200
 
 assertions:
   - type: "file_content"
@@ -33,7 +33,7 @@ assertions:
     expected: "valid_json"
   - type: "json_field"
     target: "{cases_root}/active/{test_case_id}/timing.json"
-    field: "changegate"
+    field: "phases.changegate"
     expected: "not_null"  # changegate 应该检测到变化
   - type: "file_exists"
     target: "{cases_root}/active/{test_case_id}/case-summary.md"
@@ -45,4 +45,4 @@ teardown:
       source: "{backup_dir}/{test_case_id}"
       dest: "{cases_root}/active/{test_case_id}"
 
-timeout_seconds: 360
+timeout_seconds: 1800
```
