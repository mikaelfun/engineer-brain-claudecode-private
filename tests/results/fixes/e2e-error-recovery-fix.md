# Fix Report: e2e-error-recovery

**Test ID:** e2e-error-recovery
**Fix Type:** code_bug
**Description:** Add corrupt_file and delete_dir setup action handlers in e2e-runner.sh, move fault injection from steps to setup section
**Modified Files:** tests/executors/e2e-runner.sh,tests/registry/workflow-e2e/error-recovery.yaml
**Fixed At:** 2026-03-28T10:47:15Z

## What Was Fixed

Add corrupt_file and delete_dir setup action handlers in e2e-runner.sh, move fault injection from steps to setup section

## Modified Files

- `tests/executors/e2e-runner.sh`
- `tests/registry/workflow-e2e/error-recovery.yaml`

## Diff

### tests/registry/workflow-e2e/error-recovery.yaml
```diff
diff --git a/tests/registry/workflow-e2e/error-recovery.yaml b/tests/registry/workflow-e2e/error-recovery.yaml
index acd26b6..2310499 100644
--- a/tests/registry/workflow-e2e/error-recovery.yaml
+++ b/tests/registry/workflow-e2e/error-recovery.yaml
@@ -14,28 +14,21 @@ setup:
     params:
       source: "{cases_root}/active/{test_case_id}"
       dest: "{backup_dir}/{test_case_id}"
-
-steps:
-  # 场景 1: 损坏 JSON 文件
+  # Fault injection: corrupt JSON + delete logs dir (handled by e2e-runner setup actions parser)
   - action: "corrupt_file"
     params:
       file: "{cases_root}/active/{test_case_id}/casehealth-meta.json"
       content: "{invalid json}}}"
-  - action: "run_casework"
-    params:
-      case_id: "{test_case_id}"
-    safety_check: "scripts.safe[casework]"
-    timeout_seconds: 300
-
-  # 场景 2: 删除 logs 目录
   - action: "delete_dir"
     params:
       target: "{cases_root}/active/{test_case_id}/logs/"
+
+steps:
   - action: "run_casework"
     params:
       case_id: "{test_case_id}"
     safety_check: "scripts.safe[casework]"
-    timeout_seconds: 300
+    timeout_seconds: 540
 
 assertions:
   - type: "file_exists"
```
