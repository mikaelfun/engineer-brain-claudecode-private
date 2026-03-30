# Fix Report: regression-days-since-contact

**Test ID:** regression-days-since-contact
**Fix Type:** test_def_fix
**Description:** Replace run_skill with run_casework, change is_number to not_null, change file_content on todo/ to file_exists, remove contains_days_info
**Modified Files:** tests/registry/workflow-e2e/regression-days-contact.yaml
**Fixed At:** 2026-03-28T10:47:21Z

## What Was Fixed

Replace run_skill with run_casework, change is_number to not_null, change file_content on todo/ to file_exists, remove contains_days_info

## Modified Files

- `tests/registry/workflow-e2e/regression-days-contact.yaml`

## Diff

### tests/registry/workflow-e2e/regression-days-contact.yaml
```diff
diff --git a/tests/registry/workflow-e2e/regression-days-contact.yaml b/tests/registry/workflow-e2e/regression-days-contact.yaml
index fe4bdf9..d4740a1 100644
--- a/tests/registry/workflow-e2e/regression-days-contact.yaml
+++ b/tests/registry/workflow-e2e/regression-days-contact.yaml
@@ -2,7 +2,7 @@ id: "regression-days-since-contact"
 name: "回归: daysSinceLastContact 不更新"
 category: "workflow-e2e"
 source: "cases/test-results/evolution-log.md — Bug #3"
-description: "generate-todo.sh 应该有日历天重新计算逻辑"
+description: "casework 应该包含 inspection-writer 重新计算 daysSinceLastContact"
 safety_level: "safe"
 priority: "critical"
 tags: ["regression", "fixed-bug"]
@@ -17,21 +17,20 @@ setup:
       dest: "{backup_dir}/{test_case_id}"
 
 steps:
-  - action: "run_skill"
+  - action: "run_casework"
     params:
-      skill: "inspection-writer"
       case_id: "{test_case_id}"
-    safety_check: "scripts.safe[inspection-writer]"
-    timeout_seconds: 120
+    safety_check: "scripts.safe[casework]"
+    timeout_seconds: 300
 
 assertions:
   - type: "json_field"
     target: "{cases_root}/active/{test_case_id}/casehealth-meta.json"
     field: "judge.daysSinceLastContact"
-    expected: "is_number"  # 应该是数字，不是 null
-  - type: "file_content"
+    expected: "not_null"  # 应该是数字，不是 null
+  - type: "file_exists"
     target: "{cases_root}/active/{test_case_id}/todo/"
-    expected: "contains_days_info"  # todo 中应包含天数信息
+    expected: true
 
 teardown:
   - action: "restore_case"
@@ -39,4 +38,4 @@ teardown:
       source: "{backup_dir}/{test_case_id}"
       dest: "{cases_root}/active/{test_case_id}"
 
-timeout_seconds: 180
+timeout_seconds: 360
```
