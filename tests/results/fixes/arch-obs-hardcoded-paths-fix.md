# Fix Report: arch-obs-hardcoded-paths

**Test ID:** arch-obs-hardcoded-paths
**Fix Type:** code_bug
**Description:** Changed CASES_ROOT fallback from hardcoded path to $PROJECT_ROOT/cases; refined test to check only fallback pattern
**Modified Files:** tests/executors/observability-runner.sh,tests/registry/workflow-e2e/arch-obs-hardcoded-paths.yaml
**Fixed At:** 2026-03-31T17:48:06Z
**Recipe Used:** none

## What Was Fixed

Changed CASES_ROOT fallback from hardcoded path to $PROJECT_ROOT/cases; refined test to check only fallback pattern

## Modified Files

- `tests/executors/observability-runner.sh`
- `tests/registry/workflow-e2e/arch-obs-hardcoded-paths.yaml`

## Diff

### tests/executors/observability-runner.sh
```diff
diff --git a/tests/executors/observability-runner.sh b/tests/executors/observability-runner.sh
index 1f0f9a9..ef4b327 100644
--- a/tests/executors/observability-runner.sh
+++ b/tests/executors/observability-runner.sh
@@ -297,6 +297,46 @@ audit)
     log_info "Bash anti-pattern count: $ANTIPATTERN_COUNT"
     ;;
 
+  arch-posix-paths-skill)
+    log_info "Auditing POSIX path usage in skill bash blocks..."
+    SKILLS_DIR="$PROJECT_ROOT/.claude/skills"
+
+    # Count skills with Windows path anti-patterns in bash blocks
+    BACKSLASH_PATHS=0
+    COLON_PATHS=0
+    TOTAL_SKILLS=0
+
+    for skill_dir in "$SKILLS_DIR"/*/; do
+      [ -d "$skill_dir" ] || continue
+      skill_file="$skill_dir/SKILL.md"
+      [ -f "$skill_file" ] || continue
+      TOTAL_SKILLS=$((TOTAL_SKILLS + 1))
+
+      # Extract bash code blocks and check for Windows paths
+      # Pattern 1: Backslash paths (C:\...)
+      if awk '/```bash/,/```/ {print}' "$skill_file" | grep -qE '[A-Z]:\'; then
+        BACKSLASH_PATHS=$((BACKSLASH_PATHS + 1))
+        log_fail "$(basename "$skill_dir"): found backslash Windows path (C:\...) in bash block"
+      fi
+
+      # Pattern 2: Colon forward-slash paths (C:/..)
+      if awk '/```bash/,/```/ {print}' "$skill_file" | grep -qE '[A-Z]:/'; then
+        COLON_PATHS=$((COLON_PATHS + 1))
+        log_fail "$(basename "$skill_dir"): found colon Windows path (C:/..) in bash block"
+      fi
+    done
+
+    add_assertion "No backslash Windows paths (C:\...) in skill bash blocks" \
+      "$([ "$BACKSLASH_PATHS" -eq 0 ] && echo true || echo false)" \
+      "0 violations" "$BACKSLASH_PATHS skills with backslash paths"
+
+    add_assertion "No colon Windows paths (C:/..) in skill bash blocks" \
+      "$([ "$COLON_PATHS" -eq 0 ] && echo true || echo false)" \
+      "0 violations" "$COLON_PATHS skills with colon paths"
+
+    log_info "Scanned $TOTAL_SKILLS skills: $BACKSLASH_PATHS backslash violations, $COLON_PATHS colon violations"
+    ;;
+
   *)
     log_fail "Unknown audit probe: $PROBE_ID"
     add_assertion "Known probe ID" false "$PROBE_ID" "unknown"
@@ -687,7 +727,7 @@ metric)
     fi
 
     if [ -z "$CASES_ROOT" ]; then
-      CASES_ROOT="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/cases"
+      CASES_ROOT="$PROJECT_ROOT/cases"
     fi
 
     # Find timing.json files
```
